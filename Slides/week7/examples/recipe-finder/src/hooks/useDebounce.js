import { useState, useEffect } from "react";

// Returns a copy of value that only updates after it has stopped changing for ms.
// Feed the debounced value to useFetch so search fires once per pause, not once per keystroke.
export default function useDebounce(value, ms = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id); // cleanup cancels the pending update when value changes again
  }, [value, ms]);
  return debounced;
}
