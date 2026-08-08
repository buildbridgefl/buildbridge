import { useState, useMemo, useEffect, useRef } from "react";
const track = (action, vendor) => { if (window.gtag) window.gtag("event", action, { vendor: vendor }); };
const SB_URL = "https://jbpwxfaazetfcbwxrmtc.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpicHd4ZmFhemV0ZmNid3hybXRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1OTU5NjcsImV4cCI6MjEwMDE3MTk2N30.5Ptc17G4dJ5iXiaWDupto0gTHhS2ltyLgDLaDBFKppM";
const sbHeaders = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json" };
async function fetchFollows() {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/vendor_follows?select=vendor_id,followers`, { headers: sbHeaders });
    const rows = await r.json();
    const map = {};
    rows.forEach(row => { map[row.vendor_id] = row.followers; });
    return map;
  } catch (e) { return {}; }
}
async function addFollow(vendorId) {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/rpc/increment_follow`, { method: "POST", headers: sbHeaders, body: JSON.stringify({ vid: vendorId }) });
    return await r.json();
  } catch (e) { return null; }
}
async function submitProjectPost(postType, content, contact) {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/project_posts`, { method: "POST", headers: sbHeaders, body: JSON.stringify({ post_type: postType, content: content, contact: contact || null }) });
    return r.ok;
  } catch (e) { return false; }
}
async function submitBid(bid) {     try {       const r = await fetch(`${SB_URL}/rest/v1/project_bids`, { method: "POST", headers: sbHeaders, body: JSON.stringify(bid) });       return r.ok;     } catch (e) { return false; }   } async function submitVendorApplication(app) {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/vendor_applications`, { method: "POST", headers: sbHeaders, body: JSON.stringify(app) });
    return r.ok;
  } catch (e) { return false; }
}
async function submitClaimRequest(claim) {   try {     const r = await fetch(`${SB_URL}/rest/v1/claim_requests`, { method: "POST", headers: sbHeaders, body: JSON.stringify(claim) });     return r.ok;   } catch (e) { return false; } } async function updateMyVendorRow(token, id, fields) {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/vendor_applications?id=eq.${id}`, {
      method: "PATCH",
      headers: { apikey: SB_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(fields)
    });
    return r.ok;
  } catch (e) { return false; }
}
async function fetchMyVendorRow(token) {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/vendor_applications?select=*`, {
      headers: { apikey: SB_KEY, Authorization: `Bearer ${token}` }
    });
    if (!r.ok) return [];
    return await r.json();
  } catch (e) { return []; }
}
async function fetchApprovedVendors() {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/vendor_applications?select=*&approved=eq.true&type=eq.contractor`, { headers: sbHeaders });
    const rows = await r.json();
    return rows.map(v => ({
      id: 1000 + v.id,
      name: v.name,
      company: v.company,
      trade: v.trade || "General",
      location: v.city || "Citrus County, FL",
      phone: v.phone || "",
      email: v.email || "",
      website: v.website || "",
      avatar: v.avatar || (v.company || "??").split(" ").map(w => w[0]).join("").slice(0, 3).toUpperCase(),
      rating: 5.0, jobs: 0, followers: 0, following: 0,
      verified: true, premium: false, claimed: v.claimed === true,
      license: v.license || null,         lat: v.lat || null,         lng: v.lng || null,         serviceRadiusMiles: v.service_radius_miles || 33,
      reviews: 0, videoTitle: v.video_title || null, videoUrl: v.video_url || null,
      specialties: v.specialties ? v.specialties.split(",").map(s => s.trim()) : [],
      bio: v.bio || ""
   }));
  } catch (e) { return []; }
}
async function fetchApprovedSuppliers() {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/vendor_applications?select=*&approved=eq.true&type=eq.supplier`, { headers: sbHeaders });
    const rows = await r.json();
    return rows.map(v => ({
      id: 2000 + v.id,
      name: v.company,
      category: v.trade || "General",
      location: "Citrus County, FL",
      website: v.website || "",
      phone: v.phone || "",
      bio: v.bio || ""
    }));
  } catch (e) { return []; }
}
async function fetchApprovedPosts() {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/project_posts?select=*&approved=eq.true&order=created_at.desc`, { headers: sbHeaders });
    return await r.json();
  } catch (e) { return []; }
}
async function fetchApprovedReviews() {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/reviews?select=*&approved=eq.true&order=created_at.desc`, { headers: sbHeaders });
    const rows = await r.json();
    return rows.map(v => ({
      id: v.id,
      contractorId: v.contractor_id,
      author: v.author,
      rating: v.rating,
      project: v.project || "",
      text: v.text,
      date: daysAgo(v.created_at)
    }));
  } catch (e) { return []; }
}
async function submitReview(review) {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/reviews`, { method: "POST", headers: sbHeaders, body: JSON.stringify(review) });
    return r.ok;
  } catch (e) { return false; }
}
 const TARGET_TRADES = ["HVAC", "Electrical", "Plumbing", "Roofing", "General Contractor", "Tile & Masonry", "Painting", "Flooring", "Concrete", "Fencing", "Tree Service", "Pool Service", "Septic", "Well / Water", "Handyman", "Appliance Repair", "Pressure Washing", "Windows & Doors", "Drywall", "Garage Doors", "Pest Control", "Irrigation", "Landscaping", "Junk Removal", "Solar", "Gutters", "Screen Enclosure", "Insulation", "Locksmith", "Mobile Home Service"];
function milesBetween(lat1, lng1, lat2, lng2) {
  if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) return null
  const R = 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
const MAP_TOWNS = [   { n: "Citrus Springs", lat: 28.9944, lng: -82.4587, inC: true },   { n: "Crystal River", lat: 28.9025, lng: -82.5926, inC: true },   { n: "Beverly Hills", lat: 28.9169, lng: -82.4576, inC: true },   { n: "Hernando", lat: 28.8969, lng: -82.3762, inC: true },   { n: "Lecanto", lat: 28.8442, lng: -82.4832, inC: true },   { n: "Inverness", lat: 28.8397, lng: -82.3298, inC: true },   { n: "Homosassa", lat: 28.7900, lng: -82.5800, inC: true },   { n: "Floral City", lat: 28.7497, lng: -82.2967, inC: true },   { n: "Dunnellon", lat: 29.0489, lng: -82.4629, inC: false },   { n: "Belleview", lat: 29.0611, lng: -82.0601, inC: false, dx: -26 },   { n: "Brooksville", lat: 28.5553, lng: -82.3879, inC: false },   { n: "Weeki Wachee", lat: 28.5136, lng: -82.5729, inC: false, dx: -30 },   { n: "Spring Hill", lat: 28.4769, lng: -82.5246, inC: false, dx: 40, dy: 16 }, ];  function RosterMap({ roster }) {   const LAT_MAX = 29.14, LAT_MIN = 28.40, LNG_MIN = -82.92, LNG_MAX = -81.98, W = 700, H = 620;   const px = l => ((l - LNG_MIN) / (LNG_MAX - LNG_MIN)) * W;   const py = l => ((LAT_MAX - l) / (LAT_MAX - LAT_MIN)) * H;   const cx1 = px(-82.79), cx2 = px(-82.05), cy1 = py(29.07), cy2 = py(28.61);   const tally = {}; let noGeo = 0;   roster.forEach(c => {     if (c.lat == null || c.lng == null) { noGeo++; return; }     let best = null, bd = 1e9;     MAP_TOWNS.forEach(t => { const d = Math.pow(t.lat - c.lat, 2) + Math.pow(t.lng - c.lng, 2); if (d < bd) { bd = d; best = t; } });     if (bd > 0.09 || !best) { noGeo++; return; }     (tally[best.n] = tally[best.n] || []).push(c.company);   });   const gaps = MAP_TOWNS.filter(t => t.inC && !(tally[t.n] || []).length);   const outside = MAP_TOWNS.filter(t => !t.inC && (tally[t.n] || []).length).reduce((s, t) => s + tally[t.n].length, 0);   return (     <div style={{ marginBottom: 22 }}>       <div className="eyebrow" style={{ marginBottom: 8 }}>Where your roster actually is</div>       <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", background: "#0B1220", borderRadius: 12, border: `1px solid ${C.border}` }}>         <rect x="0" y="0" width={px(-82.71)} height={H} fill="#0E2436" opacity="0.6" />         <text x="30" y={H * 0.6} fontSize="10.5" letterSpacing="2" fill="#3E5B72" transform={`rotate(-90 30 ${H * 0.6})`}>GULF OF MEXICO</text>         <rect x={cx1} y={cy1} width={cx2 - cx1} height={cy2 - cy1} fill="#132441" opacity="0.55" stroke={C.orange} strokeWidth="1.4" strokeDasharray="7 5" rx="8" />         <text x={cx1 + 12} y={cy1 + 21} fontSize="11" fontWeight="800" letterSpacing="1.5" fill={C.orange}>CITRUS COUNTY</text>         {MAP_TOWNS.map(t => {           const n = (tally[t.n] || []).length, x = px(t.lng), y = py(t.lat), ox = t.dx || 0, oy = t.dy || 0;           if (n > 0) {             const r = 9 + Math.min(n, 6) * 2.2, col = t.inC ? C.green : C.orange;             return (<g key={t.n}>               <circle cx={x} cy={y} r={r + 6} fill={col} opacity="0.15" />               <circle cx={x} cy={y} r={r} fill={col} opacity="0.9" />               <text x={x} y={y + 4.5} textAnchor="middle" fontSize="12.5" fontWeight="800" fill="#0B1220">{n}</text>               <text x={x + ox} y={y - r - 7 + oy} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={t.inC ? "#E8EDF5" : "#93A2B8"}>{t.n}</text>             </g>);           }           if (t.inC) return (<g key={t.n}>             <circle cx={x} cy={y} r="7" fill="none" stroke={C.orange} strokeWidth="1.6" strokeDasharray="3 2.5" opacity="0.75" />             <text x={x + ox} y={y - 13} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={C.orange} opacity="0.9">{t.n}</text>           </g>);           return (<g key={t.n}>             <circle cx={x} cy={y} r="3.5" fill="#39465C" />             <text x={x + ox} y={y - 9} textAnchor="middle" fontSize="9.5" fill="#5F6E85">{t.n}</text>           </g>);         })}       </svg>       <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 11.5, color: C.muted, marginTop: 10 }}>         <span><span style={{ color: C.green, fontWeight: 800 }}>●</span> In Citrus County</span>         <span><span style={{ color: C.orange, fontWeight: 800 }}>●</span> Outside the county ({outside})</span>         <span><span style={{ color: C.orange }}>○</span> Citrus town, no coverage</span>       </div>       {gaps.length > 0 && <div style={{ fontSize: 12.5, color: C.dim, marginTop: 8, lineHeight: 1.55 }}><strong style={{ color: C.orange }}>Empty towns:</strong> {gaps.map(t => t.n).join(" · ")}</div>}       {noGeo > 0 && <div style={{ fontSize: 11.5, color: C.muted, marginTop: 4 }}>{noGeo} listing{noGeo > 1 ? "s" : ""} missing coordinates — add lat/lng in Supabase to place {noGeo > 1 ? "them" : "it"}.</div>}     </div>   ); }  function CoverageDashboard({ roster, onBack }) { const counts = TARGET_TRADES.map(t => { const key = t.toLowerCase().split(" ")[0].replace(/[^a-z]/g, ""); const matches = roster.filter(c => (c.trade || "").toLowerCase().includes(key) || t.toLowerCase().includes((c.trade || "").toLowerCase().split(" ")[0])); return { trade: t, n: matches.length, who: matches.map(m => m.company) }; }).sort((a, b) => a.n - b.n || a.trade.localeCompare(b.trade)); const gaps = counts.filter(c => c.n === 0).length; const thin = counts.filter(c => c.n === 1).length; const covered = counts.filter(c => c.n >= 2).length; const box = (label, n, color) => (<div style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, textAlign: "center" }}><div className="display" style={{ fontSize: 26, fontWeight: 800, color }}>{n}</div><div className="eyebrow" style={{ fontSize: 10, marginTop: 2 }}>{label}</div></div>); return (<div className="fade-in" style={{ maxWidth: 760, margin: "0 auto", padding: "20px 0" }}><button onClick={onBack} className="btn-ghost" style={{ padding: "7px 14px", fontSize: 12, marginBottom: 14 }}>← Back to site</button><div className="eyebrow" style={{ marginBottom: 4 }}>Internal · not linked publicly</div><div className="display" style={{ fontSize: 26, fontWeight: 800, color: C.white, marginBottom: 4 }}>ROSTER COVERAGE</div><div style={{ fontSize: 13, color: C.dim, marginBottom: 18 }}>{roster.length} contractors across {TARGET_TRADES.length} tracked trades. Recruit the red rows first.</div><div style={{ display: "flex", gap: 10, marginBottom: 20 }}>{box("No coverage", gaps, C.orange)}{box("Single point", thin, "#E8B33A")}{box("Covered", covered, C.green)}</div><RosterMap roster={roster} />{counts.map(c => { const color = c.n === 0 ? C.orange : c.n === 1 ? "#E8B33A" : C.green; return (<div key={c.trade} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", background: C.card, border: `1px solid ${C.border}`, borderLeft: `3px solid ${color}`, borderRadius: 8, marginBottom: 6 }}><div style={{ width: 26, textAlign: "center", fontWeight: 800, fontSize: 15, color }}>{c.n}</div><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13.5, fontWeight: 700, color: C.white }}>{c.trade}</div>{c.who.length > 0 && <div style={{ fontSize: 11.5, color: C.muted, marginTop: 1 }}>{c.who.join(" · ")}</div>}</div>{c.n === 0 && <div style={{ fontSize: 10.5, fontWeight: 800, color: C.orange, letterSpacing: 0.5 }}>RECRUIT</div>}</div>); })}</div>); }
async function sendMagicLink(email) {   try {     const r = await fetch(`${SB_URL}/auth/v1/otp?redirect_to=${encodeURIComponent(window.location.origin)}`, {       method: "POST",       headers: { apikey: SB_KEY, "Content-Type": "application/json" },       body: JSON.stringify({ email: email, create_user: true })     });     return r.ok;   } catch (e) { return false; } } async function getUser(token) {   try {     const r = await fetch(`${SB_URL}/auth/v1/user`, { headers: { apikey: SB_KEY, Authorization: `Bearer ${token}` } });     if (!r.ok) return null;     return await r.json();   } catch (e) { return null; } } function readTokenFromUrl() {   const hash = window.location.hash;   if (!hash.includes("access_token")) return null;   const params = new URLSearchParams(hash.slice(1));   const token = params.get("access_token");   if (token) {     localStorage.setItem("bb-token", token);     window.history.replaceState(null, "", window.location.pathname);   }   return token; } function daysAgo(dateString) {
  if (!dateString) return "";
  const then = new Date(dateString);
  const now = new Date();
  const diffMs = now - then;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 30) return `${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return "1 month ago";
  return `${diffMonths} months ago`;
}
function LiveFollowers({ id, fallback = 0 }) {
  const [n, setN] = useState(fallback);
  useEffect(() => {
    let live = true;
    const load = () => fetchFollows().then(m => { if (live && m[id] != null) setN(m[id]); });
    load();
    window.addEventListener("follows-updated", load);
    return () => { live = false; window.removeEventListener("follows-updated", load); };
  }, [id]);
  return n;
}
function FollowButton({ contractor, onToast }) {
  const [done, setDone] = useState(false);
  return (
    <button className="btn-ghost" style={{ padding: "10px 18px", fontSize: 13 }} onClick={async () => {
      if (done) return;
      setDone(true);
      track("follow_click", contractor.company);
      await addFollow(contractor.id);
      window.dispatchEvent(new Event("follows-updated"));
      onToast && onToast("You're now following " + contractor.company);
    }}>{done ? "Following ✓" : "+ Follow"}</button>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   BuildBridge — Citrus County's Construction Network
   v2 rebuild: blueprint design system · mobile-first · real icons ·
   smarter matching · accessibility · all v1 bugs fixed
   ════════════════════════════════════════════════════════════════════════════ */

// ── Data ─────────────────────────────────────────────────────────────────────
  const CONTRACTORS = [
  { id: 6, hidden: true, name: "BuildBridge FL", company: "BuildBridge", trade: "official", location: "Citrus County, FL", phone: "(352) 555-0100", rating: 5.0, jobs: 0, followers: 0, following: 0, verified: false, premium: true, avatar: "BB", bio: "Project Management for residential builds — overseeing your project from inception to completion. Single point of contact for budget planning, architect coordination, permit management, hiring and vetting builders, construction oversight, and move-in closeout.", specialties: ["Budget Planning", "Permit Management", "Construction Oversight"], license: "N/A", reviews: 0, videoTitle: "BuildBridge FL — Citrus County's Construction Network", videoUrl: "https://www.youtube.com/embed/dTcSJL5hhpY", email: "asanchez@buildbridgefl.com"},
];
  

const FEED_POSTS = [
   { id: 8, contractorId: 6, type: "text", time: "Just now", title: "Why BuildBridge exists", description: "I've spent 25+ years in the trades here in Florida. I know what a good contractor looks like — and I know how hard they are to find online. BuildBridge is simple: every contractor listed here is real, local to Citrus County, and verified — state license checked, business registration confirmed. Nobody pays to be listed. Nobody buys their way to the top. Just a straight connection between homeowners and contractors who do honest work.", likes: 0, comments: 0, saves: 0, tags: ["BuildBridge", "Our Mission"] },
  { id: 7, contractorId: 6, type: "text", time: "1d ago", title: "Citrus County homeowners: you may no longer need a permit for that project", description: "Florida's new HB 803 law took effect July 1 — projects under $7,500 may now qualify for a permit exemption, meaning less paperwork and faster starts. Exemption doesn't cover electrical, plumbing, structural, mechanical, or gas work, and flood zone properties don't qualify. BuildBridge Permit Prep helps you figure out if you qualify and handles the filing so you don't have to fight the county portal. Contractors: your first filing is free (prep fee waived — county fees always separate). Head to the Permits tab to learn more. #HB803 #CitrusCounty #BuildBridge",likes: 0, comments: 1, saves: 0, commentsList: [{ author: "BuildBridge FL", avatar: "BB", text: "Questions about whether your project qualifies? Drop us a line through the Permits tab — happy to help you figure it out." }],tags: ["HB803", "CitrusCounty", "BuildBridge"] },
  { id: 6, contractorId: 6, type: "text", time: "1w ago", title: "Welcome to BuildBridge FL — Citrus County's Construction Network", description: "BuildBridge is live and open for business in Citrus County. If you're a contractor, vendor, or homeowner — this is your platform. Free to join, built by someone with 25+ years in the trades. Let's build something great together.", likes: 0, comments: 0, saves: 0,tags: ["CitrusCounty", "BuildBridge", "Welcome"] }
];

const REVIEWS = [
];

const PROJECTS = [   { id: 1, type: "Lawn Mowing & Yard Maintenance", urgent: false, owner: "Homeowner", posted: "Today", budget: "Open to quotes", bids: 0, location: "Sugarmill Woods area", description: "Homeowner looking for regular lawn mowing service. Contact BuildBridge to be connected." },

];

const JOBS = [
];

const SUPPLIERS = [
  { id: 1, name: "Nature Coast Fence Supply", category: "Fencing Materials", location: "Weeki Wachee, FL", website: "https://naturecoastfencesupply.com", phone: "", bio: "Wholesale vinyl, chain link, and aluminum fence materials. Over 90% manufactured in the USA — vinyl fence profiles extruded right in Hernando County. Family-owned since 2018." },
];

// ── Matching engine (expanded plain-language keyword map) ────────────────────
const TRADE_KEYWORDS = {
  "Roofing": ["roof", "shingle", "metal roof", "leak", "leaking", "storm", "flat roof", "gutter", "soffit", "fascia", "hurricane", "hail", "tarp", "re-roof", "reroof", "drip edge", "attic"],
  "Electrical": ["electric", "panel", "wiring", "wire", "outlet", "ev charg", "breaker", "generator", "lighting", "light fixture", "fan", "surge", "220", "240", "amp", "rewir", "smoke detector"],
  "Plumbing": ["plumb", "pipe", "water heater", "repipe", "drain", "faucet", "toilet", "sink", "sewer", "septic", "clog", "garbage disposal", "shower valve", "tankless", "water softener", "well pump"],
  "Tile & Masonry": ["tile", "stone", "brick", "masonry", "grout", "travertine", "paver", "outdoor kitchen", "patio", "backsplash", "marble", "granite", "stucco", "concrete", "fire pit", "retaining wall"],
  "General Contractor": ["addition", "renovation", "remodel", "build", "construction", "kitchen", "bathroom", "bath", "home", "room", "garage", "lanai", "screen enclosure", "deck", "drywall", "flooring", "windows", "doors", "framing", "demo", "insurance claim"],
  "Project Management": ["manage", "budget", "permit", "oversee", "coordinate", "project manager", "inception", "closeout", "architect", "new home", "custom home", "ground up", "vet", "hire a builder", "general oversight"],   "HVAC": ["hvac", "air condition", "a/c", " ac ", "ac ", "cooling", "not cooling", "heating", "heater", "furnace", "heat pump", "mini split", "mini-split", "thermostat", "duct", "ductwork", "air handler", "condenser", "freon", "refrigerant", "blowing warm", "no cold air", "ac unit", "central air"],   "Pest Control": ["pest", "bug", "termite", "roach", "cockroach", "ant", "rodent", "rat", "mouse", "mice", "spider", "wasp", "bee", "mosquito", "flea", "exterminat", "infestation", "wdo", "lawn care", "lawn treatment"],   "Irrigation": ["irrigation", "sprinkler", "drip line", "watering system", "reclaimed water", "backflow", "drainage", "zone valve", "rain sensor", "smart controller"],   "Landscaping": ["landscap", "lawn", "mowing", "mow", "sod", "mulch", "palm", "tree", "shrub", "hedge", "trim", "yard", "landscape lighting", "curb appeal"],   "Junk Removal": ["junk", "haul away", "hauling", "cleanout", "clean-out", "clean out", "debris", "trash", "declutter", "estate cleanout", "appliance removal", "furniture removal", "storm debris", "dumpster", "scrap"],   "Hauling": ["haul", "hauling", "debris", "land clearing", "bush hog", "equipment haul", "dump run", "storm cleanup"],   "Garage Doors": ["garage door", "garage", "opener", "spring", "broken spring", "off track", "off-track", "remote", "keypad", "overhead door", "door won't open", "door wont open"],
};

const TOWNS = [ { name: "Beverly Hills", county: "Citrus", lat: 28.9169, lng: -82.4576 }, { name: "Brooksville", county: "Hernando", lat: 28.5553, lng: -82.3879 }, { name: "Citrus Springs", county: "Citrus", lat: 28.9994, lng: -82.4593 }, { name: "Crystal River", county: "Citrus", lat: 28.9025, lng: -82.5926 }, { name: "Dunnellon", county: "Marion", hideInHeader: true, lat: 29.0489, lng: -82.4593 }, { name: "Floral City", county: "Citrus", lat: 28.7494, lng: -82.2965 }, { name: "Hernando", county: "Citrus", lat: 28.9028, lng: -82.3776 }, { name: "Homosassa", county: "Citrus", lat: 28.7811, lng: -82.6134 }, { name: "Homosassa Springs", county: "Citrus", lat: 28.8003, lng: -82.5765 }, { name: "Inverness", county: "Citrus", lat: 28.8358, lng: -82.3304 }, { name: "Lecanto", county: "Citrus", lat: 28.8517, lng: -82.4870 }, { name: "Sugarmill Woods", county: "Citrus", lat: 28.7364, lng: -82.5140 } ];
const SERVED_COUNTIES = [...new Set(TOWNS.filter(t => !t.hideInHeader).map(t => t.county))].sort(); const SERVED_LABEL = SERVED_COUNTIES.length === 1 ? `${SERVED_COUNTIES[0]} County` : SERVED_COUNTIES.slice(0, -1).join(", ") + " & " + SERVED_COUNTIES.slice(-1) + " Counties"; function scoreContractors(input, list) {
  const text = input.toLowerCase();
  return list
    .map(c => {
      const keys = Object.entries(TRADE_KEYWORDS).filter(([trade]) => c.trade.toLowerCase().includes(trade.toLowerCase()) || trade.toLowerCase().includes(c.trade.toLowerCase().split(" ")[0])).flatMap(([, words]) => words).concat(c.trade.toLowerCase().split(/[^a-z]+/).filter(w => w.length > 3));
      const reasons = keys.filter(k => text.includes(k));
      const tradeHit = c.trade.toLowerCase().split(/[^a-z]+/).some(w => w.length > 3 && text.includes(w)) ? 2 : 0;
      const specialtyHits = c.specialties.filter(s => text.includes(s.toLowerCase())).length;
      const score = reasons.length * 2 + tradeHit + specialtyHits * 1.5 + c.rating * 0.4 + (c.verified ? 0.3 : 0);
      return { ...c, score, reasons: [...new Set(reasons)] };
    })
    .filter(c => c.reasons.length > 0 || c.trade.toLowerCase().split(/[^a-z]+/).some(w => w.length > 3 && text.includes(w)))
    .sort((a, b) => b.score - a.score);
}

// ── Design tokens ────────────────────────────────────────────────────────────
const DARK = {
  bg: "#0B1220",        // deep blueprint navy
  panel: "#0F1729",
  card: "#141E33",
  border: "#22304F",
  line: "#2E3D5F",      // blueprint grid line
  orange: "#FF8A1E",    // safety orange
  orangeDk: "#E06D00",
  blue: "#5B9DFF",
  green: "#34D178",
  red: "#FF5C5C",
  purple: "#A78BFA",
  text: "#DCE4F2",
  dim: "#93A3C0",
 muted: "#5D6E8F",
  white: "#FFFFFF",
};

const LIGHT = {
  bg: "#F1F5FA", panel: "#F8FAFD", card: "#FFFFFF", border: "#DDE4EF", line: "#E6ECF4",
  orange: "#F07800", orangeDk: "#B85400", blue: "#2563EB", green: "#0E8A4C", red: "#D63333",
  purple: "#7C4DE0", text: "#111A2B", dim: "#4B5B76", muted: "#78889F", white: "#0A1220",
};

const C = { ...DARK }; 

const makeCss = () => `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body {
    background: ${C.bg};
    background-image:
      linear-gradient(${C.line}22 1px, transparent 1px),
      linear-gradient(90deg, ${C.line}22 1px, transparent 1px);
    background-size: 32px 32px;
    font-family: 'Barlow', 'Inter', system-ui, -apple-system, sans-serif;
    color: ${C.text};
    -webkit-font-smoothing: antialiased;
  }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }

  .display { font-family: 'Barlow Condensed', 'Barlow', system-ui, sans-serif; text-transform: uppercase; letter-spacing: 0.06em; }
  .eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: ${C.orange}; }

  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  .fade-in { animation: fadeIn 0.25s ease; }
  @media (prefers-reduced-motion: reduce) { .fade-in { animation: none; } * { transition: none !important; } }

  .hover-card { transition: border-color 0.18s, transform 0.18s; }
  .hover-card:hover { border-color: ${C.orange}66 !important; }
  button { font-family: inherit; }
  button:focus-visible, a:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible {
    outline: 2px solid ${C.orange}; outline-offset: 2px; border-radius: 6px;
  }
  .btn-primary { background: ${C.orange}; border: none; border-radius: 10px; color: #14100A; font-weight: 800; cursor: pointer; transition: background 0.15s; }
  .btn-primary:hover { background: ${C.orangeDk}; }
  .btn-ghost { background: transparent; border: 1px solid ${C.border}; border-radius: 10px; color: ${C.dim}; font-weight: 600; cursor: pointer; transition: border-color 0.15s, color 0.15s; }
  .btn-ghost:hover { border-color: ${C.orange}88; color: ${C.text}; }
  .nav-btn { transition: background 0.15s, color 0.15s; }
  .nav-btn:hover { background: ${C.orange}14 !important; }

  .app-shell { display: flex; flex: 1; max-width: 1140px; margin: 0 auto; width: 100%; }
  .main-col { flex: 1; min-width: 0; border-right: 1px solid ${C.border}; }
  .side-col { width: 300px; flex-shrink: 0; }
  .scroll-col { overflow-y: auto; height: calc(100vh - 64px); padding: 20px 18px 90px; }
  .top-nav { display: flex; gap: 2px; }
  .bottom-nav { display: none; }

  @media (max-width: 1000px) { .side-col { display: none; } .main-col { border-right: none; } }
  @media (max-width: 760px) {
    .top-nav { display: none; }
    .bottom-nav {
      display: flex; position: fixed; bottom: 0; left: 0; right: 0; z-index: 150;
      background: ${C.panel}F2; backdrop-filter: blur(10px);
      border-top: 1px solid ${C.border};
      padding: 6px 4px calc(6px + env(safe-area-inset-bottom));
      justify-content: space-around;
    }
    .scroll-col { height: calc(100vh - 64px); padding: 14px 12px 110px; }
    .stat-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .portfolio-grid { grid-template-columns: 1fr !important; }
    .hide-mobile { display: none !important; }
  }
`;

// ── Icons (inline SVG — no dependency, consistent stroke style) ──────────────
function Icon({ name, size = 18, color = "currentColor", style }) {
  const P = { fill: "none", stroke: color, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
  const paths = {
    home: <path {...P} d="M3 10.5 12 3l9 7.5M5 9.5V21h5v-6h4v6h5V9.5" />,
    clipboard: <><rect {...P} x="5" y="4" width="14" height="17" rx="2" /><path {...P} d="M9 4V2.5h6V4M9 10h6M9 14h6M9 18h4" /></>,
    users: <><circle {...P} cx="9" cy="8" r="3.2" /><path {...P} d="M2.5 20c.6-3.4 3.3-5.5 6.5-5.5S14.9 16.6 15.5 20M16 5.2a3.2 3.2 0 0 1 0 5.9M18 14.8c2 .8 3.2 2.6 3.5 5.2" /></>,
    hammer: <path {...P} d="m14 6 3.5-3.5c1.5 0 4 2.5 4 4L18 10m-4-4-9.5 9.5a2.1 2.1 0 0 0 3 3L17 9m-3-3 4 4" />,
    truck: <><path {...P} d="M2 8h11v8H2z" /><path {...P} d="M13 11h4l3 3v2h-2" /><circle {...P} cx="6.5" cy="18" r="1.8" /><circle {...P} cx="16.5" cy="18" r="1.8" /></>,
    sparkles: <path {...P} d="M12 3v0l1.8 4.6L18.5 9.5l-4.7 1.9L12 16l-1.8-4.6L5.5 9.5l4.7-1.9L12 3ZM19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15ZM5 14l.7 1.8L7.5 16.5l-1.8.7L5 19l-.7-1.8L2.5 16.5l1.8-.7L5 14Z" />,
    heart: <path {...P} d="M12 20.5C7 16.5 3 13.3 3 9.2 3 6.4 5.2 4.5 7.7 4.5c1.7 0 3.3.9 4.3 2.4 1-1.5 2.6-2.4 4.3-2.4 2.5 0 4.7 1.9 4.7 4.7 0 4.1-4 7.3-9 11.3Z" />,
    comment: <path {...P} d="M21 12a8 8 0 0 1-8 8H4l2.2-3.1A8 8 0 1 1 21 12Z" />,
    bookmark: <path {...P} d="M6 3.5h12V21l-6-3.8L6 21V3.5Z" />,
    share: <path {...P} d="M12 15V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v5.5h14V14" />,
    phone: <path {...P} d="M5 4h4l1.5 4.5L8 10a12 12 0 0 0 6 6l1.5-2.5L20 15v4c0 1-1 2-2 2A16 16 0 0 1 3 6c0-1 1-2 2-2Z" />,
    check: <path {...P} d="m4.5 12.5 5 5L19.5 7" />,
    star: <path fill={color} stroke="none" d="m12 2.8 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17l-5.6 3 1.1-6.2L3 9.4l6.2-.9L12 2.8Z" />,
    pin: <><path {...P} d="M12 21.5S5 14.7 5 9.7a7 7 0 0 1 14 0c0 5-7 11.8-7 11.8Z" /><circle {...P} cx="12" cy="9.5" r="2.4" /></>,
    badge: <><path {...P} d="M12 2.5 14.5 5h3.6l.4 3.6L21 12l-2.5 3.4-.4 3.6h-3.6L12 21.5 9.5 19H5.9l-.4-3.6L3 12l2.5-3.4L5.9 5h3.6L12 2.5Z" /><path {...P} d="m9 12 2 2 4-4" /></>,
    play: <path fill={color} stroke="none" d="M8 5.5v13l11-6.5L8 5.5Z" />,
    plus: <path {...P} d="M12 5v14M5 12h14" />,
    search: <><circle {...P} cx="10.5" cy="10.5" r="6.5" /><path {...P} d="m15.5 15.5 5 5" /></>,
    dollar: <path {...P} d="M12 2.5v19M16.5 6.5c-.8-1.3-2.4-2-4.5-2-2.5 0-4.5 1.3-4.5 3.4 0 4.6 9 2.6 9 7.2 0 2.1-2 3.4-4.5 3.4-2.1 0-3.7-.7-4.5-2" />,
    arrowRight: <path {...P} d="M4 12h16m0 0-6-6m6 6-6 6" />,
    x: <path {...P} d="M6 6l12 12M18 6 6 18" />,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0, display: "block", ...style }} aria-hidden="true">{paths[name]}</svg>;
}

// ── Small components ─────────────────────────────────────────────────────────
function Avatar({ initials, size = 40, premium = false }) {
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg, ${C.orange}4D, ${C.blue}3A)`, border: `2px solid ${premium ? C.orange : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.34, fontWeight: 800, color: C.orange }} className="display">
       <span style={{ color: C.white, fontWeight: 800, fontSize: size * 0.34 }}>{initials}</span> 
      </div>
      {premium && (
        <div style={{ position: "absolute", bottom: -3, right: -3, width: size * 0.36, height: size * 0.36, minWidth: 14, minHeight: 14, background: C.orange, borderRadius: "50%", border: `2px solid ${C.bg}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="star" size={size * 0.2} color="#14100A" />
        </div>
      )}
    </div>
  );
}

function Badge({ text, color = C.orange, icon }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: `${color}1A`, color, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
      {icon && <Icon name={icon} size={11} color={color} />}{text}
    </span>
  );
}

function Stars({ rating }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }} aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map(i => <Icon key={i} name="star" size={12} color={i <= Math.round(rating) ? C.orange : C.border} />)}
      <span style={{ color: C.dim, fontSize: 12, marginLeft: 3, fontWeight: 700 }}>{rating.toFixed(1)}</span>
    </span>
  );
}

// ── Pablo ────────────────────────────────────────────────────────────────────
function Pablo({ size = 96 }) {
  return (
    <svg width={size} height={size * 1.1} viewBox="270 60 175 195" aria-hidden="true" style={{ flexShrink: 0, display: "block" }}>
      <rect x="288" y="168" width="16" height="58" rx="8" fill="#2C4E8A" />
      <rect x="376" y="168" width="16" height="58" rx="8" fill="#2C4E8A" />
      <circle cx="296" cy="230" r="9" fill="#D6A278" />
      <rect x="302" y="158" width="76" height="86" rx="15" fill="#2C4E8A" />
      <rect x="305" y="163" width="21" height="78" rx="6" fill="#E8862E" />
      <rect x="354" y="163" width="21" height="78" rx="6" fill="#E8862E" />
      <rect x="305" y="196" width="21" height="6" fill="#F7D9B8" />
      <rect x="354" y="196" width="21" height="6" fill="#F7D9B8" />
      <rect x="332" y="148" width="16" height="14" fill="#C08C63" />
      <circle cx="340" cy="120" r="34" fill="#D6A278" />
      <path d="M308 96 A 32 30 0 0 1 372 96 Z" fill="#E8862E" />
      <path d="M336 68 L 344 68 L 344 96 L 336 96 Z" fill="#FF8A1E" />
      <ellipse cx="340" cy="96" rx="52" ry="9" fill="#FF8A1E" />
      <circle cx="329" cy="120" r="3.5" fill="#0B1220" />
      <circle cx="353" cy="120" r="3.5" fill="#0B1220" />
      <path d="M323 133 Q 331 130 340 136 Q 349 130 357 133 Q 350 143 340 141 Q 330 143 323 133 Z" fill="#0B1220" />
      <path d="M333 152 Q 340 157 347 152" stroke="#B07A4E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <rect x="384" y="188" width="48" height="58" rx="4" fill="#F2EDE4" />
      <rect x="399" y="183" width="18" height="9" rx="2" fill="#8894A8" />
      <rect x="392" y="204" width="32" height="3.5" rx="1.75" fill="#B9C2CF" />
      <rect x="392" y="215" width="32" height="3.5" rx="1.75" fill="#B9C2CF" />
      <rect x="392" y="226" width="20" height="3.5" rx="1.75" fill="#B9C2CF" />
      <circle cx="386" cy="228" r="9" fill="#D6A278" />
    </svg>
  );
}

function SectionHead({ eyebrow, title, sub }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div className="eyebrow" style={{ marginBottom: 4 }}>{eyebrow}</div>
      <div className="display" style={{ fontWeight: 800, fontSize: 24, color: C.white, lineHeight: 1.1 }}>{title}</div>
      {sub && <div style={{ fontSize: 13, color: C.dim, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function VideoEmbed({ url, title }) {
  return (
    <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: 10, overflow: "hidden", border: `1px solid ${C.border}` }}>
      <iframe src={url} title={title} loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }} allowFullScreen />
    </div>
  );
}

// ── Feed post ────────────────────────────────────────────────────────────────
function FeedPost({ post, contractor, onProfile }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showComment, setShowComment] = useState(false);

  return (
    <article className="hover-card fade-in" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, marginBottom: 16, overflow: "hidden" }}>
      <div style={{ padding: "16px 16px 12px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => onProfile(contractor)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} aria-label={`View ${contractor.name}'s profile`}>
          <Avatar initials={contractor.avatar} size={44} premium={contractor.premium} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => onProfile(contractor)} style={{ background: "none", border: "none", fontWeight: 800, fontSize: 14, color: C.white, cursor: "pointer", padding: 0 }}>{contractor.name}</button>
            {contractor.verified && <Badge text={contractor.license ? "Licensed" : "Verified"} color={contractor.license ? C.green : C.blue} icon="badge" />}
            {contractor.premium && <Badge text="Premium" color={C.orange} icon="star" />}
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{contractor.company} · {contractor.trade}</div>
        </div>
        {post.isJob && <Badge text="Hiring" color={C.blue} />}
        {post.isVideo && <Badge text="Video" color={C.purple} icon="play" />}
      </div>

      <div style={{ padding: "0 16px 14px" }}>
        <h3 style={{ fontWeight: 800, fontSize: 15.5, color: C.white, marginBottom: 8, lineHeight: 1.3 }}>{post.title}</h3>
        <p style={{ fontSize: 13.5, color: C.dim, lineHeight: 1.6, marginBottom: 12 }}>{post.description}</p>

        {post.isVideo && (
          contractor.videoUrl ? (
            <div style={{ marginBottom: 12 }}>
              <VideoEmbed url={contractor.videoUrl} title={contractor.videoTitle} />
              <div style={{ fontWeight: 700, fontSize: 13, color: C.white, marginTop: 8 }}>{contractor.videoTitle}</div>
            </div>
          ) : (
            <div style={{ background: C.panel, borderRadius: 12, padding: 18, display: "flex", alignItems: "center", gap: 14, marginBottom: 12, border: `1px solid ${C.border}` }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: `${C.orange}1E`, border: `2px solid ${C.orange}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="play" size={20} color={C.orange} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: C.white }}>{contractor.videoTitle}</div>
                <div style={{ fontSize: 11.5, color: C.muted, marginTop: 3 }}>Video coming soon</div>
              </div>
            </div>
          )
        )}

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {post.tags.map(t => <span key={t} style={{ fontSize: 11, color: C.blue, background: `${C.blue}14`, padding: "3px 9px", borderRadius: 20, fontWeight: 600 }}>#{t}</span>)}
        </div>

        <div style={{ display: "flex", gap: 4, borderTop: `1px dashed ${C.line}`, paddingTop: 10 }}>
          {[
            { icon: "heart", label: post.likes + (liked ? 1 : 0), on: liked, action: () => setLiked(v => !v), aria: "Like" },
            { icon: "comment", label: post.comments, on: showComment, action: () => setShowComment(v => !v), aria: "Comment" },
            { icon: "bookmark", label: post.saves + (saved ? 1 : 0), on: saved, action: () => setSaved(v => !v), aria: "Save" },
            { icon: "share", label: "Share", action: () => { if (navigator.share) { navigator.share({ title: "BuildBridge FL", url: "https://buildbridgefl.com" }); } else { navigator.clipboard.writeText("https://buildbridgefl.com"); alert("Link copied!"); } }, aria: "Share" },
          ].map(({ icon, label, on, action, aria }) => (
            <button key={aria} onClick={action} aria-label={aria} style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", color: on ? C.orange : C.muted, fontSize: 12.5, fontWeight: 700, cursor: "pointer", padding: "6px 10px", borderRadius: 8 }}>
              <Icon name={icon} size={16} color={on ? C.orange : C.muted} /><span>{label}</span>
            </button>
          ))}
        </div>

        {showComment && (
  <div style={{ marginTop: 10 }}>
    {(post.commentsList || []).map((cm, i) => (
      <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "flex-start" }}>
        <Avatar initials={cm.avatar} size={28} />
        <div style={{ background: C.panel, borderRadius: 10, padding: "8px 12px", flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.white }}>{cm.author}</div>
          <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.5 }}>{cm.text}</div>
        </div>
      </div>
    ))}
    <div style={{ display: "flex", gap: 8 }}>
          
            <input placeholder="Add a comment…" aria-label="Add a comment" style={{ flex: 1, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", color: C.text, fontSize: 13, outline: "none" }} />
            <button className="btn-primary" style={{ padding: "9px 16px", fontSize: 12 }}>Post</button>
          </div>
      </div>
      )}
      </div>
    </article>
  );
}
function ReviewForm({ contractor, onToast }) {
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(5);
  const [project, setProject] = useState("");
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  if (sent) return <div style={{ background: C.card, border: `1px solid ${C.green}44`, borderRadius: 12, padding: 20, textAlign: "center", fontSize: 13, color: C.dim }}>Thanks — your review is in the queue. We check every review before it goes live.</div>;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
      <div style={{ fontWeight: 800, fontSize: 15, color: C.white, marginBottom: 4 }}>Leave a review</div>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>Worked with {contractor.name.split(" ")[0]}? Tell other homeowners how it went.</div>
      <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 12 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <button key={i} onClick={() => setRating(i)} aria-label={`${i} star${i > 1 ? "s" : ""}`} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
            <Icon name="star" size={24} color={i <= rating ? C.orange : C.border} />
          </button>
        ))}
        <span style={{ fontSize: 12.5, color: C.dim, marginLeft: 6, fontWeight: 700 }}>{rating}.0</span>
      </div>
      <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Your name *" aria-label="Your name" style={{ width: "100%", background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", color: C.text, fontSize: 13, outline: "none", marginBottom: 8 }} />
      <input value={project} onChange={e => setProject(e.target.value)} placeholder="What was the job? (e.g. Water heater install)" aria-label="Project" style={{ width: "100%", background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", color: C.text, fontSize: 13, outline: "none", marginBottom: 8 }} />
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder="How did it go? Quality, communication, timeline, price…" aria-label="Your review" style={{ width: "100%", background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", color: C.text, fontSize: 13, resize: "vertical", minHeight: 90, fontFamily: "inherit", outline: "none", marginBottom: 12 }} />
      <button className="btn-primary" style={{ width: "100%", padding: 12, fontSize: 13.5 }} onClick={async () => {
        if (!author.trim() || !text.trim()) { onToast && onToast("Please add your name and a few words"); return; }
        track("review_submit", contractor.company);
        const ok = await submitReview({ contractor_id: contractor.id, author, rating, project, text });
        if (ok) { setSent(true); } else { onToast && onToast("Hmm, that didn't send — try again in a minute."); }
      }}>Submit review</button>
    </div>
  );
}


// ── Contractor profile ───────────────────────────────────────────────────────
function ContractorProfile({ contractor, reviews, roster = [], onSelect, onBack, onToast, onTrust, onClaim }) {
  const [tab, setTab] = useState("portfolio");
  const myReviews = reviews.filter(r => r.contractorId === contractor.id);
  const tel = contractor.phone?.replace(/\D/g, "");
  const idx = roster.findIndex(c => c.id === contractor.id);
  const canNav = idx >= 0 && roster.length > 1 && !!onSelect;
  const touchX = useRef(0);
  const go = step => {
    if (!canNav) return;
    setTab("portfolio");
    onSelect(roster[(idx + step + roster.length) % roster.length]);
  };

  return (
    <div className="fade-in"
      onTouchStart={e => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={e => { const dx = e.changedTouches[0].clientX - touchX.current; if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1); }}>
      <div style={{ background: `linear-gradient(135deg, ${C.panel}, ${C.line})`, height: 84, borderRadius: 16, border: `1px solid ${C.border}`, position: "relative", marginBottom: 18 }}>
        <div style={{ position: "absolute", top: 14, left: 14, display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={onBack} className="btn-ghost" style={{ padding: "6px 14px", fontSize: 13, background: `${C.bg}CC` }}>← Back</button>
          {canNav && <button onClick={() => go(-1)} aria-label="Previous contractor" className="btn-ghost" style={{ padding: "6px 12px", fontSize: 15, background: `${C.bg}CC` }}>‹</button>}
          {canNav && <button onClick={() => go(1)} aria-label="Next contractor" className="btn-ghost" style={{ padding: "6px 12px", fontSize: 15, background: `${C.bg}CC` }}>›</button>}
          {canNav && <span style={{ fontSize: 11.5, color: C.muted, fontWeight: 600 }}>{idx + 1} of {roster.length}</span>}
        </div>
        <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 8 }}>
          {contractor.premium && <Badge text="Premium Pro" color={C.orange} icon="star" />}
          {contractor.verified && <Badge text="Verified" color={C.green} icon="badge" />}
        </div>
      </div>

      <div style={{ padding: "0 6px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 14, marginBottom: 18, paddingLeft: 12 }}>
          <Avatar initials={contractor.avatar} size={76} premium={contractor.premium} />
          <div style={{ flex: 1, paddingBottom: 4, minWidth: 0 }}>
            <div className="display" style={{ fontWeight: 800, fontSize: 22, color: C.white, lineHeight: 1.25 }}>{contractor.name}</div>
            <div style={{ fontSize: 13, color: C.dim, marginTop: 2 }}>{contractor.company} · {contractor.trade}</div>
          </div>
        </div>

        {/* Contact strip — the actions that make the phone ring */}
        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
         <a href={`tel:${tel}`} onClick={() => track("call_click", contractor.company)} className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 18px", fontSize: 13, textDecoration: "none" }}>
            <Icon name="phone" size={15} color="#14100A" /> Call {contractor.phone}
          </a>
          <button onClick={() => setTab("contact")} className="btn-ghost" style={{ padding: "10px 18px", fontSize: 13 }}>Message</button>
          <FollowButton contractor={contractor} onToast={onToast} />
          {contractor.website && <a href={`${contractor.website}?utm_source=buildbridge&utm_medium=profile`} target="_blank" rel="noopener" onClick={() => track("website_click", contractor.company)} className="btn-ghost" style={{ padding: "10px 18px", fontSize: 13, textDecoration: "none" }}>Website</a>} 
        </div>

       {contractor.claimed === false && (
          <div style={{ background: C.card, border: `1px solid ${C.blue}55`, borderLeft: `4px solid ${C.blue}`, borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.white, marginBottom: 4 }}>This listing hasn't been claimed yet</div>
          <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.55, marginBottom: 12 }}>We built this page from public record — license and business registration verified. {contractor.company} hasn't added their own details yet.</div>
            {onClaim && <button onClick={() => onClaim(contractor)} className="btn-primary" style={{ padding: "9px 18px", fontSize: 12.5 }}>Is this your business? Claim it</button>}
          </div>  
        )}

        {contractor.claimed !== false && (
        <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
          {[["Rating", contractor.rating.toFixed(1)], ["Jobs done", contractor.jobs], ["Followers", <LiveFollowers id={contractor.id} fallback={contractor.followers} />], ["Reviews", contractor.reviews]].map(([label, val]) => (
            <div key={label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
              <div className="display" style={{ fontWeight: 800, fontSize: 20, color: C.orange }}>{val}</div>
              <div style={{ fontSize: 10.5, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>{label}</div>
            </div>
         ))}
        </div>
        )}

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 14 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>About</div>
          <p style={{ fontSize: 13.5, color: C.dim, lineHeight: 1.65, marginBottom: 12 }}>{contractor.bio}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {contractor.specialties.map(s => <Badge key={s} text={s} color={C.blue} />)}
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12.5, color: C.dim }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon name="pin" size={14} color={C.muted} />{contractor.location}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <Icon name="badge" size={14} color={C.muted} />
             {contractor.license === "N/A" ? "License: N/A" : <>License <a href={`https://www.myfloridalicense.com/wl11.asp?mode=2&search=LicNbr&SID=&brd=&typ=&lic=${contractor.license}`} target="_blank" rel="noreferrer" style={{ color: C.blue, fontWeight: 700 }}>{contractor.license}</a> · <span onClick={onTrust} style={{ color: C.blue, cursor: "pointer", textDecoration: "underline" }}>verify at FL DBPR</span></>}
              {" · "}<a href={`https://search.sunbiz.org/Inquiry/CorporationSearch/SearchResults?inquiryType=EntityName&searchTerm=${encodeURIComponent(contractor.company || "")}`} target="_blank" rel="noreferrer" onClick={() => track("sunbiz_verify_click", contractor.company)} style={{ color: C.blue, textDecoration: "underline" }}>Sunbiz record</a>
            </span>
          </div>
        </div>

      {(() => {
  const vids = contractor.videos && contractor.videos.length
    ? contractor.videos
    : (contractor.videoUrl ? [{ url: contractor.videoUrl, title: contractor.videoTitle }] : []);
  return vids.length > 0 && (
    <div style={{ background: C.card, border: `1px solid ${C.purple}44`, borderRadius: 14, padding: 16, marginBottom: 14 }}>
      <div className="eyebrow" style={{ color: C.purple, marginBottom: 10 }}>Featured video{vids.length > 1 ? "s" : ""}</div>
      {vids.map((v, i) => (
        <div key={i} style={{ marginBottom: i < vids.length - 1 ? 20 : 0 }}>
          <VideoEmbed url={v.url} title={v.title} />
          <div style={{ fontWeight: 800, fontSize: 14, color: C.white, marginTop: 10 }}>{v.title}</div>
          <div style={{ fontSize: 12, color: C.purple, marginTop: 3 }}>Featured on BuildBridge</div>
        </div>
      ))}
    </div>
  );
})()}
        
        

        <div role="tablist" style={{ display: "flex", gap: 4, marginBottom: 16, background: C.panel, borderRadius: 10, padding: 4, border: `1px solid ${C.border}` }}>
          {["portfolio", "reviews", "contact"].map(t => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} style={{ flex: 1, background: tab === t ? C.orange : "transparent", color: tab === t ? "#14100A" : C.muted, border: "none", borderRadius: 8, padding: "9px", fontSize: 13, fontWeight: 800, cursor: "pointer", textTransform: "capitalize" }}>{t}</button>
          ))}
        </div>

        {tab === "portfolio" && (
          <div className="portfolio-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {(contractor.projects || []).map((proj, i) => (
              <div key={proj} className="hover-card" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
                <div style={{ height: 84, background: `linear-gradient(135deg, ${[C.blue, C.green, C.red, C.purple][i]}22, ${C.panel})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name={["home", "hammer", "clipboard", "sparkles"][i]} size={30} color={`${C.text}66`} />
                </div>
                <div style={{ padding: "10px 12px" }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: C.white }}>{proj}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{contractor.location}</div>
                </div>
              </div>
            ))}
            {(!contractor.projects || contractor.projects.length === 0) && (
          <div style={{ gridColumn: "1 / -1", padding: 24, textAlign: "center", color: C.muted, fontSize: 13 }}>No projects posted yet — check back soon.</div>
          )}
          </div>
        )}

        {tab === "reviews" && (
          myReviews.length > 0 ? myReviews.map(r => (
            <div key={r.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: C.white }}>{r.author}</div>
                <Stars rating={r.rating} />
              </div>
              <div style={{ fontSize: 11.5, color: C.muted, marginBottom: 8 }}>{r.project} · {r.date}</div>
              <p style={{ fontSize: 13.5, color: C.dim, lineHeight: 1.6, fontStyle: "italic" }}>"{r.text}"</p>
            </div>
          )) : (
           <div style={{ textAlign: "center", padding: 40, color: C.muted, fontSize: 13, background: C.card, borderRadius: 12, border: `1px dashed ${C.line}`, marginBottom: 14 }}>
              No reviews yet. Hire {contractor.name.split(" ")[0]} and be the first to leave one.
            </div>
          )
        )}
{tab === "reviews" && <ReviewForm contractor={contractor} onToast={onToast} />}
        {tab === "contact" && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: C.white, marginBottom: 14 }}>Send a message</div>
            <textarea placeholder={`Describe your project for ${contractor.name.split(" ")[0]} — what, where, and roughly when…`} aria-label="Project description" style={{ width: "100%", background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: 12, color: C.text, fontSize: 13, resize: "vertical", minHeight: 100, fontFamily: "inherit", outline: "none", marginBottom: 12 }} />
            <button onClick={() => (track("message_click", contractor.company), contractor.email ?window.location.href = `mailto:${contractor.email}?subject=BuildBridge Lead — ${contractor.trade} Inquiry` : onToast(`Call ${contractor.phone} to reach ${contractor.name.split(" ")[0]}`))}  className="btn-primary" style={{ width: "100%", padding: 12, fontSize: 14 }}>Send message</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Coverage finder (map-first front door) ─────────────────────────────────── 
// ── Leaflet loader (CDN, no package.json change) ─────────────────────────────
function useLeaflet() {
  const [ready, setReady] = useState(typeof window !== "undefined" && !!window.L);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!document.getElementById("leaflet-theme")) {
      const st = document.createElement("style");
      st.id = "leaflet-theme";
      st.textContent = `
        .leaflet-control-zoom a{background:rgba(11,18,32,.92)!important;color:#FF8A1E!important;border:1px solid rgba(255,255,255,.22)!important;font-weight:800!important;box-shadow:0 2px 8px rgba(0,0,0,.5)!important}
        .leaflet-control-zoom a:hover{background:#E8862E!important;color:#14100A!important}
        .leaflet-control-attribution{background:rgba(0,0,0,.55)!important;color:#e8e8e8!important;font-size:9.5px!important}
        .leaflet-control-attribution a{color:#9fb2d0!important}
        .leaflet-popup-content-wrapper,.leaflet-popup-tip{background:#fff;border-radius:10px}
      `;
      document.head.appendChild(st);
    }
    if (window.L) { setReady(true); return; }
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css"; link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    let s = document.getElementById("leaflet-js");
    if (!s) {
      s = document.createElement("script");
      s.id = "leaflet-js";
      s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      s.async = true;
      document.body.appendChild(s);
    }
    const onLoad = () => setReady(true);
    s.addEventListener("load", onLoad);
    return () => s.removeEventListener("load", onLoad);
  }, []);
  return ready;
}

// ── Coverage map ─────────────────────────────────────────────────────────────
function CoverageMap({ results, townObj }) {
  const ready = useLeaflet();
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);   const tileRef = useRef(null); const satRef = useRef(null); const [sat, setSat] = useState(false);   const SAT_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";   const LBL_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}";   const isLight = C.bg === LIGHT.bg;   useEffect(() => { if (!tileRef.current || !mapRef.current) return; if (sat) { tileRef.current.setUrl(SAT_URL); if (!satRef.current) satRef.current = window.L.tileLayer(LBL_URL, { maxZoom: 19 }).addTo(mapRef.current); return; } if (satRef.current) { mapRef.current.removeLayer(satRef.current); satRef.current = null; } tileRef.current.setUrl(`https://{s}.basemaps.cartocdn.com/${isLight ? "light_all" : "dark_all"}/{z}/{x}/{y}{r}.png`); }, [isLight, sat]);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!ready || !elRef.current || mapRef.current) return;
    const L = window.L;
    const map = L.map(elRef.current, { scrollWheelZoom: false, zoomControl: true }).setView([28.87, -82.45], 9);
    tileRef.current = L.tileLayer(`https://{s}.basemaps.cartocdn.com/${isLight ? "light_all" : "dark_all"}/{z}/{x}/{y}{r}.png`, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a> &copy; <a href="https://www.esri.com/">Esri</a>, Maxar',
      maxZoom: 19, subdomains: "abcd"
    }).addTo(map);
    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);
    setTimeout(() => map.invalidateSize(), 60);
  }, [ready]);

  useEffect(() => {
    if (!ready || !mapRef.current || !layerRef.current) return;
    const L = window.L;
    const map = mapRef.current;
    layerRef.current.clearLayers();
    const pts = [];

    if (townObj) {
      const jobIcon = L.divIcon({
        className: "",
        html: `<div style="width:20px;height:20px;border-radius:50%;background:#2f6b3f;border:3px solid #fff;box-shadow:0 0 0 4px rgba(47,107,63,.35)"></div>`,
        iconSize: [20, 20], iconAnchor: [10, 10]
      });
      L.marker([townObj.lat, townObj.lng], { icon: jobIcon, zIndexOffset: 500 })
        .bindPopup(`<b>${townObj.name}</b><br/>Your job site`)
        .addTo(layerRef.current);
      pts.push([townObj.lat, townObj.lng]);
    }

    results.forEach(c => {
      if (c.lat == null || c.lng == null) return;
      const icon = L.divIcon({
        className: "",
        html: `<div style="min-width:30px;height:30px;padding:0 5px;border-radius:15px;background:#E8862E;border:2px solid #14100A;color:#14100A;font:800 11px/26px system-ui,sans-serif;text-align:center;box-shadow:0 2px 6px rgba(0,0,0,.5)">${c.avatar || "?"}</div>`,
        iconSize: [30, 30], iconAnchor: [15, 15]
      });
      const tel = (c.phone || "").replace(/\D/g, "");
      L.marker([c.lat, c.lng], { icon })
        .bindPopup(
          `<div style="font:600 13px system-ui,sans-serif;min-width:150px">` +
          `<b style="font-size:14px">${c.company}</b><br/>` +
          `<span style="color:#555">${c.trade || ""}</span><br/>` +
          (c.d == null ? "" : `<span style="color:#555">${Math.round(c.d)} mi from ${townObj ? townObj.name : "you"}</span><br/>`) +
          (tel ? `<a href="tel:${tel}" style="display:inline-block;margin-top:6px;background:#E8862E;color:#14100A;padding:5px 12px;border-radius:6px;text-decoration:none;font-weight:800">Call</a>` : "") +
          `</div>`
        )
        .addTo(layerRef.current);
      pts.push([c.lat, c.lng]);
    });

    if (townObj) map.setView([townObj.lat, townObj.lng], 10);     else if (pts.length > 1) map.fitBounds(L.latLngBounds(pts).pad(0.25));
    else if (pts.length === 1) map.setView(pts[0], 11);
    setTimeout(() => map.invalidateSize(), 60);
  }, [ready, results, townObj]);

  const zoomToTown = () => {
    const map = mapRef.current;
    if (!map || !townObj) return;
    track("coverage_map_zoom", townObj.name);
    map.setView([townObj.lat, townObj.lng], 12, { animate: true });
    setFocused(true);
  };

  const showRegion = () => {
    const map = mapRef.current;
    const L = window.L;
    if (!map || !L) return;
    const pts = results.filter(c => c.lat != null && c.lng != null).map(c => [c.lat, c.lng]);
    if (townObj) pts.push([townObj.lat, townObj.lng]);
    if (pts.length > 1) map.fitBounds(L.latLngBounds(pts).pad(0.25), { animate: true });
    else if (pts.length === 1) map.setView(pts[0], 11, { animate: true });
    setFocused(false);
  };

  const zoomBtn = { background: C.card, color: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 12px", fontSize: 11.5, fontWeight: 800, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,.45)", whiteSpace: "nowrap" };

  return (
    <div style={{ position: "relative", marginBottom: 12 }}>
      <div ref={elRef} style={{ height: 300, width: "100%", borderRadius: 12, border: `1px solid ${C.border}`, background: C.panel, zIndex: 0 }} />
      {!ready && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: C.muted, pointerEvents: "none" }}>Loading map…</div>
      )}
      {ready && townObj && (
        <div style={{ position: "absolute", left: 10, bottom: 10, display: "flex", gap: 6, zIndex: 400 }}>
          <button onClick={zoomToTown} style={{ ...zoomBtn, background: focused ? C.orange : C.card, color: focused ? "#14100A" : C.white, borderColor: focused ? C.orange : C.border }}>Zoom to {townObj.name}</button>
          <button onClick={showRegion} style={{ ...zoomBtn, background: !focused ? C.orange : C.card, color: !focused ? "#14100A" : C.white, borderColor: !focused ? C.orange : C.border }}>Whole region</button>           <button onClick={() => { track("coverage_map_basemap", sat ? "map" : "satellite"); setSat(!sat); }} style={{ ...zoomBtn, background: sat ? C.orange : C.card, color: sat ? "#14100A" : C.white, borderColor: sat ? C.orange : C.border }}>{sat ? "Map" : "Satellite"}</button>          
        </div>
      )}
    </div>
  );


}  // ── Coverage gap report (admin: add ?gaps=1 to the URL) ──────────────────────
function CoverageGaps({ roster }) {
  const trades = useMemo(() => [...new Set(roster.map(c => tradeBucket(c.trade)))].sort(), [roster]);
  const grid = useMemo(() => TOWNS.map(t => {
    const covering = roster
      .map(c => ({ ...c, d: milesBetween(t.lat, t.lng, c.lat, c.lng) }))
      .filter(c => c.d == null || c.d <= (c.serviceRadiusMiles || 50));
    const counts = {};
    trades.forEach(tr => { counts[tr] = covering.filter(c => tradeBucket(c.trade) === tr).length; });
    return { town: t.name, counts, total: covering.length };
  }), [roster, trades]);

  const holes = [];
  grid.forEach(row => trades.forEach(tr => { if (row.counts[tr] === 0) holes.push({ town: row.town, trade: tr }); }));
  const byTrade = {};
  holes.forEach(h => { byTrade[h.trade] = (byTrade[h.trade] || 0) + 1; });
  const ranked = Object.entries(byTrade).sort((a, b) => b[1] - a[1]);

  const th = { padding: "6px 8px", fontSize: 10, fontWeight: 800, color: C.muted, textAlign: "center", whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: ".04em" };
  const td = n => ({ padding: "6px 8px", fontSize: 12, fontWeight: 800, textAlign: "center", color: n === 0 ? "#ff6b6b" : n === 1 ? "#E8862E" : C.green, background: n === 0 ? "rgba(255,107,107,.10)" : "transparent" });

  return (
    <div style={{ background: C.card, border: `1px solid ${C.orange}55`, borderRadius: 14, padding: 18, marginBottom: 20 }}>
      <div className="eyebrow" style={{ color: C.orange, marginBottom: 4 }}>Internal · recruiting</div>
      <div className="display" style={{ fontWeight: 800, fontSize: 20, color: C.white, marginBottom: 4 }}>Coverage gaps</div>
      <div style={{ fontSize: 12.5, color: C.dim, marginBottom: 14, lineHeight: 1.5 }}>
        {roster.length} contractors across {trades.length} trades. Red cells are towns with nobody in that trade — {holes.length} gap{holes.length !== 1 ? "s" : ""} total.
      </div>

      {ranked.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Recruit these first</div>
          {ranked.slice(0, 6).map(([tr, n]) => (
            <div key={tr} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", background: C.panel, border: `1px solid ${C.line}`, borderRadius: 8, marginBottom: 5, fontSize: 12.5 }}>
              <span style={{ color: C.white, fontWeight: 700 }}>{tr}</span>
              <span style={{ color: n === TOWNS.length ? "#ff6b6b" : C.muted, fontWeight: 700 }}>
                {n === TOWNS.length ? "no coverage anywhere" : `missing in ${n} of ${TOWNS.length} towns`}
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 520 }}>
          <thead>
            <tr>
              <th style={{ ...th, textAlign: "left" }}>Town</th>
              {trades.map(tr => <th key={tr} style={th}>{tr}</th>)}
            </tr>
          </thead>
          <tbody>
            {grid.map(row => (
              <tr key={row.town} style={{ borderTop: `1px solid ${C.line}` }}>
                <td style={{ padding: "6px 8px", fontSize: 12, fontWeight: 700, color: C.white, whiteSpace: "nowrap" }}>{row.town}</td>
                {trades.map(tr => <td key={tr} style={td(row.counts[tr])}>{row.counts[tr]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function tradeBucket(trade) {
  const t = (trade || "").toLowerCase();
  const alias = [["hvac","HVAC"],["air condition","HVAC"],["heating","HVAC"],["cooling","HVAC"],["roof","Roofing"],["plumb","Plumbing"],["electric","Electrical"],["pest","Pest Control"],["termite","Pest Control"],["irrigation","Irrigation"],["sprinkler","Irrigation"],["landscap","Landscaping"],["lawn","Landscaping"],["junk","Junk Removal"],["debris","Junk Removal"],["haul","Junk Removal"],["garage","Garage Doors"],["cabinet","Cabinets"],["fence","Fencing"],["tile","Tile & Masonry"],["masonry","Tile & Masonry"],["concrete","Tile & Masonry"],["general contractor","General Contractor"]];
  const a = alias.find(([k]) => t.includes(k));
  return a ? a[1] : (trade || "General").split(/[,&\/]/)[0].trim();
}

function CoverageFinder({ roster, onProfile }) {   const [town, setTown] = useState(null); const [trade, setTrade] = useState(null); const t = TOWNS.find(x => x.name === town);   const inTown = !t ? [] : roster     .map(c => ({ ...c, d: milesBetween(t.lat, t.lng, c.lat, c.lng) }))     .filter(c => c.d == null || c.d <= (c.serviceRadiusMiles || 50))     .sort((a, b) => (a.d == null ? 9999 : a.d) - (b.d == null ? 9999 : b.d));   const tradeList = [...new Set(inTown.map(c => tradeBucket(c.trade)))].sort();   const results = trade ? inTown.filter(c => tradeBucket(c.trade) === trade) : inTown;    return (     <div style={{ background: `linear-gradient(120deg, ${C.card}, ${C.panel})`, border: `1px solid ${C.orange}55`, borderRadius: 16, padding: "18px 18px 16px", marginBottom: 18, position: "relative", overflow: "hidden" }}>       <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `repeating-linear-gradient(45deg, ${C.orange}, ${C.orange} 10px, #14100A 10px, #14100A 20px)` }} aria-hidden="true" />       <div className="eyebrow" style={{ marginBottom: 6, marginTop: 4 }}>Start here</div>       <div className="display" style={{ fontWeight: 800, fontSize: 22, color: C.white, lineHeight: 1.15, marginBottom: 6 }}>Where's the job?</div>       <div style={{ fontSize: 12.5, color: C.dim, marginBottom: 14, lineHeight: 1.5 }}>Tap your town. You'll see every verified contractor who actually covers it — not just the ones with an address nearby.</div>        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: town ? 16 : 0 }}>         {TOWNS.map(x => (           <button key={x.name} onClick={() => { track("coverage_town_click", x.name); setTrade(null); setTown(town === x.name ? null : x.name); }}             style={{ background: town === x.name ? C.orange : "transparent", color: town === x.name ? "#14100A" : C.dim, border: `1px solid ${town === x.name ? C.orange : C.border}`, borderRadius: 20, padding: "7px 13px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>{x.name}</button>         ))}       </div>        {town && (         <div className="fade-in">           <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>             <div className="eyebrow" style={{ color: C.green }}>{results.length} verified contractor{results.length !== 1 ? "s" : ""} {trade ? `for ${trade} in ${town}` : `cover ${town}`}</div>             <button onClick={() => { setTrade(null); setTown(null); }} style={{ background: "none", border: "none", color: C.muted, fontSize: 11.5, fontWeight: 700, cursor: "pointer", padding: 0 }}>Clear</button>           </div>

          <CoverageMap results={results} townObj={t} />

          {tradeList.length > 1 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
              <button onClick={() => setTrade(null)} style={{ background: !trade ? C.blue : "transparent", color: !trade ? "#14100A" : C.muted, border: `1px solid ${!trade ? C.blue : C.line}`, borderRadius: 20, padding: "5px 11px", fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>All trades</button>
              {tradeList.map(tr => (
                <button key={tr} onClick={() => { track("coverage_trade_click", tr); setTrade(trade === tr ? null : tr); }} style={{ background: trade === tr ? C.blue : "transparent", color: trade === tr ? "#14100A" : C.muted, border: `1px solid ${trade === tr ? C.blue : C.line}`, borderRadius: 20, padding: "5px 11px", fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>{tr}</button>
              ))}
            </div>
          )}            {results.length === 0 && (             <div style={{ background: C.panel, border: `1px dashed ${C.line}`, borderRadius: 12, padding: "22px 16px", textAlign: "center", fontSize: 12.5, color: C.muted, lineHeight: 1.55 }}>               Nobody on the roster covers {town} yet. We're adding verified contractors every week — try a nearby town, or browse the full network below.             </div>           )}            {results.map(c => (             <div key={c.id} className="hover-card" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, marginBottom: 8, display: "flex", gap: 11, alignItems: "center" }}>               <button onClick={() => onProfile(c)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} aria-label={`View ${c.name}'s profile`}>                 <Avatar initials={c.avatar} size={42} premium={c.premium} />               </button>               <div style={{ flex: 1, minWidth: 0 }}>                 <button onClick={() => onProfile(c)} style={{ background: "none", border: "none", fontWeight: 800, fontSize: 14, color: C.white, cursor: "pointer", padding: 0, textAlign: "left" }}>{c.company}</button>                 <div style={{ fontSize: 11.5, color: C.muted, marginTop: 1 }}>{c.trade}</div>                 <div style={{ fontSize: 11.5, color: C.blue, fontWeight: 700, marginTop: 3, display: "inline-flex", alignItems: "center", gap: 4 }}>                   <Icon name="pin" size={12} color={C.blue} />{c.d == null ? "Serves Citrus County" : `${Math.round(c.d)} mi away`}                 </div>               </div>               <a href={`tel:${c.phone?.replace(/\D/g, "")}`} onClick={() => track("coverage_call_click", c.company)} className="btn-primary" style={{ padding: "8px 14px", fontSize: 12, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>                 <Icon name="phone" size={13} color="#14100A" />Call               </a>             </div>           ))}         </div>       )}     </div>   ); }  // ── Main app ─────────────────────────────────────────────────────────────────
export default function BuildBridgeSocial() {
  const [view, setView] = useState("feed");   const [authUser, setAuthUser] = useState(null);   const [loginModal, setLoginModal] = useState(false);   const [loginEmail, setLoginEmail] = useState("");   const [myRow, setMyRow] = useState(null);   const [editForm, setEditForm] = useState({ phone: "", email: "", website: "", bio: "" });   useEffect(() => {     if (!authUser) { setMyRow(null); return; }     const token = localStorage.getItem("bb-token");     if (token) fetchMyVendorRow(token).then(rows => { setMyRow(rows); if (rows[0]) setEditForm({ phone: rows[0].phone || "", email: rows[0].email || "", website: rows[0].website || "", bio: rows[0].bio || "" }); });   }, [authUser]);   useEffect(() => {     const token = readTokenFromUrl() || localStorage.getItem("bb-token");     if (token) getUser(token).then(u => { if (u && u.email) setAuthUser(u); else localStorage.removeItem("bb-token"); });   }, []);
  const [activeProfile, setActiveProfile] = useState(null);
  const [postModal, setPostModal] = useState(false);
  const [postType, setPostType] = useState("Project");
  const [vendorModal, setVendorModal] = useState(false);   const [bidModal, setBidModal] = useState(null);   const [bidForm, setBidForm] = useState({ bidder_name: "", phone: "", email: "", bid_amount: "", message: "" });
  const [vApp, setVApp] = useState({ name: "", company: "", trade: "", phone: "", email: "", website: "", license: "", bio: "", type: "contractor" });   const [claimTarget, setClaimTarget] = useState(null);   const [claimForm, setClaimForm] = useState({ claimant_name: "", role: "", email: "", phone: "", note: "" });
  const [dbVendors, setDbVendors] = useState([]);     const [dbSuppliers, setDbSuppliers] = useState([]);
useEffect(() => {
 async function fetchVendorVideos() {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/vendor_videos?select=*&order=sort_order.asc`, { headers: sbHeaders });
    const rows = await r.json();
    const map = {};
    rows.forEach(row => {
      if (!map[row.vendor_id]) map[row.vendor_id] = [];
      map[row.vendor_id].push({ url: row.video_url, title: row.video_title });
    });
    return map;
  } catch (e) { return {}; }
}
 Promise.all([fetchApprovedVendors(), fetchVendorVideos()]).then(([vendors, videoMap]) => {
      setDbVendors(vendors.map(v => ({ ...v, videos: videoMap[v.id - 1000] || [] })));
    });
  }, []);
  useEffect(() => { fetchApprovedSuppliers().then(setDbSuppliers); }, []);

    const ALL = useMemo(() => [...CONTRACTORS, ...dbVendors], [dbVendors]);
    const ALL_SUPPLIERS = useMemo(() => [...SUPPLIERS, ...dbSuppliers], [dbSuppliers]);
  const [dbPosts, setDbPosts] = useState([]);
  useEffect(() => { fetchApprovedPosts().then(setDbPosts); }, []);   const [dbReviews, setDbReviews] = useState([]);   useEffect(() => { fetchApprovedReviews().then(setDbReviews); }, []);
  const [newPost, setNewPost] = useState("");   const [newContact, setNewContact] = useState("");
  const [toast, setToast] = useState(null);
  const [networkQuery, setNetworkQuery] = useState("");
  const [matchInput, setMatchInput] = useState("");
  const [matchBudget, setMatchBudget] = useState("");
  const [matchTimeline, setMatchTimeline] = useState("");   const [matchTown, setMatchTown] = useState("");
  const [matchResults, setMatchResults] = useState(null); // null = not searched yet
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchSummary, setMatchSummary] = useState("");

  const [theme, setTheme] = useState(() => localStorage.getItem("bb-theme") || "dark");   useEffect(() => { Object.assign(C, theme === "light" ? LIGHT : DARK); }, [theme]);   const toggleTheme = () => { const next = theme === "light" ? "dark" : "light"; Object.assign(C, next === "light" ? LIGHT : DARK); localStorage.setItem("bb-theme", next); setTheme(next); };   const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 2500); };
  const openProfile = c => { setActiveProfile(c); setView("profile"); };
  const goView = id => { setView(id); setActiveProfile(null); };   const [coverageMode, setCoverageMode] = useState(() => new URLSearchParams(window.location.search).get("coverage") === "1");

  const filteredNetwork = useMemo(() => {
    const q = networkQuery.trim().toLowerCase();
    if (!q) return ALL.filter(c => !c.hidden);
    return ALL.filter(c => !c.hidden && [c.name, c.company, c.trade, c.location, ...c.specialties].join(" ").toLowerCase().includes(q));
  }, [networkQuery, ALL]);

 const applyDistance = list => {
    const town = TOWNS.find(t => t.name === matchTown);
    if (!town) return list;
    return list
      .map(c => ({ ...c, distanceMiles: milesBetween(town.lat, town.lng, c.lat, c.lng) }))
      .filter(c => c.distanceMiles == null || c.distanceMiles <= (c.serviceRadiusMiles || 50))
      .sort((a, b) => {
        if (a.distanceMiles == null) return 1;
        if (b.distanceMiles == null) return -1;
        return a.distanceMiles - b.distanceMiles;
      });
  };

  const keywordFallback = () => {
    const scored = scoreContractors(matchInput, ALL.filter(c => !c.hidden));
    const base = scored.length > 0 ? scored : ALL.filter(c => !c.hidden).sort((a, b) => b.rating - a.rating);
    setMatchResults(applyDistance(base));
    setMatchSummary("");
  };

  const runMatch = async () => {
    if (!matchInput.trim()) { showToast("Describe your project first"); return; }
    setMatchLoading(true);
    setMatchResults(null);
    setMatchSummary("");
    try {
      const r = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: matchInput,
          budget: matchBudget,
          timeline: matchTimeline,
          contractors: ALL.filter(c => !c.hidden).map(({ id, name, company, trade, specialties, location, rating, jobs, verified }) => ({ id, name, company, trade, specialties, location, rating, jobs, verified })),
        }),
      });
      if (!r.ok) throw new Error("api");
      const data = await r.json();
      const matched = (data.matches || [])
        .map(m => {
          const c = ALL.find(x => x.id === m.id && !x.hidden);
          return c ? { ...c, reasons: m.reason ? [m.reason] : [] } : null;
        })
        .filter(Boolean);
      if (matched.length === 0) throw new Error("empty");
      setMatchResults(applyDistance(matched));
      setMatchSummary(data.summary || "");
    } catch {
      keywordFallback(); // API down or no key set — keyword matcher still works
    } finally {
      setMatchLoading(false);
    }
  };

  if (coverageMode) return <div style={{ background: C.bg, minHeight: "100vh", padding: 20 }}><CoverageDashboard roster={ALL.filter(c => !c.hidden)} onBack={() => { window.history.replaceState(null, "", window.location.pathname); setCoverageMode(false); }} /></div>;    const navItems = [
  { id: "feed", icon: "home", label: "Feed" },
{ id: "match", icon: "sparkles", label: "AI Match" },
{ id: "jobs", icon: "hammer", label: "Find Work" },
{ id: "projects", icon: "clipboard", label: "Projects" },
{ id: "network", icon: "users", label: "Network" },
{ id: "permits", icon: "clipboard", label: "Permits" },
{ id: "suppliers", icon: "truck", label: "Suppliers" }, { id: "myprofile", icon: "clipboard", label: "My Profile" },  
  ];

  const NavButtons = ({ vertical = false }) =>
    navItems.map(n => {
      const active = view === n.id || (view === "profile" && n.id === "feed");
      return (
        <button key={n.id} onClick={() => goView(n.id)} className="nav-btn" aria-label={n.label} aria-current={active ? "page" : undefined}
          style={{ background: active ? `${C.orange}18` : "transparent", color: active ? C.orange : C.muted, border: "none", padding: vertical ? "8px 14px" : "6px 12px", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <Icon name={n.icon} size={19} color={active ? C.orange : C.muted} />
          <span style={{ fontSize: 9.5, letterSpacing: "0.04em" }}>{n.label}</span>
        </button>
      );
    });

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{makeCss()}</style>
      <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;800&family=Barlow+Condensed:wght@700;800&display=swap" rel="stylesheet" />

      {toast && (
        <div role="status" style={{ position: "fixed", top: 74, left: "50%", transform: "translateX(-50%)", background: C.green, color: "#08120B", padding: "10px 20px", borderRadius: 10, fontWeight: 800, fontSize: 13, zIndex: 1000, boxShadow: "0 6px 24px rgba(0,0,0,0.45)", display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="check" size={15} color="#08120B" />{toast}
        </div>
      )}

      {/* Header */}
      <header style={{ background: `${C.panel}F0`, backdropFilter: "blur(10px)", borderBottom: `1px solid ${C.border}`, height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", position: "sticky", top: 0, zIndex: 100 }}>
        <button onClick={() => goView("feed")} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0 }} aria-label="BuildBridge home">
          <svg width="150" height="34" viewBox="0 0 900 260" style={{ flexShrink: 0 }}>
<text x="450" y="130" fontFamily="Arial, Helvetica, sans-serif" fontSize="86" fontWeight="700" textAnchor="middle" fill={C.text}>Build<tspan fill={C.orange}>Bridge</tspan></text>
  <path d="M 200 175 Q 450 130 700 175" fill="none" stroke={C.orangeDk} strokeWidth="4" />
  <circle cx="200" cy="175" r="7" fill={C.orange} />
  <circle cx="325" cy="152" r="7" fill={C.orangeDk} />
  <circle cx="450" cy="142" r="8" fill={C.text} />
  <circle cx="575" cy="152" r="7" fill={C.orangeDk} />
  <circle cx="700" cy="175" r="7" fill={C.orange} />
</svg>
          <span className="hide-mobile" style={{ fontSize: 10, color: C.orange, background: `${C.orange}18`, padding: "3px 9px", borderRadius: 20, fontWeight: 800, letterSpacing: "0.1em" }}>{SERVED_LABEL.toUpperCase()}</span>
        </button>

        <nav className="top-nav" aria-label="Primary"><NavButtons /></nav>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={toggleTheme} className="btn-ghost" aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"} title={theme === "light" ? "Dark mode" : "Light mode"} style={{ padding: "8px 11px", fontSize: 15, lineHeight: 1 }}>{theme === "light" ? "🌙" : "☀️"}</button> {authUser ? <button onClick={() => { localStorage.removeItem("bb-token"); setAuthUser(null); showToast("Signed out"); }} className="btn-ghost" style={{ padding: "8px 12px", fontSize: 12.5, fontWeight: 800, color: C.green }}>Signed in — sign out</button> : <button onClick={() => setLoginModal(true)} className="btn-ghost" style={{ padding: "8px 12px", fontSize: 12.5, fontWeight: 800, color: C.dim }}>Contractor login</button>} <button onClick={() => (track("facebook_follow_click", "header"), window.open("https://www.facebook.com/profile.php?id=61591959271748"))} className="btn-ghost" aria-label="BuildBridge FL on Facebook" style={{ padding: "8px 12px", fontSize: 12.5, fontWeight: 800, color: C.blue }}>Follow us on Facebook</button> <button onClick={() => (track("facebook_group_click", "header"), window.open("https://www.facebook.com/groups/1454402876451068/"))} className="btn-ghost" aria-label="Citrus County Construction Network Facebook group" style={{ padding: "8px 12px", fontSize: 12.5, fontWeight: 800, color: C.orange }}>Join Group</button> <button onClick={() => setPostModal(true)} className="btn-primary" style={{ padding: "8px 16px", fontSize: 12.5, display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="plus" size={14} color="#14100A" /><span className="hide-mobile">Post</span>
          </button>
        </div>
      </header>

   {/* Claim listing modal */}
{claimTarget && (
<div role="dialog" aria-modal="true" aria-label="Claim this listing" style={{ position: "fixed", inset: 0, background: "rgba(4,8,16,0.75)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflowY: "auto" }}>
<div className="fade-in" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, width: "100%", maxWidth: 460, padding: 24, maxHeight: "90vh", overflowY: "auto" }}>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
<div className="display" style={{ fontWeight: 800, fontSize: 18, color: C.white }}>Claim {claimTarget.company}</div>
<button onClick={() => setClaimTarget(null)} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 4 }}><Icon name="x" size={18} /></button>
</div>
<div style={{ fontSize: 12.5, color: C.dim, marginBottom: 14, lineHeight: 1.5 }}>Tell us who you are and we'll confirm you're with the business before handing over the page. Usually same day. Free — claiming costs nothing, ever.</div>
{[["claimant_name","Your name *"],["role","Your role (owner, manager…) *"],["email","Business email *"],["phone","Phone *"]].map(([k, label]) => (
<input key={k} value={claimForm[k]} onChange={e => setClaimForm({ ...claimForm, [k]: e.target.value })} placeholder={label} aria-label={label} style={{ width: "100%", background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", color: C.text, fontSize: 13, outline: "none", marginBottom: 8 }} />
))}
<textarea value={claimForm.note} onChange={e => setClaimForm({ ...claimForm, note: e.target.value })} placeholder="Anything that helps us verify — license #, years in business, website…" aria-label="Verification note" style={{ width: "100%", background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", color: C.text, fontSize: 13, resize: "vertical", minHeight: 70, fontFamily: "inherit", outline: "none", marginBottom: 12 }} />
<div style={{ display: "flex", gap: 10 }}>
<button onClick={() => setClaimTarget(null)} className="btn-ghost" style={{ flex: 1, padding: 11, fontSize: 13 }}>Cancel</button>
<button onClick={async () => { if (!claimForm.claimant_name.trim() || !claimForm.role.trim() || !claimForm.email.trim() || !claimForm.phone.trim()) { showToast("Please fill the required fields (*)"); return; } track("claim_submit", claimTarget.company); const ok = await submitClaimRequest({ vendor_id: claimTarget.id - 1000, company: claimTarget.company, ...claimForm }); if (ok) { setClaimTarget(null); setClaimForm({ claimant_name: "", role: "", email: "", phone: "", note: "" }); showToast("Claim sent — we'll verify and be in touch shortly."); } else { showToast("Hmm, that didn't send — try again in a minute."); } }} className="btn-primary" style={{ flex: 2, padding: 11, fontSize: 13 }}>Submit claim</button>
</div>
</div>
</div>
)}

     {/* Vendor application modal */}
{vendorModal && (
<div role="dialog" aria-modal="true" aria-label="Apply to get listed" style={{ position: "fixed", inset: 0, background: "rgba(4,8,16,0.75)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflowY: "auto" }}>
<div className="fade-in" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, width: "100%", maxWidth: 480, padding: 24, maxHeight: "90vh", overflowY: "auto" }}>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
<div className="display" style={{ fontWeight: 800, fontSize: 18, color: C.white }}>Get listed free</div>
<button onClick={() => setVendorModal(false)} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 4 }}><Icon name="x" size={18} /></button>
</div>
<div style={{ fontSize: 12.5, color: C.dim, marginBottom: 14, lineHeight: 1.5 }}>We verify every business on Sunbiz and check licenses with FL DBPR before listing. Free, no fees ever.</div>               <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>                 {["contractor", "supplier"].map(t => (                   <button key={t} onClick={() => setVApp({ ...vApp, type: t })} className="btn-ghost" style={{ padding: "8px 16px", fontSize: 12.5, border: vApp.type === t ? `1px solid ${C.orange}` : undefined, color: vApp.type === t ? C.orange : undefined }}>{t === "contractor" ? "Contractor" : "Supplier / Vendor"}</button>                 ))}               </div>
{[["name","Your name *"],["company","Business name *"],["trade","Trade (e.g. Plumbing, Roofing) *"],["phone","Phone *"],["email","Email"],["website","Website"],["license","License # (if your trade requires one)"]].map(([k, label]) => (
<input key={k} value={vApp[k]} onChange={e => setVApp({ ...vApp, [k]: e.target.value })} placeholder={label} aria-label={label} style={{ width: "100%", background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", color: C.text, fontSize: 13, outline: "none", marginBottom: 8 }} />
))}
<textarea value={vApp.bio} onChange={e => setVApp({ ...vApp, bio: e.target.value })} placeholder="Tell homeowners about your business — services, service area, years in business…" aria-label="About your business" style={{ width: "100%", background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", color: C.text, fontSize: 13, resize: "vertical", minHeight: 80, fontFamily: "inherit", outline: "none", marginBottom: 12 }} />
<div style={{ display: "flex", gap: 10 }}>
<button onClick={() => setVendorModal(false)} className="btn-ghost" style={{ flex: 1, padding: 11, fontSize: 13 }}>Cancel</button>
<button onClick={async () => { if (!vApp.name.trim() || !vApp.company.trim() || !vApp.trade.trim() || !vApp.phone.trim()) { showToast("Please fill the required fields (*)"); return; } track("vendor_apply_submit", vApp.company); const ok = await submitVendorApplication(vApp); if (ok) { setVendorModal(false); setVApp({ name: "", company: "", trade: "", phone: "", email: "", website: "", license: "", bio: "" }); showToast("Application sent! We'll verify your business and be in touch."); } else { showToast("Hmm, that didn't send — try again in a minute."); } }} className="btn-primary" style={{ flex: 2, padding: 11, fontSize: 13 }}>Submit application</button>
</div>
</div>
</div>
)}
      {/* Submit a Bid modal */}       {bidModal && (         <div role="dialog" aria-modal="true" aria-label="Submit a bid" style={{ position: "fixed", inset: 0, background: "rgba(4,8,16,0.75)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>           <div className="fade-in" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, width: "100%", maxWidth: 480, padding: 24, maxHeight: "90vh", overflowY: "auto" }}>             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>               <div className="display" style={{ fontWeight: 800, fontSize: 18, color: C.white }}>Submit a bid</div>               <button onClick={() => setBidModal(null)} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 4 }}><Icon name="x" size={18} /></button>             </div>             <div style={{ fontSize: 12.5, color: C.dim, marginBottom: 14, lineHeight: 1.5 }}>Bidding on: <strong style={{ color: C.white }}>{bidModal.type}</strong> — {bidModal.location}</div>             {[["bidder_name","Your name *"],["phone","Phone *"],["email","Email"],["bid_amount","Your bid amount"]].map(([k, label]) => (               <input key={k} value={bidForm[k]} onChange={e => setBidForm({ ...bidForm, [k]: e.target.value })} placeholder={label} aria-label={label} style={{ width: "100%", background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: "11px 14px", fontSize: 13.5, color: C.white, marginBottom: 10 }} />             ))}             <textarea value={bidForm.message} onChange={e => setBidForm({ ...bidForm, message: e.target.value })} placeholder="Message — describe your approach, timeline, or questions" aria-label="Message" style={{ width: "100%", background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: "11px 14px", fontSize: 13.5, color: C.white, minHeight: 80, marginBottom: 14, resize: "vertical" }} />             <div style={{ display: "flex", gap: 10 }}>               <button onClick={() => setBidModal(null)} className="btn-ghost" style={{ flex: 1, padding: 11, fontSize: 13 }}>Cancel</button>               <button onClick={async () => { if (!bidForm.bidder_name.trim() || !bidForm.phone.trim()) { showToast("Please fill the required fields (*)"); return; } const ok = await submitBid({ project_id: bidModal.id, ...bidForm }); if (ok) { showToast("Bid submitted — the homeowner will follow up"); setBidModal(null); setBidForm({ bidder_name: "", phone: "", email: "", bid_amount: "", message: "" }); track("bid_submit", bidModal.type); } else { showToast("Something went wrong — try again"); } }} className="btn-primary" style={{ flex: 1, padding: 11, fontSize: 13 }}>Submit bid</button>             </div>           </div>         </div>       )}       {/* Mobile bottom nav */}
      <nav className="bottom-nav" aria-label="Primary mobile"><NavButtons vertical /></nav>

      {loginModal && (         <div role="dialog" aria-modal="true" aria-label="Contractor login" style={{ position: "fixed", inset: 0, background: "rgba(4,8,16,0.75)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={e => e.target === e.currentTarget && setLoginModal(false)}>           <div className="fade-in" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, width: "100%", maxWidth: 420, padding: 24 }}>             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>               <div className="display" style={{ fontWeight: 800, fontSize: 18, color: C.white }}>Contractor login</div>               <button onClick={() => setLoginModal(false)} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 4 }}><Icon name="x" size={18} /></button>             </div>             <div style={{ fontSize: 12.5, color: C.dim, marginBottom: 14, lineHeight: 1.5 }}>Enter your email and we'll send you a sign-in link. No password needed.</div>             <input value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="you@yourcompany.com" aria-label="Email" style={{ width: "100%", background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: "11px 14px", color: C.text, fontSize: 13.5, outline: "none", marginBottom: 12 }} />             <button onClick={async () => { if (!loginEmail.includes("@")) { showToast("Enter a valid email"); return; } track("login_link_request", loginEmail); const ok = await sendMagicLink(loginEmail); if (ok) { setLoginModal(false); setLoginEmail(""); showToast("Check your email for the sign-in link"); } else { showToast("Couldn't send — try again in a minute"); } }} className="btn-primary" style={{ width: "100%", padding: 12, fontSize: 13.5 }}>Send me a login link</button>           </div>         </div>       )}        {/* Post modal */}
      {postModal && (
        <div role="dialog" aria-modal="true" aria-label="Share a project or update" style={{ position: "fixed", inset: 0, background: "rgba(4,8,16,0.75)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={e => e.target === e.currentTarget && setPostModal(false)}>
          <div className="fade-in" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, width: "100%", maxWidth: 480, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div className="display" style={{ fontWeight: 800, fontSize: 18, color: C.white }}>Share an update</div>
              <button onClick={() => setPostModal(false)} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 4 }}><Icon name="x" size={18} /></button>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              {["Project", "Video", "Hiring", "Seeking work"].map(t => (
                <button key={t} onClick={() => setPostType(t)} className="btn-ghost" style={{ padding: "6px 12px", fontSize: 11.5, border: postType === t ? `1px solid ${C.orange}` : undefined, color: postType === t ? C.orange : undefined }}>{t}</button>
              ))}
            </div>
            <textarea value={newPost} onChange={e => setNewPost(e.target.value)} aria-label="Post content"
              placeholder="Describe your project, share a before & after, post a job opening…"
              style={{ width: "100%", background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: 12, color: C.text, fontSize: 13, resize: "vertical", minHeight: 120, fontFamily: "inherit", outline: "none", marginBottom: 12 }} />                 <input value={newContact} onChange={e => setNewContact(e.target.value)} placeholder="Your phone or email (optional — leave blank and BuildBridge connects leads for you)" style={{ width: "100%", background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: 12, color: C.text, fontSize: 13, fontFamily: "inherit", outline: "none", marginBottom: 12 }} />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setPostModal(false)} className="btn-ghost" style={{ flex: 1, padding: 11, fontSize: 13 }}>Cancel</button>
              <button onClick={async () => { if (!newPost.trim()) { showToast("Type something first!"); return; } track("share_update_click", "Crew Board"); const ok = await submitProjectPost(postType, newPost, newContact); setPostModal(false); setNewPost(""); showToast(ok ? "Sent! We review posts before they go live — yours is in the queue." : "Hmm, that didn't send — try again in a minute."); }} className="btn-primary" style={{ flex: 2, padding: 11, fontSize: 13 }}>Publish post</button>
            </div>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="app-shell">
        <main className="main-col">
          <div className="scroll-col">
            {view === "profile" && activeProfile ? (
              <ContractorProfile contractor={activeProfile} reviews={[...REVIEWS, ...dbReviews]} roster={ALL.filter(c => !c.hidden)} onSelect={openProfile} onBack={() => goView("feed")} onToast={showToast} onTrust={() => goView("trust")} onClaim={c => { track("claim_click", c.company); setClaimTarget(c); }} />

            ) : view === "feed" ? (
             <>
                <CoverageFinder roster={ALL.filter(c => !c.hidden)} onProfile={openProfile} />
                {/* Homeowner quick-start */}
                <div style={{ background: `linear-gradient(120deg, ${C.card}, ${C.panel})`, border: `1px solid ${C.border}`, borderRadius: 16, padding: "18px 18px 16px", marginBottom: 18, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `repeating-linear-gradient(45deg, ${C.orange}, ${C.orange} 10px, #14100A 10px, #14100A 20px)` }} aria-hidden="true" />
                  <div className="eyebrow" style={{ marginBottom: 6, marginTop: 4 }}>Homeowners start here</div>
                  <div className="display" style={{ fontWeight: 800, fontSize: 21, color: C.white, lineHeight: 1.15, marginBottom: 6 }}>Find the right pro for your project</div>
                  <div style={{ fontSize: 13, color: C.dim, marginBottom: 14 }}>Describe the job in plain words — our AI matches you with verified Citrus County contractors.</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button onClick={() => goView("match")} className="btn-primary" style={{ padding: "10px 18px", fontSize: 13, display: "flex", alignItems: "center", gap: 7 }}>
                      <Icon name="sparkles" size={15} color="#14100A" />Match me with a contractor
                    </button>
                    <button onClick={() => goView("network")} className="btn-ghost" style={{ padding: "10px 18px", fontSize: 13 }}>Browse the network</button>               <div style={{ fontSize: 11.5, color: C.dim, marginTop: 12 }}>No paid ads. No pay-to-play. Nobody buys their way onto this site. Every contractor here passed a license and registration check first — that's the only way in.</div>
                  </div>
                </div>
                 {/* Permit Prep banner */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", background: C.card, border: `1px solid ${C.orange}55`, borderLeft: `4px solid ${C.orange}`, borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: C.white, marginBottom: 4 }}>Permit Prep is here — HB 803 exemptions</div>
            <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.5 }}>Projects under $7,500 may not need a permit anymore. We check and file for you. Contractors: first filing free.</div>
          </div>
         <button className="btn-primary" onClick={() => (track("permit_prep_sidebar_click", "sidebar"), window.open("https://docs.google.com/forms/d/e/1FAIpQLSefxtPbcIOzoAEZYCuQa8f-HTVmxd1pIQ5WYPtAdxhBcZ1jjg/viewform"))} style={{ width: "100%", padding: 10, fontSize: 12.5 }}>Ask About My Project</button>
        </div>

            {/* Resources CTA */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Resources we recommend</div>
          <div style={{ fontSize: 12, color: C.dim, marginBottom: 12, lineHeight: 1.55 }}>Tools contractors on our network use to run their business. Nobody pays to be recommended here — this is just what we've seen work.</div>
          {[
            { name: "Business insurance (NEXT)", url: "https://nextinsurance.sjv.io/c/7573151/1148969/14516" },
            { name: "Business insurance (Thimble)", url: "https://www.thimble.com/" },
            { name: "Scheduling & invoicing (Housecall Pro)", url: "https://www.housecallpro.com/" },
          ].map((r, i) => (
            <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer sponsored" onClick={() => track("resource_link_click", r.name)} style={{ display: "block", fontSize: 12.5, color: C.blue, textDecoration: "none", padding: "7px 0", borderBottom: i < 2 ? `1px dashed ${C.line}` : "none" }}>{r.name} →</a>
          ))}
          <div style={{ fontSize: 11, color: C.muted, marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.line}`, lineHeight: 1.5 }}>
            Some of these are affiliate links — if you sign up, we may earn a commission at no extra cost to you. It never affects who gets listed in our contractor directory.
          </div>
        </div>

            {/* Suggested */}
               {/* Get Listed banner */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "12px 16px", marginBottom: 16 }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.white }}>Contractors: get listed free</div>
            <div style={{ fontSize: 11.5, color: C.dim }}>Verified badge, direct homeowner contact, no fees.</div>
          </div>
          <button className="btn-ghost" onClick={() => (track("get_listed_banner_click", "banner"), setVendorModal(true))} style={{ padding: "9px 14px", fontSize: 12 }}>Get Listed</button>
        </div>  
       
                <div style={{ display: "flex", gap: 14, marginBottom: 18, overflowX: "auto", paddingBottom: 4 }}>
                  {ALL.filter(c => !c.hidden).map(c => (
                    <button key={c.id} onClick={() => openProfile(c)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", flexShrink: 0, background: "none", border: "none", padding: 0 }} aria-label={`View ${c.name}'s profile`}>
                      <div style={{ padding: 2, borderRadius: "50%", background: c.premium ? `linear-gradient(135deg, ${C.orange}, ${C.orangeDk})` : C.border }}>
                        <Avatar initials={c.avatar} size={48} />
                      </div>
                      <span style={{ fontSize: 10.5, color: C.muted, maxWidth: 58, textAlign: "center", lineHeight: 1.2 }}>{c.compnany}</span>
                    </button>
                  ))}
                </div>

                {FEED_POSTS.map(post => (
                  <FeedPost key={post.id} post={post} contractor={ALL.find(c => c.id === post.contractorId)} onProfile={openProfile} />
                ))}
              </>

            ) : view === "projects" ? (
              <>
                <SectionHead eyebrow="Open bids" title="Open projects" sub="Homeowners and developers looking for contractors now" />                 <button className="btn-primary" onClick={() => (track("post_project_click", "projects"), setPostType("Project"), setPostModal(true))} style={{ padding: "10px 18px", fontSize: 13, marginBottom: 16 }}>Post a Project — free</button>
                {PROJECTS.length === 0 && dbPosts.filter(p => p.post_type === "Project").length === 0 && (
                <div style={{ background: C.card, border: `1px dashed ${C.border}`, borderRadius: 16, padding: "36px 20px", textAlign: "center", marginBottom: 16 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: C.white, marginBottom: 6 }}>No open projects yet</div>
                  <div style={{ fontSize: 12.5, color: C.dim, lineHeight: 1.6, maxWidth: 420, margin: "0 auto 14px" }}>Homeowners: be the first — post your project free and let verified local contractors come to you.</div>
                  <button className="btn-primary" onClick={() => (track("post_project_click", "projects"), setPostType("Project"), setPostModal(true))} style={{ padding: "10px 18px", fontSize: 13 }}>Post a Project</button>
                </div>
              )} 
                {dbPosts.filter(p => p.post_type === "Project").map(p => (                 <div key={p.id} className="hover-card" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 14 }}>                 <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>                 <Badge text={p.post_type} color={C.orange} />                 <span style={{ fontSize: 11, color: C.muted }}>{new Date(p.created_at).toLocaleDateString()}</span>                 </div>                 <p style={{ fontSize: 13.5, color: C.text, lineHeight: 1.55 }}>{p.content}</p>                 {p.contact && <div style={{ fontSize: 11.5, color: C.blue, marginTop: 8 }}>Contact: {p.contact}</div>}                 {!p.contact && <div style={{ fontSize: 11.5, color: C.dim, marginTop: 8 }}>Open to quotes — contact BuildBridge to be connected.</div>}                 </div>                 ))}                 {PROJECTS.map(proj => (
                  <div key={proj.id} className="hover-card" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, gap: 10, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 800, fontSize: 16, color: C.white }}>{proj.type}</span>
                          {proj.urgent && <Badge text="Urgent" color={C.red} />}
                        </div>
                        <div style={{ fontSize: 12, color: C.muted }}>Posted by {proj.owner || "Homeowner"} · {daysAgo(proj.created_at)}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="display" style={{ fontWeight: 800, fontSize: 17, color: C.orange }}>{proj.budget}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>{proj.bids} bids</div>
                      </div>
                    </div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: C.dim, marginBottom: 10 }}><Icon name="pin" size={14} color={C.muted} />{proj.location}</div>
                    <p style={{ fontSize: 13.5, color: C.dim, lineHeight: 1.55, marginBottom: 14 }}>{proj.description}</p>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={() => { track("project_bid_click", proj.type); setBidModal(proj); }} className="btn-primary" style={{ flex: 1, padding: 11, fontSize: 13 }}>Submit bid</button>
                      <button className="btn-ghost" onClick={() => showToast("Saved projects — coming soon!")} style={{ padding: "11px 18px", fontSize: 13 }}>Save</button>
                    </div>
                  </div>
                  ))}
              </>

               ) : view === "myprofile" ? (
              <>
                <SectionHead eyebrow="Your listing" title="My profile" sub="Edit your BuildBridge listing" />
                {!authUser ? (
                  <div style={{ background: C.card, border: `1px dashed ${C.border}`, borderRadius: 16, padding: 30, textAlign: "center", fontSize: 13, color: C.dim }}>Sign in to see your listing.</div>
                ) : myRow === null ? (
                  <div style={{ fontSize: 13, color: C.dim }}>Loading…</div>
                ) : myRow.length === 0 ? (
                  <div style={{ background: C.card, border: `1px dashed ${C.border}`, borderRadius: 16, padding: 30, textAlign: "center", fontSize: 13, color: C.dim }}>No listing is linked to {authUser.email} yet.</div>
                ) : myRow.map(v => (
                  <div key={v.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 14 }}>
                    <div style={{ fontSize: 17, fontWeight: 800, color: C.white, marginBottom: 4 }}>{v.company}</div>
                    <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 16 }}>{v.name} · {v.trade}</div>
                    {[["phone","Phone"],["website","Website"]].map(([k, label]) => (
                      <div key={k} style={{ marginBottom: 10 }}>
                        <div className="eyebrow" style={{ fontSize: 10, color: C.muted, marginBottom: 5 }}>{label}</div>
                        <input value={editForm[k]} onChange={e => setEditForm({ ...editForm, [k]: e.target.value })} aria-label={label} style={{ width: "100%", background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", color: C.text, fontSize: 13, outline: "none" }} />
                      </div>
                    ))}
                    <div className="eyebrow" style={{ fontSize: 10, color: C.muted, marginBottom: 5 }}>About your business</div>
                    <textarea value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} aria-label="About your business" style={{ width: "100%", background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", color: C.text, fontSize: 13, minHeight: 100, resize: "vertical", fontFamily: "inherit", outline: "none", marginBottom: 14 }} />
                    <div style={{ background: C.panel, border: `1px dashed ${C.line}`, borderRadius: 10, padding: 12, marginBottom: 14, fontSize: 12, color: C.dim, lineHeight: 1.5 }}>Business name, trade, license number, and email are locked. Your email is your sign-in — contact BuildBridge to change it.</div>
                    <button onClick={async () => { const token = localStorage.getItem("bb-token"); const ok = await updateMyVendorRow(token, v.id, editForm); showToast(ok ? "Saved" : "Couldn't save — try again"); if (ok) track("profile_self_edit", v.company); }} className="btn-primary" style={{ width: "100%", padding: 12, fontSize: 13.5 }}>Save changes</button>
                  </div>
                ))}
              </>

            ) : view === "trust" ? (
              <>
                <SectionHead eyebrow="Verification" title="What is Sunbiz? What is DBPR?" sub="How BuildBridge checks every contractor and supplier before listing them" />
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: C.white, marginBottom: 8 }}>Sunbiz</div>
                  <p style={{ fontSize: 13.5, color: C.dim, lineHeight: 1.6 }}>Sunbiz is Florida's official state business registry (sunbiz.org). It confirms a company is a real, legally registered business in good standing — not a fly-by-night operation with no paper trail.</p>
                </div>
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: C.white, marginBottom: 8 }}>DBPR</div>
                  <p style={{ fontSize: 13.5, color: C.dim, lineHeight: 1.6 }}>DBPR stands for the Florida Department of Business & Professional Regulation. It confirms a contractor holds an active, legitimate state license for their trade — plumbing, electrical, HVAC, and others — where the law requires one. Not every trade needs a state license (landscaping and junk removal, for example, don't) — but where one's required, DBPR is how you check it's real.</p>
                </div>
                <div style={{ background: C.card, border: `1px solid ${C.orange}44`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
                  <p style={{ fontSize: 13.5, color: C.white, lineHeight: 1.6, fontWeight: 700 }}>We check both before anyone gets listed on BuildBridge. No fees, no exceptions.</p>
                </div>
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: C.white, marginBottom: 10 }}>Don't take our word for it</div>
                  <p style={{ fontSize: 12.5, color: C.dim, lineHeight: 1.6, marginBottom: 12 }}>Check any business yourself, any time:</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <a href="https://sunbiz.org" target="_blank" rel="noopener" className="btn-ghost" style={{ padding: "10px 16px", fontSize: 13, textDecoration: "none" }}>Sunbiz search →</a>
                    <a href="https://myfloridalicense.com" target="_blank" rel="noopener" className="btn-ghost" style={{ padding: "10px 16px", fontSize: 13, textDecoration: "none" }}>DBPR license search →</a>
                  </div>
                </div>
              </>

            ) : view === "network" ? (
              <>
                <SectionHead eyebrow="The directory" title="Contractor network" sub="Verified local professionals in Citrus County" />
                {typeof window !== "undefined" && window.location.search.includes("gaps=1") && (
                  <CoverageGaps roster={ALL.filter(c => !c.hidden)} />
                )}
              
      
          
              
                <div style={{ position: "relative", marginBottom: 18 }}>
                  <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }}><Icon name="search" size={16} color={C.muted} /></div>
                  <input value={networkQuery} onChange={e => setNetworkQuery(e.target.value)} placeholder="Search by trade, name, town, or specialty…" aria-label="Search contractors"
                    style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 14px 12px 38px", color: C.text, fontSize: 13.5, outline: "none" }} />
                </div>
                {filteredNetwork.length === 0 && (
                  <div style={{ textAlign: "center", padding: 40, color: C.muted, fontSize: 13, background: C.card, borderRadius: 12, border: `1px dashed ${C.line}` }}>
                    No contractors match "{networkQuery}". Try a trade like "roofing" or a town like "Inverness".
                  </div>
                )}
                {filteredNetwork.map(c => (
                  <div key={c.id} className="hover-card" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, marginBottom: 14, display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <button onClick={() => openProfile(c)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} aria-label={`View ${c.name}'s profile`}>
                      <Avatar initials={c.avatar} size={52} premium={c.premium} />
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                        <div>
                          <button onClick={() => openProfile(c)} style={{ background: "none", border: "none", fontWeight: 800, fontSize: 15, color: C.white, cursor: "pointer", padding: 0, marginBottom: 2, textAlign: "left" }}>{c.name}</button>
                          <div style={{ fontSize: 12, color: C.muted }}>{c.company} · {c.trade}</div>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          {c.verified && <Badge text={c.license ? "Licensed" : "Verified"} color={c.license ? C.green : C.blue} icon="badge" />}
                          {c.premium && <Badge text="Pro" color={C.orange} icon="star" />}
                        </div>
                      </div>
                      <p style={{ fontSize: 13, color: C.dim, margin: "8px 0", lineHeight: 1.5 }}>{c.bio}</p>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                       {c.claimed === false ? (
                          <span style={{ fontSize: 11.5, color: C.muted, fontStyle: "italic" }}>Listed from public record — not yet claimed</span>
                        ) : (
                          <>
                            <Stars rating={c.rating} />
                            <span style={{ fontSize: 12, color: C.muted }}>{c.jobs} jobs · {c.followers} followers</span>
                          </>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                        <button onClick={() => openProfile(c)} className="btn-primary" style={{ padding: "8px 16px", fontSize: 12 }}>View profile</button>
                        <a href={`tel:${c.phone?.replace(/\D/g, "")}`} className="btn-ghost" style={{ padding: "8px 14px", fontSize: 12, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <Icon name="phone" size={13} />Call
                        </a>
                        <FollowButton contractor={c} onToast={showToast} />
                      </div>
                    </div>
                  </div>
                ))}
              </>

            ) : view === "jobs" ? (
              <>
                <SectionHead eyebrow="Crew board" title="Find work" sub="Jobs posted by contractors looking for crews and specialty trades" />
              {JOBS.length === 0 && dbPosts.filter(p => p.post_type === "Hiring" || p.post_type === "Seeking work").length === 0 && (
<div style={{ background: C.card, border: `1px dashed ${C.border}`, borderRadius: 16, padding: "36px 20px", textAlign: "center", marginBottom: 16 }}>
<div style={{ fontSize: 15, fontWeight: 800, color: C.white, marginBottom: 6 }}>No crew jobs posted yet</div>
<div style={{ fontSize: 12.5, color: C.dim, lineHeight: 1.6, maxWidth: 420, margin: "0 auto 14px" }}>Contractors: hiring a crew or need a specialty sub? Post it here free and reach every verified pro in Citrus County.</div>
<button className="btn-primary" onClick={() => (track("post_job_click", "findwork"), setPostModal(true), setPostType("Hiring"))} style={{ padding: "9px 20px", fontSize: 13 }}>Post a job — free</button>
</div>
 )}               
{dbPosts.filter(p => p.post_type === "Hiring" || p.post_type === "Seeking work").map(p => (
<div key={p.id} className="hover-card" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 14 }}>
<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
<Badge text={p.post_type} color={p.post_type === "Hiring" ? C.blue : C.green} />
<span style={{ fontSize: 11, color: C.muted }}>{new Date(p.created_at).toLocaleDateString()}</span>
</div>
<p style={{ fontSize: 13.5, color: C.text, lineHeight: 1.55 }}>{p.content}</p>
{p.contact && <div style={{ fontSize: 11.5, color: C.blue, marginTop: 8 }}>Contact: {p.contact}</div>}
{!p.contact && <div style={{ fontSize: 11.5, color: C.dim, marginTop: 8 }}>Interested? Contact BuildBridge to be connected.</div>}
</div>
))}  {JOBS.map((job, i) => (
                  <div key={i} className="hover-card" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 10, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 800, fontSize: 15, color: C.white }}>{job.title}</span>
                          {job.urgent && <Badge text="Urgent" color={C.red} />}
                        </div>
                        <div style={{ fontSize: 12, color: C.muted }}>{job.company} · {job.location}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 800, color: C.green, fontSize: 14 }}><Icon name="dollar" size={14} color={C.green} />{job.pay}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>{job.type}</div>
                      </div>
                    </div>
                    <p style={{ fontSize: 13.5, color: C.dim, lineHeight: 1.55, marginBottom: 12 }}>{job.desc}</p>
                    <button onClick={() => showToast("Application sent")} style={{ background: C.green, border: "none", borderRadius: 10, padding: "9px 20px", color: "#08120B", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>Apply now</button>
                  </div>
                ))}
              </>

            ) : view === "match" ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                  <Pablo size={92} />
                  <div>
                    <div className="eyebrow" style={{ marginBottom: 4 }}>Ask Pablo</div>
                    <div className="display" style={{ fontWeight: 800, fontSize: 24, color: C.white, lineHeight: 1.1 }}>Tell Pablo about your project</div>
                    <div style={{ fontSize: 13, color: C.dim, marginTop: 6 }}>Describe it in plain words — Pablo finds the verified contractors who cover your town</div>
                  </div>
                </div>
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 20 }}>
                  <textarea value={matchInput} onChange={e => setMatchInput(e.target.value)} aria-label="Describe your project"
                    placeholder='Example: "My lanai screen ripped in the storm and the roof is leaking near the back bedroom. Crystal River area, want it fixed this month."'
                    style={{ width: "100%", background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, color: C.text, fontSize: 13.5, resize: "vertical", minHeight: 110, fontFamily: "inherit", outline: "none", marginBottom: 14, lineHeight: 1.55 }} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                    <div>
                      <div className="eyebrow" style={{ fontSize: 10, marginBottom: 6, color: C.muted }}>Budget</div>
                      <select value={matchBudget} onChange={e => setMatchBudget(e.target.value)} aria-label="Budget" style={{ width: "100%", background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", color: C.text, fontSize: 13, outline: "none" }}>
                        <option value="">Select…</option>
                        {["Under $5K", "$5K–$15K", "$15K–$50K", "$50K+"].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <div className="eyebrow" style={{ fontSize: 10, marginBottom: 6, color: C.muted }}>Timeline</div>
                      <select value={matchTimeline} onChange={e => setMatchTimeline(e.target.value)} aria-label="Timeline" style={{ width: "100%", background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", color: C.text, fontSize: 13, outline: "none" }}>
                        <option value="">Select…</option>
                    {["ASAP", "1 month", "3 months", "Flexible"].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <div className="eyebrow" style={{ fontSize: 10, marginBottom: 6, color: C.muted }}>Your area</div>
                      <select value={matchTown} onChange={e => setMatchTown(e.target.value)} aria-label="Your area" style={{ width: "100%", background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", color: C.text, fontSize: 13, outline: "none" }}>
                        <option value="">Select your town…</option>
                        {TOWNS.map(t => <option key={t.name}>{t.name}</option>)}
                      </select>
                    </div>
                  </div>  
                  <button onClick={runMatch} disabled={matchLoading} className="btn-primary" style={{ width: "100%", padding: 13, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: matchLoading ? 0.7 : 1 }}>
                    <Icon name="sparkles" size={16} color="#14100A" />{matchLoading ? "Pablo's looking…" : "Ask Pablo"}{!matchLoading && <Icon name="arrowRight" size={16} color="#14100A" />}
                  </button>
                </div>

                {matchResults && (
                  <div className="fade-in">
                    {matchSummary && (
                      <div style={{ background: C.card, border: `1px solid ${C.blue}44`, borderRadius: 12, padding: "12px 16px", marginBottom: 14, fontSize: 13.5, color: C.dim, lineHeight: 1.5, display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <Icon name="sparkles" size={16} color={C.blue} style={{ marginTop: 2 }} />
                        <span><span style={{ color: C.white, fontWeight: 700 }}>Pablo says: </span>{matchSummary}</span>
                      </div>
                    )}
                    <div className="eyebrow" style={{ marginBottom: 12 }}>{matchResults.length} matched contractor{matchResults.length !== 1 ? "s" : ""}{matchTimeline === "ASAP" ? " · sorted for fast starts" : ""}</div>
                    {matchResults.map((c, i) => (
                      <div key={c.id} className="hover-card" style={{ background: C.card, border: `1px solid ${i === 0 ? C.orange : C.border}`, borderRadius: 16, padding: 18, marginBottom: 14 }}>
                        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                          <div style={{ position: "relative" }}>
                            <Avatar initials={c.avatar} size={48} premium={c.premium} />
                            {i === 0 && <div className="display" style={{ position: "absolute", top: -8, right: -10, background: C.orange, color: "#14100A", fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 6, letterSpacing: "0.08em" }}>TOP MATCH</div>}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
                              <div>
                                <div style={{ fontWeight: 800, fontSize: 15, color: C.white }}>{c.name}</div>
                                <div style={{ fontSize: 12, color: C.muted }}>{c.company} · {c.trade}</div>
                              </div>
                              <Stars rating={c.rating} />
                            </div>
                            <p style={{ fontSize: 13, color: C.dim, margin: "8px 0", lineHeight: 1.5 }}>{c.bio}</p>
                           {c.distanceMiles != null && ( <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, color: C.blue, marginBottom: 8, fontWeight: 700 }}><Icon name="pin" size={13} color={C.blue} />{Math.round(c.distanceMiles)} mi away · {c.location}</div> )}
                            {c.reasons?.length > 0 && (
                              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, color: C.green, marginBottom: 8, fontWeight: 700 }}>
                                <Icon name="check" size={13} color={C.green} />Matched on: {c.reasons.join(", ")}
                              </div>
                            )}
                            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                              <button onClick={() => openProfile(c)} className="btn-primary" style={{ padding: "8px 16px", fontSize: 12 }}>View profile</button>
                              <button onClick={() => c.email ? (window.location.href = `mailto:${c.email}?subject=BuildBridge Inquiry`) : showToast(`Call ${c.name} to connect`)} className="btn-ghost" style={{ padding: "8px 14px", fontSize: 12 }}>Message</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : view === "permits" ? (
            <>
              <SectionHead eyebrow="BuildBridge Services" title="Permit Prep & Processing" sub="Citrus County permit paperwork — handled. Your license, your permit, our legwork." />

              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 20 }}>
                <div className="eyebrow" style={{ marginBottom: 10, color: C.orange }}>Heard about the new $7,500 no-permit rule?</div>
                <p style={{ fontSize: 13.5, color: C.dim, lineHeight: 1.6, margin: 0 }}>Careful — Florida's HB 803 (effective July 1, 2026) does NOT cover electrical, plumbing, structural, mechanical, or gas work, and it doesn't apply in flood hazard areas — which includes a big chunk of coastal Citrus County. It also requires a written exemption request filed with the county. Guess wrong and you're paying double permit fees, or failing an inspection when you sell.</p>
              </div>

              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 20 }}>
                <div className="eyebrow" style={{ marginBottom: 12 }}>What we do</div>
                <p style={{ fontSize: 13.5, color: C.dim, lineHeight: 1.6, marginTop: 0 }}>For licensed contractors: we prepare, assemble, and process your permit applications as your authorized agent — filed under your license, submitted electronically, tracked to approval. You stay on the tools.</p>
                <p style={{ fontSize: 13.5, color: C.dim, lineHeight: 1.6, marginBottom: 0 }}>For homeowners: owner-builder permit packages and HB 803 exemption request filings — including confirming your project actually qualifies before you skip a permit.</p>
              </div>

              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 20 }}>
                <div className="eyebrow" style={{ marginBottom: 12 }}>Pricing</div>
                {[["Exemption filing", "$75–100"], ["Standard permit", "$150–250"], ["Complex permit", "$300–500"], ["Monthly retainer (regulars)", "$250–400"]].map(([label, price]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px dashed ${C.line}`, fontSize: 13.5 }}>
                    <span style={{ color: C.text }}>{label}</span><span style={{ color: C.orange, fontWeight: 800 }}>{price}</span>
                  </div>
                ))}
                <div style={{ fontSize: 12.5, color: C.green, marginTop: 12, fontWeight: 700 }}>BuildBridge vendors: your first one is free.</div>
              </div>

              <button onClick={() => (track("permit_request_click", "BuildBridge"), window.location.href = "mailto:asanchez@buildbridgefl.com?subject=Permit Prep Request")} className="btn-primary" style={{ width: "100%", padding: 14, fontSize: 14 }}>Request Permit Help</button>
            </>
          ) : view === "suppliers" ? (             <>               <SectionHead eyebrow="Vendors & Suppliers" title="Material Suppliers" sub="Local suppliers Citrus County contractors trust. Order or reach out directly." />                {ALL_SUPPLIERS.map(s => (                 <div key={s.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>                   <div className="eyebrow" style={{ marginBottom: 6, color: C.orange }}>{s.category}</div>                   <div style={{ fontSize: 18, fontWeight: 800, color: C.white, marginBottom: 6 }}>{s.name}</div>                   <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>{s.location}</div>                   <p style={{ fontSize: 13.5, color: C.dim, lineHeight: 1.6, marginTop: 0, marginBottom: 14 }}>{s.bio}</p>                   <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>                     <a href={`${s.website}?utm_source=buildbridge&utm_medium=supplier_catalog`} target="_blank" rel="noopener" onClick={() => track("supplier_click", s.name)} className="btn-primary" style={{ display: "inline-flex", alignItems: "center", padding: "10px 18px", fontSize: 13, textDecoration: "none" }}>Shop Now</a>                     {s.phone && <a href={`tel:${s.phone}`} onClick={() => track("supplier_call_click", s.name)} className="btn-ghost" style={{ padding: "10px 18px", fontSize: 13, textDecoration: "none" }}>Call {s.phone}</a>}                   </div>                 </div>               ))}             </>           ) : null}
          </div>
        </main>

        {/* Right sidebar */}
        <aside className="side-col">
          <div className="scroll-col">
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>Browse by Trade</div>
              {["#GarageDoors", "#Plumbing", "#Electrical", "#Landscaping", "#JunkRemoval"].map((tag, i) => (
                <div key={tag} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 4 ? `1px dashed ${C.line}` : "none" }}>
                  <span onClick={() => (track("topic_click", tag), setNetworkQuery(tag.replace("#", "").replace(/([A-Z])/g, " $1").trim()), goView("network"))} style={{ fontSize: 13, color: C.blue, cursor: "pointer", fontWeight: 600 }}>{tag}</span>
                </div>
              ))}
            </div>

            {/* Vendor CTA */}
            <div style={{ background: C.card, border: `1px solid ${C.orange}44`, borderRadius: 14, padding: 16, marginBottom: 16, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `repeating-linear-gradient(45deg, ${C.orange}, ${C.orange} 10px, #14100A 10px, #14100A 20px)` }} aria-hidden="true" />
              <div className="eyebrow" style={{ marginBottom: 8, marginTop: 4 }}>Vendors & suppliers</div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: C.white, marginBottom: 8 }}>Put your business in front of every contractor in the county</div>
              <div style={{ fontSize: 12, color: C.dim, marginBottom: 12, lineHeight: 1.55 }}>List your shop, post deals, and reach the crews buying materials every week. Free to join.</div>
              <button  className="btn-primary" style={{ width: "100%", padding: 10, fontSize: 12.5 }} onClick={() => (track("supplier_signup_click", "sidebar"), setVApp({ ...vApp, type: "supplier" }), setVendorModal(true))}>Feature Your Deals</button>
            </div>

            {/* Permit Prep CTA */}
        <div style={{ background: C.card, border: `1px solid ${C.orange}44`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div className="eyebrow" style={{ color: C.orange, marginBottom: 8 }}>Permit Prep</div>
          <div style={{ fontSize: 13.5, fontWeight: 800, color: C.white, marginBottom: 8 }}>New: HB 803 permit exemptions</div>
          <div style={{ fontSize: 12, color: C.dim, marginBottom: 12, lineHeight: 1.55 }}>Projects under $7,500 may no longer need a permit. We check if you qualify and handle the county filing. Contractors: first filing free.</div>
          <button className="btn-primary" onClick={() => (track("permit_prep_sidebar_click", "sidebar"), window.open("https://docs.google.com/forms/d/e/1FAIpQLSefxtPbcIOzoAEZYCuQa8f-HTVmxd1pIQ5WYPtAdxhBcZ1jjg/viewform"))} style={{ width: "100%", padding: 10, fontSize: 12.5 }}>Ask About My Project</button>
        </div>

            {/* Suggested */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16 }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>People to follow</div>
              {ALL.filter(c => !c.hidden).slice(0, 3).map((c, i) => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < 2 ? `1px dashed ${C.line}` : "none" }}>
                  <Avatar initials={c.avatar} size={36} premium={c.premium} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{c.trade}</div>
                  </div>
                  <FollowButton contractor={c} onToast={showToast} />
                </div>
              ))}
            </div>
          </div>
          </aside>
        </div>
       <footer style={{ padding: "24px 18px", textAlign: "center", fontSize: 11.5, color: C.dim, lineHeight: 1.6, borderTop: `1px solid ${C.border}`, marginTop: 24 }}>
    BuildBridge verifies each contractor's license and business registration before listing them. The contract and the work are between you and the contractor — BuildBridge isn't the contractor and doesn't oversee, manage, or guarantee the job.
    <div style={{ marginTop: 10 }}>
        <a href="https://www.facebook.com/groups/1454402876451068/" target="_blank" rel="noopener noreferrer" style={{ color: C.orange || "#ff8c1a" }}>
            Join the conversation → Citrus County Construction Network (Facebook group)
        </a>
    </div>
</footer>
      </div>
    );
  }
