export default function ParticlesBackground() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {Array.from({ length: 15 }, (_, index) => (
        <div
          key={index}
          className="absolute bg-emerald-500/20 rounded-full animate-float"
          style={{
            width: `${1 + index % 4}px`,
            height: `${1 + index % 4}px`,
            top: `${(index * 37 + 13) % 100}%`,
            left: `${(index * 61 + 7) % 100}%`,
            animationDuration: `${10 + index % 10}s`,
            animationDelay: `${index % 5}s`,
          }}
        />
      ))}
    </div>
  );
}
