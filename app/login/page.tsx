import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getAuthState } from "@/lib/auth/session";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ auth_error?: string; missing_config?: string }>;
}) {
  const auth = await getAuthState();

  if (auth.configured && auth.user) {
    redirect("/app");
  }

  const params = await searchParams;

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <Link className="auth-brand" href="/">
          1337
        </Link>
        <LoginForm
          authError={params.auth_error}
          missingConfig={!auth.configured || params.missing_config === "1"}
        />
      </div>
    </main>
  );
}
