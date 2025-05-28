# Who's Hiring — Hacker News Job Search

Try it out: [here](https://dheerajck.github.io/hnwhoishiring/)

An intuitive and easy to use frontend for Hacker News Who's Hiring threads in your browser -- completely local, no data leaves your browser.

## Search Query Syntax

Use the following syntax to filter job posts:

- **`remote`**
  Matches jobs containing the word or substring `remote`.

- **`"@gmail.com"`**
  Matches jobs containing the exact string `"@gmail.com"`.

- **`rust & backend`**
  Matches jobs that mention both `rust` **and** `backend`.

- **`react | angular`**
  Matches jobs that mention **either** `react` **or** `angular`.

- **`~us-based`**
  Excludes jobs that mention the word `us-based`.

- **`~"bay area"`**
  Excludes jobs that mention the exact string `"bay area"`.

- **`python | javascript & remote & ~us-based`**
  Matches jobs that mention `python` **or** `javascript`, **and** `remote`, but **not** `us-based`.
