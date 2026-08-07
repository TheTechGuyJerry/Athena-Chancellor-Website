import { NextRequest, NextResponse } from "next/server";
import { getCMSData, updateCMSSettings } from "../../../../lib/cms-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = getCMSData();
  const { adminPasswordHash, ...safeSettings } = data.settings;
  return NextResponse.json(safeSettings);
}

export async function PUT(req: NextRequest) {
  try {
    const updates = await req.json();
    updateCMSSettings(updates);
    const updated = getCMSData().settings;
    const { adminPasswordHash, ...safeSettings } = updated;
    return NextResponse.json({ success: true, settings: safeSettings });
  } catch {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
