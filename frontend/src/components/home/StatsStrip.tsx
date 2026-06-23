"use client";
import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { Leaf } from "lucide-react";

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
  { value: 10000, suffix: "+", label: "Farmers Helped",     sub: "Across East Africa" },
  { value: 25,    suffix: "+", label: "Crops Supported",    sub: "Including major staples" },
  { value: 98,    suffix: "%", label: "Satisfaction Rate",  sub: "Based on user feedback" },
  { value: 200,   suffix: "+", label: "Diseases Indexed",   sub: "In our knowledge base" },
];

export function StatsStrip() {
  return (
    <section className="relative overflow-hidden bg-green-700 py-14">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
          {/* Left branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Leaf size={20} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Built for Farmers.</div>
              <div className="text-green-200 text-xs">Powered by AI.</div>
            </div>
          </div>
          <div className="hidden md:block h-10 w-px bg-white/20" />
          <p className="text-green-100 text-sm max-w-md text-center md:text-left">
            Trusted by smallholder farmers across Uganda, Kenya, Tanzania and Rwanda
            to protect their crops and increase yields.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-white/20">
          {stats.map(({ value, suffix, label, sub }) => (
            <div key={label} className="text-center">
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-1">
                <Counter target={value} suffix={suffix} />
              </div>
              <div className="text-green-100 font-semibold text-sm">{label}</div>
              <div className="text-green-300/70 text-xs mt-0.5">{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
