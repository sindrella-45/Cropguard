"use client";
import { useEffect } from "react";
import { startKeepAlive } from "@/lib/keepAlive";
import { PublicNav }       from "@/components/home/PublicNav";
import { HeroSection }     from "@/components/home/HeroSection";
import { StatsStrip }      from "@/components/home/StatsStrip";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { HowItWorks }      from "@/components/home/HowItWorks";
import { Footer }          from "@/components/home/Footer";

export default function HomePage() {
  useEffect(() => {
    // Wake up backend as soon as someone visits the landing page
    const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    fetch(`${BACKEND}/health`).catch(() => {});
  }, []);

  return (
    <main className="bg-white min-h-screen">
      <PublicNav />
      <HeroSection />
      <StatsStrip />
      <FeaturesSection />
      <HowItWorks />
      <Footer />
    </main>
  );
}