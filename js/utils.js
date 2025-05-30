import { MONTH_NAMES } from "./config.js";

// Debounce utility function
export function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// New helper to extract year and month from thread title
export function getYearAndMonthFromTitle(title) {
  const lowerTitle = title.toLowerCase();
  let yearMatch = lowerTitle.match(/\b(\d{4})\b/);
  let year = yearMatch ? parseInt(yearMatch[1]) : null;

  let month = null;
  for (let i = 0; i < MONTH_NAMES.length; i++) {
    if (lowerTitle.includes(MONTH_NAMES[i].toLowerCase())) {
      month = MONTH_NAMES[i];
      break;
    }
  }
  return { year, month };
}
