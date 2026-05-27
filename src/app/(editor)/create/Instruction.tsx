import React, { useEffect, useState } from "react";
import { ChevronRight, ChevronLeft, BookOpen, Lightbulb, X, Sparkles } from "lucide-react";
import { useInstructionStore } from "@/store/useInstruction";
import Image from "next/image";

const TOTAL_PAGES = 4;

export default function Instruction() {
  const displayInstructions = useInstructionStore((state) => state.displayInstructions);
  const dismissForever = useInstructionStore((state) => state.dismissForever);

  const currentPage = useInstructionStore((state) => state.currentPage);
  const setCurrentPage = useInstructionStore((state) => state.setCurrentPage);

  // Hydration guard — avoid SSR/client mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted || !displayInstructions) return null;

  const handleContinue = () => {
    if (currentPage < TOTAL_PAGES) {
      setCurrentPage(currentPage + 1);
    } else {
      // Last page → dismiss permanently
      dismissForever();
    }
  };

  const handleBack = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleSkip = () => {
    dismissForever();
  };

  // ─── Dot Indicator ───
  const DotIndicator = () => (
    <div className="flex justify-center gap-2 py-4">
      {Array.from({ length: TOTAL_PAGES }, (_, i) => (
        <button
          key={i}
          onClick={() => setCurrentPage(i + 1)}
          className={`w-2 h-2 rounded-full transition-all duration-200 cursor-pointer ${
            currentPage === i + 1
              ? 'bg-[var(--color-editor-accent)] w-6'
              : 'bg-[var(--color-editor-border)] hover:bg-[var(--color-editor-muted)]'
          }`}
          aria-label={`Go to page ${i + 1}`}
        />
      ))}
    </div>
  );

  // ─── Navigation Footer ───
  const NavFooter = ({ isLast = false }: { isLast?: boolean }) => (
    <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--color-editor-border)]">
      <div className="flex items-center gap-2">
        {currentPage > 1 && (
          <button
            onClick={handleBack}
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-[var(--color-editor-secondary)] border border-[var(--color-editor-border)] rounded-lg hover:bg-[var(--color-editor-elevated)] transition-all duration-150 cursor-pointer"
          >
            <ChevronLeft size={14} />
            Back
          </button>
        )}
        <button
          onClick={handleSkip}
          className="px-4 py-2 text-sm font-medium text-[var(--color-editor-muted)] hover:text-[var(--color-editor-secondary)] transition-colors duration-150 cursor-pointer"
        >
          Skip tutorial
        </button>
      </div>
      <button
        onClick={handleContinue}
        className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-[var(--color-editor-accent)] rounded-lg hover:bg-[var(--color-editor-accent-hover)] shadow-md shadow-[var(--color-editor-accent)]/20 transition-all duration-150 cursor-pointer active:scale-[0.97]"
      >
        {isLast ? (
          <>
            <Sparkles size={14} />
            Start Writing
          </>
        ) : (
          <>
            Continue
            <ChevronRight size={14} />
          </>
        )}
      </button>
    </div>
  );

  // ─── Mascot ───
  const Mascot = ({ className = "" }: { className?: string }) => (
    <div className={`w-14 h-14 bg-blue-400 rounded-full relative flex-shrink-0 ${className}`}>
      <div className="absolute top-3.5 left-1.5">
        <div className="flex space-x-0.5">
          <div className="w-5 h-5 bg-white rounded-full border-2 border-gray-800 flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-gray-900 rounded-full" />
          </div>
          <div className="w-5 h-5 bg-white rounded-full border-2 border-gray-800 flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-gray-900 rounded-full" />
          </div>
        </div>
        <div className="w-1 h-0.5 bg-gray-800 absolute top-2.5 left-5" />
      </div>
      <div className="absolute -top-1.5 -right-1.5">
        <Lightbulb className="w-5 h-5 text-yellow-400 fill-yellow-200" />
      </div>
    </div>
  );

  // ─── Page Content ───
  const pages: Record<number, React.ReactNode> = {
    1: (
      <div className="space-y-6">
        {/* Hero */}
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-8 text-center">
          <div className="flex justify-center mb-4">
            <Mascot />
          </div>
          <h2 className="text-2xl font-bold text-[var(--color-editor-text)] mb-2">
            Welcome to OpenIdear ✨
          </h2>
          <p className="text-sm text-[var(--color-editor-secondary)] max-w-md mx-auto">
            A quick tour to help you get the most out of the editor.
            This only takes a minute!
          </p>
        </div>

        {/* Info card */}
        <div className="bg-[var(--color-editor-surface)] rounded-xl p-6 border border-[var(--color-editor-border)]">
          <h3 className="text-lg font-bold text-[var(--color-editor-text)] mb-3 flex items-center gap-2">
            <BookOpen size={20} className="text-[var(--color-editor-accent)]" />
            What is OpenIdear?
          </h3>
          <p className="text-sm text-[var(--color-editor-secondary)] leading-relaxed mb-3">
            OpenIdear is an open platform where everyone can share ideas, knowledge, services,
            and technology. We connect a creative community and support earning through affiliate links.
          </p>
          <div className="bg-[var(--color-editor-accent)]/5 border-l-3 border-[var(--color-editor-accent)] px-4 py-3 rounded-r-lg">
            <p className="text-sm font-medium text-[var(--color-editor-accent)]">
              Join the sharing community — Post your content today!
            </p>
          </div>
        </div>
      </div>
    ),
    2: (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <Mascot />
            <div>
              <h2 className="text-xl font-bold text-[var(--color-editor-text)] mb-1">
                Getting Started
              </h2>
              <p className="text-sm text-[var(--color-editor-secondary)]">
                Here's how the editor is organized
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--color-editor-surface)] rounded-xl overflow-hidden border border-[var(--color-editor-border)]">
          <div className="p-6">
            <div className="flex gap-6">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">1</div>
                  <h4 className="text-sm font-semibold text-[var(--color-editor-text)]">Post List (Left)</h4>
                </div>
                <p className="text-xs text-[var(--color-editor-secondary)] leading-relaxed">
                  Click the sidebar icon to browse your existing posts or create a new one.
                </p>
              </div>
              <div className="w-px bg-[var(--color-editor-border)]" />
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">2</div>
                  <h4 className="text-sm font-semibold text-[var(--color-editor-text)]">Block Insert (+)</h4>
                </div>
                <p className="text-xs text-[var(--color-editor-secondary)] leading-relaxed">
                  Use the + button below the editor to insert blocks like headings, images, code, and more.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-[var(--color-editor-elevated)] px-6 py-3">
            <p className="text-xs text-[var(--color-editor-muted)] text-center">
              💡 Tip: You can also drag and drop images directly into the editor!
            </p>
          </div>
        </div>
      </div>
    ),
    3: (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <Mascot />
            <div>
              <h2 className="text-xl font-bold text-[var(--color-editor-text)] mb-1">
                The Editor
              </h2>
              <p className="text-sm text-[var(--color-editor-secondary)]">
                Writing made simple and beautiful
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--color-editor-surface)] rounded-xl p-6 border border-[var(--color-editor-border)] space-y-4">
          {[
            { emoji: "✏️", title: "Rich Text Editing", desc: "Use the toolbar to format text — bold, italic, headings, lists, and more." },
            { emoji: "👁️", title: "Live Preview", desc: "Toggle Preview mode to see how your post will look when published." },
            { emoji: "💻", title: "HTML Mode", desc: "Switch to HTML mode for fine-grained control over your content." },
            { emoji: "💾", title: "Auto-Save", desc: "Your work is automatically saved every few seconds. No more lost drafts!" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-[var(--color-editor-elevated)] transition-colors">
              <span className="text-xl flex-shrink-0 mt-0.5">{item.emoji}</span>
              <div>
                <h4 className="text-sm font-semibold text-[var(--color-editor-text)]">{item.title}</h4>
                <p className="text-xs text-[var(--color-editor-secondary)] mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    4: (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <Mascot />
            <div>
              <h2 className="text-xl font-bold text-[var(--color-editor-text)] mb-1">
                Publishing Your Post
              </h2>
              <p className="text-sm text-[var(--color-editor-secondary)]">
                Share your ideas with the world
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--color-editor-surface)] rounded-xl p-6 border border-[var(--color-editor-border)] space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--color-editor-text)]">Save your draft first</h4>
              <p className="text-xs text-[var(--color-editor-secondary)] mt-0.5">Click "Save" in the header or let auto-save handle it.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--color-editor-text)]">Click "Publish"</h4>
              <p className="text-xs text-[var(--color-editor-secondary)] mt-0.5">A panel will slide open where you can add a description, cover image, and category.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--color-editor-text)]">Hit "Publish Now"</h4>
              <p className="text-xs text-[var(--color-editor-secondary)] mt-0.5">Your post goes live and can be shared with the community!</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[var(--color-editor-accent)]/5 to-[var(--color-editor-success)]/5 rounded-xl p-6 text-center border border-[var(--color-editor-border)]">
          <p className="text-2xl mb-2">🎉</p>
          <h3 className="text-lg font-bold text-[var(--color-editor-text)] mb-1">You're all set!</h3>
          <p className="text-sm text-[var(--color-editor-secondary)]">
            Click "Start Writing" to begin creating your first post.
          </p>
        </div>
      </div>
    ),
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gray-900/30 backdrop-blur-sm flex items-center justify-center p-4 animate-[fade-in_0.2s_ease-out]">
      <div className="w-full max-w-2xl bg-[var(--color-editor-bg)] rounded-2xl shadow-2xl border border-[var(--color-editor-border)] overflow-hidden animate-[slide-up_0.3s_ease-out] max-h-[90vh] flex flex-col">
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 rounded-lg text-[var(--color-editor-muted)] hover:text-[var(--color-editor-text)] hover:bg-[var(--color-editor-elevated)] transition-all duration-150 cursor-pointer z-10"
          aria-label="Close tutorial"
        >
          <X size={18} />
        </button>

        {/* Dot indicator */}
        <DotIndicator />

        {/* Page content — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 pb-2">
          {pages[currentPage]}
        </div>

        {/* Navigation footer */}
        <NavFooter isLast={currentPage === TOTAL_PAGES} />
      </div>
    </div>
  );
}
