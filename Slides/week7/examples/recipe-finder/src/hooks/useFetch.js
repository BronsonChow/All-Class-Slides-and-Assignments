import { useState, useEffect } from "react";

// A custom hook: a function whose name starts with "use" and which calls other hooks.
// It packages the Three States so a component never writes this effect again.
// Each component that calls useFetch gets ITS OWN data/loading/error. Nothing is shared.
//
// Options:
//   retries: how many times to retry network failures and 5xx (never 404). Default 0.
//   keepData: on refetch, keep the previous data until the new data arrives. Default true.

function messageFor(err) {
  if (err.name === "TypeError") return "Could not reach the server. Check your connection.";
  if (err.message === "HTTP 404") return "That does not exist.";
  return "The server had a problem. Try again in a moment.";
}
function shouldRetry(err) {
  return err.name === "TypeError" || err.message.startsWith("HTTP 5");
}

export default function useFetch(url, { retries = 0, keepData = true } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    if (!keepData) setData(null);

    async function load(attempt) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("HTTP " + res.status);
        const json = await res.json();
        if (alive) {
          setData(json);
          setLoading(false);
        }
      } catch (err) {
        if (!alive) return;
        console.error(`useFetch ${url} attempt ${attempt}`, err);
        if (attempt <= retries && shouldRetry(err)) {
          setTimeout(() => load(attempt + 1), 600 * attempt);
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
  }, [url, tick, retries, keepData]);

  const refetch = () => setTick((t) => t + 1);
  return { data, loading, error, refetch };
}
