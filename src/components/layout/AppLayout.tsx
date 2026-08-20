import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { UrgentHelpButton } from './UrgentHelpButton';
import { BackgroundBlobs } from './BackgroundBlobs';
import { AlertTriangle, X } from 'lucide-react';

function SafetyAlert() {
  const [isVisible, setIsVisible] = useState(false);

  if (!isVisible) return null;

  return (
    <div
      role="alert"
      className="relative z-40 mx-4 mt-4 md:mx-8 md:mt-6 max-w-2xl glass rounded-2xl border border-accent-amber/40 p-4 shadow-glow animate-slide-up"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-accent-amber/15 flex items-center justify-center">
          <AlertTriangle className="h-5 w-5 text-accent-amber" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-text-primary">Safety check-in</h3>
          <p className="text-sm text-text-secondary mt-1">
            We noticed some concerning patterns. Would you like to talk to someone or try a grounding exercise?
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              type="button"
              className="min-h-[40px] px-4 py-2 rounded-xl bg-accent-lavender/20 text-accent-lavender text-sm font-medium hover:bg-accent-lavender/30 transition-colors"
            >
              Breathing exercise
            </button>
            <button
              type="button"
              className="min-h-[40px] px-4 py-2 rounded-xl bg-surface-hover text-text-primary text-sm font-medium hover:bg-surface border border-surface-border transition-colors"
            >
              Crisis resources
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          aria-label="Dismiss safety alert"
          className="flex-shrink-0 min-h-[40px] min-w-[40px] rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors inline-flex items-center justify-center"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export function AppLayout() {
  return (
    <div className="relative min-h-screen bg-bg-primary overflow-x-hidden">
      <BackgroundBlobs />

      <Navbar />

      <div className="relative z-10">
        <SafetyAlert />

        <main
          id="main-content"
          className="pb-8 pt-6 md:pt-8 px-4 md:px-8 max-w-7xl mx-auto w-full overflow-x-hidden"
        >
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      <UrgentHelpButton variant="floating" />
    </div>
  );
}
