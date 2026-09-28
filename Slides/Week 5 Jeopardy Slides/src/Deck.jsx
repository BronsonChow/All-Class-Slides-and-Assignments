import { useState } from "react";
import { T, Code, Slide, Col, Qty, Reveal, Tiers, Checklist, Quiz, DeckShell } from "./ui.jsx";
import Jeopardy from "./Jeopardy.jsx";

/* ------------------------------------------------------------------
   CSC 436  |  Week 6, Tuesday Sep 29  |  Mission 4
   Composition and Lifting State. Game show first, then the dissection.
------------------------------------------------------------------- */

/* 1. Title */
function TitleSlide() {
  return (
    <div style={{ height: "100%", display: "grid", gridTemplateColumns: "1.1fr 1fr", alignItems: "center", padding: "0 80px", gap: 40 }}>
      <div>
        <div className="kicker">CSC 436, Week 6, Mission 4, Tuesday Sep 29</div>
        <h1 style={{ fontSize: 66, lineHeight: 1.0, fontWeight: 800 }}>Composition and Lifting State</h1>
        <p style={{ fontSize: 21, color: T.muted, marginTop: 22, maxWidth: 540, lineHeight: 1.5 }}>
          First we play a game. Then we open the game's source code, because the game is the lesson.
        </p>
      </div>
      <div className="panel" style={{ padding: 28 }}>
        <div style={{ fontSize: 20, fontWeight: 600, color: T.ink, marginBottom: 12 }}>How today runs</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 16, lineHeight: 1.5 }}>
          <div><span className="chip">1</span> Five teams. Jeopardy on everything from weeks 4 and 5.</div>
          <div><span className="chip">2</span> Open the source. Three components, one owner of the score.</div>
          <div><span className="chip">3</span> The rule: state lives in the closest common parent.</div>
          <div><span className="chip">4</span> You build your own scoreboard with the same split.</div>
        </div>
        <div className="note" style={{ marginTop: 16 }}>Pick team names now. Whoever is holding a laptop is the captain.</div>
      </div>
    </div>
  );
}

