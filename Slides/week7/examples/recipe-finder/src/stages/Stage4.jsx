import { useState, useEffect } from "react";
import { searchUrl } from "../api.js";
import RecipeRow from "../components/RecipeRow.jsx";

// STAGE 4: a dependency that changes. query in the array means refetch on every keystroke.
// The cleanup function (return) runs before the NEXT effect run. We use it to ignore
// results from a search that is no longer current.
export default function Stage4() {
  const [query, setQuery] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const res = await fetch(searchUrl(query));
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();
        if (alive) setRecipes(data.recipes);
      } catch (err) {
        console.error(err);
        if (alive) setError("Could not search recipes. Try again.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();

    return () => {
      alive = false; // this search is stale, ignore whatever it returns
    };
  }, [query]);

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search recipes" />
      {loading && <p>Searching...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && recipes.length === 0 && <p>No recipes match "{query}". Try a shorter search.</p>}
      {!loading && !error && (
        <ul>
          {recipes.map((r) => (
            <RecipeRow key={r.id} recipe={r} />
          ))}
        </ul>
      )}
    </div>
  );
}
