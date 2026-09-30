import { NextResponse } from "next/server";

// The public calculator has been retired in favor of appointment requests.
export async function POST() {
  return NextResponse.json(
    { error: "The calculator is no longer available. Please book an appointment." },
    { status: 410 }
  );
}
