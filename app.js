// app.js - Main application entry point
import { initUIEventListeners } from './ui-events.js';
import { fetchAndStoreThreads } from './thread-manager.js';

function initializeApp() {
    // 1. Initialize all UI event listeners
    // This also handles initial renderParsedQuery if search input has value
    // and sets up render functions for thread-manager internally if still needed by it (which it isn't)
    initUIEventListeners();

    // 2. Fetch initial thread data for all categories
    // This will internally trigger rendering of category switcher, thread switcher, and jobs for the default/latest thread
    // as thread-manager.js now directly imports its rendering dependencies from ui-render.js
    fetchAndStoreThreads(); 

    console.log("Application initialized.");
}

// Start the application
initializeApp();
