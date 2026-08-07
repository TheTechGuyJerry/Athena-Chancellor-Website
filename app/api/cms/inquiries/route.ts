import { NextRequest, NextResponse } from "next/server";
import { getCMSData, addCMSInquiry, updateInquiryStatus, deleteInquiry } from "../../../../lib/cms-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = getCMSData();
  return NextResponse.json(data.inquiries);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === "update-status") {
      updateInquiryStatus(body.id, body.status);
      return NextResponse.json({ success: true });
    }

    if (!body.name || !body.email || !body.message) {
      return NextResponse.json({ error: "Name, Email, and Message are required" }, { status: 400 });
    }

    const inquiry = addCMSInquiry({
      name: body.name,
      organization: body.organization || "Independent",
      email: body.email,
      phone: body.phone || "",
      subject: body.subject || "Press Inquiry",
      message: body.message,
    });

    return NextResponse.json({ success: true, inquiry });
  } catch {
    return NextResponse.json({ error: "Failed to submit press inquiry" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID missing" }, { status: 400 });

    deleteInquiry(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete inquiry" }, { status: 500 });
  }
}
