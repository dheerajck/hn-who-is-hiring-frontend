// memory-usage.js
// Shows localStorage usage in the debug box

function getLocalStorageUsage() {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    // Each char is 2 bytes in UTF-16
    total += key.length * 2 + value.length * 2;
  }
  return total; // in bytes
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function updateMemoryUsageBox() {
  const el = document.getElementById('memory-usage-value');
  if (!el) return;
  const bytes = getLocalStorageUsage();
  el.textContent = formatBytes(bytes);
}

// Update every 2 seconds
setInterval(updateMemoryUsageBox, 2000);
// Initial update
updateMemoryUsageBox();

export { updateMemoryUsageBox };
