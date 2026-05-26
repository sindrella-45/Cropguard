'use client'
import { useState } from 'react'

interface StarRatingProps {
  value: number
  onChange: (v: number) => void
}
export function StarRating({ value, onChange }: StarRatingProps) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-2">
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className={`text-3xl transition-transform duration-150 hover:scale-110 ${n <= (hover || value) ? 'text-amber-400' : 'text-gray-200'}`}
        >★</button>
      ))}
    </div>
  )
}
