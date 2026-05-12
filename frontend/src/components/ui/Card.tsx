import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface CardProps { children: ReactNode; className?: string; hover?: boolean; }

export function Card({ children, className, hover = true }: CardProps) {
  return (
    <div className={cn('bg-white rounded-2xl border border-gray-200 shadow-sm transition-all duration-200', hover && 'hover:shadow-md', className)}>
      {children}
    </div>
  );
}
