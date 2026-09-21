"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
  const [createdGroupId, setCreatedGroupId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: group, error: groupError } = await supabase
        .from("groups")
        .insert({
          name: formData.name.trim(),
          type: formData.tripType,
          base_currency: formData.baseCurrency,
          spend_currency: formData.spendCurrency,
          fx_mode: formData.fxMode,
          fixed_fx_rate: formData.fixedFxRate,
          simplify_debts: formData.simplifyDebts,
          created_by: user.id,
        })
        .select("id")
        .single();
      if (groupError) throw groupError;

      const displayName =
        (user.user_metadata?.display_name as string) ||
        user.email?.split("@")[0] ||
        "You";

      const { error: memberError } = await supabase.from("group_members").insert({
        group_id: group.id,
        user_id: user.id,
        name: displayName,
        avatar: displayName[0]?.toUpperCase() || "Y",
      });
      if (memberError) throw memberError;

      setCreatedGroupId(group.id);
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create group");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[var(--background)] px-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--success)] flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-1">Group created</h2>
          <p className="text-sm text-[var(--muted)] mb-6">&quot;{formData.name}&quot; is ready</p>
          <button
            onClick={() => router.push(createdGroupId ? `/trip/${createdGroupId}` : "/")}
            className="w-full max-w-xs py-3 bg-[var(--primary)] text-white rounded-xl text-sm font-semibold active:opacity-80 transition-opacity"
          >
            Go to trip
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[var(--border-color)]">
        <div className="flex items-center h-14 px-4">
          <button onClick={() => router.push("/")} className="p-1 -ml-1 mr-3">
            <svg className="w-5 h-5 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-lg font-bold text-[var(--foreground)] tracking-tight">New Group</span>
        </div>
        <div className="px-4 pb-3">
          <StepIndicator steps={STEPS} currentStep={currentStep} />
        </div>
      </header>

      {/* Content */}
      <main className="px-4 pt-6 pb-24">
        <div key={currentStep}>
          {currentStep === 1 && <StepBasics formData={formData} updateFormData={updateFormData} />}
          {currentStep === 2 && <StepCurrency formData={formData} updateFormData={updateFormData} />}
          {currentStep === 3 && <StepDebts formData={formData} updateFormData={updateFormData} />}
        </div>
      </main>

      {/* Bottom actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--border-color)] px-4 py-3" style={{ paddingBottom: "calc(12px + var(--safe-bottom))" }}>
        {error && (
          <p className="text-xs font-medium text-[var(--error)] bg-[var(--error)]/5 border border-[var(--error)]/20 rounded-xl px-4 py-2.5 mb-3">{error}</p>
        )}
        <div className="flex gap-3">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="px-4 py-3 text-sm font-medium text-[var(--muted)] rounded-xl border border-[var(--border-color)] active:opacity-80 transition-opacity"
            >
              Back
            </button>
          )}
          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-xl text-sm font-semibold active:opacity-80 transition-opacity disabled:opacity-30"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-3 bg-[var(--primary)] text-white rounded-xl text-sm font-semibold active:opacity-80 transition-opacity disabled:opacity-70"
            >
              {isSubmitting ? "Creating..." : "Create Group"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
