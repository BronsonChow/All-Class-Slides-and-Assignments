// The message is for the user. The real error already went to console.error.
export default function ErrorBox({ message, onRetry }) {
  return (
    <div className="error">
      <strong>Could not load recipes</strong>
      <p>{message}</p>
      {onRetry && <button onClick={onRetry}>Retry</button>}
    </div>
  );
}
