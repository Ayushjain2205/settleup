"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StepIndicator } from "@/components/step-indicator";
import { StepBasics } from "@/components/step-basics";
import { StepCurrency } from "@/components/step-currency";
import { StepDebts } from "@/components/step-debts";

export interface GroupFormData {
  name: string;
  tripType: "domestic" | "international";
  baseCurrency: string;
  spendCurrency: string;
  fxMode: "fixed" | "live";
  fixedFxRate: number;
  simplifyDebts: boolean;
}

const STEPS = [
  { id: 1, label: "Basics" },
  { id: 2, label: "Currency" },
  { id: 3, label: "Settle" },
];

export default function GroupWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<GroupFormData>({
    name: "",
    tripType: "international",
    baseCurrency: "INR",
    spendCurrency: "MYR",
    fxMode: "fixed",
    fixedFxRate: 19.2,
    simplifyDebts: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const updateFormData = (partial: Partial<GroupFormData>) => {
    setFormData((prev) => ({ ...prev, ...partial }));
  };

  const canProceed = () => {
    if (currentStep === 1) return formData.name.trim().length >= 2;
    if (currentStep === 2) return formData.baseCurrency && formData.spendCurrency;
    return true;
  };

  const handleNext = () => {
    if (currentStep < 3 && canProceed()) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-6 animate-fade-in">
          <div className="w-20 h-20 bg-[var(--success)] rounded-full flex items-center justify-center mx-auto animate-scale-in">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[var(--foreground)]">Group Created!</h2>
            <p className="text-[var(--muted)] mt-2 text-lg">&quot;{formData.name}&quot; is ready for expenses</p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="px-8 py-3 bg-[var(--primary)] text-white rounded-xl font-semibold hover:bg-[var(--primary-dark)] transition-all duration-200 shadow-lg hover:shadow-xl btn-press"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-6 border-b border-[var(--border)]">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--primary)] rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="font-bold text-xl text-[var(--foreground)]">SettleUp</span>
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center p-6 pt-12">
        <div className="w-full max-w-2xl">
          <StepIndicator steps={STEPS} currentStep={currentStep} />

          <div className="mt-8 bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--border)] p-8">
            <div key={currentStep} className="animate-fade-in">
              {currentStep === 1 && (
                <StepBasics formData={formData} updateFormData={updateFormData} />
              )}
              {currentStep === 2 && (
                <StepCurrency formData={formData} updateFormData={updateFormData} />
              )}
              {currentStep === 3 && (
                <StepDebts formData={formData} updateFormData={updateFormData} />
              )}
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-6 py-3 text-[var(--muted)] font-medium rounded-xl hover:bg-[var(--surface)] transition-colors disabled:opacity-0 disabled:pointer-events-none"
            >
              Back
            </button>

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="px-8 py-3 bg-[var(--primary)] text-white rounded-xl font-semibold hover:bg-[var(--primary-dark)] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-[var(--accent)] text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-70"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating...
                  </span>
                ) : (
                  "Create Group"
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
