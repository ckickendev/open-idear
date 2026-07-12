// =============================================================================
//  AI PUBLISHING FEATURE — REUSABLE PUBLISH WIZARD COORDINATOR
//  src/features/publish/components/PublishWizard.tsx
//
//  Design Decisions:
//  - Fully encapsulated React stepper coordinator managing 6 publication steps.
//  - Steps: Content Check, SEO Check, Media Check, Metadata Check, Preview, Publish.
//  - Responsive design with stepper header indicators, action footers, and view wrappers.
//  - Follows standard a11y focus outlines and keyboard navigation tags.
// =============================================================================

import React, { useState } from "react";
import { Check, ArrowRight, ArrowLeft, X, Loader2, Award, ShieldCheck, Heart } from "lucide-react";

export type WizardStepType = 
  | "content" 
  | "seo" 
  | "media" 
  | "metadata" 
  | "preview" 
  | "publish";

interface StepConfig {
  id: WizardStepType;
  label: string;
  description: string;
}

const WIZARD_STEPS: readonly StepConfig[] = [
  { id: "content", label: "Content Check", description: "Audit readability & structure." },
  { id: "seo", label: "SEO Check", description: "Optimize search metadata cards." },
  { id: "media", label: "Media Check", description: "Select & compress featured banner." },
  { id: "metadata", label: "Metadata Check", description: "Set categories & schedule timings." },
  { id: "preview", label: "Device Preview", description: "Inspect mobile/desktop viewports." },
  { id: "publish", label: "Launch Post", description: "Confirm & slide to publish." },
];

interface PublishWizardProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly renderStepContent: (step: WizardStepType) => React.ReactNode;
  readonly isStepValid?: (step: WizardStepType) => boolean;
  readonly onFinish?: () => Promise<void> | void;
}

export default function PublishWizard({
  isOpen,
  onClose,
  renderStepContent,
  isStepValid = () => true,
  onFinish,
}: PublishWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = WIZARD_STEPS[currentStepIndex];

  if (!isOpen || !currentStep) return null;

  const handleNext = () => {
    if (currentStepIndex < WIZARD_STEPS.length - 1) {
      if (!isStepValid(currentStep.id)) {
        return; // block proceeding if step constraints fail
      }
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  return (
    <div className="publish-wizard-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
      <div className="relative w-full max-w-5xl bg-[var(--color-editor-surface)] border border-[var(--color-editor-border)] rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[90vh] text-xs text-[var(--color-editor-text)] animate-[scale-in_0.18s_ease-out]">
        
        {/* ─── Wizard Header stepper ────────────────────────────────────────── */}
        <header className="px-6 py-4 border-b border-[var(--color-editor-border)] flex-shrink-0 flex items-center justify-between gap-4 select-none">
          <div className="text-left space-y-0.5">
            <span className="bg-indigo-500/10 text-indigo-400 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider text-[8px]">
              Publish Wizard Dashboard
            </span>
            <h2 className="text-base font-extrabold text-[var(--color-editor-text)]">
              {currentStep.label}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--color-editor-elevated)] text-[var(--color-editor-secondary)] transition-colors cursor-pointer"
            title="Cancel Publication Wizard"
          >
            <X size={16} />
          </button>
        </header>

        {/* Stepper progress indicator bar */}
        <div className="bg-[var(--color-editor-elevated)] px-6 py-3 border-b border-[var(--color-editor-border)] overflow-x-auto flex-shrink-0 select-none">
          <div className="flex items-center gap-2.5 min-w-max">
            {WIZARD_STEPS.map((step, idx) => {
              const isActive = idx === currentStepIndex;
              const isCompleted = idx < currentStepIndex;
              
              return (
                <React.Fragment key={step.id}>
                  {/* Step node */}
                  <div
                    onClick={() => idx < currentStepIndex && setCurrentStepIndex(idx)}
                    className={`flex items-center gap-2 p-1.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "text-[var(--color-editor-accent)] font-bold scale-102"
                        : isCompleted
                        ? "text-emerald-500 cursor-pointer hover:bg-emerald-500/5 font-semibold"
                        : "text-[var(--color-editor-muted)] opacity-60"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                        isActive
                          ? "bg-[var(--color-editor-accent)] text-white"
                          : isCompleted
                          ? "bg-emerald-500 text-white"
                          : "bg-[var(--color-editor-border)] text-[var(--color-editor-secondary)]"
                      }`}
                    >
                      {isCompleted ? <Check size={10} /> : idx + 1}
                    </div>
                    <div className="text-left leading-none space-y-0.5">
                      <span className="block text-[10px]">{step.label}</span>
                    </div>
                  </div>

                  {/* Divider arrow */}
                  {idx < WIZARD_STEPS.length - 1 && (
                    <div className="w-4 h-px bg-[var(--color-editor-border)]" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* ─── Stepper Content canvas ──────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[var(--color-editor-bg)]">
          <div className="max-w-4xl mx-auto h-full">
            {renderStepContent(currentStep.id)}
          </div>
        </main>

        {/* ─── Stepper Actions footer ──────────────────────────────────────── */}
        <footer className="px-6 py-4 bg-[var(--color-editor-elevated)] border-t border-[var(--color-editor-border)] flex-shrink-0 flex items-center justify-between select-none">
          {/* Back button */}
          <button
            type="button"
            disabled={currentStepIndex === 0}
            onClick={handleBack}
            className={`px-4 py-2 border border-[var(--color-editor-border)] hover:bg-[var(--color-editor-border)] text-[var(--color-editor-secondary)] rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentStepIndex === 0 ? "opacity-30 cursor-not-allowed" : "active:scale-97"
            }`}
          >
            <ArrowLeft size={13} />
            <span>Back</span>
          </button>

          {/* Stepper info text */}
          <span className="text-[10px] text-[var(--color-editor-muted)] font-medium hidden sm:inline">
            Step {currentStepIndex + 1} of {WIZARD_STEPS.length} — {currentStep.description}
          </span>

          {/* Next / Finish button */}
          {currentStepIndex < WIZARD_STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!isStepValid(currentStep.id)}
              className={`px-4 py-2 bg-[var(--color-editor-accent)] hover:opacity-95 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                !isStepValid(currentStep.id)
                  ? "bg-zinc-700/50 text-zinc-500 border border-zinc-700 cursor-not-allowed shadow-none"
                  : "active:scale-97 shadow-md"
              }`}
            >
              <span>Next Step</span>
              <ArrowRight size={13} />
            </button>
          ) : (
            <span className="text-[10px] text-indigo-400 font-bold flex items-center gap-1 select-none animate-pulse">
              <ShieldCheck size={12} className="animate-spin" />
              <span>Use Slide to Publish in review sheet to deploy.</span>
            </span>
          )}
        </footer>
      </div>
    </div>
  );
}
