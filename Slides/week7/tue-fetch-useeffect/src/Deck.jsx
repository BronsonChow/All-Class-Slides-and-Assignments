import { useState, useEffect, useRef } from "react";
import { T, Code, Slide, Col, Reveal, Tiers, Checklist, Quiz, DeckShell } from "./ui.jsx";
import { fakeFetch, net, NetControls, RecipeRow, RECIPES } from "./fakeApi.jsx";

/* ------------------------------------------------------------------
   CSC 436  |  Week 7, Tuesday Oct 6  |  Mission 5
   fetch + useEffect + The Three States Pattern. Theme: Recipe Finder.
------------------------------------------------------------------- */

/* 1. Title */
function TitleSlide() {
  const [state, setState] = useState("idle");
  const run = async () => {
    setState("loading");
    try { await fakeFetch("/recipes"); setState("data"); } catch { setState("error"); }
  };
  const colors = { idle: T.muted, loading: T.blue, data: T.accent, error: T.warn };
  return (
    <div style={{ height: "100%", display: "grid", gridTemplateColumns: "1.1fr 1fr", alignItems: "center", padding: "0 80px", gap: 40 }}>
      <div>
        <div className="kicker">CSC 436, Week 7, Mission 5, Tuesday Oct 6</div>
        <h1 style={{ fontSize: 60, lineHeight: 1.0, fontWeight: 800 }}>fetch, useEffect, and the Three States</h1>
        <p style={{ fontSize: 21, color: T.muted, marginTop: 22, maxWidth: 560, lineHeight: 1.5 }}>
          Until today every piece of data was typed in by hand. Today the data lives on a server, arrives late, and sometimes does not arrive at all.
        </p>
      </div>
      <div className="panel" style={{ padding: 32, textAlign: "center" }}>
        <div className="note" style={{ marginBottom: 10 }}>Every async screen is in exactly one of these</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 22 }}>
          {["loading", "data", "error"].map((s) => (
            <span key={s} className="chip" style={{ fontSize: 17, padding: "8px 18px", background: state === s ? colors[s] : T.bg, color: state === s ? "#fff" : T.muted }}>{s}</span>
          ))}
        </div>
        <button className="btn primary" onClick={run} disabled={state === "loading"}>Fetch recipes</button>
        <div style={{ marginTop: 14 }}>
          <button className={"tab" + (net.fail ? " on" : "")} onClick={() => { net.fail = !net.fail; setState("idle"); }}>{net.fail ? "Server is down" : "Server is up"}</button>
        </div>
      </div>
    </div>
  );
}

/* 2. Warm-up: async recap, predict the order */
function WarmupSlide() {
  const [log, setLog] = useState([]);
  const run = () => {
    setLog([]);
    const add = (m) => setLog((l) => [...l, m]);
    add("1: start");
    setTimeout(() => add("3: timeout fired"), 0);
    Promise.resolve().then(() => add("4: promise resolved"));
    add("2: end");
  };
  return (
    <Slide kicker="Warm-up: predict before you run" title="In what order do these four lines print?">
      <Col>
        <Code>{`console.log("start")

setTimeout(() => console.log("timeout fired"), 0)

Promise.resolve().then(() => console.log("promise resolved"))

console.log("end")`}</Code>
        <div className="note">Hands up for each guess. Then run it. The number at the front of each line in the output is the real order.</div>
      </Col>
      <Col>
        <button className="btn primary" onClick={run}>Run it</button>
        <div className="panel mono" style={{ minHeight: 140, fontSize: 15, color: T.muted }}>
          <div style={{ color: T.accent, fontWeight: 600, marginBottom: 6 }}>console</div>
          {log.length === 0 ? "(nothing yet)" : log.map((l, i) => <div key={i}>{l}</div>)}
        </div>
        <Reveal label="Why that order?">
          <div className="h">Synchronous code runs to the end first</div>
          Then the microtask queue (promises) drains, then the macrotask queue (timeouts). fetch returns a promise, so everything we do today lands in that "later" bucket. Your component will render before the data exists. Plan for it.
        </Reveal>
      </Col>
    </Slide>
  );
}