/* 2. The game */
function GameSlide() {
  return (
    <div style={{ height: "100%", padding: "22px 48px 12px", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <h2 style={{ fontSize: 28, fontWeight: 700 }}>React Jeopardy</h2>
        <span className="note">Click a value. Show the answer. Award the points. Rename teams inline.</span>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        <Jeopardy />
      </div>
    </div>
  );
}

/* 3. Where does the score live? */
function WhereSlide() {
  const [sel, setSel] = useState(null);
  const opts = [
    { id: "sb", label: "Inside Scoreboard", why: "Scoreboard shows the score, so it feels natural. But ClueModal needs to add points and it cannot reach into a sibling's state." },
    { id: "cm", label: "Inside ClueModal", why: "ClueModal changes the score. But it unmounts every time it closes, so its state would vanish with it." },
    { id: "both", label: "In both, kept in sync", why: "Two copies of the truth. The moment one updates and the other does not, the app lies to the user." },
    { id: "app", label: "In App, passed down", why: "App is the closest component that is above both Scoreboard and ClueModal. One copy. Both children read it as a prop. Both can ask App to change it through a callback." },
  ];
  return (
    <Slide kicker="The question" title="Three components need the score. Who owns it?">
      <Col>
        <div className="panel" style={{ padding: 14 }}>
          <Tree highlight={sel === "app" ? "app" : sel === "sb" ? "sb" : sel === "cm" ? "cm" : sel === "both" ? "both" : null} />
        </div>
        <div className="note">Board needs to know which clues are used. ClueModal needs to add points. Scoreboard needs to show and rename. All three touch the same data.</div>
      </Col>
      <Col>
        {opts.map((o) => (
          <button key={o.id} className={"panel"} onClick={() => setSel(o.id)} style={{ textAlign: "left", cursor: "pointer", borderColor: sel === o.id ? (o.id === "app" ? T.accent : T.warn) : T.line, fontFamily: "inherit" }}>
            <div style={{ fontWeight: 600, color: T.ink, fontSize: 16 }}>{o.label}</div>
            {sel === o.id && <div style={{ marginTop: 6, fontSize: 15, lineHeight: 1.5 }}>{o.why}</div>}
          </button>
        ))}
        {sel === "app" && <div className="callout good"><div className="h">The rule</div>State lives in the closest common parent of every component that reads or changes it. That is lifting state.</div>}
      </Col>
    </Slide>
  );
}
function Tree({ highlight }) {
  const node = (label, id, depth, extra) => {
    const on = highlight === id || (highlight === "both" && (id === "sb" || id === "cm"));
    return (
      <div key={id} style={{ marginLeft: depth * 28, padding: "6px 10px", borderRadius: 8, background: on ? (highlight === "app" ? T.accentSoft : T.warnSoft) : "transparent", display: "flex", gap: 10, alignItems: "center", fontSize: 16 }}>
        <span className="mono" style={{ color: T.blue }}>{"<" + label + " />"}</span>
        {extra && <span className="note">{extra}</span>}
      </div>
    );
  };
  return (
    <div>
      {node("App", "app", 0, "teams, used, open")}
      {node("Board", "board", 1, "reads used, calls onPick")}
      {node("ClueModal", "cm", 1, "reads teams, calls onAward")}
      {node("Scoreboard", "sb", 1, "reads teams, calls onRename, onAdjust")}
    </div>
  );
}

/* 4. Open the source: App */
function SourceAppSlide() {
  return (
    <Slide kicker="Open the source" title="App owns the truth and hands out two things: data and functions">
      <Col>
        <Code>{`export default function Jeopardy() {
  const [teams, setTeams] = useState(START_TEAMS)
  const [used, setUsed] = useState([])
  const [open, setOpen] = useState(null)

  function award(teamId, delta) {
    setTeams(teams.map(t =>
      t.id === teamId ? { ...t, score: t.score + delta } : t
    ))
    closeClue()
  }
  function rename(teamId, name) { /* same map pattern */ }

  return (
    <>
      <Board categories={CATEGORIES} used={used} onPick={pick} />
      <Scoreboard teams={teams} onRename={rename} onAdjust={adjust} />
      {open && <ClueModal clue={...} teams={teams} onAward={award} />}
    </>
  )
}`}</Code>
      </Col>
      <Col>
        <div className="callout blue">
          <div className="h">Props down</div>
          <span className="mono">teams</span>, <span className="mono">used</span>, <span className="mono">clue</span>. Plain data. The children render it and never edit it.
        </div>
        <div className="callout good">
          <div className="h">Events up</div>
          <span className="mono">onPick</span>, <span className="mono">onAward</span>, <span className="mono">onRename</span>. Functions defined in App, passed as props. When a child calls one, App's state changes, App re-renders, and new props flow down.
        </div>
        <div className="panel" style={{ fontSize: 15, lineHeight: 1.6 }}>
          Notice <span className="mono">award</span> is the same map-plus-spread pattern from Thursday. Nothing new inside the function. What is new is who calls it.
        </div>
      </Col>
    </Slide>
  );
}

/* 5. Open the source: Scoreboard */
function SourceChildSlide() {
  const [teams, setTeams] = useState([{ id: 1, name: "Team 1", score: 300 }, { id: 2, name: "Team 2", score: 500 }]);
  const adjust = (id, d) => setTeams(teams.map((t) => (t.id === id ? { ...t, score: t.score + d } : t)));
  const rename = (id, name) => setTeams(teams.map((t) => (t.id === id ? { ...t, name } : t)));
  return (
    <Slide kicker="Open the source" title="Scoreboard has zero useState. It is a pure function of its props.">
      <Col>
        <Code>{`function Scoreboard({ teams, onRename, onAdjust }) {
  return (
    <div>
      {teams.map(t => (
        <div key={t.id}>
          <input
            value={t.name}
            onChange={e => onRename(t.id, e.target.value)}
          />
          <button onClick={() => onAdjust(t.id, -100)}>-</button>
          <span>{t.score}</span>
          <button onClick={() => onAdjust(t.id, 100)}>+</button>
        </div>
      ))}
    </div>
  )
}`}</Code>
        <div className="callout">
          <div className="h">The input is controlled by the parent's state</div>
          value comes from a prop. onChange calls a prop. Scoreboard never stores the name. That is why renaming in Scoreboard instantly updates the buttons inside ClueModal.
        </div>
      </Col>
      <Col>
        <div className="panel">
          <div className="note" style={{ marginBottom: 8 }}>Live: this Scoreboard is rendered by a parent on this slide</div>
          {teams.map((t) => (
            <div key={t.id} className="row">
              <input className="input" value={t.name} onChange={(e) => rename(t.id, e.target.value)} style={{ width: 160 }} />
              <Qty value={t.score} onDec={() => adjust(t.id, -100)} onInc={() => adjust(t.id, 100)} />
            </div>
          ))}
        </div>
        <div className="panel" style={{ borderColor: T.blue }}>
          <div className="note" style={{ marginBottom: 6 }}>A sibling reading the same props</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: T.ink }}>{[...teams].sort((a, b) => b.score - a.score)[0].name} is leading</div>
        </div>
        <div className="note">Rename a team above. The sibling updates. Neither component talked to the other. Both read from the parent.</div>
      </Col>
    </Slide>
  );
}

