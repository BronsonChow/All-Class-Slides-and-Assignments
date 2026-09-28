import { useState, useEffect } from "react";
import { T } from "./ui.jsx";

/* ------------------------------------------------------------------
   Jeopardy: three components, one owner.
   App (Jeopardy) owns teams, scores, used clues, open clue.
   Board, ClueModal, Scoreboard receive props and call back up.
   This file is read in class on the "open the source" slide.
------------------------------------------------------------------- */

export const CATEGORIES = [
  {
    name: "JSX",
    clues: [
      { v: 100, q: "This attribute replaces class in JSX.", a: "className" },
      { v: 200, q: "A component must return exactly this many top-level elements.", a: "One (or a fragment)" },
      { v: 300, q: "These two characters let you write JavaScript inside JSX.", a: "Curly braces { }" },
      { v: 400, q: "Component names must start with this kind of letter, or React treats them as HTML.", a: "A capital letter" },
      { v: 500, q: "Write the JSX for a self-closing image tag with a src of logo.png.", a: '<img src="logo.png" />' },
    ],
  },
  {
    name: "Props",
    clues: [
      { v: 100, q: "Props flow in this direction through the tree.", a: "Down, parent to child" },
      { v: 200, q: "True or false: a child can reassign a prop to change what the parent shows.", a: "False. Props are read-only." },
      { v: 300, q: "The syntax that pulls name and price out of the props object in the function signature.", a: "Destructuring: function Item({ name, price })" },
      { v: 400, q: "To pass a number 5 as a prop called count, you write this.", a: "count={5}" },
      { v: 500, q: "A prop whose value is a function. Name the pattern and what it is for.", a: "Callback prop. Lets the child tell the parent something happened." },
    ],
  },
  {
    name: "State",
    clues: [
      { v: 100, q: "The hook that gives a component memory between renders.", a: "useState" },
      { v: 200, q: "useState returns an array of these two things.", a: "The current value and a setter function" },
      { v: 300, q: "setCount(count + 1) three times in one click ends at this number if count started at 0.", a: "1. The snapshot rule." },
      { v: 400, q: "The setter form you use when the new value depends on the old one.", a: "Functional update: setCount(c => c + 1)" },
      { v: 500, q: "cart.coffee += 1; setCart(cart). Why does nothing render?", a: "Same object reference. React sees no change. Spread into a new object." },
    ],
  },
  {
    name: "Events",
    clues: [
      { v: 100, q: "The React prop for a click handler.", a: "onClick" },
      { v: 200, q: "onClick={save()} versus onClick={save}. Which is broken and why?", a: "save() calls it during render. Pass the function, not its result." },
      { v: 300, q: "The line that stops a form from reloading the page.", a: "e.preventDefault()" },
      { v: 400, q: "An input with value={name} but no onChange does this.", a: "Freezes. You cannot type in it." },
      { v: 500, q: "Where the typed text lives in a controlled input.", a: "In state, not in the DOM" },
    ],
  },
  {
    name: "Lists and Keys",
    clues: [
      { v: 100, q: "The array method that turns data into elements.", a: "map" },
      { v: 200, q: "The best value for key when your data has one.", a: "A stable id" },
      { v: 300, q: "Add an item to an array in state without push.", a: "setItems([...items, newItem])" },
      { v: 400, q: "Remove the item with a given id.", a: "setItems(items.filter(i => i.id !== id))" },
      { v: 500, q: "Toggle done on one item in a list. Write the pattern.", a: "items.map(i => i.id === id ? { ...i, done: !i.done } : i)" },
    ],
  },
  {
    name: "Fix the Bug",
    clues: [
      { v: 100, q: "let count = 0 outside the component, count++ on click. Screen never changes. Fix it.", a: "Move it into useState" },
      { v: 200, q: "{items && <List />} shows a 0 when empty. Fix it.", a: "items.length > 0 &&  or a ternary" },
      { v: 300, q: "<input value={text} /> cannot be typed into. Fix it.", a: "Add onChange={e => setText(e.target.value)}" },
      { v: 400, q: "Warning: each child in a list should have a unique key. Fix it.", a: "Add key={item.id} on the element returned from map" },
      { v: 500, q: "Two sibling components each have their own copy of cart and drift apart. Fix it.", a: "Lift cart into the parent and pass it down as a prop" },
    ],
  },
];

const TEAM_COLORS = ["#2563EB", "#0E9F6E", "#E8590C", "#7C3AED", "#DB2777"];

