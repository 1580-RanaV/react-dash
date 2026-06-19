

export default function GeneratingLoader() {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center rounded-xl" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(20px) saturate(160%)", WebkitBackdropFilter: "blur(20px) saturate(160%)" }}>
      <img
        src="/logo.png"
        alt=""
        width={64}
        height={64}
        className="animate-logo-pulse rounded-xl"
      />
    </div>
  );
}
