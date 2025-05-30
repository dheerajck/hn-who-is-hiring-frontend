// ui-events.js
import { appliedKey, notesKey, favoriteKey, themekey, hiddenKey, searchDebounceTimeout, CATEGORY_CACHE_KEY, CATEGORY_API_MAP } from './config.js';
import { applied, notes, allComments, currentThreadId, favorites, hidden, activeToastHideTimerId, currentCategory, setApplied, setNotes, setFavorites, setHidden, setActiveToastHideTimerId } from './state.js';
import { removeLocalStorageKeysWithPrefix } from './cache.js';
import { debounce } from './utils.js';
import { renderJobs, updateJobCardInPlace, showToast, updateThemeIcon, renderParsedQuery } from './ui-render.js';
import { parseQuery } from './search-logic.js';

// --- START: Element Selectors (cached for performance) ---
let searchInput, clearSearchBtn, controlButtonsContainer, favBtn, notesBtn, appliedBtn, hideAppliedBtn, showHiddenBtn, resetBtn, jobsContainer, themeToggle, goToTopButton, helpModal, openHelpModalBtn, closeHelpModalBtn, toastElement;

function cacheDOMElements() {
    searchInput = document.getElementById('search');
    clearSearchBtn = document.getElementById('clearSearchBtn');
    controlButtonsContainer = document.querySelector('.control-buttons');
    jobsContainer = document.getElementById('jobs');
    themeToggle = document.getElementById('themeToggle');
    goToTopButton = document.getElementById('goToTop');
    helpModal = document.getElementById('helpModal');
    openHelpModalBtn = document.getElementById('openHelpModal');
    closeHelpModalBtn = document.getElementById('closeHelpModal');
    toastElement = document.getElementById('toast');
}
// --- END: Element Selectors ---


// --- START: Clear Search Button Logic ---
function setupClearSearchButton() {
    if (!searchInput || !clearSearchBtn) return;

    function toggleClearButtonVisibility() {
        clearSearchBtn.style.display = searchInput.value.length > 0 ? 'inline-block' : 'none';
    }

    searchInput.addEventListener('input', toggleClearButtonVisibility);

    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        searchInput.focus();
    });

    toggleClearButtonVisibility();
}
// --- END: Clear Search Button Logic ---

// --- START: Keyboard Navigation ---
const keyboardShortcuts = {
  'j': () => navigateJobs('next'),
  'k': () => navigateJobs('prev'),
  '/': () => searchInput && searchInput.focus(),
  'Escape': () => document.activeElement && document.activeElement.blur(),
  'a': () => handleJobAction(),
  'g': () => window.scrollTo({ top: 0, behavior: 'smooth' })
};

function navigateJobs(direction) {
  const jobCards = document.querySelectorAll('.job-card');
  if (!jobCards.length) return;

  const focused = document.activeElement;
  let currentIndex = -1;

  jobCards.forEach((card, index) => {
    if (card === focused || card.contains(focused)) {
      currentIndex = index;
    }
  });

  let nextIndex;
  if (direction === 'next') {
    nextIndex = (currentIndex + 1) % jobCards.length;
  } else {
    nextIndex = (currentIndex - 1 + jobCards.length) % jobCards.length;
  }

  if (jobCards[nextIndex]) {
    jobCards[nextIndex].focus();
    jobCards[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function handleJobAction() {
  const focused = document.activeElement;
  const jobCard = focused ? focused.closest('.job-card') : null;

  if (jobCard) {
    const actionButton = jobCard.querySelector('.job-action-button');
    if (actionButton) actionButton.click();
  }
}

function setupGlobalKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            if (e.key === 'Escape') {
                e.target.blur();
            }
            return;
        }
        const shortcut = keyboardShortcuts[e.key];
        if (shortcut) {
            e.preventDefault();
            shortcut();
        }
    });
}
// --- END: Keyboard Navigation ---

// --- START: Toast Logic ---
function setupToastScrollListener() {
    window.addEventListener('scroll', () => {
        if (toastElement && toastElement.classList.contains('show')) {
            toastElement.classList.remove('show');
            if (activeToastHideTimerId) {
                clearTimeout(activeToastHideTimerId);
                setActiveToastHideTimerId(null);
            }
        }
    });
}
// --- END: Toast Logic ---

