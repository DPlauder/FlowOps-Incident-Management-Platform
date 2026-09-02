import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await env.flowops_db
      .prepare("SELECT 1 AS ok")
      .first<{ ok: number }>();

    return NextResponse.json({
      status: "ok",
      database: result?.ok === 1 ? "connected" : "unknown",
    });
  } catch (error) {
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        status: "error",
        database: "unavailable",
      },
      { status: 500 }
    );
  }
}