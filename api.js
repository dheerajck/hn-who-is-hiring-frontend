import { USE_MOCK_DATA, MOCK_HIRING_THREADS_INITIAL, MOCK_HIRING_THREADS_UPDATE, MOCK_HIRED_THREADS_INITIAL, MOCK_HIRED_THREADS_UPDATE, MOCK_FREELANCER_THREADS_INITIAL, MOCK_FREELANCER_THREADS_UPDATE, MOCK_COMMENTS_INITIAL, MOCK_COMMENTS_UPDATE } from './config.js';

// Helper function to fetch the latest list from API for a specific category
export async function fetchLatestThreadListFromApi(categoryConfig, isBackground = false) {
    if (USE_MOCK_DATA) {
        const { query } = categoryConfig;
        let mockData;
        if (query.includes("Who is hiring?")) {
            mockData = isBackground ? MOCK_HIRING_THREADS_UPDATE : MOCK_HIRING_THREADS_INITIAL;
        } else if (query.includes("Who wants to be hired?")) {
            mockData = isBackground ? MOCK_HIRED_THREADS_UPDATE : MOCK_HIRED_THREADS_INITIAL;
        } else if (query.includes("Freelancer?")) {
            mockData = isBackground ? MOCK_FREELANCER_THREADS_UPDATE : MOCK_FREELANCER_THREADS_INITIAL;
        } else {
            mockData = [];
        }
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([...mockData]);
            }, isBackground ? 2000 : 500); // Simulate network delay for background
        });
    }

    const { query, tags } = categoryConfig;
    const encodedQuery = encodeURIComponent(query);
    const apiUrl = `https://hn.algolia.com/api/v1/search_by_date?query=${encodedQuery}&tags=${tags}`;

    const res = await fetch(apiUrl);
    if (!res.ok) {
        throw new Error(`Failed to fetch thread list for category "${query}": ${res.statusText}`);
    }
    const data = await res.json();
    return data.hits || [];
}

// Fetches all comments for a given thread ID (cache miss scenario)
export async function fetchThreadComments(threadId) {
    if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 600));
        return (MOCK_COMMENTS_INITIAL[threadId] || []).slice().reverse();
    }
    const res = await fetch(`https://hn.algolia.com/api/v1/items/${threadId}`);
    if (!res.ok) {
        throw new Error(`Failed to fetch thread details: ${res.statusText}`);
    }
    const data = await res.json();
    // Only include top-level comments (those whose parent_id is the story_id itself)
    return (data.children || []).filter(c => c.parent_id === data.id).slice().reverse();
}

// Fetches newer comments for a given thread ID since a certain timestamp (cache hit scenario)
export async function fetchNewerComments(threadId, lastCachedTimestampMs) {
    if (USE_MOCK_DATA) {
        const mockUpdates = MOCK_COMMENTS_UPDATE[threadId] || [];
        await new Promise(resolve => setTimeout(resolve, 400));
        return mockUpdates;
    }
    const lastCachedTimestampSeconds = Math.floor(lastCachedTimestampMs / 1000);
    const updateApiUrl = `https://hn.algolia.com/api/v1/search_by_date?tags=comment,story_${threadId}&numericFilters=created_at_i>${lastCachedTimestampSeconds}&hitsPerPage=1000`;
    const updateRes = await fetch(updateApiUrl);
    if (!updateRes.ok) {
        throw new Error(`Failed to fetch updates: ${updateRes.statusText}`);
    }
    const updateData = await updateRes.json();
    return updateData.hits || [];
}
