import { NextRequest, NextResponse } from "next/server";
import { getCMSData, addCMSSubscriber } from "../../../../lib/cms-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = getCMSData();
  return NextResponse.json(data.subscribers);
}

export async function POST(req: NextRequest) {
  try {
    const { email, source } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    const sub = addCMSSubscriber(email, source || "Website");
    return NextResponse.json({ success: true, subscriber: sub });
  } catch {
    return NextResponse.json({ error: "Subscription failed." }, { status: 500 });
  }
}
