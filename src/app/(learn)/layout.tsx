/**
 * Learn layout — immersive, full-screen layout for course video player.
 * No global Header/Footer so the video player can take full viewport height.
 */
export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
