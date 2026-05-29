"use client";
import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const steps = 50;
    const inc = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += inc;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 1400 / steps);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const stats = [
  { value: 10000, suffix: "+", label: "Farmers Helped" },
  { value: 25,    suffix: "+", label: "Crops Supported" },
  { value: 98,    suffix: "%", label: "Satisfaction Rate" },
];

export function StatsStrip() {
  return (
    <section className="bg-gray-50 border-t border-b border-gray-100 py-10">
      <div className="max-w-4xl mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left branding */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">🌿</span>
            </div>
            <span className="text-gray-600 font-semibold text-sm">
              Built for Farmers. Powered by AI.
            </span>
          </div>

          {/* Divider */}
          <div className="hidden md:block h-10 w-px bg-gray-200" />

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {stats.map(({ value, suffix, label }, i) => (
              <div key={label} className="text-center flex items-center gap-4">
                {i > 0 && <div className="hidden md:block h-8 w-px bg-gray-200" />}
                <div>
                  <div className="text-3xl font-extrabold text-green-700">
                    <Counter target={value} suffix={suffix} />
                  </div>
                  <div className="text-gray-500 text-xs mt-0.5">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
