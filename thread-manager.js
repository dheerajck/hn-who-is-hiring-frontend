import { USE_MOCK_DATA, CATEGORY_API_MAP, CATEGORY_CACHE_KEY, toastTimeout, MOCK_COMMENTS_INITIAL, MOCK_COMMENTS_UPDATE } from './config.js';
import { allThreads, currentCategory, currentThreadId, allComments, selectedYear, setAllThreads, setCurrentCategory, setCurrentThreadId, setAllComments, setSelectedYear } from './state.js';
import { getCache, setCache, minimizeCommentObject } from './cache.js';
import { fetchLatestThreadListFromApi, fetchThreadComments, fetchNewerComments } from './api.js';
// Import UI render functions
import { renderJobs, renderCategorySwitcher, renderThreadSwitcher, showToast as uiShowToast } from './ui-render.js';


export async function loadThread(id) {
    const startTime = performance.now();
    const requestedIdForThisCall = id; // Capture the ID for this specific call

    setCurrentThreadId(id);
    document.getElementById('jobs').innerHTML = `<div class="loading"><i class="fas fa-circle-notch"></i> Loading thread...</div>`;
    document.getElementById('load-time-info').textContent = '';

    document.querySelectorAll('.year-selector button, .month-selector button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.threadId === String(requestedIdForThisCall)) {
            btn.classList.add('active');
            const yearBtn = document.querySelector(`.year-selector button[data-year="${btn.dataset.year}"]`);
            if (yearBtn) yearBtn.classList.add('active');
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
            document.getElementById('load-time-info').textContent = `Displayed ${cachedCount} job posts. Checking for updates...`;

            let fetchedHits = await fetchNewerComments(requestedIdForThisCall, lastCachedTimestampMs);
            if (requestedIdForThisCall !== currentThreadId) return;

            let newTopLevelComments = fetchedHits.filter(comment => String(comment.parent_id) === String(requestedIdForThisCall));
            newTopLevelComments = newTopLevelComments.map(comment => ({
                ...comment,
                id: comment.id || comment.objectID,
                text: comment.text || comment.comment_text,
            }));

            let uniqueNewComments = [];
            if (newTopLevelComments.length > 0) {
                const existingCommentIds = new Set(commentsForThisRequest.map(c => String(c.id)));
                uniqueNewComments = newTopLevelComments.filter(nc => nc.id && !existingCommentIds.has(String(nc.id)));
                commentsForThisRequest = [...uniqueNewComments, ...commentsForThisRequest];
                const minimizedCommentsForCache = commentsForThisRequest.map(minimizeCommentObject);
                setCache(cacheKey, { comments: minimizedCommentsForCache, cachedAt: Date.now() });
            }

            if (uniqueNewComments.length > 0) {
                setAllComments(commentsForThisRequest);
                renderJobs(allComments);
            }

            const endTime = performance.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);
            document.getElementById('load-time-info').textContent = `Loaded ${commentsForThisRequest.length} jobs (${uniqueNewComments.length} new jobs added) in ${duration} seconds`;

        } else {
            commentsForThisRequest = await fetchThreadComments(requestedIdForThisCall);
            if (requestedIdForThisCall !== currentThreadId) return;

            const minimizedCommentsForCache = commentsForThisRequest.map(minimizeCommentObject);
            setCache(cacheKey, { comments: minimizedCommentsForCache, cachedAt: Date.now() });
            setAllComments(commentsForThisRequest);
            renderJobs(allComments);

            const endTime = performance.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);
            document.getElementById('load-time-info').textContent = `Loaded ${allComments.length} jobs in ${duration} seconds`;
        }
    } catch (error) {
        if (requestedIdForThisCall !== currentThreadId) return;
        document.getElementById('jobs').innerHTML = `
          <div class="loading">
            <i class="fas fa-exclamation-circle"></i>
            Failed to load thread details for ${requestedIdForThisCall}. ${error.message || ''}
          </div>`;
        document.getElementById('load-time-info').textContent = `Failed to load jobs`;
    }
}

async function fetchAllCategoryThreads() {
    for (const category in CATEGORY_API_MAP) {
        try {
            const hits = await fetchLatestThreadListFromApi(CATEGORY_API_MAP[category]);
            allThreads[category] = hits; // Directly update state.js via import
        } catch (error) {
            console.error(`Error fetching threads for category ${category}:`, error);
            allThreads[category] = [];
        }
    }
    setCache(CATEGORY_CACHE_KEY, allThreads);
}

async function fetchLatestCategoryThreadsInBackground() {
    let updated = false;
    if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const currentCachedThreads = { ...allThreads };

    for (const category in CATEGORY_API_MAP) {
        try {
            const latestHits = await fetchLatestThreadListFromApi(CATEGORY_API_MAP[category], true);
            if (latestHits.length > 0 && JSON.stringify(latestHits) !== JSON.stringify(currentCachedThreads[category])) {
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
        uiShowToast("✨ Thread lists updated in background!", 3000);
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
            document.getElementById('jobs').innerHTML = `<div class="loading"><i class="fas fa-info-circle"></i> No threads found in cache for "${CATEGORY_API_MAP[currentCategory].label}". Checking for new ones...</div>`;
        }
        fetchLatestCategoryThreadsInBackground();
    } else {
        document.getElementById('jobs').innerHTML = `<div class="loading"><i class="fas fa-circle-notch"></i> Loading all job categories...</div>`;
        await fetchAllCategoryThreads();
        renderCategorySwitcher();
        const latestThread = allThreads[currentCategory][0];
        if (latestThread) {
            const match = latestThread.title.match(/\b(\d{4})\b/);
            setSelectedYear(match ? parseInt(match[1]) : null);
            renderThreadSwitcher();
            await loadThread(latestThread.objectID);
        } else {
            document.getElementById('jobs').innerHTML = `<div class="loading"><i class="fas fa-info-circle"></i> No threads found for "${CATEGORY_API_MAP[currentCategory].label}".</div>`;
        }
    }
}

// Remove _setRenderFunctions as it's no longer needed
