"use client";

// =============================================================================
//  AI CONTENT STUDIO — MANAGEMENT ROUTE PAGE
//  src/app/(dashboard)/management/content-studio/page.tsx
//
//  Design Decisions:
//  - Conforms strictly to OpenIdear admin panel design system and layout.
//  - Desktop first, tablet, and mobile responsive.
//  - Fully manages empty, generating, success, error, and regeneration states.
// =============================================================================

import React, { useState } from "react";
import Link from "next/link";
import {
  Menu,
  FileText,
  Folder,
  AlertTriangle,
  Settings,
  Bell,
  User,
  ChevronDown,
  Users,
  BookText,
  BookOpen,
  PanelLeftClose,
  PanelLeft,
  Lightbulb,
  Mail,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import Logo from "@/components/common/Logo";
import {
  useContentStudio,
  ContentStudioHeader,
  ContentStudioInputCard,
  ContentStudioIdeasGrid,
  ContentStudioGridSkeleton,
  ContentStudioEmptyState,
  ContentStudioErrorState,
  ContentBriefEditor,
  ContentOutlineEditor,
  ArticleWritingProgress,
  ContentIntelligenceSection,
} from "@/features/content-studio";

export default function ContentStudioPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const {
    step,
    topic,
    setTopic,
    contentGoal,
    setContentGoal,
    numberOfIdeas,
    setNumberOfIdeas,
    ideas,
    selectedIdeaIds,
    selectedIdeas,
    isIdeaSelected,
    toggleSelectIdea,
    selectAll,
    deselectAll,
    isGenerating,
    isError,
    errorMessage,
    hasGenerated,
    intelligence,
    generateIdeas,
    regenerateIdeas,
    currentIdea,
    currentBrief,
    activeIdeaIndex,
    setActiveIdeaIndex,
    isGeneratingBrief,
    availableCategories,
    updateCurrentBriefField,
    regenerateBriefSuggestions,
    proceedToBrief,
    backToIdeas,
    proceedToOutline,
    currentOutline,
    isGeneratingOutline,
    regenerateOutline,
    updateOutlineTitle,
    updateOutlineIntroduction,
    updateOutlineConclusion,
    updateSectionHeading,
    updateSectionPurpose,
    reorderSections,
    addSection,
    deleteSection,
    addKeyPoint,
    updateKeyPoint,
    deleteKeyPoint,
    addFaqItem,
    updateFaqItem,
    deleteFaqItem,
    backToBrief,
    writingStages,
    streamChunkText,
    generateArticle,
  } = useContentStudio();

  // Management Sidebar items conforming to OpenIdear dashboard navigation
  const menuItems = [
    { id: "categories", label: "Danh mục", icon: Folder, href: "/management" },
    { id: "topics", label: "Chủ đề", icon: Lightbulb, href: "/management" },
    { id: "posts", label: "Ý tưởng/Bài viết", icon: FileText, href: "/management" },
    {
      id: "content-studio",
      label: "AI Content Studio",
      icon: Sparkles,
      href: "/management/content-studio",
      isCurrent: true,
      badge: "AI",
    },
    { id: "users", label: "Người dùng", icon: Users, href: "/management" },
    { id: "series", label: "Series", icon: BookText, href: "/management" },
    { id: "courses", label: "Khóa học", icon: BookOpen, href: "/management/my-courses" },
    { id: "course-categories", label: "Danh mục khoá học", icon: Folder, href: "/management" },
    { id: "reports", label: "Báo cáo vi phạm", icon: AlertTriangle, href: "/management" },
    { id: "support", label: "Hộp thư hỗ trợ", icon: Mail, href: "/management" },
    { id: "contributions", label: "Đóng góp ý kiến", icon: MessageSquare, href: "/management" },
    { id: "settings", label: "Cài đặt", icon: Settings, href: "/management" },
  ];

  return (
    <div className="flex h-screen bg-muted/30 text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`
          ${sidebarOpen ? "w-64" : "w-[72px]"} 
          bg-card border-r border-border 
          transition-all duration-300 ease-in-out
          flex flex-col flex-shrink-0
          max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-40
          ${!sidebarOpen ? "max-md:-translate-x-full" : ""}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-4 border-b border-border flex-shrink-0">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <Logo size={20} className="text-white" />
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <h1 className="font-bold text-base text-foreground truncate">
                OpenIdear
              </h1>
              <p className="text-[11px] text-muted-foreground font-medium">
                Admin Panel
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-3 overflow-y-auto">
          <div className="space-y-0.5">
            {menuItems.map((item) => {
              const isActive = item.isCurrent;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left
                    transition-all duration-150 text-[13.5px] font-medium
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-ring
                    ${
                      isActive
                        ? "bg-primary/10 text-primary border-l-[3px] border-primary pl-[9px]"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground border-l-[3px] border-transparent pl-[9px]"
                    }
                  `}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <item.icon
                      size={18}
                      className={
                        isActive ? "text-primary" : "text-muted-foreground"
                      }
                    />
                    {sidebarOpen && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </div>
                  {sidebarOpen && item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/20 text-primary uppercase">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-border p-3 flex-shrink-0">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-[13.5px] font-medium cursor-pointer"
            title={sidebarOpen ? "Thu gọn sidebar" : "Mở rộng sidebar"}
          >
            {sidebarOpen ? (
              <PanelLeftClose size={18} />
            ) : (
              <PanelLeft size={18} />
            )}
            {sidebarOpen && <span>Thu gọn</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/30 backdrop-blur-xs z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-card border-b border-border px-4 lg:px-8 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors md:hidden"
              aria-label="Toggle sidebar"
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-foreground leading-tight flex items-center gap-2">
                <span>AI Content Studio</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Strategy Agent
                </span>
              </h2>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Lên ý tưởng, phân tích cụm nội dung và hoạch định chiến lược dài hạn bằng AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button
              type="button"
              className="relative p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-card" />
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-2 ml-1 pl-3 border-l border-border">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <User size={16} className="text-primary" />
              </div>
              <div className="hidden sm:flex items-center gap-1 text-sm font-medium text-foreground">
                <span>Admin</span>
                <ChevronDown size={14} className="text-muted-foreground" />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Body */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto space-y-7">
          <div className="max-w-6xl mx-auto space-y-7">
            {/* Page Header */}
            <ContentStudioHeader step={step} />

            {/* User Governance Banner: Explicit Human-in-the-Loop Control */}
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-border/70 bg-card/60 text-xs text-muted-foreground shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  <strong>Content Governance:</strong> AI Strategist recommends clusters & drafts outlines. You retain complete approval & publishing control in OpenIdear Editor.
                </span>
              </div>
              <span className="text-[11px] font-semibold text-foreground/80 hidden sm:inline px-2 py-0.5 rounded bg-muted/60 border border-border/40">
                Autonomous Publishing: Disabled
              </span>
            </div>

            {/* Step 1: Idea Generation & Selection */}
            {step === "ideas" && (
              <>
                {/* Input Card */}
                <ContentStudioInputCard
                  topic={topic}
                  setTopic={setTopic}
                  contentGoal={contentGoal}
                  setContentGoal={setContentGoal}
                  numberOfIdeas={numberOfIdeas}
                  setNumberOfIdeas={setNumberOfIdeas}
                  isGenerating={isGenerating}
                  onGenerate={() => generateIdeas()}
                />

                {/* State Dispatcher: Generating vs Error vs Success vs Empty */}
                {isGenerating && (
                  <ContentStudioGridSkeleton count={numberOfIdeas} />
                )}

                {!isGenerating && isError && (
                  <ContentStudioErrorState
                    errorMessage={errorMessage}
                    onRetry={() => generateIdeas()}
                  />
                )}

                {!isGenerating && !isError && hasGenerated && ideas.length > 0 && (
                  <div className="space-y-6">
                    {intelligence && (
                      <ContentIntelligenceSection
                        intelligence={intelligence}
                        topic={topic}
                        onSelectGap={(gap) => {
                          setTopic(gap);
                          generateIdeas(gap);
                        }}
                      />
                    )}

                    <ContentStudioIdeasGrid
                      ideas={ideas}
                      selectedIdeaIds={selectedIdeaIds}
                      isIdeaSelected={isIdeaSelected}
                      onToggleIdea={toggleSelectIdea}
                      onSelectAll={selectAll}
                      onDeselectAll={deselectAll}
                      onRegenerate={regenerateIdeas}
                      isGenerating={isGenerating}
                      onContinue={proceedToBrief}
                    />
                  </div>
                )}

                {!isGenerating && !isError && !hasGenerated && (
                  <ContentStudioEmptyState />
                )}
              </>
            )}

            {/* Step 2: Content Brief Editor */}
            {step === "brief" && currentIdea && (
              <ContentBriefEditor
                idea={currentIdea}
                brief={currentBrief}
                isLoadingBrief={isGeneratingBrief}
                onUpdateField={updateCurrentBriefField}
                onRegenerateSuggestions={regenerateBriefSuggestions}
                onBack={backToIdeas}
                onProceedToOutline={proceedToOutline}
                selectedIdeas={selectedIdeas}
                activeIdeaIndex={activeIdeaIndex}
                onSelectIdeaIndex={setActiveIdeaIndex}
                availableCategories={availableCategories}
              />
            )}

            {/* Step 3: Content Outline Editor */}
            {step === "outline" && currentIdea && currentBrief && currentOutline && (
              <ContentOutlineEditor
                selectedIdeas={selectedIdeas}
                activeIdeaIndex={activeIdeaIndex}
                onSelectIdeaIndex={setActiveIdeaIndex}
                outline={currentOutline}
                brief={currentBrief}
                isGeneratingOutline={isGeneratingOutline}
                onRegenerateOutline={regenerateOutline}
                onUpdateTitle={updateOutlineTitle}
                onUpdateIntroduction={updateOutlineIntroduction}
                onUpdateConclusion={updateOutlineConclusion}
                onUpdateSectionHeading={updateSectionHeading}
                onUpdateSectionPurpose={updateSectionPurpose}
                onReorderSections={reorderSections}
                onAddSection={addSection}
                onDeleteSection={deleteSection}
                onAddKeyPoint={addKeyPoint}
                onUpdateKeyPoint={updateKeyPoint}
                onDeleteKeyPoint={deleteKeyPoint}
                onAddFaqItem={addFaqItem}
                onUpdateFaqItem={updateFaqItem}
                onDeleteFaqItem={deleteFaqItem}
                onBack={backToBrief}
                onGenerateArticle={generateArticle}
              />
            )}

            {/* Step 4: Article Writing Progress */}
            {step === "writing" && currentIdea && (
              <ArticleWritingProgress
                idea={currentIdea}
                stages={writingStages}
                streamChunkText={streamChunkText}
                onCancel={backToBrief}
                onRetry={generateArticle}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
