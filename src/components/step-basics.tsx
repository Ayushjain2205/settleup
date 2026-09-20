"use client";

import type { GroupFormData } from "@/app/groups/new/page";

interface StepBasicsProps {
  formData: GroupFormData;
  updateFormData: (partial: Partial<GroupFormData>) => void;
}

export function StepBasics({ formData, updateFormData }: StepBasicsProps) {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-2">Name your trip</h2>
        <p className="text-[var(--muted)] text-lg">Something everyone will recognize</p>
      </div>

      <input
        type="text"
        value={formData.name}
        onChange={(e) => updateFormData({ name: e.target.value })}
        placeholder="Malaysia Trip 2026"
        className="w-full px-0 py-4 bg-transparent border-0 border-b-2 border-[var(--border-color)] text-2xl text-[var(--foreground)] placeholder:text-[var(--muted)]/40 focus:outline-none focus:border-[var(--primary)] transition-colors"
        autoFocus
      />

      <div className="space-y-4">
        <label className="block text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">Trip type</label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => updateFormData({ tripType: "domestic" })}
            className={`relative p-6 rounded-2xl text-left transition-all duration-200 border-2 ${
              formData.tripType === "domestic"
                ? "border-[var(--primary)] bg-[var(--primary)]/[0.04] shadow-sm"
                : "border-[var(--border-color)] bg-white hover:border-[var(--primary)]/40"
            }`}
          >
            <span className="text-3xl block mb-3">🏠</span>
            <div className="font-bold text-[var(--foreground)] text-lg">Domestic</div>
            <div className="text-sm text-[var(--muted)] mt-1">Same currency everywhere</div>
            {formData.tripType === "domestic" && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[var(--primary)] flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={() => updateFormData({ tripType: "international" })}
            className={`relative p-6 rounded-2xl text-left transition-all duration-200 border-2 ${
              formData.tripType === "international"
                ? "border-[var(--primary)] bg-[var(--primary)]/[0.04] shadow-sm"
                : "border-[var(--border-color)] bg-white hover:border-[var(--primary)]/40"
            }`}
          >
            <span className="text-3xl block mb-3">✈️</span>
            <div className="font-bold text-[var(--foreground)] text-lg">International</div>
            <div className="text-sm text-[var(--muted)] mt-1">Multiple currencies</div>
            {formData.tripType === "international" && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[var(--primary)] flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
