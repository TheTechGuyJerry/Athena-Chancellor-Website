import type { Metadata } from "next";
import { BlogClient } from "./BlogClient";

export const metadata: Metadata = { title: "Blog & Dispatches — Osita Chidoka" };

export default function Blog() {
  return (
    <main className="blog-page">
      <section className="blog-hero">
        <h1>Insights &amp; Perspectives</h1>
        <p>Thoughts on leadership, public policy, governance, and building a better Nigeria.</p>
      </section>
      <BlogClient />
    </main>
  );
}

