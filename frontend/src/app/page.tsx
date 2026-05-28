import { PublicNav }       from "@/components/home/PublicNav";
import { HeroSection }     from "@/components/home/HeroSection";
import { StatsStrip }      from "@/components/home/StatsStrip";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { HowItWorks }      from "@/components/home/HowItWorks";
import { Footer }          from "@/components/home/Footer";

export default function HomePage() {
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
