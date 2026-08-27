import { useState, useMemo, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { getCMSData } from "../lib/cms-store";
import { Essay } from "../lib/essays";
import { EssayReader } from "../components/EssayReader";
import { SEOHead } from "../components/SEOHead";
import { NotFoundPage } from "./NotFoundPage";
import { stripHtml, safeIsoDate } from "../lib/url-utils";

export function EssayDetailPage() {
  const { slug: pathSlug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const querySlug = searchParams.get("slug");
  
  const currentSlug = pathSlug || querySlug || "";

  const [essays, setEssays] = useState<Essay[]>(() => getCMSData().essays);

  useEffect(() => {
    const handleUpdate = () => {
      setEssays(getCMSData().essays);
    };
    window.addEventListener("osita_cms_updated", handleUpdate);
    return () => window.removeEventListener("osita_cms_updated", handleUpdate);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentSlug]);

  const essay = useMemo<Essay | null>(() => {
    if (!currentSlug) return essays[0] || null;

    // 1. Direct match
    let found = essays.find((e) => e.slug === currentSlug);
    if (found) return found;

    // 2. Partial/fuzzy match (e.g. 'ekulu')
    found = essays.find((e) => e.slug.includes(currentSlug) || currentSlug.includes(e.slug));
    if (found) return found;

    // 3. Match title keywords
    const lower = currentSlug.toLowerCase();
    found = essays.find((e) => e.title.toLowerCase().includes(lower) || lower.includes("ekulu"));
    if (found) return found;

    return null; // Don't fallback to essays[0] if specific slug requested
  }, [currentSlug, essays]);

  if (!essay) {
    if (!currentSlug && essays.length === 0) {
      return (
        <main className="wrap" style={{ paddingBlock: "100px", textAlign: "center" }}>
          <h1>No Essays Available</h1>
        </main>
      );
    }
    return <NotFoundPage message="The essay you are looking for does not exist or has been relocated." />;
  }

  return (
    <main style={{ paddingBlock: "32px 80px", background: "#08090d", minHeight: "100vh" }}>
      <SEOHead
        title={`${essay.title} | Chief Osita Chidoka`}
        description={stripHtml(essay.summary || essay.subtitle)}
        canonicalPath={`/collections/${essay.slug}`}
        type="article"
        image={essay.imageUrl}
        article={{
          publishedTime: safeIsoDate(`${essay.month} 1, ${essay.year}`),
          author: "Osita Chidoka",
          section: "Essays & Speeches",
        }}
      />
      <div className="wrap-wide">
        <EssayReader essay={essay} isModal={false} />
      </div>
    </main>
  );
}

