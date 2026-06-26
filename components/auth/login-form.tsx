"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

type LoginFormProps = {
  missingConfig: boolean;
  authError?: string;
};

export function LoginForm({ missingConfig, authError }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDisabled = isSubmitting || missingConfig;

  async function handleRequestCode(event: FormEvent<HTMLFormElement>) {
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
        shouldCreateUser: true
      }
    });

    setIsSubmitting(false);

    if (error) {
      setStatus(error.message);
      return;
    }

    setCode("");
    setCodeSent(true);
    setStatus("Enter the 6-digit code sent to your email.");
  }

  async function handleVerifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setStatus("Supabase is not configured yet.");
      return;
    }

    const token = code.replace(/\D/g, "");

    if (token.length !== 6) {
      setStatus("Enter the 6-digit code from your email.");
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email"
    });

    setIsSubmitting(false);

    if (error) {
      setStatus(error.message);
      return;
    }

    setStatus("Signed in. Redirecting...");
    router.replace("/app");
    router.refresh();
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
        disabled={isDisabled}
        onClick={handleGoogleSignIn}
      >
        Continue with Google
      </button>

      <div className="auth-divider">
        <span />
        <p>or</p>
        <span />
      </div>

      {authError ? <p className="auth-status">{authError}</p> : null}

      <form className="auth-form" onSubmit={handleRequestCode}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          required
          disabled={isDisabled || codeSent}
          onChange={(event) => {
            setEmail(event.target.value);
            setCodeSent(false);
            setCode("");
          }}
        />
        <button type="submit" disabled={isDisabled || codeSent}>
          {isSubmitting && !codeSent ? "Sending code..." : "Send code"}
        </button>
      </form>

      {codeSent ? (
        <form className="auth-form" onSubmit={handleVerifyCode}>
          <div className="auth-code-header">
            <label htmlFor="code">Verification code</label>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setCodeSent(false);
                setCode("");
                setStatus(null);
              }}
            >
              Change email
            </button>
          </div>
          <input
            id="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            placeholder="000000"
            value={code}
            required
            disabled={isDisabled}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
          />
          <button type="submit" disabled={isDisabled}>
            {isSubmitting ? "Verifying..." : "Verify code"}
          </button>
        </form>
      ) : null}

      {status ? <p className="auth-status">{status}</p> : null}
    </div>
  );
}
