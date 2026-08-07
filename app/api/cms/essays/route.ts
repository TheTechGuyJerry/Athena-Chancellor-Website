import { NextRequest, NextResponse } from "next/server";
import { getCMSData, updateCMSEssays } from "../../../../lib/cms-store";
import { Essay } from "../../../../lib/essays";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = getCMSData();
  return NextResponse.json(data.essays);
}

export async function POST(req: NextRequest) {
  try {
    const newEssay: Essay = await req.json();

    if (!newEssay.title || !newEssay.summary) {
      return NextResponse.json({ error: "Title and Summary are required." }, { status: 400 });
    }

    // Auto-generate slug if missing
    if (!newEssay.slug && newEssay.title) {
      newEssay.slug = newEssay.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    const data = getCMSData();
    const existingIndex = data.essays.findIndex(
      (e) => (newEssay.slug && e.slug === newEssay.slug) || e.title.toLowerCase() === newEssay.title.toLowerCase()
    );

    if (!newEssay.content || newEssay.content.length === 0) {
      newEssay.content = [newEssay.summary];
    }

    let updatedList = [...data.essays];

    if (existingIndex >= 0) {
      updatedList[existingIndex] = {
        ...updatedList[existingIndex],
        ...newEssay,
      };
    } else {
      newEssay.views = 0;
      newEssay.downloads = 0;
      updatedList.unshift(newEssay);
    }

    updateCMSEssays(updatedList);
    return NextResponse.json({ success: true, essay: newEssay, list: updatedList });
  } catch {
    return NextResponse.json({ error: "Failed to save essay." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ error: "Slug parameter missing" }, { status: 400 });
    }

    const data = getCMSData();
    const updatedList = data.essays.filter((e) => e.slug !== slug);
    updateCMSEssays(updatedList);

    return NextResponse.json({ success: true, list: updatedList });
  } catch {
    return NextResponse.json({ error: "Failed to delete essay." }, { status: 500 });
  }
}
