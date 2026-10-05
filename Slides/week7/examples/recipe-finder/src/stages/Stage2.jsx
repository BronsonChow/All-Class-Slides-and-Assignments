import { useState, useEffect } from "react";
import { recipesUrl } from "../api.js";
import RecipeRow from "../components/RecipeRow.jsx";

// STAGE 2: fetch once with an empty dependency array.
// Watch the Network tab: exactly one request.
// Watch the screen during the delay: blank. Not broken, just blank.
export default function Stage2() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    fetch(recipesUrl())
      .then((res) => res.json())
      .then((data) => setRecipes(data.recipes));
  }, []);

  return (
    <ul>
      {recipes.map((r) => (
        <RecipeRow key={r.id} recipe={r} />
      ))}
    </ul>
  );
}
