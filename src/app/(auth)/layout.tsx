/**
 * Auth layout — centered card layout for authentication pages.
 * No Header/Footer. Clean, focused layout for login/register flows.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/30 px-4">
      {children}
    </div>
  );
}
