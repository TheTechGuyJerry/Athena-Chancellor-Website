import { NextRequest, NextResponse } from "next/server";
import { getCMSData, updateCMSDispatches, DispatchPost } from "../../../../lib/cms-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = getCMSData();
  return NextResponse.json(data.dispatches);
}

export async function POST(req: NextRequest) {
  try {
    const post: DispatchPost = await req.json();

    if (!post.title || !post.summary) {
      return NextResponse.json({ error: "Title and Summary are required." }, { status: 400 });
    }

    const data = getCMSData();
    if (!post.id) {
      post.id = `disp-${Date.now()}`;
    }
    if (!post.slug) {
      post.slug = post.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }
    if (!post.date) {
      post.date = new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
    if (typeof post.published !== "boolean") {
      post.published = true;
    }
    if (!post.author) {
      post.author = "Osita Chidoka";
    }

    let updatedList = [...data.dispatches];
    const existingIndex = updatedList.findIndex((d) => d.id === post.id);

    if (existingIndex >= 0) {
      updatedList[existingIndex] = { ...updatedList[existingIndex], ...post };
    } else {
      post.reads = 0;
      updatedList.unshift(post);
    }

    updateCMSDispatches(updatedList);
    return NextResponse.json({ success: true, post, list: updatedList });
  } catch {
    return NextResponse.json({ error: "Failed to save dispatch post." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID parameter missing" }, { status: 400 });
    }

    const data = getCMSData();
    const updatedList = data.dispatches.filter((d) => d.id !== id);
    updateCMSDispatches(updatedList);

    return NextResponse.json({ success: true, list: updatedList });
  } catch {
    return NextResponse.json({ error: "Failed to delete dispatch." }, { status: 500 });
  }
}
