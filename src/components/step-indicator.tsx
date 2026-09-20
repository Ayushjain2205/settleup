"use client";

interface StepIndicatorProps {
  steps: { id: number; label: string }[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                currentStep > step.id
                  ? "bg-[var(--success)] text-white"
                  : currentStep === step.id
                  ? "bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/25"
                  : "bg-[var(--border-color)] text-[var(--muted)]"
              }`}
            >
              {currentStep > step.id ? (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.id
              )}
            </div>
            <span
              className={`text-xs font-semibold transition-colors hidden sm:inline ${
                currentStep >= step.id ? "text-[var(--foreground)]" : "text-[var(--muted)]"
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-8 h-0.5 mx-2 transition-colors ${
                currentStep > step.id ? "bg-[var(--success)]" : "bg-[var(--border-color)]"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
