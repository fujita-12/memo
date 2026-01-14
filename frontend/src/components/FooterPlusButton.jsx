// src/components/Button.jsx
import { Link } from 'react-router-dom';
import styles from './FooterPlusButton.module.css';

function cx(...args) {
  return args.filter(Boolean).join(' ');
}

export default function Button({
  children,
  onClick,
  disabled = false,
  type = 'button',
  to,
  className = '',
}) {
  const classes = cx(
    styles.bottomBtn,
    disabled && styles.disabled,
    className
  );

  // Link版（toがある時）
  if (to) {
    return (
      <Link
        to={disabled ? '#' : to}
        className={classes}
        onClick={(e) => {
          if (disabled) {
            e.preventDefault();
            return;
          }
          onClick?.(e);
        }}
        aria-disabled={disabled ? 'true' : undefined}
        tabIndex={disabled ? -1 : undefined}
      >
        {children}
      </Link>
    );
  }

  // button版
  return (
    <button className={classes} type={type} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}