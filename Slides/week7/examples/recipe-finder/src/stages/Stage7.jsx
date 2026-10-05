import { useState } from "react";
import { searchUrl } from "../api.js";
import useFetch from "../hooks/useFetch.js";
import RecipeRow from "../components/RecipeRow.jsx";
import RecipeSkeleton from "../components/RecipeSkeleton.jsx";
import ErrorBox from "../components/ErrorBox.jsx";

// STAGE 7 (Thursday): the same screen as Stage 6, after extracting useFetch.
// Count the lines. There is no useEffect in this file.
export default function Stage7() {
  const [query, setQuery] = useState("");
  const { data, loading, error, refetch } = useFetch(searchUrl(query), { retries: 2 });

  const firstLoad = data === null;

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search recipes" />
      {loading && firstLoad && <RecipeSkeleton />}
      {error && <ErrorBox message={error} onRetry={refetch} />}
      {!firstLoad && !error && (
        <div style={{ opacity: loading ? 0.45 : 1, transition: "opacity 150ms" }}>
          {loading && <span className="tag">Updating...</span>}
          {data.recipes.length === 0 && !loading && <p>No recipes match "{query}". Try a shorter search.</p>}
          <ul>
            {data.recipes.map((r) => (
              <RecipeRow key={r.id} recipe={r} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
