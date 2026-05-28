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
  { value: 12000, suffix: "+", label: "Farmers Protected",   sub: "Across East Africa" },
  { value: 200,   suffix: "+", label: "Diseases Indexed",    sub: "In knowledge base" },
  { value: 96,    suffix: "%", label: "Crop ID Accuracy",    sub: "When image is clear" },
  { value: 5,     suffix: "",  label: "Languages Supported", sub: "Including Luganda & Swahili" },
];

export function StatsStrip() {
  return (
    <section className="bg-green-600 py-14">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ value, suffix, label, sub }) => (
            <div key={label} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-1">
                <Counter target={value} suffix={suffix} />
              </div>
              <div className="text-green-100 font-semibold text-sm mb-0.5">{label}</div>
              <div className="text-green-200/70 text-xs">{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