/* 6. The broken version: state duplicated */
function BrokenSlide() {
  const [parentScore, setParentScore] = useState(0);
  const [childCopy, setChildCopy] = useState(0);
  return (
    <Slide kicker="Break it" title="What happens when a child keeps its own copy">
      <Col>
        <Code>{`// Broken Scoreboard: makes a private copy of the prop
function Scoreboard({ score }) {
  const [localScore, setLocalScore] = useState(score)
  return (
    <div>
      <span>{localScore}</span>
      <button onClick={() => setLocalScore(localScore + 100)}>+</button>
    </div>
  )
}

// useState(score) reads the prop ONCE, on the first render.
// After that, localScore and the parent's score drift apart.`}</Code>
        <div className="callout">
          <div className="h">The tell</div>
          Any time you write <span className="mono">useState(someProp)</span>, stop. You are about to have two sources of truth. Either the parent owns it and you use the prop directly, or the child owns it and the parent should not have it at all.
        </div>
      </Col>
      <Col>
        <div className="panel" style={{ borderColor: T.blue }}>
          <div className="note">Parent (App) score</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="num-display" style={{ fontSize: 40 }}>{parentScore}</span>
            <button className="btn primary" onClick={() => setParentScore(parentScore + 100)}>Award from ClueModal</button>
          </div>
        </div>
        <div className="panel" style={{ borderColor: T.warn }}>
          <div className="note">Broken Scoreboard's private copy</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="num-display" style={{ fontSize: 40, color: T.warn }}>{childCopy}</span>
            <button className="btn" onClick={() => setChildCopy(childCopy + 100)}>+ in Scoreboard</button>
          </div>
        </div>
        <div className="panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>They agree?</span>
          <span className="chip" style={parentScore !== childCopy ? { background: T.warnSoft, color: T.warn } : {}}>{parentScore === childCopy ? "Yes" : `No. Off by ${Math.abs(parentScore - childCopy)}`}</span>
        </div>
        <button className="btn small" onClick={() => { setParentScore(0); setChildCopy(0); }}>Reset</button>
      </Col>
    </Slide>
  );
}

/* 7. Callback naming and the wiring */
function WiringSlide() {
  const [step, setStep] = useState(0);
  const steps = [
    { t: "1. User clicks + in Scoreboard", code: `<button onClick={() => onAdjust(t.id, 100)}>+</button>` },
    { t: "2. onAdjust is really App's adjust function", code: `<Scoreboard teams={teams} onAdjust={adjust} />` },
    { t: "3. adjust runs in App and calls setTeams", code: `function adjust(teamId, delta) {
  setTeams(teams.map(t =>
    t.id === teamId ? { ...t, score: t.score + delta } : t
  ))
}` },
    { t: "4. App re-renders. New teams prop flows to every child.", code: `<Scoreboard teams={teams} ... />   // new array
<ClueModal teams={teams} ... />    // same new array` },
  ];
  return (
    <Slide kicker="The round trip" title="One click, four steps, and it always ends back at the top">
      <Col>
        <div style={{ display: "flex", gap: 8 }}>
          {steps.map((_, i) => <button key={i} className={"tab" + (step === i ? " on" : "")} onClick={() => setStep(i)}>Step {i + 1}</button>)}
        </div>
        <h3 style={{ fontSize: 21, fontWeight: 600 }}>{steps[step].t}</h3>
        <Code>{steps[step].code}</Code>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn small" disabled={step === 0} onClick={() => setStep(step - 1)}>Previous</button>
          <button className="btn small primary" disabled={step === 3} onClick={() => setStep(step + 1)}>Next step</button>
        </div>
      </Col>
      <Col>
        <div className="panel" style={{ fontSize: 15, lineHeight: 1.7 }}>
          <div style={{ fontWeight: 600, color: T.ink, marginBottom: 6 }}>Naming convention</div>
          <div>Parent defines <span className="mono">adjust</span>, <span className="mono">rename</span>, <span className="mono">award</span>. Verbs.</div>
          <div>Child receives <span className="mono">onAdjust</span>, <span className="mono">onRename</span>, <span className="mono">onAward</span>. on + verb, like onClick.</div>
          <div style={{ marginTop: 6 }} className="note">The child does not know or care what the parent does with the call. It just reports: this happened, here is the id.</div>
        </div>
        <div className="callout blue">
          <div className="h">Why the arrow wrapper</div>
          <span className="mono">onClick={"{"}() =&gt; onAdjust(t.id, 100){"}"}</span> because we need to pass arguments. <span className="mono">onClick={"{"}onAdjust(t.id, 100){"}"}</span> would call it during render. Same rule as always.
        </div>
      </Col>
    </Slide>
  );
}

