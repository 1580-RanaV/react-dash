export default function LogoLoaderView() {
  return (
    <main className="logo-loader-screen" aria-label="Loading">
      <div className="logo-loader" role="status" aria-live="polite">
        <div className="logo-loader__mark">
          <img src="/hq.png" alt="Intempt" width={112} height={112} />
          <span className="logo-loader__shimmer logo-loader__shimmer--quick" />
          <span className="logo-loader__shimmer logo-loader__shimmer--sunrise" />
        </div>
        <span className="sr-only">Loading</span>
      </div>
    </main>
  );
}
