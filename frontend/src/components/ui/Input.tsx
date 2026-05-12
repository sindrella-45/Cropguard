import { cn } from '@/lib/utils';
import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string; }

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <input
        className={cn('px-4 py-2.5 border-2 border-gray-200 rounded-xl font-body text-sm text-gray-800 bg-white transition-all duration-200 outline-none focus:border-green-500 focus:ring-3 focus:ring-green-500/12 placeholder:text-gray-400', error && 'border-red-400 focus:border-red-500', className)}
        {...props}
      />
      {error && <span className="text-red-500 text-xs">{error}</span>}
    </div>
  );
}
