import { useState, useMemo, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { getCMSData } from "../lib/cms-store";
import { Essay } from "../lib/essays";
import { EssayReader } from "../components/EssayReader";

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

    return essays[0] || null;
  }, [currentSlug, essays]);

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
    <main style={{ paddingBlock: "32px 80px", background: "#08090d", minHeight: "100vh" }}>
      <div className="wrap-wide">
        <EssayReader essay={essay} isModal={false} />
      </div>
    </main>
  );
}

