import { useState, useEffect } from "react";
import { recipesUrl } from "../api.js";
import RecipeRow from "../components/RecipeRow.jsx";

// STAGE 3: the Three States Pattern. loading, error, data.
// Try it: change recipesUrl() to BROKEN (import it from api.js) and watch the error branch.
// Then delete the res.ok check and see that catch never runs for a 404.
export default function Stage3() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(recipesUrl());
        if (!res.ok) throw new Error("HTTP " + res.status); // fetch does not throw on 404/500
        const data = await res.json();
        setRecipes(data.recipes);
      } catch (err) {
        console.error(err); // for you
        setError("Could not load recipes. Check your connection and try again."); // for them
      } finally {
        setLoading(false);
      }
    }
    load(); // the effect itself cannot be async, so define and call
  }, []);

  if (loading) return <p>Loading recipes...</p>;
  if (error) return <p className="error">{error}</p>;
  return (
    <ul>
      {recipes.map((r) => (
        <RecipeRow key={r.id} recipe={r} />
      ))}
    </ul>
  );
}
