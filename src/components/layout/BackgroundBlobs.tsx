export function BackgroundBlobs() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-accent-lavender/10 blur-3xl animate-blob-slow" />
      <div
        className="absolute top-1/3 -right-40 h-[450px] w-[450px] rounded-full bg-accent-cyan/10 blur-3xl animate-blob-slow"
        style={{ animationDelay: '4s' }}
      />
      <div
        className="absolute -bottom-40 left-1/3 h-[400px] w-[400px] rounded-full bg-accent-lavender/5 blur-3xl animate-blob-slow"
        style={{ animationDelay: '8s' }}
      />
      <div className="absolute inset-0 bg-gradient-radial" />
    </div>
  );
}
