'use client';

import { useEffect, useState } from 'react';

interface ToggleProps {
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
}

export function Toggle({
  defaultChecked = false,
  onChange,
}: ToggleProps) {
  const [isOn, setIsOn] = useState(defaultChecked);

  useEffect(() => {
    setIsOn(defaultChecked);
  }, [defaultChecked]);

  const handleToggle = () => {
    const next = !isOn;
    setIsOn(next);
    onChange?.(next);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      aria-label="Toggle setting"
      onClick={handleToggle}
      className={`relative h-6 w-11 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 flex-shrink-0 ${
        isOn ? 'bg-green-500' : 'bg-gray-300'
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform duration-300 ${
          isOn ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  );
}