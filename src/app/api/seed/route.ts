import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resetAndSeed } from "@/lib/seedData";

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-seed-token");
  const expected = process.env.SEED_TOKEN;

  if (!expected || token !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const force = request.nextUrl.searchParams.get("force") === "true";
  const existing = await prisma.customer.count();
  if (existing > 0 && !force) {
    return NextResponse.json({
      seeded: false,
      message: `Database already has ${existing} customer(s); skipped. Pass ?force=true to wipe and reseed.`,
    });
  }

  const result = await resetAndSeed(prisma);
  return NextResponse.json({ seeded: true, ...result });
}
