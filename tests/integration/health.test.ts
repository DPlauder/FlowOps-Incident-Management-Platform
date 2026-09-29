import { describe, expect, it } from "vitest";
import { GET } from "../../src/app/api/health/route";

describe("GET /api/health", () => {
  it("connects to the D1 database", async () => {
    const response = await GET();

    expect(response.status).toBe(200);

    const body = await response.json();

    expect(body).toEqual({
      status: "ok",
      database: "connected",
    });
  });
});