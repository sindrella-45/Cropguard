"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Camera, Cpu, Database, Pill } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: <Camera size={22} className="text-green-600" />,
    bg: "bg-green-50",
    title: "Photograph the leaf",
    description:
      "Take a clear close-up photo of the affected leaf in natural daylight. Our validator rejects blurry or non-plant images before processing begins.",
    image: "/images/person-photo-plant.jpg",
  },
  {
    number: "02",
    icon: <Cpu size={22} className="text-blue-600" />,
    bg: "bg-blue-50",
    title: "AI identifies crop & symptoms",
    description:
      "The AI identifies your crop species then describes every visible symptom — preventing anchoring bias before any disease name is considered.",
    image: null,
  },
  {
    number: "03",
    icon: <Database size={22} className="text-purple-600" />,
    bg: "bg-purple-50",
    title: "Knowledge base retrieval",
    description:
      "Symptoms are matched against verified agricultural PDFs. Each crop has its own dedicated knowledge base for precise, accurate results.",
    image: null,
  },
  {
    number: "04",
    icon: <Pill size={22} className="text-amber-600" />,
    bg: "bg-amber-50",
    title: "Treatment & prevention plan",
    description:
      "Receive specific guidance grounded in locally available products. Bacterial diseases get bactericides. Viral conditions get vector control advice.",
    image: "/images/maize-field.jpg",
  },
];

export function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="how-it-works" className="bg-white py-20 px-6 md:px-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6"
        >
          <div>
            <span className="text-green-600 text-xs font-bold uppercase tracking-widest">
              The Process
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3 leading-tight max-w-lg">
              From photo to treatment plan in under 60 seconds
            </h2>
          </div>
          <Link href="/auth/register" className="no-underline flex-shrink-0">
            <button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-7 py-3.5 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-green-600/20">
              Try It Free →
            </button>
          </Link>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {steps.map(({ number, icon, bg, title, description, image }, i) => (
            <motion.div
              key={number}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative rounded-2xl overflow-hidden border border-gray-100 group hover:shadow-lg transition-all duration-300"
            >
              {/* Background image for steps 1 and 4 */}
              {image && (
                <>
                  <img
                    src={image}
                    alt={title}
                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/96 via-white/88 to-white/60" />
                </>
              )}
              {!image && <div className="absolute inset-0 bg-gray-50" />}

              {/* Content */}
              <div className="relative z-10 p-7">
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    {icon}
                  </div>
                  <span className="text-3xl font-black text-gray-100 select-none">
                    {number}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2 leading-snug">
                  {title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
