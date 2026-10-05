# CSC 436, Week 7, Thursday Oct 8: Mission 6, Error Handling, Loading UX, Custom Hooks

Interactive deck. Recipe Finder continues. Ends with the Harden Recipe Finder assignment. Also plants the API key slide for Project 4.

## Run it

    npm install
    npm run dev

Open the printed URL (usually http://localhost:5173), then F11 for full screen.

## Presenting

- Right arrow, space, Page Down: next slide
- Left arrow, Page Up: previous slide
- Home: first slide
- N: toggle the instructor note strip
- Click a progress bar segment to jump

Demo slides have a Network delay slider and a Healthy / Failing toggle. The demos use a fake API (src/fakeApi.jsx) so they work without wifi. The live-code stages run against the real API in ../examples/recipe-finder.

Slides live in src/Deck.jsx. Shared theme and helpers are in src/ui.jsx. The student handout is the DOCX in this folder.

## Slides

1. Title: errors, loading, hooks
2. Warm-up: rate the error message (1 to 3)
3. Four ways a fetch fails
4. Retry button and automatic retries with backoff (live)
5. Loading UX: text vs skeleton vs keep old data (live)
6. The smell: three copies of the same effect
7. Extract useFetch in four cuts
8. Payoff: search plus detail, two useFetch calls (live)
9. Why an API key cannot live in React code
10. Assignment: Harden Recipe Finder
11. Close quiz

ESM throughout. No require() or module.exports.