/* 8. When NOT to lift */
function DontLiftSlide() {
  const [sel, setSel] = useState(null);
  const cards = [
    { t: "Whether the answer is revealed inside ClueModal", a: "Keep local", why: "Only ClueModal cares. It resets every time the modal opens. No sibling reads it." },
    { t: "The team scores", a: "Lift", why: "ClueModal changes it, Scoreboard shows it. Two components, closest parent is App." },
    { t: "Whether a dropdown menu is open", a: "Keep local", why: "Pure UI detail of one component." },
    { t: "Which clues have been used", a: "Lift", why: "Board greys them out, App decides when to add one. Board cannot own it because ClueModal closing is what marks it used." },
    { t: "The text in a search box that filters a list rendered by a sibling", a: "Lift", why: "The sibling needs the query to filter. Closest common parent owns it." },
    { t: "Hover state on a button", a: "Keep local", why: "Nobody else needs it. CSS can probably do it anyway." },
  ];
  const [ans, setAns] = useState(cards.map(() => null));
  const [checked, setChecked] = useState(false);
  const score = ans.filter((a, i) => a === cards[i].a).length;
  return (
    <Slide kicker="Judgment" title="Not everything gets lifted. Sort these." wide>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignContent: "start" }}>
        {cards.map((c, i) => {
          const right = checked && ans[i] === c.a;
          const wrong = checked && ans[i] !== null && ans[i] !== c.a;
          return (
            <div key={i} className="panel" style={{ borderColor: right ? T.accent : wrong ? T.warn : T.line, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 15 }}>{c.t}</span>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  {["Keep local", "Lift"].map((o) => <button key={o} className={"tab" + (ans[i] === o ? " on" : "")} onClick={() => { setAns(ans.map((x, j) => (j === i ? o : x))); setChecked(false); }}>{o}</button>)}
                </div>
              </div>
              {checked && <div className="note" style={{ marginTop: 6 }}>{c.why}</div>}
            </div>
          );
        })}
        <div className="panel" style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 15, lineHeight: 1.5 }}>Lift only as high as needed. State that one component uses stays in that component. Lifting everything to App is the other failure mode.</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {checked && <span className="num-display" style={{ fontSize: 28, color: score === cards.length ? T.accent : T.ink }}>{score} / {cards.length}</span>}
            <button className="btn primary" onClick={() => setChecked(true)}>Check</button>
          </div>
        </div>
      </div>
    </Slide>
  );
}

