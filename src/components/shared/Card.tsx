interface CardProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function Card({ title, subtitle, children }: CardProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="w-full max-w-lg glass rounded-2xl p-8 shadow-glow animate-slide-up">
        <div className="text-center">
          <h1 className="text-2xl font-bold font-display text-text-primary mb-2">{title}</h1>
          {subtitle && <p className="text-text-secondary mb-6">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
