import { useState } from "react";
import Stage1 from "./stages/Stage1.jsx";
import Stage2 from "./stages/Stage2.jsx";
import Stage3 from "./stages/Stage3.jsx";
import Stage4 from "./stages/Stage4.jsx";
import Stage5 from "./stages/Stage5.jsx";
import Stage6 from "./stages/Stage6.jsx";
import Stage7 from "./stages/Stage7.jsx";
import Stage8 from "./stages/Stage8.jsx";

const STAGES = [
  { day: "Tue", label: "1 Effect sets the tab title", el: Stage1 },
  { day: "Tue", label: "2 fetch once, blank while waiting", el: Stage2 },
  { day: "Tue", label: "3 Three States", el: Stage3 },
  { day: "Tue", label: "4 Search with [query] and cleanup", el: Stage4 },
  { day: "Thu", label: "5 Error messages, Retry, backoff", el: Stage5 },
  { day: "Thu", label: "6 Skeleton and keep old data", el: Stage6 },
  { day: "Thu", label: "7 useFetch extracted", el: Stage7 },
  { day: "Thu", label: "8 Two hooks, detail panel, debounce", el: Stage8 },
];

export default function App() {
  const [i, setI] = useState(0);
  const Stage = STAGES[i].el;
  return (
    <div className="app">
      <header>
        <h1>Recipe Finder</h1>
        <p className="muted">CSC 436 Week 7. Each stage is its own file in src/stages. Open DevTools, Network tab, while you click around.</p>
        <nav>
          {STAGES.map((s, k) => (
            <button key={k} className={i === k ? "on" : ""} onClick={() => setI(k)}>
              <span className="day">{s.day}</span> {s.label}
            </button>
          ))}
        </nav>
      </header>
      <main key={i}>
        <Stage />
      </main>
    </div>
  );
}
