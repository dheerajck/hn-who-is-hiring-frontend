export const USE_MOCK_DATA = false;

// --- START: Mock Data Definitions ---
export const MOCK_HIRING_THREADS_INITIAL = [
  { objectID: "43884796", title: "Ask HN: Who is hiring? (May 2025 - Mock)" }, // Newest
  { objectID: "43872046", title: "Ask HN: Who is hiring? (April 2025 - Mock)" },
  { objectID: "43866535", title: "Ask HN: Who is hiring? (March 2025 - Mock)" },
  { objectID: "43865039", title: "Ask HN: Who is hiring? (Feb 2025 - Mock)" },
  { objectID: "43861861", title: "Ask HN: Who is hiring? (Jan 2025 - Mock)" },
  { objectID: "43861420", title: "Ask HN: Who is hiring? (Dec 2024 - Mock)" },
  { objectID: "43858638", title: "Ask HN: Who is hiring? (Nov 2024 - Mock)" },
];
export const MOCK_HIRING_THREADS_UPDATE = [
  {
    objectID: "43864562",
    title: "Ask HN: Who is hiring? (June 2025 - Mock NEW)",
  }, // The new one for background check
  ...MOCK_HIRING_THREADS_INITIAL, // Include the previous ones
];

export const MOCK_HIRED_THREADS_INITIAL = [
  {
    objectID: "40000001",
    title: "Ask HN: Who wants to be hired? (May 2025 - Mock)",
  },
  {
    objectID: "40000002",
    title: "Ask HN: Who wants to be hired? (April 2025 - Mock)",
  },
  {
    objectID: "40000003",
    title: "Ask HN: Who wants to be hired? (March 2025 - Mock)",
  },
];
export const MOCK_HIRED_THREADS_UPDATE = [
  {
    objectID: "40000004",
    title: "Ask HN: Who wants to be hired? (June 2025 - Mock NEW)",
  },
  ...MOCK_HIRED_THREADS_INITIAL,
];

export const MOCK_FREELANCER_THREADS_INITIAL = [
  { objectID: "50000001", title: "Ask HN: Freelancer? (May 2025 - Mock)" },
  { objectID: "50000002", title: "Ask HN: Freelancer? (April 2025 - Mock)" },
  { objectID: "50000003", title: "Ask HN: Freelancer? (March 2025 - Mock)" },
];
export const MOCK_FREELANCER_THREADS_UPDATE = [
  { objectID: "50000004", title: "Ask HN: Freelancer? (June 2025 - Mock NEW)" },
  ...MOCK_FREELANCER_THREADS_INITIAL,
];

export const MOCK_COMMENTS_INITIAL = {
  43884796: [
    // Comments for the first mock hiring thread
    {
      id: 101,
      text: "Mock Job 1: We need a JavaScript wizard! Remote OK.",
      author: "mock_company_1",
      created_at: "2025-05-03T10:00:00Z",
      created_at_i: 1746266400,
      parent_id: 43884796,
      story_id: 43884796,
      type: "comment",
    },
    {
      id: 102,
      text: "Mock Job 2: Python developer wanted. On-site.",
      author: "mock_company_2",
      created_at: "2025-05-03T09:30:00Z",
      created_at_i: 1746264600,
      parent_id: 43884796,
      story_id: 43884796,
      type: "comment",
    },
    {
      id: 103,
      text: "Mock Job 3: Rust engineer needed. <pre><code>code example</code></pre>",
      author: "mock_company_3",
      created_at: "2025-05-03T09:00:00Z",
      created_at_i: 1746262800,
      parent_id: 43884796,
      story_id: 43884796,
      type: "comment",
    },
  ],
  43861420: [
    // Dec 2024 hiring
    {
      id: 1001,
      text: "Old Job 1: C++ developer. Remote.",
      author: "old_company_1",
      created_at: "2024-12-05T10:00:00Z",
      created_at_i: 1733385600,
      parent_id: 43861420,
      story_id: 43861420,
      type: "comment",
    },
    {
      id: 1002,
      text: "Old Job 2: QA tester. On-site.",
      author: "old_company_2",
      created_at: "2024-12-05T09:30:00Z",
      created_at_i: 1733383800,
      parent_id: 43861420,
      story_id: 43861420,
      type: "comment",
    },
  ],
  40000001: [
    // Comments for the first mock hired thread
    {
      id: 201,
      text: "Mock Person 1: Front-end developer available.",
      author: "mock_person_1",
      created_at: "2025-05-03T11:00:00Z",
      created_at_i: 1746270000,
      parent_id: 40000001,
      story_id: 40000001,
      type: "comment",
    },
  ],
  50000001: [
    // Comments for the first mock freelancer thread
    {
      id: 301,
      text: "Mock Freelancer 1: UI/UX Designer looking for projects.",
      author: "mock_freelancer_1",
      created_at: "2025-05-03T12:00:00Z",
      created_at_i: 1746273600,
      parent_id: 50000001,
      story_id: 50000001,
      type: "comment",
    },
  ],
};