// --- START: Filter Buttons ---
const highlightClass = 'active';

function setActiveFilter(btnToActivate, allFilterButtons) {
    const isActive = btnToActivate.classList.contains(highlightClass);
    allFilterButtons.forEach(b => b.classList.remove(highlightClass));
    if (!isActive) {
        btnToActivate.classList.add(highlightClass);
    }
    renderJobs(allComments);
}

function setupFilterButtons() {
    if (!controlButtonsContainer) return;
    controlButtonsContainer.classList.add('filter-row');

    favBtn = document.createElement('button');
    favBtn.id = 'showFavorites';
    favBtn.className = 'filter-btn';
    favBtn.innerHTML = '<i class="fas fa-star"></i> Favorites';

    notesBtn = document.createElement('button');
    notesBtn.id = 'showNotes';
    notesBtn.className = 'filter-btn';
    notesBtn.innerHTML = '<i class="fas fa-sticky-note"></i> Show Notes';

    appliedBtn = document.createElement('button');
    appliedBtn.id = 'showApplied';
    appliedBtn.className = 'filter-btn';
    appliedBtn.innerHTML = '<i class="fas fa-check"></i> Show Applied';

    hideAppliedBtn = document.createElement('button');
    hideAppliedBtn.id = 'hideAppliedBtn';
    hideAppliedBtn.className = 'filter-btn';
    hideAppliedBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Applied';

    showHiddenBtn = document.createElement('button');
    showHiddenBtn.id = 'showHidden';
    showHiddenBtn.className = 'filter-btn';
    showHiddenBtn.innerHTML = '<i class="fas fa-xmark"></i> Show Excluded';
    
    resetBtn = document.createElement('button');
    resetBtn.id = 'resetDefaultsBtn';
    resetBtn.className = 'filter-btn reset-btn';
    resetBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Reset Everything';
    resetBtn.title = 'Clear all applied statuses, notes, and favorites';

    const allFilterButtons = [favBtn, notesBtn, appliedBtn, hideAppliedBtn, showHiddenBtn];

    favBtn.onclick = () => setActiveFilter(favBtn, allFilterButtons);
    notesBtn.onclick = () => setActiveFilter(notesBtn, allFilterButtons);
    appliedBtn.onclick = () => setActiveFilter(appliedBtn, allFilterButtons);
    hideAppliedBtn.onclick = () => setActiveFilter(hideAppliedBtn, allFilterButtons);
    showHiddenBtn.onclick = () => setActiveFilter(showHiddenBtn, allFilterButtons);

    resetBtn.onclick = () => {
        if (window.confirm('Are you sure you want to clear all applied statuses, notes, favorites, hidden jobs, AND caches? This cannot be undone.')) {
            setApplied({});
            setFavorites({});
            setNotes({});
            setHidden({});
            localStorage.removeItem(appliedKey);
            localStorage.removeItem(favoriteKey);
            localStorage.removeItem(notesKey);
            localStorage.removeItem(hiddenKey);
            localStorage.removeItem(themekey);

            try {
                const removedCount = removeLocalStorageKeysWithPrefix(['hn_thread_comments_', CATEGORY_CACHE_KEY]);
                console.log(`Removed ${removedCount} cached items from localStorage.`);
            } catch (e) {
                console.error("Error clearing caches from localStorage", e);
            }

            allFilterButtons.forEach(b => b.classList.remove(highlightClass));
            showToast('All data cleared. Reloading...');
            window.location.reload();
        }
    };

    controlButtonsContainer.appendChild(favBtn);
    controlButtonsContainer.appendChild(notesBtn);
    controlButtonsContainer.appendChild(appliedBtn);
    controlButtonsContainer.appendChild(hideAppliedBtn);
    controlButtonsContainer.appendChild(showHiddenBtn);
    controlButtonsContainer.appendChild(resetBtn);
}
// --- END: Filter Buttons ---

