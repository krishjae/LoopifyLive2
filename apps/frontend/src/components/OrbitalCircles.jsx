import { useEffect, useState } from "react";

const floatingElements = [
  { id: 1, type: "avatar", img: "https://randomuser.me/api/portraits/women/44.jpg", size: 46, orbit: 1, startAngle: 0 },
  { id: 2, type: "avatar", img: "https://randomuser.me/api/portraits/men/32.jpg", size: 42, orbit: 1, startAngle: 120 },
  { id: 3, type: "avatar", img: "https://randomuser.me/api/portraits/women/68.jpg", size: 38, orbit: 1, startAngle: 240 },
  { id: 4, type: "avatar", img: "https://randomuser.me/api/portraits/men/22.jpg", size: 40, orbit: 2, startAngle: 60 },
  { id: 5, type: "avatar", img: "https://randomuser.me/api/portraits/women/89.jpg", size: 48, orbit: 2, startAngle: 180 },
  { id: 6, type: "icon", icon: "🎵", size: 44, orbit: 2, startAngle: 300 },
  { id: 7, type: "icon", icon: "🎹", size: 42, orbit: 3, startAngle: 30 },
  { id: 8, type: "icon", icon: "🎸", size: 44, orbit: 3, startAngle: 150 },
  { id: 9, type: "avatar", img: "https://randomuser.me/api/portraits/men/85.jpg", size: 36, orbit: 3, startAngle: 270 },
];

const orbitRadii = [130, 210, 300];

export default function OrbitalCircles() {
  const [angles, setAngles] = useState(
    floatingElements.reduce((acc, el) => ({ ...acc, [el.id]: el.startAngle }), {})
  );

  useEffect(() => {
    let frameId;
    let lastTime = Date.now();

    function animate() {
      const now = Date.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      setAngles((prev) => {
        const next = { ...prev };
        floatingElements.forEach((el) => {
          const speed = 8 / el.orbit;
          next[el.id] = (prev[el.id] + speed * delta) % 360;
        });
        return next;
      });
      frameId = requestAnimationFrame(animate);
    }

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div className="relative w-[640px] h-[640px] flex items-center justify-center">
      {/* Orbital rings with gradient strokes */}
      {orbitRadii.map((radius, idx) => (
        <div
          key={idx}
          className="absolute rounded-full"
          style={{
            width: radius * 2,
            height: radius * 2,
            border: `1px solid rgba(139, 92, 246, ${0.08 - idx * 0.02})`,
          }}
        />
      ))}

      {/* Center stat */}
      <div className="absolute z-10 text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/15 flex items-center justify-center mx-auto mb-0">
          <div>
            <div className="text-3xl font-display font-bold text-white">50k+</div>
            <div className="text-[10px] text-white/40 tracking-[0.2em] uppercase mt-0.5">Musicians</div>
          </div>
        </div>
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
            className="absolute transition-none"
            style={{
              width: el.size,
              height: el.size,
              transform: `translate(${x}px, ${y}px)`,
              willChange: 'transform'
            }}
          >
            {el.type === "avatar" ? (
              <img
                src={el.img}
                alt=""
                className="w-full h-full rounded-full object-cover border-2 border-white/10 shadow-lg shadow-violet-500/15 hover:border-violet-400/40 transition-colors"
              />
            ) : (
              <div className="w-full h-full rounded-xl bg-bg-secondary/80 backdrop-blur-md border border-white/[0.06] flex items-center justify-center text-xl shadow-lg shadow-violet-500/10">
                {el.icon}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
