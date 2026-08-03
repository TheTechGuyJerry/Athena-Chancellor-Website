"use client";
import { useEffect, useMemo, useState } from "react";
import { essays } from "../lib/essays";

const categories = ["All","Politics","Youth","Development","Transport","Business","Culture"];
export function Archive() {
 const [category,setCategory]=useState("All"); const [query,setQuery]=useState("");
 useEffect(()=>{const p=new URLSearchParams(location.search); const q=p.get("q"); const c=p.get("category"); if(q)setQuery(q); if(c)setCategory(c[0].toUpperCase()+c.slice(1));},[]);
 const filtered=useMemo(()=>essays.filter(e=>(category==="All"||e.category===category)&&(e.title+e.summary).toLowerCase().includes(query.toLowerCase())),[category,query]);
 const years=[...new Set(filtered.map(e=>e.year))];
 return <>
  <div className="archive-controls"><div className="category-tabs">{categories.map(c=><button className={c===category?"active":""} onClick={()=>setCategory(c)} key={c}>{c}</button>)}</div><label className="archive-search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search the archive…"/></label></div>
  <p className="archive-count"><strong>{filtered.length}</strong> <em>{filtered.length===1?"essay":"essays"} in the archive</em></p>
  <div className="archive-list">{years.map(year=><section className="year-group" key={year}><div className="year-mark">{year}</div><div>{filtered.filter(e=>e.year===year).map(e=><article className="essay-row" key={e.title}><div><h2>{e.title}</h2><span className="essay-category">{e.category}</span><p>{e.summary}</p></div><div className="essay-meta"><span>{e.month}</span><strong>PDF</strong></div></article>)}</div></section>)}</div>
  {filtered.length===0&&<p className="empty">No essays found matching your search.</p>}
 </>;
}
