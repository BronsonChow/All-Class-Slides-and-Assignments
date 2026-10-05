// Grey blocks shaped like RecipeRow so the layout does not jump when data lands.
export default function RecipeSkeleton({ rows = 5 }) {
  return (
    <ul>
      {Array.from({ length: rows }).map((_, i) => (
        <li className="row" key={i}>
          <div className="sk" style={{ width: 48, height: 48, borderRadius: 8 }} />
          <div style={{ flex: 1 }}>
            <div className="sk" style={{ height: 14, width: "45%" }} />
            <div className="sk" style={{ height: 11, width: "30%", marginTop: 8 }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
