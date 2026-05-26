import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface BadgeProps { children: ReactNode; variant?: 'green' | 'amber' | 'red' | 'gray' | 'teal'; className?: string; }

export function Badge({ children, variant = 'gray', className }: BadgeProps) {
  const variants = {
    green: 'bg-green-100 text-green-800',
    amber: 'bg-amber-50 text-amber-800',
    red: 'bg-red-50 text-red-600',
    gray: 'bg-gray-100 text-gray-600',
    teal: 'bg-teal-50 text-teal-700',
  };
  return (
    <span className={cn('inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
}
