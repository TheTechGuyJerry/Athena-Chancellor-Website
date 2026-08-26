import React from "react";
import { SEOHead } from "../components/SEOHead";
import { NewsletterForm } from "../components/NewsletterForm";

export function SubscribePage() {
  return (
    <>
      <SEOHead 
        title="Subscribe | Osita Chidoka" 
        description="Join the dispatch to receive the latest essays, insights, and updates directly to your inbox." 
      />
      <div className="bg-[#fafafa] text-slate-800 font-sans" style={{ borderTop: "1px solid #eaeaea" }}>
         {/* Hero Section */}
         <div className="max-w-6xl mx-auto px-6 py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column */}
            <div>
               <div className="text-[11px] font-bold tracking-widest text-slate-500 uppercase mb-6 flex items-center gap-4">
                  CHANCELLOR DISPATCH <span className="w-8 h-[1px] bg-slate-300"></span>
               </div>
               <h1 className="text-4xl md:text-5xl lg:text-[54px] font-serif text-slate-900 leading-[1.1] mb-6" style={{ fontFamily: "Georgia, serif" }}>
                  Start every morning with clarity.
               </h1>
               <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-lg">
                  Stay ahead with the <strong>Chancellor Dispatch</strong> — a concise briefing on Nigeria's politics, economy, governance and public policy, delivered before the noise begins.
               </p>
               <div className="flex flex-wrap gap-6 text-[13px] font-bold text-[#059669]">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    One email
                  </span>
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    Five minutes
                  </span>
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    High-signal
                  </span>
               </div>
            </div>

            {/* Right Column (Card) */}
            <div className="bg-white p-8 md:p-10 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 max-w-[420px] mx-auto lg:mr-0 lg:ml-auto w-full">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Subscribe free</h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Step 1 of 2</span>
               </div>
               <p className="text-[14px] text-slate-600 mb-8 leading-relaxed">
                  Get verified facts, useful context and clear analysis directly in your inbox.
               </p>
               <div className="mb-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">Email address</label>
                  <NewsletterForm source="Hero Card" />
               </div>
               <p className="text-[11px] text-slate-400 text-center mt-6">
                  Free to join. Unsubscribe at any time.
               </p>
            </div>
         </div>

         {/* Divider / Value Props */}
         <div className="border-y border-slate-200 bg-white">
            <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[13px] text-center md:text-left">
               <div className="flex-1"><strong className="text-slate-900 font-bold">Verified information</strong> <span className="text-slate-500">— checked before it reaches your inbox</span></div>
               <div className="hidden md:block w-px h-8 bg-slate-200"></div>
               <div className="flex-1"><strong className="text-slate-900 font-bold">Clear context</strong> <span className="text-slate-500">— understand why it matters</span></div>
               <div className="hidden md:block w-px h-8 bg-slate-200"></div>
               <div className="flex-1"><strong className="text-slate-900 font-bold">No partisan noise</strong> <span className="text-slate-500">— independent analysis</span></div>
            </div>
         </div>

         {/* Features Grid */}
         <div className="max-w-6xl mx-auto px-6 py-24 bg-[#fafafa]">
            <div className="text-center mb-16">
               <h2 className="text-3xl md:text-[32px] font-serif text-slate-900 mb-4" style={{ fontFamily: "Georgia, serif" }}>Why decision-makers read the Dispatch</h2>
               <p className="text-slate-600 max-w-2xl mx-auto text-[15px]">
                  We filter out the viral outrage to deliver rigorous policy analysis, institutional tracking, and economic insights.
               </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-[#f5f5f5] border border-slate-200/60 p-8 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">01 / Rigour</div>
                  <h4 className="text-lg font-bold text-slate-900 mb-3">Policy Over Politics</h4>
                  <p className="text-[14px] text-slate-600 leading-relaxed">
                     We focus on lawmaking, regulatory shifts, fiscal decisions and institutional reform rather than political theater.
                  </p>
               </div>
               <div className="bg-[#f5f5f5] border border-slate-200/60 p-8 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">02 / Efficiency</div>
                  <h4 className="text-lg font-bold text-slate-900 mb-3">5-Minute Digest</h4>
                  <p className="text-[14px] text-slate-600 leading-relaxed">
                     Structured specifically for busy executives, policymakers, and civic leaders who need high signal density quickly.
                  </p>
               </div>
               <div className="bg-[#f5f5f5] border border-slate-200/60 p-8 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">03 / Independence</div>
                  <h4 className="text-lg font-bold text-slate-900 mb-3">Non-Partisan Analysis</h4>
                  <p className="text-[14px] text-slate-600 leading-relaxed">
                     Independent commentary committed strictly to constitutional facts and the public interest.
                  </p>
               </div>
            </div>
         </div>

         {/* Bottom CTA */}
         <div className="bg-white border-t border-slate-200 py-24">
            <div className="max-w-2xl mx-auto px-6 text-center">
               <h2 className="text-3xl md:text-[32px] font-serif text-slate-900 mb-4" style={{ fontFamily: "Georgia, serif" }}>Join thousands of informed readers today</h2>
               <p className="text-slate-600 mb-10 text-[15px]">Subscribe free to receive tomorrow morning's briefing directly in your inbox.</p>
               <div className="bg-white p-6 rounded-xl border border-slate-200 max-w-md mx-auto shadow-sm text-left">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">Email address</label>
                  <NewsletterForm source="Bottom CTA" />
               </div>
            </div>
         </div>
      </div>
    </>
  );
}