/* 3. The naive attempt */
function NaiveSlide() {
  const [attempt, setAttempt] = useState(0);
  const [renders, setRenders] = useState(0);
  const timer = useRef(null);
  const start = () => {
    setAttempt(1); setRenders(0);
    clearInterval(timer.current);
    timer.current = setInterval(() => setRenders((r) => (r >= 12 ? r : r + 1)), 120);
  };
  useEffect(() => () => clearInterval(timer.current), []);
  return (
    <Slide kicker="The trap" title="Why can't I just call fetch inside the component?">
      <Col>
        <Code>{`function Recipes() {
  const [recipes, setRecipes] = useState([])

  // runs on EVERY render
  fetch("/api/recipes")
    .then(res => res.json())
    .then(data => setRecipes(data.recipes))   // state change, so render

  return <ul>{recipes.map(r => <li key={r.id}>{r.name}</li>)}</ul>
}`}</Code>
        <div className="callout">
          <div className="h">Trace it</div>
          Render 1 calls fetch. Data arrives, setRecipes runs, render 2. Render 2 calls fetch again. Data arrives, setRecipes, render 3. Forever. Your API bill and your laptop fan both go up.
        </div>
      </Col>
      <Col>
        <div className="panel" style={{ textAlign: "center" }}>
          <div className="note">Simulated: renders triggered by this component</div>
          <div className="num-display" style={{ fontSize: 72, color: renders >= 12 ? T.warn : T.ink }}>{renders}{renders >= 12 ? "+" : ""}</div>
          <button className="btn primary" onClick={start}>Mount the naive component</button>
          {renders >= 12 && <div className="note" style={{ marginTop: 10, color: T.warn }}>Still going. We stopped counting.</div>}
        </div>
        <div className="callout blue">
          <div className="h">What we need</div>
          A way to say: run this once after the first render, and not again unless I tell you. That is useEffect.
        </div>
      </Col>
    </Slide>
  );
}

/* 4. useEffect anatomy */
function EffectSlide() {
  const [pick, setPick] = useState(null);
  const parts = {
    hook: { label: "useEffect", text: "A hook. Register some code to run AFTER React has painted the screen. Same rules as useState: top level of the component, same order every render." },
    fn: { label: "() => { ... }", text: "The effect. The code that talks to the outside world: fetch, timers, document.title, event listeners on window." },
    deps: { label: "[ ]", text: "The dependency array. Empty means run once after the first render. [query] means run after the first render and again whenever query changes. Leave it out entirely and it runs after every render, which is the naive trap again." },
  };
  const cur = parts[pick];
  return (
    <Slide kicker="Anatomy" title="useEffect: run this after render, only when these change" wide>
      <div style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "center", justifyContent: "center" }}>
        <div className="mono" style={{ fontSize: 40, background: T.codeBg, color: "#E5E7EB", padding: "28px 40px", borderRadius: 16 }}>
          <Part id="hook" c="#93C5FD" pick={pick} setPick={setPick}>useEffect</Part>(<Part id="fn" c="#A7F3D0" pick={pick} setPick={setPick}>() =&gt; {"{ ... }"}</Part>, <Part id="deps" c="#FCD34D" pick={pick} setPick={setPick}>[ ]</Part>)
        </div>
        <div className="note">Click any piece.</div>
        <div className="panel" style={{ width: 760, minHeight: 110 }}>
          {cur ? (
            <>
              <div className="mono" style={{ color: T.accent, fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{cur.label}</div>
              <div style={{ fontSize: 18, lineHeight: 1.5 }}>{cur.text}</div>
            </>
          ) : (
            <div className="note" style={{ fontSize: 17 }}>Render first, then effect. React never waits for your effect to finish. That is why the screen needs a loading state.</div>
          )}
        </div>
      </div>
    </Slide>
  );
}
function Part({ id, c, pick, setPick, children }) {
  const on = pick === id;
  return <button onClick={() => setPick(id)} className="mono" style={{ background: on ? c + "33" : "transparent", border: `1px solid ${on ? c : "transparent"}`, color: c, fontSize: "inherit", borderRadius: 8, padding: "0 6px", cursor: "pointer" }}>{children}</button>;
}

