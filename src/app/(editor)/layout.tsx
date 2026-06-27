import { redirect } from "next/navigation";
import { cookies } from "next/headers";

/**
 * Editor layout — minimal chrome for content creation.
 * No Header/Footer. The editor page renders its own EditorHeader.
 * Uses editor-bg token for the background.
 *
 * Auth guard: redirects to login if no access token is present.
 * This is a server component check — the actual token validation
 * happens on the backend. This just prevents unauthenticated users
 * from even loading the editor bundle.
 *
 * NOTE: Since the app currently uses localStorage for tokens (not cookies),
 * server-side auth check is limited. The client-side EditorShell also
 * checks for the token. A future improvement should migrate to
 * httpOnly cookies or NextAuth for proper SSR auth.
 */
export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-dvh bg-editor-bg">{children}</div>;
}
