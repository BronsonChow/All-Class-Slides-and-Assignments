export default function RecipeRow({ recipe, onSelect, selected }) {
  return (
    <li className={"row" + (selected ? " selected" : "")} onClick={onSelect ? () => onSelect(recipe.id) : undefined}>
      <img src={recipe.image} alt="" width="48" height="48" />
      <div>
        <div className="name">{recipe.name}</div>
        <div className="meta">{recipe.cuisine} , {recipe.prepTimeMinutes + recipe.cookTimeMinutes} min , {recipe.difficulty}</div>
      </div>
    </li>
  );
}
