export default function Card({ title, children }) {
  return (
    <div className="rounded-2xl glass-surface p-6">
      <div className="text-white/80 text-sm mb-2">{title}</div>
      <div className="text-white text-lg font-semibold">{children}</div>
    </div>
  );
}
