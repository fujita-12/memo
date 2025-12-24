export default function Section({ title, children }) {
  return (
    <div className="card mt16">
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      {children}
    </div>
  );
}
