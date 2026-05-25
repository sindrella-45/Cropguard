import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#030a03] border-t border-white/8 py-14 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #2D6A2D, #C8A84B)" }}>
                <span className="text-lg">🌿</span>
              </div>
              <span className="font-bold text-lg text-white" style={{ fontFamily: "'Fraunces', serif" }}>
                CropGuard AI
              </span>
            </div>
            <p className="text-white/45 text-sm leading-relaxed max-w-sm mb-6">
              AI-powered crop disease diagnosis built specifically for East African
              smallholder farmers. Honest confidence scores. Locally-relevant treatments.
            </p>
            <div className="flex items-center gap-2 text-xs text-white/30">
              <span className="w-2 h-2 rounded-full bg-[#5CB85C] animate-pulse" />
              System operational · All services running
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white/80 text-xs font-bold uppercase tracking-widest mb-4">Platform</h4>
            <div className="flex flex-col gap-3">
              {["Features", "How It Works", "Supported Crops", "Offline Mode", "API Docs"].map(l => (
                <a key={l} href="#" className="text-white/40 hover:text-white/70 text-sm no-underline transition-colors">{l}</a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white/80 text-xs font-bold uppercase tracking-widest mb-4">Legal</h4>
            <div className="flex flex-col gap-3">
              {["Privacy Policy", "Terms of Use", "AI Disclaimer", "Data Deletion"].map(l => (
                <a key={l} href="#" className="text-white/40 hover:text-white/70 text-sm no-underline transition-colors">{l}</a>
              ))}
            </div>
            <div className="mt-6 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5">
              <p className="text-amber-400/80 text-[10px] leading-relaxed">
                ⚠ CropGuard AI is a decision-support tool, not a certified agronomist.
                Always confirm critical decisions with a qualified extension officer.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-xs">
            © 2026 CropGuard AI. Built for East African farmers.
          </p>
          <div className="flex items-center gap-2 text-white/25 text-xs">
            <span>Powered by</span>
            <span className="text-white/40 font-medium">GPT-4o · ChromaDB · FastAPI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