/* 9. Progression: live-code script */
function ProgressionSlide() {
  const [stage, setStage] = useState(0);
  const stages = [
    { title: "Stage 1: one component, one score", code: `function App() {
  const [score, setScore] = useState(0)
  return (
    <>
      <p>{score}</p>
      <button onClick={() => setScore(score + 100)}>+100</button>
    </>
  )
}`, demo: <S1 /> },
    { title: "Stage 2: split the display into a child", code: `function ScoreDisplay({ score }) {
  return <p>{score}</p>
}

function App() {
  const [score, setScore] = useState(0)
  return (
    <>
      <ScoreDisplay score={score} />
      <button onClick={() => setScore(score + 100)}>+100</button>
    </>
  )
}`, demo: <S2 /> },
    { title: "Stage 3: split the button into a child, pass a callback", code: `function AwardButton({ amount, onAward }) {
  return <button onClick={() => onAward(amount)}>+{amount}</button>
}

function App() {
  const [score, setScore] = useState(0)
  function award(amount) { setScore(score + amount) }
  return (
    <>
      <ScoreDisplay score={score} />
      <AwardButton amount={100} onAward={award} />
      <AwardButton amount={200} onAward={award} />
    </>
  )
}`, demo: <S3 /> },
    { title: "Stage 4: teams array, same pattern, real app", code: `const [teams, setTeams] = useState([...])

function award(id, amount) {
  setTeams(teams.map(t =>
    t.id === id ? { ...t, score: t.score + amount } : t
  ))
}

{teams.map(t => (
  <TeamCard key={t.id} team={t} onAward={award} />
))}`, demo: <S4 /> },
  ];
  const s = stages[stage];
  return (
    <Slide kicker="Progression" title="One component to a lifted scoreboard in four moves">
      <Col>
        <div style={{ display: "flex", gap: 8 }}>
          {stages.map((_, i) => <button key={i} className={"tab" + (stage === i ? " on" : "")} onClick={() => setStage(i)}>Stage {i + 1}</button>)}
        </div>
        <h3 style={{ fontSize: 21, fontWeight: 600 }}>{s.title}</h3>
        <Code>{s.code}</Code>
      </Col>
      <Col>
        {s.demo}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn small" disabled={stage === 0} onClick={() => setStage(stage - 1)}>Previous stage</button>
          <button className="btn small primary" disabled={stage === stages.length - 1} onClick={() => setStage(stage + 1)}>Next stage</button>
        </div>
      </Col>
    </Slide>
  );
}
function S1() {
  const [score, setScore] = useState(0);
  return <div className="panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span className="num-display" style={{ fontSize: 36 }}>{score}</span><button className="btn primary" onClick={() => setScore(score + 100)}>+100</button></div>;
}
function ScoreDisplay({ score }) { return <span className="num-display" style={{ fontSize: 36 }}>{score}</span>; }
function S2() {
  const [score, setScore] = useState(0);
  return <div className="panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><ScoreDisplay score={score} /><button className="btn primary" onClick={() => setScore(score + 100)}>+100</button></div>;
}
function AwardButton({ amount, onAward }) { return <button className="btn primary" onClick={() => onAward(amount)}>+{amount}</button>; }
function S3() {
  const [score, setScore] = useState(0);
  return <div className="panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><ScoreDisplay score={score} /><div style={{ display: "flex", gap: 8 }}><AwardButton amount={100} onAward={(a) => setScore(score + a)} /><AwardButton amount={200} onAward={(a) => setScore(score + a)} /></div></div>;
}
function TeamCard({ team, onAward }) {
  return <div className="row"><span style={{ fontWeight: 600 }}>{team.name}</span><div style={{ display: "flex", gap: 8, alignItems: "center" }}><span className="num-display" style={{ fontSize: 22 }}>{team.score}</span><AwardButton amount={100} onAward={(a) => onAward(team.id, a)} /></div></div>;
}
function S4() {
  const [teams, setTeams] = useState([{ id: 1, name: "Team 1", score: 0 }, { id: 2, name: "Team 2", score: 0 }, { id: 3, name: "Team 3", score: 0 }]);
  const award = (id, a) => setTeams(teams.map((t) => (t.id === id ? { ...t, score: t.score + a } : t)));
  return <div className="panel">{teams.map((t) => <TeamCard key={t.id} team={t} onAward={award} />)}</div>;
}

