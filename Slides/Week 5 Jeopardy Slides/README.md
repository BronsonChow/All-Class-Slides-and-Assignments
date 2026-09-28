# CSC 436, Week 6, Tuesday Sep 29: Mission 4, Composition and Lifting State

Game show lesson. Slide 2 is a playable React Jeopardy board. The rest of the deck opens the game's own source (src/Jeopardy.jsx) to teach lifting state. Ends with the Build Game Night assignment (DOCX in this folder).

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
- Arrow keys are disabled while a clue is open so you cannot skip slides mid-question

## Running the game

- Rename teams by typing in the scoreboard cards
- Click a dollar value to open the clue, Show answer, then award to a team (plus or minus)
- "No one got it, close" marks the clue used with no points
- Game state lives on slide 2, so leaving the slide and coming back resets it. Finish the board before moving on, or keep a tally on the whiteboard for the final round at the close.
- Clues are in the CATEGORIES array at the top of src/Jeopardy.jsx. Edit freely.

## Files

- src/Deck.jsx: the 11 slides and instructor notes
- src/Jeopardy.jsx: the game. Board, ClueModal, Scoreboard, and the App that owns their state. Open this in your editor during the "Open the source" slides.
- src/ui.jsx: shared theme and helpers
- Build-Game-Night-Assignment.docx: student handout

## Slides

1. Title and how the day runs
2. React Jeopardy (playable)
3. Where does the score live? (four options, vote)
4. Open the source: App
5. Open the source: Scoreboard (zero useState)
6. Break it: a child keeping its own copy
7. The round trip: one click, four steps
8. Lift or keep local? sorting game
9. Progression: one component to a lifted scoreboard in four stages
10. Assignment: Build Game Night
11. Close quiz, then finish the board

ESM throughout. No require() or module.exports.
