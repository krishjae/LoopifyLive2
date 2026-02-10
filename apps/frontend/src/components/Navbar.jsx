import { useState } from "react";
import { NavLink } from "react-router-dom";
import LoginModal from "./LoginModal";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="w-full px-6 lg:px-10 py-4 flex items-center justify-between backdrop-blur-2xl bg-bg/60 sticky top-0 z-50 border-b border-white/[0.04]">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-amber-400 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-shadow">
            L
          </div>
          <span className="font-display text-lg tracking-wide text-white/90 group-hover:text-white transition-colors">
            Loopify<span className="text-fuchsia-400 font-semibold">Live</span>
          </span>
        </NavLink>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 text-[13px] font-medium tracking-wide">
          <NavItem to="/production" label="Production" icon="✦" />
          <NavItem to="/learning" label="Learning" icon="♪" />
          <NavItem to="/live-stage" label="Live Stage" icon="◉" />
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen(true)}
            className="hidden sm:block px-4 py-2 text-[13px] font-medium text-white/50 hover:text-white transition-colors rounded-lg hover:bg-white/[0.04]"
          >
            Log In
          </button>
          <button
            onClick={() => setOpen(true)}
            className="px-5 py-2 rounded-full glow-btn font-semibold text-[13px] shadow-lg shadow-violet-500/20 hover:shadow-violet-500/35 transition-all"
          >
            <span>Get Started</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden ml-2 w-9 h-9 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {open && <LoginModal onClose={() => setOpen(false)} />}
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[57px] z-40 glass-elevated p-4 space-y-1 animate-slide-up border-b border-white/[0.06]">
          <MobileNavItem to="/production" label="Production" icon="✦" onClick={() => setMobileOpen(false)} />
          <MobileNavItem to="/learning" label="Learning" icon="♪" onClick={() => setMobileOpen(false)} />
          <MobileNavItem to="/live-stage" label="Live Stage" icon="◉" onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </>
  );
}

function NavItem({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${isActive
          ? "bg-white/[0.08] text-white shadow-inner"
          : "text-white/50 hover:text-white/80 hover:bg-white/[0.04]"
        }`
      }
    >
      <span className="text-[10px] opacity-60">{icon}</span>
      {label}
    </NavLink>
  );
}

function MobileNavItem({ to, label, icon, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `block px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${isActive
          ? "bg-white/[0.08] text-white"
          : "text-white/60 hover:text-white hover:bg-white/[0.04]"
        }`
      }
    >
      <span className="text-sm opacity-60">{icon}</span>
      <span className="font-medium">{label}</span>
    </NavLink>
  );
}
