"use client";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Amina Nakato",
    role: "Coffee Farmer · Masaka, Uganda",
    avatar: "AN",
    color: "#C8A84B",
    stars: 5,
    quote:
      "I uploaded a photo of my coffee leaves and within a minute I knew it was leaf rust and exactly what to apply. Before this I would wait weeks for an extension officer who never came.",
    crop: "Coffee",
    result: "Saved 80% of harvest",
  },
  {
    name: "Joseph Otieno",
    role: "Tea Farmer · Kericho, Kenya",
    avatar: "JO",
    color: "#5CB85C",
    stars: 5,
    quote:
      "What impressed me was it told me it was 'likely' not 'definitely' — and it explained why. That honesty made me trust it. The treatment it recommended was available at my nearest agrovet.",
    crop: "Tea",
    result: "Disease caught early",
  },
  {
    name: "Grace Zawedde",
    role: "Cotton Farmer · Soroti, Uganda",
    avatar: "GZ",
    color: "#C8A84B",
    stars: 4,
    quote:
      "I am not educated but the app told me in simple words what to do. Remove infected leaves, use copper spray, avoid watering overhead. I understood every step.",
    crop: "Cotton",
    result: "Bacterial blight contained",
  },
  {
    name: "Emmanuel Ndikumana",
    role: "Cocoa Farmer · Bundibugyo, Uganda",
    avatar: "EN",
    color: "#5CB85C",
    stars: 5,
    quote:
      "The app said it could not confirm the exact pathogen from the image and recommended I see an agronomist. That honesty — telling me when it doesn't know — made me trust it completely.",
    crop: "Cocoa",
    result: "Referred for lab test",
  },
  {
    name: "Fatuma Wanjiku",
    role: "Sunflower Farmer · Nakuru, Kenya",
    avatar: "FW",
    color: "#C8A84B",
    stars: 5,
    quote:
      "The offline history feature is everything. I diagnosed my plants on the farm, drove home with no internet, and my husband could read the full report and treatment plan that evening.",
    crop: "Sunflower",
    result: "Nutrient deficiency corrected",
  },
  {
    name: "Patrick Ochola",
    role: "Extension Officer · Gulu, Uganda",
    avatar: "PO",
    color: "#5CB85C",
    stars: 5,
    quote:
      "As an extension officer I cover 400 farmers. CropGuard AI has become my first-line triage. Farmers come to me already knowing what disease they likely have, and I confirm or adjust. It saves days.",
    crop: "All crops",
    result: "Covers 400+ farmers",
  },
];

export function Testimonials() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="testimonials" className="bg-[#050f05] py-28 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-[#C8A84B] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            Farmer Stories
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-5"
            style={{ fontFamily: "'Fraunces', serif" }}>
            Trusted by farmers across<br />
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #5CB85C, #C8A84B)" }}>
              Uganda and East Africa
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map(({ name, role, avatar, color, stars, quote, crop, result }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="relative rounded-2xl p-6 border border-white/8 hover:border-white/18 transition-all duration-300 flex flex-col"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: stars }).map((_, j) => (
                  <Star key={j} size={13} fill="#C8A84B" className="text-[#C8A84B]" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-white/70 text-sm leading-relaxed mb-5 flex-1 italic">
            &quot;{quote}&quot;
           </p>

              {/* Result badge */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-full border"
                  style={{ color, borderColor: `${color}40`, background: `${color}12` }}>
                  {crop}
                </span>
                <span className="text-[10px] text-[#5CB85C] font-semibold">
                  ✓ {result}
                </span>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/8">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-[#0a1a0a]"
                  style={{ background: `linear-gradient(135deg, ${color}, #fff8)` }}
                >
                  {avatar}
                </div>
                <div>
                  <div className="text-white/90 text-sm font-semibold">{name}</div>
                  <div className="text-white/40 text-xs">{role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