// --- START: Job Card Click Handler ---
function handleJobCardClick(event) {
    const target = event.target;
    const jobCard = target.closest('.job-card');
    if (!jobCard) return;

    const jobId = jobCard.dataset.jobId;
    if (!jobId) return;

    const actionTarget = target.closest('[data-action]');
    if (!actionTarget) return;

    const action = actionTarget.dataset.action;
    const noteEl = jobCard.querySelector('.note');
    
    const currentAppliedState = { ...applied };
    const currentNotesState = { ...notes };
    const currentFavoritesState = { ...favorites };
    const currentHiddenState = { ...hidden };

    if (!currentAppliedState[currentThreadId]) currentAppliedState[currentThreadId] = {};
    if (!currentNotesState[currentThreadId]) currentNotesState[currentThreadId] = {};
    if (!currentFavoritesState[currentThreadId]) currentFavoritesState[currentThreadId] = {};
    if (!currentHiddenState[currentThreadId]) currentHiddenState[currentThreadId] = {};

    if (action === 'star') {
        const starButton = actionTarget;
        if (currentFavoritesState[currentThreadId][jobId]) {
            delete currentFavoritesState[currentThreadId][jobId];
            starButton.classList.add('inactive');
        } else {
            currentFavoritesState[currentThreadId][jobId] = true;
            starButton.classList.remove('inactive');
        }
        setFavorites(currentFavoritesState);
        localStorage.setItem(favoriteKey, JSON.stringify(favorites));
        if (favBtn && favBtn.classList.contains(highlightClass)) {
            renderJobs(allComments);
        }
    } else if (action === 'copy-link') {
        const url = `https://news.ycombinator.com/item?id=${jobId}`;
        navigator.clipboard.writeText(url)
            .then(() => showToast('Link copied!'))
            .catch(err => showToast('Failed to copy link.'));
    } else if (action === 'save-note') {
        const noteText = noteEl ? noteEl.value.trim() : '';
        if (noteText) {
            currentNotesState[currentThreadId][jobId] = noteText;
        } else {
            if (currentNotesState[currentThreadId][jobId]) {
                delete currentNotesState[currentThreadId][jobId];
            }
        }
        setNotes(currentNotesState);
        localStorage.setItem(notesKey, JSON.stringify(notes));
        showToast('Note saved!');
        if (notesBtn && notesBtn.classList.contains(highlightClass)) {
            renderJobs(allComments);
        }
    } else if (action === 'apply') {
        currentAppliedState[currentThreadId][jobId] = new Date().toISOString();
        setApplied(currentAppliedState);
        localStorage.setItem(appliedKey, JSON.stringify(applied));
        showToast('Marked as applied!');
        if ((appliedBtn && appliedBtn.classList.contains(highlightClass)) ||
            (notesBtn && notesBtn.classList.contains(highlightClass)) ||
            (hideAppliedBtn && hideAppliedBtn.classList.contains(highlightClass))) {
            renderJobs(allComments);
        } else {
            updateJobCardInPlace(jobId, applied[currentThreadId][jobId]);
        }
    } else if (action === 'unapply') {
        if (currentAppliedState[currentThreadId][jobId]) {
            delete currentAppliedState[currentThreadId][jobId];
            setApplied(currentAppliedState);
            localStorage.setItem(appliedKey, JSON.stringify(applied));
            showToast('Removed applied status');
            if ((appliedBtn && appliedBtn.classList.contains(highlightClass)) ||
                (notesBtn && notesBtn.classList.contains(highlightClass)) ||
                (hideAppliedBtn && hideAppliedBtn.classList.contains(highlightClass))) {
                renderJobs(allComments);
            } else {
                updateJobCardInPlace(jobId, false);
            }
        }
    } else if (action === 'remove') {
        currentHiddenState[currentThreadId][jobId] = true;
        setHidden(currentHiddenState);
        localStorage.setItem(hiddenKey, JSON.stringify(hidden));
        showToast('Excluded!');
        renderJobs(allComments);
    } else if (action === 'unhide') {
        if (currentHiddenState[currentThreadId][jobId]) {
            delete currentHiddenState[currentThreadId][jobId];
            setHidden(currentHiddenState);
            localStorage.setItem(hiddenKey, JSON.stringify(hidden));
            showToast('Restored!');
            renderJobs(allComments);
        }
    }
}

