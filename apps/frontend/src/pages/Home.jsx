import { NavLink } from "react-router-dom";
import OrbitalCircles from "../components/OrbitalCircles";

const brands = [
  { name: "Spotify", logo: "🎧" },
  { name: "SoundCloud", logo: "☁️" },
  { name: "YouTube Music", logo: "▶️" },
  { name: "Apple Music", logo: "🍎" },
  { name: "Deezer", logo: "🎶" },
];

export default function Home() {
  return (
    <main className="relative min-h-[calc(100vh-88px)] px-6 lg:px-10 pt-8 lg:pt-16 pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left content */}
        <div className="flex-1 max-w-xl z-10">
          <div className="inline-flex items-center justify-center px-4 py-2 rounded-full glass-surface text-white/70 text-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 mr-3 animate-pulse" />
            AI-Powered Music Intelligence
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.1] mb-6">
            <span className="block">Unlock Your</span>
            <span className="block italic text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-amber-400">
              Musical Potential
            </span>
            <span className="block">With AI</span>
          </h1>

          <p className="text-lg text-white/60 max-w-md mb-10 leading-relaxed">
            Upload any song and instantly unlock chords, scale insights, and
            interactive instrument guides powered by cutting-edge AI.
          </p>

          <div className="flex items-center gap-4">
            <NavLink
              to="/learning"
              className="group px-8 py-4 rounded-full glow-btn font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 flex items-center gap-2"
            >
              Start Project
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </NavLink>
            <NavLink
              to="/production"
              className="px-8 py-4 rounded-full glass-surface font-semibold hover:bg-white/10 transition-all duration-300"
            >
              Learn More
            </NavLink>
          </div>
        </div>

        {/* Right orbital visualization */}
        <div className="flex-1 flex items-center justify-center lg:justify-end">
          <OrbitalCircles />
        </div>
      </div>

      {/* Brand logos */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-white/5 bg-gradient-to-t from-bg/50 to-transparent">
        <div className="max-w-7xl mx-auto px-10 py-6 flex items-center justify-center gap-12 flex-wrap">
          {brands.map((brand) => (
            <div
              key={brand.name}
              className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors cursor-pointer"
            >
              <span className="text-xl">{brand.logo}</span>
              <span className="text-sm font-medium tracking-wide">{brand.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Background glow effects */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-600/25 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/3 w-72 h-72 bg-fuchsia-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
    </main>
  );
}
