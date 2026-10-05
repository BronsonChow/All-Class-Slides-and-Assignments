import { useState, useEffect } from "react";
import { recipesUrl } from "../api.js";
import RecipeRow from "../components/RecipeRow.jsx";
import ErrorBox from "../components/ErrorBox.jsx";

// STAGE 5 (Thursday): errors a human can act on, a Retry button, automatic retries with backoff.
// Retry network failures and 5xx. Never retry a 404, it will still be missing.
function messageFor(err) {
  if (err.name === "TypeError") return "Could not reach the server. Check your connection.";
  if (err.message === "HTTP 404") return "That recipe does not exist.";
  return "The server had a problem. Try again in a moment.";
}
function shouldRetry(err) {
  return err.name === "TypeError" || err.message.startsWith("HTTP 5");
}

export default function Stage5() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0); // bump to refetch

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    async function load(attempt) {
      try {
        const res = await fetch(recipesUrl());
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();
        if (alive) {
          setRecipes(data.recipes);
          setLoading(false);
        }
      } catch (err) {
        if (!alive) return;
        console.error(`attempt ${attempt}`, err);
        if (attempt < 3 && shouldRetry(err)) {
          setTimeout(() => load(attempt + 1), 600 * attempt); // back off: 600, 1200
          return;
        }
        setError(messageFor(err));
        setLoading(false);
      }
    }
    load(1);

    return () => {
      alive = false;
    };
  }, [tick]);

  if (loading) return <p>Loading recipes...</p>;
  if (error) return <ErrorBox message={error} onRetry={() => setTick((t) => t + 1)} />;
  return (
    <ul>
      {recipes.map((r) => (
        <RecipeRow key={r.id} recipe={r} />
      ))}
    </ul>
  );
}
