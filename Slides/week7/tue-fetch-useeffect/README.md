# CSC 436, Week 7, Tuesday Oct 6: Mission 5, fetch + useEffect + Three States

Interactive deck. Theme: Recipe Finder. Ends with the Build Recipe Finder assignment. Project 3 is assigned today.

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

1. Title: the three chips
2. Warm-up: predict the print order (event loop)
3. The trap: fetch in the component body
4. useEffect anatomy, click the pieces
5. Dependency array playground with an effect log
6. First fetch, blank while waiting
7. The Three States Pattern (live, with failure toggle)
8. async/await spelling and res.ok
9. Search with [query] and cleanup, fetch counter
10. Progression: four stages (maps to examples/recipe-finder stages 1 to 4)
11. Assignment: Build Recipe Finder
12. Close quiz

ESM throughout. No require() or module.exports.
