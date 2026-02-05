import { useState } from "react";
import { NavLink } from "react-router-dom";
import LoginModal from "./LoginModal";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full px-6 lg:px-10 py-5 flex items-center justify-between backdrop-blur-sm bg-bg/30 sticky top-0 z-50 border-b border-white/5">
      <NavLink to="/" className="flex items-center gap-3 group">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 via-fuchsia-500 to-amber-400 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/30">
          L
        </div>
        <span className="font-display text-xl tracking-wide text-white/90 group-hover:text-white transition-colors">
          Loopify<span className="text-fuchsia-400">Live</span>
        </span>
      </NavLink>

      <nav className="hidden lg:flex items-center gap-1 text-sm tracking-wide">
        <NavItem to="/production" label="Music Production" />
        <NavItem to="/learning" label="Music Learning" />
        <NavItem to="/live-stage" label="Live Stage" />
        <NavItem to="/" label="Resources" />
      </nav>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setOpen(true)}
          className="px-5 py-2.5 text-sm font-medium text-white/70 hover:text-white transition-colors"
        >
          Log In
        </button>
        <button
          onClick={() => setOpen(true)}
          className="px-6 py-2.5 rounded-full glow-btn font-semibold text-sm shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all"
        >
          <span>Join Now</span>
        </button>
      </div>

      {open && <LoginModal onClose={() => setOpen(false)} />}
    </header>
  );
}

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-4 py-2 rounded-full transition-all duration-200 ${isActive
          ? "bg-white/10 text-white"
          : "text-white/60 hover:text-white hover:bg-white/5"
        }`
      }
    >
      {label}
    </NavLink>
  );
}
