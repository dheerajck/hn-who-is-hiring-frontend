import { CATEGORY_API_MAP, CATEGORY_CACHE_KEY } from "./config.js";

import {
  allThreads,
  currentCategory,
  currentThreadId,
  allComments,
  setAllThreads,
  setCurrentThreadId,
  setAllComments,
  setSelectedYear,
  setInitialThreadsLoadingCompleted,
} from "./state.js";

import { getCache, setCache, minimizeCommentObject } from "./cache.js";

import {
  fetchLatestThreadListFromApi,
  fetchThreadComments,
  fetchNewerComments,
} from "./api.js";

import {
  renderJobs,
  renderCategorySwitcher,
  renderThreadSwitcher,
} from "./ui-render.js";

export async function loadThread(id) {
  const startTime = performance.now();
  const requestedIdForThisCall = id; // Capture the ID for this specific call

  setCurrentThreadId(id);
  document.getElementById(
    "jobs"
  ).innerHTML = `<div class="loading"><i class="fas fa-circle-notch"></i> Loading...</div>`;
  document.getElementById("load-time-info").textContent = "";

  document
    .querySelectorAll(".year-selector button, .month-selector button")
    .forEach((btn) => {
      btn.classList.remove("active");
      if (btn.dataset.threadId === String(requestedIdForThisCall)) {
        btn.classList.add("active");

        const yearBtn = document.querySelector(
          `.year-selector button[data-year="${btn.dataset.year}"]`
        );
        yearBtn.classList.add("active");
      }
    });

  const cacheKey = `hn_thread_comments_${requestedIdForThisCall}`;
  let lastCachedTimestampMs = 0;

  try {
    const cachedData = getCache(cacheKey);
    let commentsForThisRequest = [];

    if (cachedData && cachedData.comments && cachedData.cachedAt) {
      commentsForThisRequest = cachedData.comments || [];
      lastCachedTimestampMs = cachedData.cachedAt;

      if (requestedIdForThisCall !== currentThreadId) return;

      setAllComments(commentsForThisRequest);
      renderJobs(allComments);
      const cachedCount = allComments.length;
      document.getElementById(
        "load-time-info"
      ).textContent = `Displayed ${cachedCount} job posts. Checking for updates...`;

      let fetchedHits = await fetchNewerComments(
        requestedIdForThisCall,
        lastCachedTimestampMs
      );

      if (requestedIdForThisCall !== currentThreadId) return;

      let newTopLevelComments = fetchedHits.filter(
        (comment) =>
          String(comment.parent_id) === String(requestedIdForThisCall)
      );

      newTopLevelComments = newTopLevelComments.map((comment) => ({
        ...comment,
        id: comment.id || comment.objectID,
        text: comment.text || comment.comment_text,
      }));

      let uniqueNewComments = [];
      if (newTopLevelComments.length > 0) {
        const existingCommentIds = new Set(
          commentsForThisRequest.map((c) => String(c.id))
        );
        uniqueNewComments = newTopLevelComments.filter(
          (nc) => nc.id && !existingCommentIds.has(String(nc.id))
        );
        commentsForThisRequest = [
          ...uniqueNewComments,
          ...commentsForThisRequest,
        ];
        const minimizedCommentsForCache = commentsForThisRequest.map(
          minimizeCommentObject
        );
        setCache(cacheKey, {
          comments: minimizedCommentsForCache,
          cachedAt: Date.now(),
        });
      }

      if (uniqueNewComments.length > 0) {
        setAllComments(commentsForThisRequest);
        renderJobs(allComments);
      }

      const endTime = performance.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      document.getElementById(
        "load-time-info"
      ).textContent = `Loaded ${commentsForThisRequest.length} jobs (${uniqueNewComments.length} new jobs added) in ${duration} seconds`;
    } else {
      commentsForThisRequest = await fetchThreadComments(
        requestedIdForThisCall
      );

      if (requestedIdForThisCall !== currentThreadId) return;

      const minimizedCommentsForCache = commentsForThisRequest.map(
        minimizeCommentObject
      );

      setCache(cacheKey, {
        comments: minimizedCommentsForCache,
        cachedAt: Date.now(),
      });

      setAllComments(commentsForThisRequest);
      renderJobs(allComments);

      const endTime = performance.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      document.getElementById(
        "load-time-info"
      ).textContent = `Loaded ${allComments.length} jobs in ${duration} seconds`;
    }
  } catch (error) {
    if (requestedIdForThisCall !== currentThreadId) return;

    document.getElementById("jobs").innerHTML = `
          <div class="loading">
            <i class="fas fa-exclamation-circle"></i>
            Failed to load thread details for ${requestedIdForThisCall}. ${
      error.message || ""
    }
          </div>`;
    document.getElementById(
      "load-time-info"
    ).textContent = `Failed to load jobs`;
  }
}