/* 5. Dependency array playground */
function DepsSlide() {
  const [mode, setMode] = useState("empty");
  const [count, setCount] = useState(0);
  const [other, setOther] = useState(0);
  const [runs, setRuns] = useState([]);
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const log = (why) => setRuns((r) => [...r, why].slice(-6));
  useEffect(() => { if (modeRef.current === "none") log("effect ran (no deps)"); });
  useEffect(() => { if (modeRef.current === "empty") log("effect ran (empty deps)"); }, []);
  useEffect(() => { if (modeRef.current === "count") log(`effect ran (count = ${count})`); }, [count]);
  const codes = {
    none: `useEffect(() => {\n  console.log("ran")\n})            // no array: after EVERY render`,
    empty: `useEffect(() => {\n  console.log("ran")\n}, [])        // empty: once after the first render`,
    count: `useEffect(() => {\n  console.log("ran", count)\n}, [count])   // after first render, then when count changes`,
  };
  return (
    <Slide kicker="Dependencies" title="The array decides when the effect runs. Watch the log.">
      <Col>
        <div style={{ display: "flex", gap: 8 }}>
          {[["empty", "[ ]"], ["count", "[count]"], ["none", "no array"]].map(([k, l]) => <button key={k} className={"tab mono" + (mode === k ? " on" : "")} onClick={() => { setMode(k); setRuns([]); }}>{l}</button>)}
        </div>
        <Code>{codes[mode]}</Code>
        <div className="callout">
          <div className="h">Common mistake</div>
          Using a value inside the effect and leaving it out of the array. The effect keeps seeing the old value. Vite's lint plugin warns you. Listen to it.
        </div>
      </Col>
      <Col>
        <div className="panel" style={{ display: "flex", gap: 12, justifyContent: "space-between", alignItems: "center" }}>
          <div><div className="note">count</div><div className="num-display" style={{ fontSize: 30 }}>{count}</div></div>
          <button className="btn primary" onClick={() => setCount(count + 1)}>count + 1</button>
          <div><div className="note">other</div><div className="num-display" style={{ fontSize: 30 }}>{other}</div></div>
          <button className="btn" onClick={() => setOther(other + 1)}>other + 1</button>
        </div>
        <div className="panel mono" style={{ minHeight: 160, fontSize: 14, color: T.muted }}>
          <div style={{ color: T.accent, fontWeight: 600, marginBottom: 6 }}>effect log</div>
          {runs.length === 0 ? "(switch a mode, then click)" : runs.map((r, i) => <div key={i}>{r}</div>)}
        </div>
        <div className="note">Click "other + 1" with [count] selected. No log line. The effect only cares about what is in its array.</div>
      </Col>
    </Slide>
  );
}

