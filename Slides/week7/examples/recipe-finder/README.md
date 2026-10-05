# Recipe Finder, in eight stages

The in-class example for CSC 436 Week 7. Tuesday covers stages 1 to 4 (useEffect, fetch, the Three States, search with a dependency). Thursday covers 5 to 8 (error messages and retries, loading UX, extracting useFetch, a second hook).

    npm install
    npm run dev

Click a stage in the top bar. Each stage is a separate file in src/stages so you can diff them. Keep the Network tab open.

## Map

- src/api.js: the base URL and a ?delay= so loading is visible. Change DELAY to "" when you are done.
- src/stages/Stage1.jsx: effect sets document.title. No fetch.
- src/stages/Stage2.jsx: fetch once with []. Blank while waiting.
- src/stages/Stage3.jsx: loading / error / data. res.ok. try / catch / finally.
- src/stages/Stage4.jsx: [query] dependency and the alive cleanup flag.
- src/stages/Stage5.jsx: human error messages, Retry button, 3 attempts with backoff, never retry 404.
- src/stages/Stage6.jsx: skeleton on first load, keep old data dimmed on refetch, empty state.
- src/hooks/useFetch.js: the Three States packaged as a custom hook, with retries and keepData.
- src/stages/Stage7.jsx: Stage 6 rewritten with useFetch. No useEffect in the file.
- src/hooks/useDebounce.js: wait until typing stops.
- src/stages/Stage8.jsx: list plus detail, two useFetch calls, debounced search.

## Things to break on purpose

- Stage 3: import BROKEN from api.js and fetch that instead. Then delete the res.ok line and watch catch never run.
- Stage 4: set DELAY to "delay=3000", type "pas" fast, then comment out `alive = false` in the cleanup and see results arrive out of order.
- Stage 5: change the host to dummyjson.comx (network failure, retries) versus the path to /recipez (404, no retry).
- Any stage: make the useEffect callback async and read the warning.

API: https://dummyjson.com/docs/recipes. No key, allows browser requests. ESM throughout.
