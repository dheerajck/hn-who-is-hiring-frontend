# Who's Hiring — Hacker News Job Search

Try it out: [here](https://dheerajck.github.io/hn-who-is-hiring-frontend/)

An intuitive and easy to use frontend for Hacker News Who's Hiring threads in your browser -- completely local, no data leaves your browser.

## Search Query Syntax

Use the following syntax to filter job posts:

- **`remote`**  
  Finds jobs mentioning the word `remote`.

- **`data scientist`**  
  Finds jobs mentioning the exact phrase `data scientist`.

- **`"data scientist"`**  
  Same as above — quotes ensure it's treated as a single phrase.

- **`rust & backend`**  
  Finds jobs that mention both `rust` **and** `backend`.

- **`react | angular`**  
  Finds jobs that mention **either** `react` **or** `angular`.

- **`~onsite`**  
  Excludes jobs that mention `onsite`.

- **`~"bay area"`**  
  Excludes jobs that mention the exact phrase `bay area`.

- **`python | javascript & remote & ~us-based`**  
  Finds jobs that mention either `python` **or** `javascript`, **and** `remote`, **but not** `us-based`.
