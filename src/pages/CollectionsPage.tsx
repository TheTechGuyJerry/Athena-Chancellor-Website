import { useSearchParams } from "react-router-dom";
import { useCMSData } from "../lib/cms-store";
import { Archive } from "../components/Archive";

export function CollectionsPage() {
  const cmsData = useCMSData();
  const essays = cmsData.essays;
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";

  return (
    <main>
      <section className="canon-intro wrap">
        <p className="eyebrow">The Canon</p>
        <h1>Essays &amp; Speeches</h1>
        <p className="canon-lead">
          A working body of thought on governance, state capacity, and public leadership in Nigeria.
        </p>
        <p className="canon-desc">
          These long-form essays, convocation lectures, and policy papers span three decades of public service and institutional analysis. All writings are freely accessible to read online or download.
        </p>

        {essays.length > 0 && <Archive initialEssays={essays} initialSearch={search} />}
      </section>
    </main>
  );
}
