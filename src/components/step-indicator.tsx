"use client";

interface StepIndicatorProps {
  steps: { id: number; label: string }[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1">
          <div className="flex items-center gap-1.5 flex-1">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-colors ${
                currentStep > step.id
                  ? "bg-[var(--success)] text-white"
                  : currentStep === step.id
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--border-color)] text-[var(--muted)]"
              }`}
            >
              {currentStep > step.id ? (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.id
              )}
            </div>
            <span
              className={`text-[11px] font-medium ${
                currentStep >= step.id ? "text-[var(--foreground)]" : "text-[var(--muted)]"
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`h-0.5 w-4 mx-1 flex-shrink-0 transition-colors ${
                currentStep > step.id ? "bg-[var(--success)]" : "bg-[var(--border-color)]"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
