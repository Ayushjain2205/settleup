"use client";

interface StepIndicatorProps {
  steps: { id: number; label: string }[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                currentStep > step.id
                  ? "bg-[var(--success)] text-white"
                  : currentStep === step.id
                  ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/30"
                  : "bg-[var(--border)] text-[var(--muted)]"
              }`}
            >
              {currentStep > step.id ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.id
              )}
            </div>
            <span
              className={`text-sm font-medium transition-colors duration-200 ${
                currentStep >= step.id ? "text-[var(--foreground)]" : "text-[var(--muted)]"
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-12 h-0.5 mx-3 transition-colors duration-300 ${
                currentStep > step.id ? "bg-[var(--success)]" : "bg-[var(--border)]"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
