"use client";
import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const steps = 60;
    const inc = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += inc;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const stats = [
  { value: 12000, suffix: "+", label: "Farmers Protected", sublabel: "Across East Africa" },
  { value: 200, suffix: "+", label: "Diseases Indexed", sublabel: "In knowledge base" },
  { value: 96, suffix: "%", label: "Correct Crop ID", sublabel: "When image is clear" },
  { value: 5, suffix: "", label: "Commercial Crops", sublabel: "Coffee · Tea · Cocoa · Cotton · Sunflower" },
];

export function StatsStrip() {
  return (
    <section className="bg-[#050f05] border-y border-white/8 py-16">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {stats.map(({ value, suffix, label, sublabel }, i) => (
            <div key={label} className="text-center group">
              <div
                className="text-4xl md:text-5xl font-bold mb-2 text-transparent bg-clip-text"
                style={{
                  backgroundImage: i % 2 === 0
                    ? "linear-gradient(135deg, #C8A84B, #E8D080)"
                    : "linear-gradient(135deg, #5CB85C, #2D6A2D)",
                  fontFamily: "'Fraunces', serif"
                }}
              >
                <Counter target={value} suffix={suffix} />
              </div>
              <div className="text-white/80 font-semibold text-sm mb-1">{label}</div>
              <div className="text-white/35 text-xs">{sublabel}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
