'use client';
import { cn } from '@/lib/utils';
import { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

export function Button({ variant = 'primary', size = 'md', loading, children, className, disabled, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-medium cursor-pointer transition-all duration-200 whitespace-nowrap border-0 outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-green-600 text-white hover:bg-green-700 hover:-translate-y-px shadow-[0_2px_12px_rgba(22,163,74,0.25)] hover:shadow-[0_4px_20px_rgba(22,163,74,0.35)]',
    secondary: 'bg-white text-green-700 border border-green-200 hover:bg-green-50 hover:border-green-400 shadow-sm',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-800',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100',
  };
  const sizes = {
    sm: 'px-4 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} disabled={disabled || loading} {...props}>
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-70" />
      )}
      {children}
    </button>
  );
}
