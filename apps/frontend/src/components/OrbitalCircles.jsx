import { useEffect, useState } from "react";

const floatingElements = [
  { id: 1, type: "avatar", img: "https://randomuser.me/api/portraits/women/44.jpg", size: 48, orbit: 1, startAngle: 0 },
  { id: 2, type: "avatar", img: "https://randomuser.me/api/portraits/men/32.jpg", size: 44, orbit: 1, startAngle: 120 },
  { id: 3, type: "avatar", img: "https://randomuser.me/api/portraits/women/68.jpg", size: 40, orbit: 1, startAngle: 240 },
  { id: 4, type: "avatar", img: "https://randomuser.me/api/portraits/men/22.jpg", size: 42, orbit: 2, startAngle: 60 },
  { id: 5, type: "avatar", img: "https://randomuser.me/api/portraits/women/89.jpg", size: 50, orbit: 2, startAngle: 180 },
  { id: 6, type: "icon", icon: "🎵", size: 48, orbit: 2, startAngle: 300 },
  { id: 7, type: "icon", icon: "🎹", size: 44, orbit: 3, startAngle: 30 },
  { id: 8, type: "icon", icon: "🎸", size: 46, orbit: 3, startAngle: 150 },
  { id: 9, type: "avatar", img: "https://randomuser.me/api/portraits/men/85.jpg", size: 38, orbit: 3, startAngle: 270 },
];

const orbitRadii = [140, 220, 320];

export default function OrbitalCircles() {
  const [angles, setAngles] = useState(
    floatingElements.reduce((acc, el) => ({ ...acc, [el.id]: el.startAngle }), {})
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setAngles((prev) => {
        const next = { ...prev };
        floatingElements.forEach((el) => {
          const speed = 0.15 / el.orbit; // outer orbits move slower
          next[el.id] = (prev[el.id] + speed) % 360;
        });
        return next;
      });
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-[700px] h-[700px] flex items-center justify-center">
      {/* Orbital rings */}
      {orbitRadii.map((radius, idx) => (
        <div
          key={idx}
          className="absolute rounded-full border border-white/10"
          style={{
            width: radius * 2,
            height: radius * 2,
          }}
        />
      ))}

      {/* Center stat */}
      <div className="absolute z-10 text-center">
        <div className="text-5xl font-display font-bold text-white">50k+</div>
        <div className="text-sm text-white/60 tracking-widest uppercase mt-1">Musicians</div>
      </div>

      {/* Floating elements */}
      {floatingElements.map((el) => {
        const radius = orbitRadii[el.orbit - 1];
        const angle = angles[el.id];
        const x = Math.cos((angle * Math.PI) / 180) * radius;
        const y = Math.sin((angle * Math.PI) / 180) * radius;

        return (
          <div
            key={el.id}
            className="absolute floating-element transition-transform"
            style={{
              width: el.size,
              height: el.size,
              transform: `translate(${x}px, ${y}px)`,
            }}
          >
            {el.type === "avatar" ? (
              <img
                src={el.img}
                alt=""
                className="w-full h-full rounded-full object-cover border-2 border-white/20 shadow-lg shadow-fuchsia-500/30"
              />
            ) : (
              <div className="w-full h-full rounded-xl bg-surface/80 backdrop-blur-md border border-purple-500/20 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/20">
                {el.icon}
              </div>
            )}
          </div>
        );
      })}

      {/* Cursor indicator */}
      <div
        className="absolute z-20"
        style={{ transform: "translate(80px, 200px)" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-fuchsia-400 rotate-45" />
          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-fuchsia-500 to-amber-400 text-xs font-semibold text-white">
            David
          </span>
        </div>
      </div>
    </div>
  );
}
