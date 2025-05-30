import { appliedKey, notesKey, favoriteKey, hiddenKey } from './config.js';

export let applied = JSON.parse(localStorage.getItem(appliedKey) || '{}');
export let notes = JSON.parse(localStorage.getItem(notesKey) || '{}');
export let allThreads = {
    hiring: [],
    hired: [],
    freelancer: []
};
export let currentCategory = 'hiring'; // Default category
export let currentThreadId = null;
export let allComments = []; // This will now hold comments for the *currently selected* thread only
export let favorites = JSON.parse(localStorage.getItem(favoriteKey) || '{}');
export let hidden = JSON.parse(localStorage.getItem(hiddenKey) || '{}');

export let activeToastHideTimerId = null;
export let selectedYear = null;
export let hideApplied = false; // Assuming this is a global state based on previous plan

// Functions to update state if needed, to avoid direct modification from other modules (optional for now)
export function setApplied(newApplied) {
    applied = newApplied;
}

export function setNotes(newNotes) {
    notes = newNotes;
}

export function setAllThreads(newAllThreads) {
    allThreads = newAllThreads;
}

export function setCurrentCategory(newCurrentCategory) {
    currentCategory = newCurrentCategory;
}

export function setCurrentThreadId(newCurrentThreadId) {
    currentThreadId = newCurrentThreadId;
}

export function setAllComments(newAllComments) {
    allComments = newAllComments;
}

export function setFavorites(newFavorites) {
    favorites = newFavorites;
}

export function setHidden(newHidden) {
    hidden = newHidden;
}

export function setActiveToastHideTimerId(newId) {
    activeToastHideTimerId = newId;
}

export function setSelectedYear(newSelectedYear) {
    selectedYear = newSelectedYear;
}

export function setHideApplied(newHideApplied) {
    hideApplied = newHideApplied;
}
