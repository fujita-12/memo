export default function TextField({ value, onChange, placeholder, type = 'text', readOnly = false }) {
  return (
    <input
      className="input"
      type={type}
      value={value}
      placeholder={placeholder}
      readOnly={readOnly}
      onChange={(e) => onChange?.(e.target.value)}
    />
  );
}