export const MOCK_COMMENTS_UPDATE = {
  43884796: [
    // New comments for the first mock hiring thread
    {
      objectID: "mock104",
      comment_text: "Mock Job 5 (NEW): Go developer, remote.",
      author: "mock_company_5",
      created_at: "2025-05-04T11:00:00Z",
      created_at_i: 1746356400,
      parent_id: 43884796,
      story_id: 43884796,
      story_title: "Ask HN: Who is hiring? (May 2025 - Mock)",
      type: "comment",
    },
    {
      objectID: "mock105",
      comment_text: "Mock Job 4 (NEW): Data Scientist needed.",
      author: "mock_company_4",
      created_at: "2025-05-04T10:30:00Z",
      created_at_i: 1746354600,
      parent_id: 43884796,
      story_id: 43884796,
      story_title: "Ask HN: Who is hiring? (May 2025 - Mock)",
      type: "comment",
    },
  ],
  40000001: [
    {
      objectID: "mock202",
      comment_text: "Mock Person 2 (NEW): Backend engineer for hire.",
      author: "mock_person_2",
      created_at: "2025-05-04T12:00:00Z",
      created_at_i: 1746360000,
      parent_id: 40000001,
      story_id: 40000001,
      story_title: "Ask HN: Who wants to be hired? (May 2025 - Mock)",
      type: "comment",
    },
  ],
  50000001: [
    {
      objectID: "mock302",
      comment_text: "Mock Freelancer 2 (NEW): Mobile dev for short projects.",
      author: "mock_freelancer_2",
      created_at: "2025-05-04T13:00:00Z",
      created_at_i: 1746363600,
      parent_id: 50000001,
      story_id: 50000001,
      story_title: "Ask HN: Freelancer? (May 2025 - Mock)",
      type: "comment",
    },
  ],
};

// Consolidated mock data for all categories, for background check
export const MOCK_BACKGROUND_ALL_THREADS = {
  hiring: MOCK_HIRING_THREADS_UPDATE,
  hired: MOCK_HIRED_THREADS_UPDATE,
  freelancer: MOCK_FREELANCER_THREADS_UPDATE,
};
// Consolidated mock data for all categories, for initial load
export const MOCK_INITIAL_ALL_THREADS = {
  hiring: MOCK_HIRING_THREADS_INITIAL,
  hired: MOCK_HIRED_THREADS_INITIAL,
  freelancer: MOCK_FREELANCER_THREADS_INITIAL,
};
// --- END: Mock Data Definitions ---

export const appliedKey = "appliedHNv1";
export const notesKey = "notesHNv1";
export const favoriteKey = "favoriteHNv1";
export const themekey = "themeHNv1";
export const hiddenKey = "hiddenHNv1";

export const searchDebounceTimeout = 300;
export const toastTimeout = 3000;

export const CATEGORY_CACHE_KEY = "hn_category_threads";

export const CATEGORY_API_MAP = {
  hiring: {
    query: '"Ask HN: Who is hiring?"',
    tags: "ask_hn",
    label: "Who is Hiring?",
    example_query: "python | javascript & remote & ~us-based",
  },
  hired: {
    query: '"Ask HN: Who wants to be hired?"',
    tags: "ask_hn",
    label: "Who Wants to be Hired?",
    example_query: "dheerajck18@gmail.com & python",
  },
  freelancer: {
    query: '"Ask HN: Freelancer?"',
    tags: "ask_hn",
    label: "Freelancer? Seeking freelancer?",
    example_query: "dheerajck18@gmail.com & python",
  },
};

export const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
