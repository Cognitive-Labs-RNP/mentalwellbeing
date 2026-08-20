import { Outlet } from 'react-router-dom';
import { BackgroundBlobs } from './BackgroundBlobs';
import { Heart } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="relative min-h-screen bg-bg-primary flex items-center justify-center overflow-hidden">
      <BackgroundBlobs />
      <div className="absolute inset-0 bg-gradient-to-br from-accent-lavender/5 via-transparent to-accent-cyan/5" />

      <div className="relative z-10 w-full max-w-md px-6 py-12 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-accent-lavender/20 to-accent-cyan/20 border border-surface-border mb-4 shadow-glow">
            <Heart className="h-8 w-8 text-accent-lavender" />
          </div>
          <h1 className="font-display font-bold text-3xl text-text-primary mb-2">
            Wellbeing Hub
          </h1>
          <p className="text-text-secondary">
            Your private mental wellbeing companion
          </p>
        </div>

        <div className="glass rounded-2xl p-6 md:p-8 shadow-glow animate-slide-up">
          <Outlet />
        </div>

        <p className="mt-6 text-center text-xs text-text-muted">
          All data is encrypted and stored locally on your device.
          <br />
          Your privacy and safety come first.
        </p>
      </div>
    </div>
  );
}
