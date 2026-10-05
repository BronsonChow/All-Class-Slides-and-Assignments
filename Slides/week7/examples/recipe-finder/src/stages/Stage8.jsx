import { useState } from "react";
import { searchUrl, recipeUrl } from "../api.js";
import useFetch from "../hooks/useFetch.js";
import useDebounce from "../hooks/useDebounce.js";
import RecipeRow from "../components/RecipeRow.jsx";
import RecipeSkeleton from "../components/RecipeSkeleton.jsx";
import ErrorBox from "../components/ErrorBox.jsx";

// STAGE 8 (Thursday, Bonus): two components, two independent useFetch calls, plus useDebounce.
// Search only fires after you pause typing. Detail has its own three states.

function RecipeDetail({ id }) {
  const { data, loading, error, refetch } = useFetch(recipeUrl(id), { retries: 1, keepData: false });
  if (loading) return <RecipeSkeleton rows={1} />;
  if (error) return <ErrorBox message={error} onRetry={refetch} />;
  return (
    <div className="detail">
      <img src={data.image} alt="" width="120" height="120" />
      <h3>{data.name}</h3>
      <p>{data.cuisine} , {data.prepTimeMinutes + data.cookTimeMinutes} min , serves {data.servings}</p>
      <ul className="plain">
        {data.ingredients.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}

export default function Stage8() {
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, 350);
  const [selected, setSelected] = useState(null);
  const { data, loading, error, refetch } = useFetch(searchUrl(debounced), { retries: 2 });

  return (
    <div className="split">
      <div>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search recipes" />
        {loading && data === null && <RecipeSkeleton />}
        {error && <ErrorBox message={error} onRetry={refetch} />}
        {data && !error && (
          <div style={{ opacity: loading ? 0.45 : 1 }}>
            {loading && <span className="tag">Updating...</span>}
            {data.recipes.length === 0 && !loading && <p>No recipes match "{debounced}".</p>}
            <ul>
              {data.recipes.map((r) => (
                <RecipeRow key={r.id} recipe={r} onSelect={setSelected} selected={selected === r.id} />
              ))}
            </ul>
          </div>
        )}
      </div>
      <div>{selected ? <RecipeDetail id={selected} /> : <p className="muted">Pick a recipe to see its ingredients.</p>}</div>
    </div>
  );
}
