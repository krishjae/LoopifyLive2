import { NavLink } from "react-router-dom";
import OrbitalCircles from "../components/OrbitalCircles";

const features = [
  {
    icon: "🎵",
    title: "AI Analysis",
    desc: "Detect scale, raga, emotion & genre from any audio in seconds",
    to: "/production"
  },
  {
    icon: "🎹",
    title: "Learn Instruments",
    desc: "Interactive piano & guitar with chord progressions and practice mode",
    to: "/learning"
  },
  {
    icon: "🎛️",
    title: "Live Stage",
    desc: "Multi-track mixer, timeline editor & real-time intelligence",
    to: "/live-stage"
  }
];

const brands = [
  { name: "Spotify", logo: "🎧" },
  { name: "SoundCloud", logo: "☁️" },
  { name: "YouTube Music", logo: "▶️" },
  { name: "Apple Music", logo: "🍎" },
  { name: "Deezer", logo: "🎶" },
];

export default function Home() {
  return (
    <main className="relative min-h-[calc(100vh-57px)] overflow-hidden">
      {/* Hero */}
      <section className="px-6 lg:px-10 pt-12 lg:pt-20 pb-24">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left content */}
          <div className="flex-1 max-w-xl z-10">
            <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/50 text-xs font-medium mb-8 animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2.5 animate-pulse" />
              AI-Powered Music Intelligence
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-[4.5rem] font-display font-bold leading-[1.05] mb-6 animate-slide-up">
              <span className="block text-white/95">Unlock Your</span>
              <span className="block italic text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-amber-300">
                Musical Potential
              </span>
              <span className="block text-white/95">With AI</span>
            </h1>

            <p className="text-base text-white/40 max-w-md mb-10 leading-relaxed animate-slide-up stagger-2">
              Upload any song and instantly unlock chords, scale insights, and
              interactive instrument guides powered by cutting-edge AI.
            </p>

            <div className="flex items-center gap-3 animate-slide-up stagger-3">
              <NavLink
                to="/learning"
                className="group px-7 py-3.5 rounded-full glow-btn font-semibold text-sm flex items-center gap-2"
              >
                <span>Start Creating</span>
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </NavLink>
              <NavLink
                to="/production"
                className="px-7 py-3.5 rounded-full bg-white/[0.04] border border-white/[0.08] font-semibold text-sm text-white/70 hover:text-white hover:bg-white/[0.08] transition-all"
              >
                Explore Features
              </NavLink>
            </div>
          </div>

          {/* Right orbital */}
          <div className="flex-1 flex items-center justify-center lg:justify-end animate-fade-in stagger-4">
            <OrbitalCircles />
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="px-6 lg:px-10 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <NavLink
                key={f.title}
                to={f.to}
                className="group section-card p-6 hover:bg-white/[0.03] transition-all duration-300"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/10 flex items-center justify-center text-lg mb-4 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-white font-semibold text-base mb-1.5">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
                <div className="mt-4 flex items-center gap-1.5 text-violet-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Explore</span>
                  <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </section>

      {/* Brand logos */}
      <div className="border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-10 py-5 flex items-center justify-center gap-10 flex-wrap">
          {brands.map((brand) => (
            <div
              key={brand.name}
              className="flex items-center gap-2 text-white/25 hover:text-white/50 transition-colors cursor-pointer"
            >
              <span className="text-base">{brand.logo}</span>
              <span className="text-xs font-medium tracking-wide">{brand.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Background FX */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-500/[0.06] rounded-full blur-[100px] pointer-events-none" />
    </main>
  );
}
