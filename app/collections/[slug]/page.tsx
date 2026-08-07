import { getEssayBySlug, essays } from "../../../lib/essays";
import { getCMSData } from "../../../lib/cms-store";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EssayReader } from "../../../components/EssayReader";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  try {
    const live = getCMSData().essays;
    return live.map((e) => ({
      slug: e.slug,
    }));
  } catch {
    return essays.map((e) => ({
      slug: e.slug,
    }));
  }
}

function findEssay(slug: string) {
  try {
    const live = getCMSData().essays;
    const found = live.find((e) => e.slug === slug);
    if (found) return found;
  } catch {
    // fallback
  }
  return getEssayBySlug(slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const essay = findEssay(slug);
  if (!essay) return { title: "Essay Not Found" };
  return {
    title: `${essay.title} | Osita Chidoka — The Canon`,
    description: essay.summary,
  };
}

export default async function EssayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const essay = findEssay(slug);

  if (!essay) {
    notFound();
  }

  return (
    <main>
      <section className="essay-detail-hero wrap">
        <div className="breadcrumb">
          <Link href="/collections">← Back to The Canon</Link>
        </div>
        <EssayReader essay={essay} isStandalonePage={true} />
      </section>
    </main>
  );
}
