"use client";

import { useState, type FormEvent } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function LoginForm({ missingConfig }: { missingConfig: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleEmailSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setStatus("Supabase is not configured yet.");
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/app`
      }
    });

    setIsSubmitting(false);
    setStatus(error ? error.message : "Check your email for a sign-in link.");
  }

  async function handleGoogleSignIn() {
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setStatus("Supabase is not configured yet.");
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/app`
      }
    });

    if (error) {
      setIsSubmitting(false);
      setStatus(error.message);
    }
  }

  return (
    <div className="auth-card">
      <div>
        <p className="app-eyebrow">Sign in</p>
        <h1>Launch 1337</h1>
        <p>
          Use Google or email to access the Phase 1 workspace. Wallet support
          is intentionally reserved for Phase 2.
        </p>
      </div>

      {missingConfig ? (
        <div className="auth-warning">
          Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to
          enable authentication.
        </div>
      ) : null}

      <button
        className="auth-oauth"
        type="button"
        disabled={isSubmitting || missingConfig}
        onClick={handleGoogleSignIn}
      >
        Continue with Google
      </button>

      <div className="auth-divider">
        <span />
        <p>or</p>
        <span />
      </div>

      <form className="auth-form" onSubmit={handleEmailSignIn}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          required
          disabled={isSubmitting || missingConfig}
          onChange={(event) => setEmail(event.target.value)}
        />
        <button type="submit" disabled={isSubmitting || missingConfig}>
          Send sign-in link
        </button>
      </form>

      {status ? <p className="auth-status">{status}</p> : null}
    </div>
  );
}