/* 6. fetch inside useEffect, first working version */
function FirstFetchSlide() {
  const [recipes, setRecipes] = useState([]);
  const [go, setGo] = useState(0);
  useEffect(() => {
    if (!go) return;
    let alive = true;
    setRecipes([]);
    fakeFetch("/recipes").then((r) => r.json()).then((d) => { if (alive) setRecipes(d.recipes); }).catch(() => {});
    return () => { alive = false; };
  }, [go]);
  return (
    <Slide kicker="First fetch" title="fetch belongs inside useEffect with an empty array">
      <Col>
        <Code>{`function Recipes() {
  const [recipes, setRecipes] = useState([])

  useEffect(() => {
    fetch("https://dummyjson.com/recipes")
      .then(res => res.json())
      .then(data => setRecipes(data.recipes))
  }, [])   // once, after the first render

  return (
    <ul>
      {recipes.map(r => <li key={r.id}>{r.name}</li>)}
    </ul>
  )
}`}</Code>
        <div className="callout">
          <div className="h">Look at the screen during the delay</div>
          Empty. Not broken, just empty. The user cannot tell the difference between "loading" and "there are no recipes." That is the gap the Three States close.
        </div>
      </Col>
      <Col>
        <NetControls />
        <div className="panel" style={{ minHeight: 220 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span className="note">Recipes ({recipes.length})</span>
            <button className="btn small primary" onClick={() => setGo((g) => g + 1)}>Mount component</button>
          </div>
          {recipes.map((r) => <RecipeRow key={r.id} r={r} />)}
        </div>
      </Col>
    </Slide>
  );
}

/* 7. Three States, the pattern */
function ThreeStatesSlide() {
  const [status, setStatus] = useState("loading");
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let alive = true;
    setStatus("loading"); setError(null);
    fakeFetch("/recipes")
      .then((r) => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then((d) => { if (alive) { setRecipes(d.recipes); setStatus("data"); } })
      .catch((e) => { if (alive) { setError(e.message); setStatus("error"); } });
    return () => { alive = false; };
  }, [tick]);
  const colors = { loading: T.blue, data: T.accent, error: T.warn };
  return (
    <Slide kicker="The Three States Pattern" title="Every async screen is in exactly one state. Render that state.">
      <Col>
        <Code>{`const [recipes, setRecipes] = useState([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)

useEffect(() => {
  setLoading(true)
  fetch(URL)
    .then(res => {
      if (!res.ok) throw new Error("HTTP " + res.status)
      return res.json()
    })
    .then(data => setRecipes(data.recipes))
    .catch(err => setError(err.message))
    .finally(() => setLoading(false))
}, [])

if (loading) return <p>Loading recipes...</p>
if (error) return <p>Something went wrong: {error}</p>
return <ul>{recipes.map(...)}</ul>`}</Code>
      </Col>
      <Col>
        <NetControls />
        <div className="panel" style={{ minHeight: 200 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span className="chip" style={{ background: colors[status], color: "#fff" }}>{status}</span>
            <button className="btn small primary" onClick={() => setTick((t) => t + 1)}>Refetch</button>
          </div>
          {status === "loading" && <p className="note" style={{ padding: "20px 0" }}>Loading recipes...</p>}
          {status === "error" && <div className="callout"><div className="h">Something went wrong</div>{error}</div>}
          {status === "data" && recipes.map((r) => <RecipeRow key={r.id} r={r} />)}
        </div>
        <div className="note">Flip the server to Failing and refetch. Three branches, no empty mystery screen.</div>
      </Col>
    </Slide>
  );
}

/* 8. async/await version and res.ok */
function AsyncAwaitSlide() {
  const [tab, setTab] = useState("then");
  const codes = {
    then: `useEffect(() => {
  fetch(URL)
    .then(res => {
      if (!res.ok) throw new Error("HTTP " + res.status)
      return res.json()
    })
    .then(data => setRecipes(data.recipes))
    .catch(err => setError(err.message))
    .finally(() => setLoading(false))
}, [])`,
    await: `useEffect(() => {
  async function load() {
    try {
      const res = await fetch(URL)
      if (!res.ok) throw new Error("HTTP " + res.status)
      const data = await res.json()
      setRecipes(data.recipes)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  load()
}, [])`,
  };
  return (
    <Slide kicker="Two spellings" title="Same pattern with async/await, and the res.ok line everyone skips">
      <Col>
        <div style={{ display: "flex", gap: 8 }}>
          <button className={"tab" + (tab === "then" ? " on" : "")} onClick={() => setTab("then")}>.then chain</button>
          <button className={"tab" + (tab === "await" ? " on" : "")} onClick={() => setTab("await")}>async / await</button>
        </div>
        <Code>{codes[tab]}</Code>
      </Col>
      <Col>
        <div className="callout">
          <div className="h">The effect callback cannot be async</div>
          <span className="mono">useEffect(async () =&gt; ...)</span> returns a promise, and React expects a cleanup function or nothing. Define an async function inside and call it.
        </div>
        <div className="callout">
          <div className="h">fetch does not throw on 404 or 500</div>
          It only rejects when the network itself fails. A server error is a successful response with a bad status. Check <span className="mono">res.ok</span> and throw yourself, or your catch never runs and you try to map over an error message.
        </div>
        <div className="callout good">
          <div className="h">try / catch / finally maps to the three states</div>
          try sets data, catch sets error, finally turns loading off no matter what.
        </div>
      </Col>
    </Slide>
  );
}

/* 9. Refetch on a dependency: search */
function SearchSlide() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("data");
  const [recipes, setRecipes] = useState(RECIPES);
  const [fetches, setFetches] = useState(0);
  useEffect(() => {
    let alive = true;
    setStatus("loading");
    setFetches((f) => f + 1);
    fakeFetch(`/recipes/search?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((d) => { if (alive) { setRecipes(d.recipes); setStatus("data"); } })
      .catch(() => { if (alive) setStatus("error"); });
    return () => { alive = false; };
  }, [query]);
  return (
    <Slide kicker="Dependencies, for real" title="Put query in the array and the search refetches itself">
      <Col>
        <Code>{`const [query, setQuery] = useState("")

useEffect(() => {
  let alive = true          // ignore results from an old search
  setLoading(true)
  fetch(\`\${URL}/search?q=\${query}\`)
    .then(res => res.json())
    .then(data => { if (alive) setRecipes(data.recipes) })
    .finally(() => { if (alive) setLoading(false) })
  return () => { alive = false }   // cleanup: runs before the next effect
}, [query])

<input value={query} onChange={e => setQuery(e.target.value)} />`}</Code>
        <div className="callout blue">
          <div className="h">Cleanup is the return value</div>
          Type "pas" fast and three fetches fire: p, pa, pas. If "p" comes back last it would overwrite the right answer. The cleanup flips alive to false on the stale ones so their results are ignored.
        </div>
      </Col>
      <Col>
        <NetControls />
        <div className="panel" style={{ minHeight: 200 }}>
          <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search recipes" />
          <div style={{ display: "flex", justifyContent: "space-between", margin: "10px 0 4px" }}>
            <span className="note">{status === "loading" ? "Searching..." : `${recipes.length} results`}</span>
            <span className="note mono">{fetches} fetches so far</span>
          </div>
          {status === "data" && recipes.map((r) => <RecipeRow key={r.id} r={r} />)}
          {status === "data" && recipes.length === 0 && <div className="note" style={{ padding: "12px 0" }}>No recipes match. That is the fourth state people forget: empty.</div>}
        </div>
      </Col>
    </Slide>
  );
}

/* 10. Progression stepper */
function ProgressionSlide() {
  const [stage, setStage] = useState(0);
  const stages = [
    { title: "Stage 1: effect that sets the tab title", code: `useEffect(() => {
  document.title = \`\${count} recipes saved\`
}, [count])` },
    { title: "Stage 2: fetch once, show the list", code: `const [recipes, setRecipes] = useState([])
useEffect(() => {
  fetch(URL).then(r => r.json()).then(d => setRecipes(d.recipes))
}, [])` },
    { title: "Stage 3: add loading and error", code: `const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)
// try sets data, catch sets error, finally clears loading
if (loading) return <p>Loading...</p>
if (error) return <p>{error}</p>` },
    { title: "Stage 4: search with [query] and cleanup", code: `useEffect(() => {
  let alive = true
  ...fetch with query...
  return () => { alive = false }
}, [query])` },
  ];
  const s = stages[stage];
  return (
    <Slide kicker="Progression" title="Tab title to searchable Recipe Finder in four moves">
      <Col>
        <div style={{ display: "flex", gap: 8 }}>
          {stages.map((_, i) => <button key={i} className={"tab" + (stage === i ? " on" : "")} onClick={() => setStage(i)}>Stage {i + 1}</button>)}
        </div>
        <h3 style={{ fontSize: 21, fontWeight: 600 }}>{s.title}</h3>
        <Code>{s.code}</Code>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn small" disabled={stage === 0} onClick={() => setStage(stage - 1)}>Previous</button>
          <button className="btn small primary" disabled={stage === 3} onClick={() => setStage(stage + 1)}>Next stage</button>
        </div>
      </Col>
      <Col>
        <div className="panel" style={{ fontSize: 15, lineHeight: 1.7 }}>
          <div style={{ fontWeight: 600, color: T.ink, marginBottom: 6 }}>Live-code this in the examples project</div>
          <div><span className="mono">examples/recipe-finder</span>, file <span className="mono">src/stages/Stage{stage + 1}.jsx</span></div>
          <div className="note" style={{ marginTop: 6 }}>Each stage is a separate file. Open the next one when you get there instead of editing in place, so students can diff them later.</div>
        </div>
        <div className="callout blue">
          <div className="h">Real API for the live code</div>
          <span className="mono">https://dummyjson.com/recipes</span> with <span className="mono">?delay=2000</span> to slow it down and <span className="mono">/search?q=</span> for search. No key, allows browser requests.
        </div>
      </Col>
    </Slide>
  );
}

/* 11. Assignment */
function AssignmentSlide() {
  const setup = [
    { t: "npm create vite@latest recipe-finder -- --template react", m: true },
    { t: "cd recipe-finder   then   npm install   then   npm run dev", m: true },
    { t: "Empty the return in src/App.jsx, clear src/App.css, leave main.jsx alone", m: false },
    { t: "API: https://dummyjson.com/recipes   add ?delay=2000 while building so you can see loading", m: true },
    { t: "No api keys, no fetch outside useEffect, no async directly on useEffect", m: false },
  ];
  const tiers = [
    { name: "Bronze", text: "Fetch the recipe list once with useEffect and an empty array. Render name and cuisine with map and key. Exactly one fetch in the Network tab." },
    { name: "Silver", text: "Three States: a loading message, an error message when fetch fails (test by breaking the URL), and the list. Check res.ok. Use try / catch / finally." },
    { name: "Gold", text: "A search input bound to state, with the effect depending on [query] and hitting /recipes/search?q=. Cleanup with an alive flag. An empty state when no results match." },
    { name: "Bonus", text: "Click a recipe to fetch /recipes/:id into a detail panel with its own three states. A Refetch button. document.title shows the result count." },
  ];
  return (
    <Slide kicker="Assignment: due before you leave" title="Build Recipe Finder">
      <Col>
        <h3 style={{ fontSize: 20, fontWeight: 600 }}>Set up a fresh project</h3>
        <Checklist items={setup} />
        <div className="panel" style={{ fontSize: 15, lineHeight: 1.6 }}>
          <div style={{ fontWeight: 600, color: T.ink, marginBottom: 4 }}>Before you code, answer on paper</div>
          <div>What does the screen show in the first 2 seconds? What does it show if the wifi drops? If the answer is "nothing" to either, you are not done.</div>
        </div>
        <div className="panel" style={{ fontSize: 15, lineHeight: 1.5 }}>Submit: push to GitHub Classroom and paste the link in Brightspace. Silver counts as complete. This is also the first milestone of Project 3.</div>
      </Col>
      <Col>
        <h3 style={{ fontSize: 20, fontWeight: 600 }}>Milestones</h3>
        <Tiers tiers={tiers} />
      </Col>
    </Slide>
  );
}

/* 12. Close */
function CloseSlide() {
  const qs = [
    { q: "fetch directly in the component body (not in an effect) causes...", a: ["one fetch", "an infinite render loop", "a syntax error"], c: 1 },
    { q: "useEffect(fn, []) runs the effect...", a: ["every render", "once after first render", "before the first render"], c: 1 },
    { q: "The server returns 500. fetch's promise...", a: ["rejects", "resolves with ok: false", "throws immediately"], c: 1 },
    { q: "Which belongs in the dependency array?", a: ["every variable in the file", "values the effect reads that can change", "nothing, ever"], c: 1 },
  ];
  return (
    <Slide kicker="Close" title="Four checks before Thursday" wide>
      <Quiz qs={qs} footer={<div><div style={{ fontSize: 21, fontWeight: 600, color: T.ink }}>Thursday: what to do when it breaks. Retries, skeletons, and extracting useFetch.</div><div className="note">Bring Recipe Finder. We make it survive bad wifi.</div></div>} />
    </Slide>
  );
}

const SLIDES = [
  { el: <TitleSlide />, notes: "Click Fetch recipes with the server up, then flip it down and fetch again. Three chips, one lit at a time. Say the sentence: every async screen is in exactly one state." },
  { el: <WarmupSlide />, notes: "Vote before running. Most say start, end, timeout, promise. The promise beats the timeout. One sentence on microtasks, then move on. The point is just: fetch results come later." },
  { el: <NaiveSlide />, notes: "Trace the loop out loud before mounting. Then click. The counter runs away. Ask: what would stop it? A way to run code once. Introduce the word effect." },
  { el: <EffectSlide />, notes: "Click the pieces in order: the function, then the array. Say render first, then effect. That is why the screen is blank for a moment." },
  { el: <DepsSlide />, notes: "Do [ ] first: click count, nothing logs. Then [count]: click count, logs, click other, nothing. Then no array: everything logs. Leave it on [count]." },
  { el: <FirstFetchSlide />, notes: "Set delay to 3000 before mounting. Stare at the blank list together. Ask: is it loading or empty? Nobody can tell. That is the problem." },
  { el: <ThreeStatesSlide />, notes: "This is the slide. Refetch healthy, then failing. Three branches. Write loading / error / data on the board and leave it up for the rest of the semester." },
  { el: <AsyncAwaitSlide />, notes: "Deliberate mistake beat in the live code: delete the res.ok check, break the URL to /recipez, show that catch never fires and the map crashes instead." },
  { el: <SearchSlide />, notes: "Set delay to 2500, type pasta fast. Watch the fetch counter. Explain alive. Then clear the box to show the empty state, the fourth state nobody plans for." },
  { el: <ProgressionSlide />, notes: "Open examples/recipe-finder in the editor. Stages 1 to 4 live against dummyjson with ?delay=2000. If wifi is bad, the deck demos still work because they are faked." },
  { el: <AssignmentSlide />, notes: "Paper question first. Start a 25 minute timer. Circulate for fetch outside useEffect, missing [] (watch the Network tab), and async directly on useEffect." },
  { el: <CloseSlide />, notes: "Hands up per question. Q3 is the one. fetch does not reject on 500. Tease Thursday: retries, skeletons, useFetch." },
];

export default function Deck() {
  return <DeckShell slides={SLIDES} />;
}
