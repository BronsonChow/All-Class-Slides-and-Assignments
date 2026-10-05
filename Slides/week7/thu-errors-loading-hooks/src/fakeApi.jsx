import { useState } from "react";
import { T } from "./ui.jsx";

/* ------------------------------------------------------------------
   A fake network for slides. Same shape as fetch, but you control the
   delay and whether it fails, so the Three States are visible on a
   projector and the lesson does not depend on classroom wifi.
------------------------------------------------------------------- */

export const RECIPES = [
  { id: 1, name: "Garlic Butter Pasta", cuisine: "Italian", minutes: 20, tags: ["pasta", "quick"] },
  { id: 2, name: "Chicken Tikka Masala", cuisine: "Indian", minutes: 45, tags: ["chicken", "spicy"] },
  { id: 3, name: "Beef Tacos", cuisine: "Mexican", minutes: 25, tags: ["beef", "quick"] },
  { id: 4, name: "Veggie Fried Rice", cuisine: "Chinese", minutes: 15, tags: ["rice", "vegetarian"] },
  { id: 5, name: "Margherita Pizza", cuisine: "Italian", minutes: 60, tags: ["pizza", "vegetarian"] },
  { id: 6, name: "Chicken Pad Thai", cuisine: "Thai", minutes: 30, tags: ["chicken", "noodles"] },
  { id: 7, name: "Greek Salad", cuisine: "Greek", minutes: 10, tags: ["salad", "vegetarian", "quick"] },
  { id: 8, name: "Beef Pho", cuisine: "Vietnamese", minutes: 90, tags: ["beef", "soup"] },
];

export const net = { delay: 1500, fail: false };

export function fakeFetch(path) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (net.fail) return reject(new Error("Network request failed (simulated)"));
      const q = (path.match(/q=([^&]*)/) || [])[1];
      let data = RECIPES;
      if (q !== undefined) data = RECIPES.filter((r) => r.name.toLowerCase().includes(decodeURIComponent(q).toLowerCase()));
      const one = path.match(/\/recipes\/(\d+)/);
      if (one) {
        const r = RECIPES.find((x) => x.id === Number(one[1]));
        if (!r) return resolve({ ok: false, status: 404, json: async () => ({ message: "Not found" }) });
        data = r;
      }
      resolve({ ok: true, status: 200, json: async () => ({ recipes: Array.isArray(data) ? data : undefined, ...(Array.isArray(data) ? {} : data) }) });
    }, net.delay);
  });
}

/* Control strip that lives on demo slides */
export function NetControls() {
  const [, force] = useState(0);
  return (
    <div className="panel" style={{ display: "flex", gap: 18, alignItems: "center", padding: "10px 16px" }}>
      <span className="note" style={{ whiteSpace: "nowrap" }}>Network delay</span>
      <input type="range" min="0" max="4000" step="250" value={net.delay} onChange={(e) => { net.delay = Number(e.target.value); force((x) => x + 1); }} style={{ flex: 1, accentColor: T.accent }} />
      <span className="mono note" style={{ width: 56 }}>{net.delay} ms</span>
      <button className={"tab" + (net.fail ? " on" : "")} style={net.fail ? { borderColor: T.warn, color: T.warn } : {}} onClick={() => { net.fail = !net.fail; force((x) => x + 1); }}>
        {net.fail ? "Failing" : "Healthy"}
      </button>
    </div>
  );
}

export function RecipeRow({ r }) {
  return (
    <div className="row">
      <div>
        <div style={{ fontWeight: 600, color: T.ink }}>{r.name}</div>
        <div className="note">{r.cuisine}, {r.minutes} min</div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>{r.tags.map((t) => <span key={t} className="chip">{t}</span>)}</div>
    </div>
  );
}

export function Skeleton({ rows = 3 }) {
  return (
    <div>
      <style>{`@keyframes shimmer { 0% { opacity: .45 } 50% { opacity: 1 } 100% { opacity: .45 } } .sk { animation: shimmer 1.2s ease-in-out infinite; } @media (prefers-reduced-motion: reduce) { .sk { animation: none; } }`}</style>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="row">
          <div style={{ flex: 1 }}>
            <div className="sk" style={{ height: 14, width: "45%", background: T.line, borderRadius: 6 }} />
            <div className="sk" style={{ height: 11, width: "30%", background: T.line, borderRadius: 6, marginTop: 8 }} />
          </div>
          <div className="sk" style={{ height: 22, width: 90, background: T.line, borderRadius: 999 }} />
        </div>
      ))}
    </div>
  );
}