/* ---------------------------------- Board -------------------------------- */
function Board({ categories, used, onPick }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${categories.length}, 1fr)`, gap: 8 }}>
      {categories.map((c) => (
        <div key={c.name} style={{ background: T.ink, color: "#fff", borderRadius: 10, padding: "12px 8px", textAlign: "center", fontWeight: 700, fontSize: 15, minHeight: 56, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {c.name}
        </div>
      ))}
      {[0, 1, 2, 3, 4].map((row) =>
        categories.map((c, ci) => {
          const id = `${ci}-${row}`;
          const done = used.includes(id);
          return (
            <button
              key={id}
              disabled={done}
              onClick={() => onPick(ci, row)}
              className="mono"
              style={{ background: done ? T.bg : T.surface, border: `1px solid ${T.line}`, borderRadius: 10, padding: "16px 0", fontSize: 26, fontWeight: 700, color: done ? T.line : T.accent, cursor: done ? "default" : "pointer" }}
            >
              {done ? "" : c.clues[row].v}
            </button>
          );
        })
      )}
    </div>
  );
}

/* -------------------------------- ClueModal ------------------------------ */
function ClueModal({ clue, category, teams, onAward, onClose }) {
  const [showAnswer, setShowAnswer] = useState(false);
  useEffect(() => {
    document.body.dataset.lock = "1";
    return () => { delete document.body.dataset.lock; };
  }, []);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(17,20,24,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
      <div style={{ width: 860, background: T.surface, borderRadius: 18, padding: 36 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="chip blue">{category}</span>
          <span className="mono num-display" style={{ fontSize: 26, color: T.accent }}>{clue.v}</span>
        </div>
        <div style={{ fontSize: 30, fontWeight: 600, color: T.ink, lineHeight: 1.35, margin: "26px 0", minHeight: 90 }}>{clue.q}</div>
        {showAnswer ? (
          <div className="callout good" style={{ fontSize: 22 }}>
            <div className="h">Answer</div>
            <span className="mono">{clue.a}</span>
          </div>
        ) : (
          <button className="btn accent" onClick={() => setShowAnswer(true)}>Show answer</button>
        )}
        <div style={{ marginTop: 26 }}>
          <div className="note" style={{ marginBottom: 8 }}>Award to</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {teams.map((t, i) => (
              <button key={t.id} className="btn" style={{ borderColor: TEAM_COLORS[i], color: TEAM_COLORS[i], fontWeight: 600 }} onClick={() => onAward(t.id, clue.v)}>+{clue.v} {t.name}</button>
            ))}
            {teams.map((t, i) => (
              <button key={"m" + t.id} className="btn small" style={{ color: T.muted }} onClick={() => onAward(t.id, -clue.v)}>-{clue.v} {t.name}</button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
          <button className="btn" onClick={onClose}>No one got it, close</button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- Scoreboard ----------------------------- */
function Scoreboard({ teams, onRename, onAdjust }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${teams.length}, 1fr)`, gap: 10 }}>
      {teams.map((t, i) => (
        <div key={t.id} className="panel" style={{ padding: 12, borderTop: `4px solid ${TEAM_COLORS[i]}` }}>
          <input className="input" value={t.name} onChange={(e) => onRename(t.id, e.target.value)} style={{ padding: "6px 8px", fontSize: 14, fontWeight: 600 }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
            <button className="btn round" onClick={() => onAdjust(t.id, -100)}>-</button>
            <span className="mono num-display" style={{ fontSize: 28, color: t.score < 0 ? T.warn : T.ink }}>{t.score}</span>
            <button className="btn round" onClick={() => onAdjust(t.id, 100)}>+</button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------ App -------------------------------- */
const START_TEAMS = [
  { id: 1, name: "Team 1", score: 0 },
  { id: 2, name: "Team 2", score: 0 },
  { id: 3, name: "Team 3", score: 0 },
  { id: 4, name: "Team 4", score: 0 },
  { id: 5, name: "Team 5", score: 0 },
];

export default function Jeopardy({ compact }) {
  const [teams, setTeams] = useState(START_TEAMS);
  const [used, setUsed] = useState([]);
  const [open, setOpen] = useState(null); // { ci, row } or null

  function pick(ci, row) {
    setOpen({ ci, row });
  }
  function award(teamId, delta) {
    setTeams(teams.map((t) => (t.id === teamId ? { ...t, score: t.score + delta } : t)));
    closeClue();
  }
  function closeClue() {
    if (open) setUsed([...used, `${open.ci}-${open.row}`]);
    setOpen(null);
  }
  function rename(teamId, name) {
    setTeams(teams.map((t) => (t.id === teamId ? { ...t, name } : t)));
  }
  function adjust(teamId, delta) {
    setTeams(teams.map((t) => (t.id === teamId ? { ...t, score: t.score + delta } : t)));
  }
  function reset() {
    setTeams(START_TEAMS);
    setUsed([]);
    setOpen(null);
  }

  const leader = [...teams].sort((a, b) => b.score - a.score)[0];
  const remaining = 30 - used.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: compact ? 10 : 14, height: "100%" }}>
      <Board categories={CATEGORIES} used={used} onPick={pick} />
      <Scoreboard teams={teams} onRename={rename} onAdjust={adjust} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="note">{remaining} clues left. {remaining === 0 ? `${leader.name} wins with ${leader.score}.` : `${leader.name} leads.`}</span>
        <button className="btn small" onClick={reset}>Reset game</button>
      </div>
      {open && (
        <ClueModal
          clue={CATEGORIES[open.ci].clues[open.row]}
          category={CATEGORIES[open.ci].name}
          teams={teams}
          onAward={award}
          onClose={closeClue}
        />
      )}
    </div>
  );
}
