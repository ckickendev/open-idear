/**
 * Dashboard layout — admin panel with sidebar navigation.
 * No public Header/Footer. The sidebar and dashboard header
 * are rendered by the management page itself (preserving existing pattern).
 *
 * This layout provides the isolated rendering context so
 * the root layout's marketing Header/Footer don't appear.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
