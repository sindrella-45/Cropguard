import Link from "next/link";

const cols = [
  { title: "Platform", links: ["Dashboard", "Diagnose", "History", "Guides"] },
  { title: "Company", links: ["About", "Blog", "Careers", "Partners"] },
  { title: "Support", links: ["Help Center", "Privacy Policy", "Terms of Service", "Contact Us"] },
];

export function Footer() {
  return (
    <footer id="contact" className="bg-gray-900 pt-16 pb-8 px-6 md:px-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" />
                <circle cx="12" cy="8" r="1.5" fill="white" />
              </svg>
            </div>
            <span className="font-heading font-bold text-white text-base">
              CropGuard<span className="text-green-400"> AI</span>
            </span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            AI-powered crop disease diagnosis platform built for smallholder farmers across East Africa and beyond.
          </p>
        </div>

        {cols.map((col) => (
          <div key={col.title}>
            <h4 className="text-white font-semibold text-sm mb-4">{col.title}</h4>
            <div className="flex flex-col gap-2">
              {col.links.map((l) => (
                <a key={l} href="#" className="text-gray-400 text-sm hover:text-green-400 transition-colors no-underline">
                  {l}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 pt-6 text-center text-gray-500 text-xs">
        © 2025 CropGuard AI. All rights reserved. | Built for farmers, by technologists.
      </div>
    </footer>
  );
}
