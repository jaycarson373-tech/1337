import { NextResponse } from "next/server";
import { getAuthenticatedApiUser } from "@/lib/auth/api";
import { getPhase2Env } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await getAuthenticatedApiUser();

  if ("error" in auth) {
    return auth.error;
  }

  try {
    const env = getPhase2Env();

    return NextResponse.json({
      pricing: {
        minQueryUsd: env.minQueryUsd,
        maxQueryUsd: env.maxQueryUsd,
        tokenPriceUsd: env.tokenPriceUsdFallback,
        estimatedMinBurn1337: env.minQueryUsd / env.tokenPriceUsdFallback,
        estimatedMaxBurn1337: env.maxQueryUsd / env.tokenPriceUsdFallback,
        markupMultiplier: env.queryMarkupMultiplier
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Pricing estimate unavailable."
      },
      { status: 500 }
    );
  }
}
