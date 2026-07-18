const SPOKE_COUNT = 12;

const KEYFRAMES = `
  @keyframes loader-spokes-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes loader-spoke-pulse {
    0%, 100% {
      opacity: 0.22;
    }
    42% {
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    [data-page-loader] * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
    }
  }
`;

export default function PageLoader({ fading }: { fading?: boolean }) {
  return (
    <>
      <style>{KEYFRAMES}</style>
      <div
        data-page-loader
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--content-bg)",
          transition: "opacity 0.45s ease",
          opacity: fading ? 0 : 1,
          pointerEvents: fading ? "none" : "all",
        }}
      >
        <div
          role="status"
          aria-label="Loading"
          style={{
            position: "relative",
            width: 92,
            height: 92,
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 999,
              transformOrigin: "50% 50%",
              animation: "loader-spokes-spin 1.12s linear infinite",
              willChange: "transform",
            }}
          >
            {Array.from({ length: SPOKE_COUNT }, (_, index) => {
              const rotation = (360 / SPOKE_COUNT) * index;
              return (
                <span
                  key={index}
                  style={{
                    position: "absolute",
                    left: 43,
                    top: 9,
                    width: 6,
                    height: 16,
                    borderRadius: 999,
                    background: "#0080FF",
                    transform: `rotate(${rotation}deg)`,
                    transformOrigin: "3px 37px",
                    opacity: Math.max(0.22, 1 - index * 0.07),
                    animation: "loader-spoke-pulse 1.12s ease-in-out infinite",
                    animationDelay: `${index * -0.093}s`,
                    willChange: "opacity",
                  }}
                />
              );
            })}
          </div>

          <img
            src="/logo.png"
            alt="Intempt"
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 34,
              height: 34,
              objectFit: "contain",
              transform: "translate(-50%, -50%)",
            }}
          />

          <span className="sr-only">Loading</span>
        </div>
      </div>
    </>
  );
}