/* 10. Assignment */
function AssignmentSlide() {
  const setup = [
    { t: "npm create vite@latest game-night -- --template react", m: true },
    { t: "cd game-night   then   npm install   then   npm run dev", m: true },
    { t: "Empty the return in src/App.jsx, clear src/App.css, leave main.jsx alone", m: false },
    { t: "You will make three files: App.jsx, Scoreboard.jsx, TeamCard.jsx. ESM imports between them.", m: false },
    { t: "App owns the teams array. Nothing else calls useState for teams.", m: false },
  ];
  const tiers = [
    { name: "Bronze", text: "App holds a teams array in state (3 teams: id, name, score). A Scoreboard component in its own file receives teams as a prop and renders each name and score. No useState in Scoreboard." },
    { name: "Silver", text: "A TeamCard component in its own file, rendered by Scoreboard with map and key. TeamCard has +100 and -100 buttons. Clicks travel up through onAdjust to App, which updates with map plus spread." },
    { name: "Gold", text: "An AddTeam form component with its own controlled input (local state is fine here) that calls onAdd(name) so App appends a team. A Remove button on each TeamCard through onRemove. App shows who is leading, derived from teams." },
    { name: "Bonus", text: "A Round component with a text input for a question and a Reveal button, where the reveal toggle is local state. A Reset all scores button in App. A highlight on the leading TeamCard using a prop, not local state." },
  ];
  return (
    <Slide kicker="Assignment: due before you leave" title="Build Game Night">
      <Col>
        <h3 style={{ fontSize: 20, fontWeight: 600 }}>Set up a fresh project</h3>
        <Checklist items={setup} />
        <div className="panel" style={{ fontSize: 15, lineHeight: 1.6 }}>
          <div style={{ fontWeight: 600, color: T.ink, marginBottom: 4 }}>Before you code, draw the tree on paper</div>
          <div>App, Scoreboard, TeamCard, AddTeam. Next to each: what props come in, what callbacks go out, and whether it has any state of its own.</div>
        </div>
        <div className="panel" style={{ fontSize: 15, lineHeight: 1.5 }}>
          Submit: push to your GitHub Classroom repo and paste the link in Brightspace. Silver counts as complete. Gold earns the round bonus for your Jeopardy team.
        </div>
      </Col>
      <Col>
        <h3 style={{ fontSize: 20, fontWeight: 600 }}>Milestones</h3>
        <Tiers tiers={tiers} />
      </Col>
    </Slide>
  );
}

/* 11. Close */
function CloseSlide() {
  const qs = [
    { q: "Two siblings both need the cart. Where does the cart live?", a: ["In the first sibling", "In their closest common parent", "In both"], c: 1 },
    { q: "A child needs to change parent state. The parent passes it...", a: ["the setter directly, always", "a function prop like onAdd", "nothing, the child uses useState"], c: 1 },
    { q: "useState(props.score) inside a child does what?", a: ["Stays in sync with the parent", "Copies it once, then drifts", "Throws an error"], c: 1 },
    { q: "Whether a modal's answer is revealed. Lift it?", a: ["Yes, always lift", "No, only the modal uses it", "Depends on the score"], c: 1 },
  ];
  return (
    <Slide kicker="Close" title="Four checks, then final scores" wide>
      <Quiz
        qs={qs}
        footer={
          <div>
            <div style={{ fontSize: 21, fontWeight: 600, color: T.ink }}>Thursday: Project 2 studio, then async JavaScript. Promises and the event loop.</div>
            <div className="note">Bring Game Night. Project 2 is due next Thursday.</div>
          </div>
        }
      />
    </Slide>
  );
}

const SLIDES = [
  { el: <TitleSlide />, notes: "Split into five teams of five or six before anything else. Captains have the laptop. Team names go into the scoreboard on the next slide." },
  { el: <GameSlide />, notes: "Run about 25 minutes. Rename teams inline. Click a value, read it, teams write answers, show answer, award. Minus buttons exist for wrong buzzes if you want them. Arrow keys are disabled while a clue is open. Leave the board unfinished and come back at the close." },
  { el: <WhereSlide />, notes: "Do not reveal. Vote by hand on the four options, then click each one in order. Save App for last. Say the rule twice: closest common parent." },
  { el: <SourceAppSlide />, notes: "Open src/Jeopardy.jsx in the editor alongside. Point at the real award function. Props down, events up. Write those three words on the board." },
  { el: <SourceChildSlide />, notes: "Rename a team on the live demo and point at the sibling updating. Ask: how many useState calls are in Scoreboard? Zero." },
  { el: <BrokenSlide />, notes: "Deliberate mistake beat. Click Award from ClueModal three times, then + in Scoreboard once. They disagree. The tell: useState(someProp). Say it." },
  { el: <WiringSlide />, notes: "Walk the four steps slowly. The point is the loop always returns to App. Naming: verbs in the parent, on plus verb in the child." },
  { el: <DontLiftSlide />, notes: "Vote per card before Check. The reveal toggle and hover are the ones that catch over-lifters. Lift only as high as needed." },
  { el: <ProgressionSlide />, notes: "Live-code script. Stage 1 to 4. At stage 3, write onClick={onAward(amount)} on purpose and watch it fire on render. Fix with the arrow." },
  { el: <AssignmentSlide />, notes: "Paper tree first, no exceptions. Start a 25 minute timer. Circulate for useState(props.x) and for useState in Scoreboard." },
  { el: <CloseSlide />, notes: "Quiz, then go back to slide 2 and finish the board for final scores. Gold finishers add 500 to their team." },
];

export default function Deck() {
  return <DeckShell slides={SLIDES} />;
}
