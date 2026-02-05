export default function LoginModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
      <div className="w-full max-w-md rounded-2xl glass-surface p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition"
        >
          ✕
        </button>

        <h2 className="text-3xl font-display font-semibold mb-2">
          Welcome back
        </h2>
        <p className="text-white/60 mb-8">
          Login to continue your music journey.
        </p>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-white/20"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-white/20"
          />
          <button className="w-full py-3 rounded-xl glow-btn font-semibold hover:opacity-90 transition">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
