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
    if (currentStep < 3 && canProceed()) setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center space-y-8 animate-scale-in">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--success)] to-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-[var(--success)]/20">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-3">Group created</h2>
            <p className="text-lg text-[var(--muted)]">&quot;{formData.name}&quot; is ready for expenses</p>
          </div>
          <button
            onClick={() => router.push("/trip/malaysia-2026")}
            className="px-8 py-4 bg-[var(--primary)] text-white rounded-2xl font-semibold text-lg hover:opacity-90 transition-all btn-press shadow-lg shadow-[var(--primary)]/25"
          >
            Go to trip
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] relative overflow-hidden">
      <div className="fixed top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--primary)]/[0.05] blur-[100px] pointer-events-none" />

      <header className="relative z-10 px-6 md:px-12 py-6">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="w-10 h-10 rounded-xl bg-white border border-[var(--border-color)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]/20 transition-all shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="font-bold text-lg text-[var(--foreground)]">New Group</span>
        </div>
      </header>

      <main className="relative z-10 flex items-start justify-center px-6 pt-8 pb-24">
        <div className="w-full max-w-3xl">
          <StepIndicator steps={STEPS} currentStep={currentStep} />

          <div className="mt-12 animate-fade-up" key={currentStep}>
            {currentStep === 1 && <StepBasics formData={formData} updateFormData={updateFormData} />}
            {currentStep === 2 && <StepCurrency formData={formData} updateFormData={updateFormData} />}
            {currentStep === 3 && <StepDebts formData={formData} updateFormData={updateFormData} />}
          </div>

          <div className="flex justify-between mt-12">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-6 py-3 text-[var(--muted)] font-medium rounded-xl hover:text-[var(--foreground)] transition-colors disabled:opacity-0 disabled:pointer-events-none"
            >
              Back
            </button>

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="px-8 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-xl font-semibold hover:opacity-90 transition-all btn-press disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-xl font-semibold hover:opacity-90 transition-all btn-press disabled:opacity-70 shadow-lg shadow-[var(--primary)]/25"
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
