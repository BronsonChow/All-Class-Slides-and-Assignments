// One place for the base URL so every stage reads the same way.
// ?delay=2000 slows the server down on purpose so loading states are visible.
// Remove the delay when you are done building.
export const API = "https://dummyjson.com";
export const DELAY = "delay=1500";

export function recipesUrl() {
  return `${API}/recipes?limit=12&${DELAY}`;
}
export function searchUrl(q) {
  return `${API}/recipes/search?q=${encodeURIComponent(q)}&limit=12&${DELAY}`;
}
export function recipeUrl(id) {
  return `${API}/recipes/${id}?${DELAY}`;
}
// A URL that always fails, for testing the error branch.
export const BROKEN = "https://dummyjson.com/recipez";
