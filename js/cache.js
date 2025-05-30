export function removeLocalStorageKeysWithPrefix(prefixOrPrefixes) {
    const prefixes = Array.isArray(prefixOrPrefixes) ? prefixOrPrefixes : [prefixOrPrefixes];
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && prefixes.some(prefix => key.startsWith(prefix))) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    return keysToRemove.length;
}

export function setCache(key, data) {
    const item = {
        data: data,
    };
    try {
        localStorage.setItem(key, JSON.stringify(item));
    } catch (e) {
        console.error("Error saving to localStorage", e);
    }
}

export function getCache(key) {
    try {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) {
            return null;
        }
        const item = JSON.parse(itemStr);
        return item.data;
    } catch (e) {
        console.error("Error reading from localStorage", e);
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
        parent_id: comment.parent_id
    };
}