function setupJobCardClickListener() {
    if (jobsContainer) {
        jobsContainer.addEventListener('click', handleJobCardClick);
    }
}
// --- END: Job Card Click Handler ---

// --- START: Theme Toggle ---
function toggleDark() {
    document.body.classList.toggle('dark');
    updateThemeIcon();
    if (document.body.classList.contains('dark')) {
        localStorage.removeItem(themekey);
        showToast('Dark mode enabled');
    } else {
        localStorage.setItem(themekey, 'disabled');
        showToast('Light mode enabled');
    }
}

function setupTheme() {
    if (localStorage.getItem(themekey) === 'disabled') {
        document.body.classList.remove('dark');
    } else {
        document.body.classList.add('dark');
    }
    updateThemeIcon();
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleDark);
    }
}
// --- END: Theme Toggle ---

// --- START: Search Input & Operator Buttons ---
const debouncedRenderJobs = debounce(() => {
    if (typeof allComments !== 'undefined') {
         renderJobs(allComments);
    }
}, searchDebounceTimeout);


function setupSearchAndOperatorButtons() {
    if (searchInput) {
        searchInput.addEventListener('input', debouncedRenderJobs);
    }

    document.querySelectorAll('.op-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            if (!searchInput) return;
            const operator = button.dataset.op;
            const currentPos = searchInput.selectionStart;
            const currentValue = searchInput.value;
            searchInput.value = currentValue.substring(0, currentPos) + operator + currentValue.substring(currentPos);
            searchInput.focus();
            searchInput.setSelectionRange(currentPos + operator.length, currentPos + operator.length);
            debouncedRenderJobs();
        });
    });

    const tryExampleLink = document.getElementById('try-example-search');
    if (tryExampleLink && searchInput) {
        tryExampleLink.addEventListener('click', (event) => {
            event.preventDefault();
            const exampleQuery = CATEGORY_API_MAP[currentCategory]?.example_query || '';
            searchInput.value = exampleQuery;
            searchInput.focus();
            if (clearSearchBtn) {
                 clearSearchBtn.style.display = exampleQuery.length > 0 ? 'inline-block' : 'none';
            }
            debouncedRenderJobs();
        });
    }
}
// --- END: Search Input & Operator Buttons ---

// --- START: Go To Top Button ---
function setupGoToTopButton() {
    if (!goToTopButton) return;
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300 && (!toastElement || !toastElement.classList.contains('show'))) {
            goToTopButton.classList.add('visible');
        } else {
            goToTopButton.classList.remove('visible');
        }
    });
    goToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
// --- END: Go To Top Button ---

// --- START: Help Modal ---
function setupHelpModal() {
    if (openHelpModalBtn && helpModal && closeHelpModalBtn) {
        openHelpModalBtn.onclick = function() { helpModal.style.display = 'flex'; };
        closeHelpModalBtn.onclick = function() { helpModal.style.display = 'none'; };
        window.addEventListener('click', function(e) {
            if (e.target === helpModal) helpModal.style.display = 'none';
        });
        window.addEventListener('keydown', function(e) {
          if (e.key === 'Escape' && helpModal.style.display === 'flex') {
              helpModal.style.display = 'none';
          }
        });
    }
}
// --- END: Help Modal ---


// --- START: Initialization ---
export function initUIEventListeners() {
    cacheDOMElements();

    setupClearSearchButton();
    setupGlobalKeyboardShortcuts();
    setupToastScrollListener();
    setupFilterButtons();
    setupJobCardClickListener();
    setupTheme();
    setupSearchAndOperatorButtons();
    setupGoToTopButton();
    setupHelpModal();

    if (searchInput && searchInput.value) {
        const queryTokens = parseQuery(searchInput.value);
        renderParsedQuery(queryTokens);
    } else {
        renderParsedQuery([]);
    }
}
// --- END: Initialization ---
