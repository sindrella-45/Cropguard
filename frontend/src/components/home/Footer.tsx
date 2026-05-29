import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-900 py-12 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-lg">🌿</span>
              </div>
              <div>
                <div className="font-bold text-white text-sm">CropGuard AI</div>
                <div className="text-gray-400 text-xs">Smart Crop Protection</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              AI-powered crop disease diagnosis built for East African smallholder farmers.
              Honest results. Practical treatments. Local languages.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-4">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              All systems operational
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4">Platform</h4>
            <div className="flex flex-col gap-2.5">
              {["Features", "How It Works", "Supported Crops", "Offline Mode", "API Docs"].map((l) => (
                <a key={l} href="#" className="text-gray-400 hover:text-green-400 text-sm no-underline transition-colors">
                  {l}
                </a>
              ))}
            </div>
          </div>

          {/* Legal + disclaimer */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4">Legal</h4>
            <div className="flex flex-col gap-2.5 mb-5">
              {["Privacy Policy", "Terms of Use", "AI Disclaimer", "Data Deletion"].map((l) => (
                <a key={l} href="#" className="text-gray-400 hover:text-green-400 text-sm no-underline transition-colors">
                  {l}
                </a>
              ))}
            </div>
            <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5">
              <p className="text-amber-400/80 text-[10px] leading-relaxed">
                ⚠ CropGuard AI is a decision-support tool. Always confirm
                critical decisions with a qualified agricultural extension officer.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-xs">
            © 2026 CropGuard AI · Built for East African farmers
          </p>
          <p className="text-gray-500 text-xs">
            Powered by{" "}
            <span className="text-gray-400 font-medium">GPT-4o · ChromaDB · FastAPI · Supabase</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
