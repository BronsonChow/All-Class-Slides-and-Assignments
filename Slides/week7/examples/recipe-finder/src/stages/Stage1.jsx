import { useState, useEffect } from "react";

// STAGE 1: an effect that touches the outside world (the browser tab title).
// No fetch yet. The point is: effects run AFTER render, and the array decides when.
export default function Stage1() {
  const [saved, setSaved] = useState(0);

  useEffect(() => {
    document.title = `${saved} recipes saved`;
  }, [saved]); // runs after first render, then whenever saved changes

  return (
    <div>
      <p>Look at the browser tab.</p>
      <button onClick={() => setSaved(saved + 1)}>Save a recipe ({saved})</button>
    </div>
  );
}