async function fetchAllCategoryThreads() {
  const promises = [];
  for (const category in CATEGORY_API_MAP) {
    promises.push(
      fetchLatestThreadListFromApi(CATEGORY_API_MAP[category])
        .then((hits) => ({ category, hits })) // Store category along with hits
        .catch((error) => {
          console.error(
            `Error fetching threads for category ${category}:`,
            error
          );
          return { category, hits: [] }; // Return category and empty hits on error
        })
    );
  }

  try {
    const resolvedResults = await Promise.all(promises);
    for (const result of resolvedResults) {
      allThreads[result.category] = result.hits;
    }
  } catch (error) {
    console.error(
      "Error fetching one or more category threads in parallel:",
      error
    );
  }
  setCache(CATEGORY_CACHE_KEY, allThreads);
}

async function fetchLatestCategoryThreadsInBackground() {
  let updated = false;

  const currentCachedThreads = { ...allThreads };

  for (const category in CATEGORY_API_MAP) {
    try {
      let latestHits;

      latestHits = await fetchLatestThreadListFromApi(
        CATEGORY_API_MAP[category]
      );

      if (
        latestHits.length > 0 &&
        JSON.stringify(latestHits) !==
          JSON.stringify(currentCachedThreads[category])
      ) {
        allThreads[category] = latestHits;
        updated = true;
      }
    } catch (error) {
      console.error(`Background fetch failed for category ${category}:`, error);
    }
  }
  if (updated) {
    setCache(CATEGORY_CACHE_KEY, allThreads);
    renderCategorySwitcher();
    renderThreadSwitcher();
  }
}

export async function fetchAndStoreThreads() {
  const cachedData = getCache(CATEGORY_CACHE_KEY);

  if (cachedData) {
    setAllThreads(cachedData);
    renderCategorySwitcher();

    const latestThread = allThreads[currentCategory][0];
    if (latestThread) {
      const match = latestThread.title.match(/\b(\d{4})\b/);
      setSelectedYear(match ? parseInt(match[1]) : null);
      renderThreadSwitcher();
      await loadThread(latestThread.objectID);
    } else {
      document.getElementById(
        "jobs"
      ).innerHTML = `<div class="loading"><i class="fas fa-info-circle"></i> No threads found in cache for "${CATEGORY_API_MAP[currentCategory].label}". Checking for new ones...</div>`;
    }

    setInitialThreadsLoadingCompleted(true);
    fetchLatestCategoryThreadsInBackground();
  } else {
    document.getElementById(
      "jobs"
    ).innerHTML = `<div class="loading"><i class="fas fa-circle-notch"></i> Loading...</div>`;
    await fetchAllCategoryThreads();
    renderCategorySwitcher();
    const latestThread = allThreads[currentCategory][0];
    if (latestThread) {
      const match = latestThread.title.match(/\b(\d{4})\b/);
      setSelectedYear(match ? parseInt(match[1]) : null);
      renderThreadSwitcher();
      await loadThread(latestThread.objectID);
    } else {
      document.getElementById(
        "jobs"
      ).innerHTML = `<div class="loading"><i class="fas fa-info-circle"></i> No threads found for "${CATEGORY_API_MAP[currentCategory].label}".</div>`;
    }
    setInitialThreadsLoadingCompleted(true);
  }
}
