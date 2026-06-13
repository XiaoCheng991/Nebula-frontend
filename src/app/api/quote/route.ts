import { NextResponse } from "next/server";
import { quotes } from "@/data/quotes";

export const runtime = "nodejs";

export async function GET() {
  const idx = Math.floor(Math.random() * quotes.length);
  return NextResponse.json(quotes[idx]);
}
