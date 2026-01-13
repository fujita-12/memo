// src/components/Button.jsx
import { Link } from 'react-router-dom';
import styles from './Button.module.css';

function cx(...args) {
  return args.filter(Boolean).join(' ');
}

export default function Button({
  children,
  onClick,
  disabled = false,
  type = 'button',

  // link
  to,

  // style options
  align = 'center', // 'left' | 'center' | 'right'
  variant = 'primary', // 'primary' | 'black' | 'danger'
  size = '', // 'sm' | 'md' | 'lg'

  className = '',
}) {
  const classes = cx(
    styles.btn,
    styles[`variant_${variant}`],
    styles[`size_${size}`],
    styles[`align_${align}`],
    disabled && styles.disabled,
    className // 外から渡されたクラスも混ぜたい場合
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