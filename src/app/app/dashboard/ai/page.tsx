import type { Metadata } from "next";
import { AICreatorDashboard } from "@/features/ai/components/dashboard";

export const metadata: Metadata = {
  title: "AI Creator Dashboard",
  description: "Monitor your personal AI usage, token consumption, and model benchmarks in OpenIdear.",
};

export default function AIDashboardPage() {
  return <AICreatorDashboard />;
}
