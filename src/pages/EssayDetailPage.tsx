import { useMemo, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { getCMSData } from "../lib/cms-store";
import { Essay } from "../lib/essays";
import { EssayReader } from "../components/EssayReader";

export function EssayDetailPage() {
  const { slug: pathSlug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const querySlug = searchParams.get("slug");
  
  const currentSlug = pathSlug || querySlug || "";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentSlug]);

  const essay = useMemo<Essay | null>(() => {
    const data = getCMSData();
    if (!currentSlug) return data.essays[0] || null;

    // 1. Direct match
    let found = data.essays.find((e) => e.slug === currentSlug);
    if (found) return found;

    // 2. Partial/fuzzy match (e.g. 'ekulu')
    found = data.essays.find((e) => e.slug.includes(currentSlug) || currentSlug.includes(e.slug));
    if (found) return found;

    // 3. Match title keywords
    const lower = currentSlug.toLowerCase();
    found = data.essays.find((e) => e.title.toLowerCase().includes(lower) || lower.includes("ekulu"));
    if (found) return found;

    return data.essays[0] || null;
  }, [currentSlug]);

  if (!essay) {
    return (
      <main className="wrap" style={{ paddingBlock: "100px", textAlign: "center" }}>
        <h1>Essay Not Found</h1>
        <p>The essay you are looking for does not exist or has been relocated.</p>
        <Link to="/collections" className="gold-button" style={{ marginTop: "24px", display: "inline-block" }}>
          Return to Archive
        </Link>
      </main>
    );
  }

  return (
    <main style={{ paddingBlock: "24px 60px", background: "var(--paper)" }}>
      <div className="wrap-wide">
        <EssayReader essay={essay} isModal={false} />
      </div>
    </main>
  );
}

