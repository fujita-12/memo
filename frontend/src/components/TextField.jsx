// src/components/TextField.jsx
import styles from './TextField.module.css';

export default function TextField({
  value,
  onChange,
  placeholder,
  type = 'text',
  readOnly = false,
  className = '',
  name,
  id,
  autoComplete,
  disabled = false,
}) {
  return (
    <input
      className={`${styles.input} ${className}`.trim()}
      type={type}
      value={value}
      placeholder={placeholder}
      readOnly={readOnly}
      disabled={disabled}
      name={name}
      id={id}
      autoComplete={autoComplete}
      onChange={(e) => onChange?.(e.target.value)}
    />
  );
}
