import { initUIEventListeners } from "./ui-events.js";
import { fetchAndStoreThreads } from "./thread-manager.js";
import { CATEGORY_API_MAP } from "./config.js";
import { setCurrentCategory } from "./state.js";
import { showToast } from "./ui-render.js";

function initializeApp() {
  // 0. Check for category in query params and set it if present
  const params = new URLSearchParams(window.location.search);
  const categoryParam = params.get("category");
  let selectedCategory = "hiring";
  let invalidCategory = false;
  if (categoryParam) {
    if (CATEGORY_API_MAP[categoryParam]) {
      selectedCategory = categoryParam;
    } else {
      invalidCategory = true;
    }
  }

  setCurrentCategory(selectedCategory);

  if (invalidCategory) {
    showToast(
      `Invalid category: '${categoryParam}'. Showing 'hiring' instead.`,
      4000
    );
  }

  // 1. Initialize all UI event listeners
  // This also handles initial renderParsedQuery if search input has value
  // and sets up render functions for thread-manager internally if still needed by it (which it isn't)
  initUIEventListeners();

  // 2. Fetch initial thread data for all categories
  // This will internally trigger rendering of category switcher, thread switcher, and jobs for the default/latest thread
  // as thread-manager.js now directly imports its rendering dependencies from ui-render.js
  fetchAndStoreThreads();

  // console.log("Application initialized.");
}

// Start the application
initializeApp();
