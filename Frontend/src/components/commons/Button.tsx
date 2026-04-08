import React from 'react';

type Variant = 'primary' | 'secondary' | 'delete' | 'ghost' | 'icon';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: React.ReactNode;
  ariaLabel?: string;
}

const variantClass: Record<Variant, string> = {
  primary: 'btn btn-primary',
  secondary: 'btn btn-secondary',
  delete: 'btn-delete',
  ghost: 'btn-ghost',
  icon: 'btn-icon',
};

export default function Button({ variant = 'primary', children, className = '', ariaLabel, ...rest }: Props) {
  const cls = `${variantClass[variant]} ${className}`.trim();
  return (
    <button className={cls} aria-label={ariaLabel} {...rest}>
      {children}
    </button>
  );
}
