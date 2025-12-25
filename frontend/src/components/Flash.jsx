export default function Flash({ info, error }) {
  if (!info && !error) return null;

  return (
    <div className="mt12">
      {info && <p className="flashOk">{info}</p>}
      {error && <p className="flashErr">{error}</p>}
    </div>
  );
}
