import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-900 py-14 px-6 md:px-10">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">🌿</span>
              </div>
              <span className="font-bold text-white text-base">CropGuard AI</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs mb-5">
              AI-powered crop disease diagnosis built specifically for East African
              smallholder farmers. Honest confidence scores. Locally-relevant treatments.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              All systems operational
            </div>
          </div>

          {/* Platform links */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4">
              Platform
            </h4>
            <div className="flex flex-col gap-3">
              {["Features", "How It Works", "Supported Crops", "Offline Mode"].map((l) => (
                <a
                  key={l}
                  href="#"
                  className="text-gray-400 hover:text-white text-sm no-underline transition-colors"
                >
                  {l}
                </a>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4">
              Legal
            </h4>
            <div className="flex flex-col gap-3">
              {["Privacy Policy", "Terms of Use", "AI Disclaimer", "Data Deletion"].map((l) => (
                <a
                  key={l}
                  href="#"
                  className="text-gray-400 hover:text-white text-sm no-underline transition-colors"
                >
                  {l}
                </a>
              ))}
            </div>
            <div className="mt-5 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5">
              <p className="text-amber-400/80 text-[10px] leading-relaxed">
                ⚠ CropGuard AI is a decision-support tool. Always confirm
                critical decisions with a qualified extension officer.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs">
            © 2026 CropGuard AI. Built for East African farmers.
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
