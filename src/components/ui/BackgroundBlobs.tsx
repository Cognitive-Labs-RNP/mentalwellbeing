export function BackgroundBlobs() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden pointer-events-none -z-10"
    >
      <svg
        className="absolute -top-32 -left-32 w-[520px] h-[520px] animate-blob-slow opacity-25"
        viewBox="0 0 500 500"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="blobLavender" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="1" />
            <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path
          fill="url(#blobLavender)"
          d="M413,294.5Q368,389,277,416.5Q186,444,106.5,387Q27,330,49.5,234Q72,138,156,83.5Q240,29,323,65.5Q406,102,433.5,191Q461,280,413,294.5Z"
        />
      </svg>

      <svg
        className="absolute top-1/2 -translate-y-1/2 -right-40 w-[480px] h-[480px] animate-blob-slow opacity-25"
        style={{ animationDelay: '6s' }}
        viewBox="0 0 500 500"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="blobCyan" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#67e8f9" stopOpacity="1" />
            <stop offset="60%" stopColor="#22d3ee" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path
          fill="url(#blobCyan)"
          d="M433,311Q406,397,327.5,431Q249,465,169,422.5Q89,380,62,292Q35,204,96,138Q157,72,246,56.5Q335,41,395,98Q455,155,453.5,232.5Q452,310,433,311Z"
        />
      </svg>

      <svg
        className="absolute -bottom-40 left-1/3 w-[560px] h-[560px] animate-blob-slow opacity-20"
        style={{ animationDelay: '12s' }}
        viewBox="0 0 500 500"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="blobIndigo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="1" />
            <stop offset="60%" stopColor="#4f46e5" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path
          fill="url(#blobIndigo)"
          d="M398.5,284.5Q381,369,310,417Q239,465,156.5,431.5Q74,398,46,312Q18,226,69.5,158Q121,90,203,59.5Q285,29,353,73.5Q421,118,436.5,199Q452,280,398.5,284.5Z"
        />
      </svg>
    </div>
  )
}
