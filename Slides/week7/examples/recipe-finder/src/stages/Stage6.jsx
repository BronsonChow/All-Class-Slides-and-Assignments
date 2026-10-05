import { useState, useEffect } from "react";
import { searchUrl } from "../api.js";
import RecipeRow from "../components/RecipeRow.jsx";
import RecipeSkeleton from "../components/RecipeSkeleton.jsx";
import ErrorBox from "../components/ErrorBox.jsx";

// STAGE 6 (Thursday): loading UX. Skeleton on first load. On a refetch, keep the old
// results on screen dimmed instead of clearing them, so the user never loses their place.
export default function Stage6() {
  const [query, setQuery] = useState("");
  const [recipes, setRecipes] = useState(null); // null = never loaded, [] = loaded and empty
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    // NOTE: we do not call setRecipes([]) here. Old data stays until new data arrives.

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
      alive = false;
    };
  }, [query]);

  const firstLoad = recipes === null;

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search recipes" />
      {loading && firstLoad && <RecipeSkeleton />}
      {error && <ErrorBox message={error} />}
      {!firstLoad && !error && (
        <div style={{ opacity: loading ? 0.45 : 1, transition: "opacity 150ms" }}>
          {loading && <span className="tag">Updating...</span>}
          {recipes.length === 0 && !loading && <p>No recipes match "{query}". Try a shorter search.</p>}
          <ul>
            {recipes.map((r) => (
              <RecipeRow key={r.id} recipe={r} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
