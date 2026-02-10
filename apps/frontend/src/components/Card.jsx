export default function Card({ title, icon, children }) {
  return (
    <div className="group rounded-2xl section-card p-5 hover:bg-white/[0.03] transition-all duration-300">
      <div className="flex items-center gap-2 mb-2.5">
        {icon && <span className="text-sm opacity-60">{icon}</span>}
        <div className="text-white/45 text-xs font-medium uppercase tracking-wider">{title}</div>
      </div>
      <div className="text-white text-lg font-semibold">{children}</div>
    </div>
  );
}
