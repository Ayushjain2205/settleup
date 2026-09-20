"use client";

import type { GroupFormData } from "@/app/groups/new/page";

interface StepBasicsProps {
  formData: GroupFormData;
  updateFormData: (partial: Partial<GroupFormData>) => void;
}

export function StepBasics({ formData, updateFormData }: StepBasicsProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[var(--foreground)]">Name your trip</h2>
        <p className="text-[var(--muted)] mt-1">Give your group a name everyone will recognize</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="group-name" className="block text-sm font-medium text-[var(--foreground)]">
          Group Name
        </label>
        <input
          id="group-name"
          type="text"
          value={formData.name}
          onChange={(e) => updateFormData({ name: e.target.value })}
          placeholder="Malaysia Trip 2026"
          className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
          autoFocus
        />
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-[var(--foreground)]">
          Trip Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => updateFormData({ tripType: "domestic" })}
            className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
              formData.tripType === "domestic"
                ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-sm"
                : "border-[var(--border)] hover:border-[var(--primary)]/50"
            }`}
          >
            <span className="text-2xl">🏠</span>
            <div className="mt-2 font-semibold text-[var(--foreground)]">Domestic</div>
            <div className="text-xs text-[var(--muted)]">Same currency</div>
          </button>

          <button
            type="button"
            onClick={() => updateFormData({ tripType: "international" })}
            className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
              formData.tripType === "international"
                ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-sm"
                : "border-[var(--border)] hover:border-[var(--primary)]/50"
            }`}
          >
            <span className="text-2xl">✈️</span>
            <div className="mt-2 font-semibold text-[var(--foreground)]">International</div>
            <div className="text-xs text-[var(--muted)]">Multiple currencies</div>
          </button>
        </div>
      </div>
    </div>
  );
}
