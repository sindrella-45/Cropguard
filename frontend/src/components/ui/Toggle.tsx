'use client';
import { useState, useEffect } from 'react';

interface ToggleProps {
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
}

export function Toggle({ defaultChecked = false, onChange }: ToggleProps) {
  const [isOn, setIsOn] = useState(defaultChecked);

  // Sync when defaultChecked changes (loaded from store)
  useEffect(() => {
    setIsOn(defaultChecked);
  }, [defaultChecked]);

  const handle = () => {
    const next = !isOn;
    setIsOn(next);
    onChange?.(next);
  };

  return (
    <button
      role="switch"
      aria-checked={isOn}
      onClick={handle}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 flex-shrink-0 ${
        isOn ? 'bg-green-500' : 'bg-gray-300'
      }`}
    >
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${
        isOn ? 'translate-x-5' : 'translate-x-1'
      }`} />
    </button>
  );
}