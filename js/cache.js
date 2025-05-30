import LZString from 'https://cdn.skypack.dev/lz-string';

export function removeLocalStorageKeysWithPrefix(prefixOrPrefixes) {
  const prefixes = Array.isArray(prefixOrPrefixes)
    ? prefixOrPrefixes
    : [prefixOrPrefixes];
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && prefixes.some((prefix) => key.startsWith(prefix))) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));
  return keysToRemove.length;
}

export function setCache(key, data) {
  const item = {
    data: data,
  };
  try {
    const stringifiedItem = JSON.stringify(item);
    const compressedItem = LZString.compressToUTF16(stringifiedItem);
    localStorage.setItem(key, compressedItem);
  } catch (e) {
    console.error("Error saving to localStorage", e);
    // Attempt to save uncompressed if compression fails for some reason (e.g., LZString not loaded)
    // Or, handle more gracefully depending on how critical compression is.
    try {
        localStorage.setItem(key, JSON.stringify(item));
        console.warn(`Stored ${key} uncompressed due to an earlier compression error.`);
    } catch (e2) {
        console.error("Error saving uncompressed data to localStorage either", e2);
    }
  }
}

export function getCache(key) {
  try {
    const compressedItemStr = localStorage.getItem(key);
    if (!compressedItemStr) {
      return null;
    }

    let itemStr;
    // Try to decompress, if it fails, assume it's old, uncompressed data
    try {
      itemStr = LZString.decompressFromUTF16(compressedItemStr);
      if (itemStr === null || itemStr === "") { // Decompression might return null or empty for invalid input
        // If decompression results in null/empty, it might be uncompressed data or truly invalid
        // Let's assume it's uncompressed if it doesn't look like typical compressed output
        // This is a basic check; more robust checks might be needed if lz-string output can be confused with JSON
        if (compressedItemStr.startsWith("{") || compressedItemStr.startsWith("[")) {
            itemStr = compressedItemStr; // Assume it's uncompressed JSON
            console.warn(`Reading ${key} as uncompressed data.`);
        } else {
            // If it's not valid compressed data and not clearly uncompressed JSON, treat as error/corrupt
            console.error("Failed to decompress and data does not look like uncompressed JSON for key:", key);
            localStorage.removeItem(key);
            return null;
        }
      }
    } catch (e) {
      // If decompression throws an error, assume it's old, uncompressed data
      itemStr = compressedItemStr;
      console.warn(`Reading ${key} as uncompressed data due to decompression error.`);
    }

    if (!itemStr) { // If after all attempts itemStr is still not valid
        console.error("Could not retrieve valid data for key:", key);
        localStorage.removeItem(key); // Remove potentially corrupted item
        return null;
    }

    const item = JSON.parse(itemStr);
    return item.data;
  } catch (e) {
    console.error("Error reading from localStorage for key:", key, e);
    localStorage.removeItem(key); // Remove potentially corrupted item
    return null; // Treat errors as cache miss
  }
}

export function minimizeCommentObject(comment) {
  return {
    id: comment.id,
    text: comment.text,
    author: comment.author,
    created_at: comment.created_at,
    created_at_i: comment.created_at_i,
    parent_id: comment.parent_id,
  };
}
