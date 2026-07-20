import { useState, useMemo } from "react";
const track = (action, vendor) => { if (window.gtag) window.gtag("event", action, { vendor: vendor }); };

/* ════════════════════════════════════════════════════════════════════════════
   BuildBridge — Citrus County's Construction Network
   v2 rebuild: blueprint design system · mobile-first · real icons ·
   smarter matching · accessibility · all v1 bugs fixed
   ════════════════════════════════════════════════════════════════════════════ */

// ── Data ─────────────────────────────────────────────────────────────────────
const CONTRACTORS = [
  
  { id: 6, hidden: true, name: "BuildBridge FL", company: "BuildBridge", trade: "official", location: "Citrus County, FL", phone: "(352) 555-0100", rating: 5.0, jobs: 0, followers: 0, following: 0, verified: false, premium: true, avatar: "BB", bio: "Project Management for residential builds — overseeing your project from inception to completion. Single point of contact for budget planning, architect coordination, permit management, hiring and vetting builders, construction oversight, and move-in closeout.", specialties: ["Budget Planning", "Permit Management", "Construction Oversight"], license: "N/A", reviews: 0, videoTitle: "BuildBridge FL — Citrus County's Construction Network", videoUrl: "https://www.youtube.com/embed/dTcSJL5hhpY", email: "asanchez@buildbridgefl.com"},
  { id: 7, name: "Daryl Walbert", company: "Secure Garage Doors LLC", trade: "Garage Doors", location: "Spring Hill, FL", phone: "(727) 834-0397", rating: 5.0, jobs: 0, followers: 0, following: 0, verified: true, premium: false, avatar: "SG", bio: "Garage door service, repair, and new installations. Florida LLC established 2019, serving Hernando, Pasco, and Citrus County.", specialties: ["Garage Door Repair", "New Installations", "Openers & Springs"], license: null, reviews: 0, videoTitle: null, email: "securegaragedoorsllc@gmail.com" },
  { id: 8, name: "Allan Zarek", company: "AJZ Plumbing LLC", trade: "Plumbing", location: "Homosassa, FL", phone: "(352) 422-5269", avatar: "AJ", email: "ajzplum99@gmail.com", website: "https://www.ajzplumbingllc.com", rating: 5.0, jobs: 0, reviews: 0, followers: 0, following: 0, verified: true, premium: false, logo: "/logos/ajz.png", specialties: ["Leak Repair", "Drain Cleaning", "Water Heaters", "Sewer Lines"], license: "CFC1430815", bio: "Owner-operated plumbing with 25 years of experience. Leak repair, drain cleaning, sewer lines, water heaters including tankless, and emergency service. Serving Citrus County. Licensed and insured." },
  { id: 9, name: "Joe Gomes", company: "J&J Hauling Solutions LLC", trade: "Debris Removal & Hauling", location: "Lecanto, FL", phone: "(352) 464-7541", website: "https://jnjhaulingsolutions.com", rating: 5.0, jobs: 0, followers: 0, following: 0, verified: true, premium: false, avatar: "JH", bio: "Hurricane and storm debris cleanup, property clean-outs, and yard waste removal. Residential, commercial, and municipal. Florida LLC established 2025, serving Citrus County. Also reach Jay at (352) 634-3081.", specialties: ["Storm Debris Removal", "Property Clean-Outs", "Yard Waste Hauling"], license: null, reviews: 0, videoTitle: null }, 
  { id: 10, name: "David Carter", company: "5 Star Landscape and Tree Services LLC", trade: "Landscape & Tree Services", location: "Beverly Hills, FL", phone: "(352) 287-1918", rating: 5.0, jobs: 0, followers: 0, following: 0, verified: true, premium: false, avatar: "VC", bio: "Tree cutting, landscaping, pressure washing, yard cleanups, construction site cleanups, and outdoor handyman services. Free estimates. Florida LLC established 2026, serving Citrus County.", specialties: ["Tree Cutting", "Landscaping", "Pressure Washing"], license: null, reviews: 0, videoTitle: null },
  { id: 11, name: "Vinnie Camenzuli", company: "Taddeo Electrical Contractors, Inc.", trade: "Electrical", location: "Hudson, FL", phone: "(352) 556-5276", avatar: "TE", email: "service@taddeoelectric.com", website: "https://taddeoelectric.com", rating: 5.0, jobs: 0, reviews: 0, followers: 0, following: 0, verified: true, premium: false, license: "EC13007179", specialties: ["Panel Upgrades", "EV Charger Installation", "Home Rewiring", "Generator Transfer Switches"], bio: "Family-owned electrical contractor serving Citrus, Hernando, Pasco, North Hillsborough, and North Pinellas Counties since 2010." },
   { id: 12, name: "Robert Dennis", company: "A & J Junk Removal LLC", trade: "Junk Removal & Clean-Outs", location: "Belleview, FL", phone: "(352) 530-3519", email: "aandjjunk82@gmail.com", specialties: ["Estate Clean-Outs", "House Clean-Outs", "Yard Debris Removal"], license: "N/A", reviews: 0, videoTitle: null },
];

const FEED_POSTS = [
   { id: 8, contractorId: 6, type: "text", time: "Just now", title: "Why BuildBridge exists", description: "I've spent 25+ years in the trades here in Florida. I know what a good contractor looks like — and I know how hard they are to find online. BuildBridge is simple: every contractor listed here is real, local to Citrus County, and verified — state license checked, business registration confirmed. Nobody pays to be listed. Nobody buys their way to the top. Just a straight connection between homeowners and contractors who do honest work.", likes: 0, comments: 0, saves: 0, tags: ["BuildBridge", "Our Mission"] },
  { id: 7, contractorId: 6, type: "text", time: "1d ago", title: "Citrus County homeowners: you may no longer need a permit for that project", description: "Florida's new HB 803 law took effect July 1 — projects under $7,500 may now qualify for a permit exemption, meaning less paperwork and faster starts. Exemption doesn't cover electrical, plumbing, structural, mechanical, or gas work, and flood zone properties don't qualify. BuildBridge Permit Prep helps you figure out if you qualify and handles the filing so you don't have to fight the county portal. Contractors: your first filing is free (prep fee waived — county fees always separate). Head to the Permits tab to learn more. #HB803 #CitrusCounty #BuildBridge",likes: 0, comments: 1, saves: 0, commentsList: [{ author: "BuildBridge FL", avatar: "BB", text: "Questions about whether your project qualifies? Drop us a line through the Permits tab — happy to help you figure it out." }],tags: ["HB803", "CitrusCounty", "BuildBridge"] },
  { id: 6, contractorId: 6, type: "text", time: "1w ago", title: "Welcome to BuildBridge FL — Citrus County's Construction Network", description: "BuildBridge is live and open for business in Citrus County. If you're a contractor, vendor, or homeowner — this is your platform. Free to join, built by someone with 25+ years in the trades. Let's build something great together.", likes: 0, comments: 0, saves: 0,tags: ["CitrusCounty", "BuildBridge", "Welcome"] }
];

const REVIEWS = [
];

const PROJECTS = [

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
  "Project Management": ["manage", "budget", "permit", "oversee", "coordinate", "project manager", "inception", "closeout", "architect", "new home", "custom home", "ground up", "vet", "hire a builder", "general oversight"],
};

function scoreContractors(input) {
  const text = input.toLowerCase();
  return CONTRACTORS
    .map(c => {
      const keys = TRADE_KEYWORDS[c.trade] || [];
      const reasons = keys.filter(k => text.includes(k));
      const tradeHit = text.includes(c.trade.toLowerCase()) ? 2 : 0;
      const specialtyHits = c.specialties.filter(s => text.includes(s.toLowerCase())).length;
      const score = reasons.length * 2 + tradeHit + specialtyHits * 1.5 + c.rating * 0.4 + (c.verified ? 0.3 : 0);
      return { ...c, score, reasons: [...new Set(reasons)] };
    })
    .filter(c => c.reasons.length > 0 || text.includes(c.trade.toLowerCase()))
    .sort((a, b) => b.score - a.score);
}

// ── Design tokens ────────────────────────────────────────────────────────────
const C = {
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

const css = `
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
      <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg, ${C.orange}2A, ${C.blue}22)`, border: `2px solid ${premium ? C.orange : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.34, fontWeight: 800, color: C.orange }} className="display">
       <span style={{ color: "#fff", fontWeight: 800, fontSize: size * 0.34, textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>{initials}</span> 
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
            {contractor.verified && <Badge text="Licensed" color={C.green} icon="badge" />}
            {contractor.premium && <Badge text="Premium" color={C.orange} icon="star" />}
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{contractor.company} · {contractor.trade} · {post.time}</div>
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

// ── Contractor profile ───────────────────────────────────────────────────────
function ContractorProfile({ contractor, reviews, onBack, onToast }) {
  const [tab, setTab] = useState("portfolio");
  const myReviews = reviews.filter(r => r.contractorId === contractor.id);
  const tel = contractor.phone?.replace(/\D/g, "");

  return (
    <div className="fade-in">
      <div style={{ background: `linear-gradient(135deg, ${C.panel}, #16224066)`, height: 116, borderRadius: 16, border: `1px solid ${C.border}`, position: "relative", marginBottom: -30 }}>
        <button onClick={onBack} className="btn-ghost" style={{ position: "absolute", top: 14, left: 14, padding: "6px 14px", fontSize: 13, background: `${C.bg}CC` }}>← Back</button>
        <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 8 }}>
          {contractor.premium && <Badge text="Premium Pro" color={C.orange} icon="star" />}
          {contractor.verified && <Badge text="Verified" color={C.green} icon="badge" />}
        </div>
      </div>

      <div style={{ padding: "0 6px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 14, marginBottom: 18, paddingLeft: 12 }}>
          <Avatar initials={contractor.avatar} size={76} premium={contractor.premium} />
          <div style={{ flex: 1, paddingBottom: 4, minWidth: 0 }}>
            <div className="display" style={{ fontWeight: 800, fontSize: 22, color: C.white }}>{contractor.name}</div>
            <div style={{ fontSize: 13, color: C.dim }}>{contractor.company} · {contractor.trade}</div>
          </div>
        </div>

        {/* Contact strip — the actions that make the phone ring */}
        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
         <a href={`tel:${tel}`} onClick={() => track("call_click", contractor.company)} className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 18px", fontSize: 13, textDecoration: "none" }}>
            <Icon name="phone" size={15} color="#14100A" /> Call {contractor.phone}
          </a>
          <button onClick={() => setTab("contact")} className="btn-ghost" style={{ padding: "10px 18px", fontSize: 13 }}>Message</button>
          <button onClick={() => { track("follow_click", contractor.company); onToast("Thanks for the interest — full accounts coming soon"); }} className="btn-ghost" style={{ padding: "10px 18px", fontSize: 13 }}>+ Follow</button>
          {contractor.website && <a href={`${contractor.website}?utm_source=buildbridge&utm_medium=profile`} target="_blank" rel="noopener" onClick={() => track("website_click", contractor.company)} className="btn-ghost" style={{ padding: "10px 18px", fontSize: 13, textDecoration: "none" }}>Website</a>} 
        </div>

        <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
          {[["Rating", contractor.rating.toFixed(1)], ["Jobs done", contractor.jobs], ["Followers", contractor.followers], ["Reviews", contractor.reviews]].map(([label, val]) => (
            <div key={label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
              <div className="display" style={{ fontWeight: 800, fontSize: 20, color: C.orange }}>{val}</div>
              <div style={{ fontSize: 10.5, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

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
              {contractor.license === "N/A" ? "License: N/A" : <>License <a href={`https://www.myfloridalicense.com/wl11.asp?mode=2&search=LicNbr&SID=&brd=&typ=&lic=${contractor.license}`} target="_blank" rel="noreferrer" style={{ color: C.blue, fontWeight: 700 }}>{contractor.license}</a> · verify at FL DBPR</>}
            </span>
          </div>
        </div>

        {contractor.videoTitle && (
          <div style={{ background: `linear-gradient(135deg, #1C1233, #241A45)`, border: `1px solid ${C.purple}44`, borderRadius: 14, padding: 16, marginBottom: 14 }}>
            <div className="eyebrow" style={{ color: C.purple, marginBottom: 10 }}>Premium feature — video commercial</div>
            {contractor.videoUrl ? (
              <>
                <VideoEmbed url={contractor.videoUrl} title={contractor.videoTitle} />
                <div style={{ fontWeight: 800, fontSize: 14, color: C.white, marginTop: 10 }}>{contractor.videoTitle}</div>
                <div style={{ fontSize: 12, color: C.purple, marginTop: 3 }}>HD project walkthrough · Featured on BuildBridge</div>
              </>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: `${C.purple}22`, border: `2px solid ${C.purple}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name="play" size={20} color={C.purple} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: C.white }}>{contractor.videoTitle}</div>
                  <div style={{ fontSize: 12, color: C.purple, marginTop: 3 }}>Video coming soon</div>
                </div>
              </div>
            )}
          </div>
        )}

        <div role="tablist" style={{ display: "flex", gap: 4, marginBottom: 16, background: C.panel, borderRadius: 10, padding: 4, border: `1px solid ${C.border}` }}>
          {["portfolio", "reviews", "contact"].map(t => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} style={{ flex: 1, background: tab === t ? C.orange : "transparent", color: tab === t ? "#14100A" : C.muted, border: "none", borderRadius: 8, padding: "9px", fontSize: 13, fontWeight: 800, cursor: "pointer", textTransform: "capitalize" }}>{t}</button>
          ))}
        </div>

        {tab === "portfolio" && (
          <div className="portfolio-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {(contractor.projects || []).map((proj, i) => (
              <div key={proj} className="hover-card" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
                <div style={{ height: 84, background: `linear-gradient(135deg, ${["#173154", "#14361F", "#3A1D1D", "#241A45"][i]}, ${C.panel})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
            <div style={{ textAlign: "center", padding: 40, color: C.muted, fontSize: 13, background: C.card, borderRadius: 12, border: `1px dashed ${C.line}` }}>
              No reviews yet. Hire {contractor.name.split(" ")[0]} and be the first to leave one.
            </div>
          )
        )}

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

// ── Main app ─────────────────────────────────────────────────────────────────
export default function BuildBridgeSocial() {
  const [view, setView] = useState("feed");
  const [activeProfile, setActiveProfile] = useState(null);
  const [postModal, setPostModal] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [toast, setToast] = useState(null);
  const [networkQuery, setNetworkQuery] = useState("");
  const [matchInput, setMatchInput] = useState("");
  const [matchBudget, setMatchBudget] = useState("");
  const [matchTimeline, setMatchTimeline] = useState("");
  const [matchResults, setMatchResults] = useState(null); // null = not searched yet
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchSummary, setMatchSummary] = useState("");

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 2500); };
  const openProfile = c => { setActiveProfile(c); setView("profile"); };
  const goView = id => { setView(id); setActiveProfile(null); };

  const filteredNetwork = useMemo(() => {
    const q = networkQuery.trim().toLowerCase();
    if (!q) return CONTRACTORS.filter(c => !c.hidden);
    return CONTRACTORS.filter(c => !c.hidden && [c.name, c.company, c.trade, c.location, ...c.specialties].join(" ").toLowerCase().includes(q));
  }, [networkQuery]);

  const keywordFallback = () => {
    const scored = scoreContractors(matchInput);
    setMatchResults(scored.length > 0 ? scored : [...CONTRACTORS].sort((a, b) => b.rating - a.rating));
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
          contractors: CONTRACTORS.map(({ id, name, company, trade, specialties, location, rating, jobs, verified }) => ({ id, name, company, trade, specialties, location, rating, jobs, verified })),
        }),
      });
      if (!r.ok) throw new Error("api");
      const data = await r.json();
      const matched = (data.matches || [])
        .map(m => {
          const c = CONTRACTORS.find(x => x.id === m.id);
          return c ? { ...c, reasons: m.reason ? [m.reason] : [] } : null;
        })
        .filter(Boolean);
      if (matched.length === 0) throw new Error("empty");
      setMatchResults(matched);
      setMatchSummary(data.summary || "");
    } catch {
      keywordFallback(); // API down or no key set — keyword matcher still works
    } finally {
      setMatchLoading(false);
    }
  };

  const navItems = [
  { id: "feed", icon: "home", label: "Feed" },
{ id: "match", icon: "sparkles", label: "AI Match" },
{ id: "jobs", icon: "hammer", label: "Find Work" },
{ id: "projects", icon: "clipboard", label: "Projects" },
{ id: "network", icon: "users", label: "Network" },
{ id: "permits", icon: "clipboard", label: "Permits" },
{ id: "suppliers", icon: "truck", label: "Suppliers" },  
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
      <style>{css}</style>
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
  <text x="450" y="130" fontFamily="Arial, Helvetica, sans-serif" fontSize="86" fontWeight="700" textAnchor="middle" fill="#DCE4F2">Build<tspan fill="#FF8A1E">Bridge</tspan></text>
  <path d="M 200 175 Q 450 130 700 175" fill="none" stroke="#E06D00" strokeWidth="4" />
  <circle cx="200" cy="175" r="7" fill="#FF8A1E" />
  <circle cx="325" cy="152" r="7" fill="#E06D00" />
  <circle cx="450" cy="142" r="8" fill="#DCE4F2" />
  <circle cx="575" cy="152" r="7" fill="#E06D00" />
  <circle cx="700" cy="175" r="7" fill="#FF8A1E" />
</svg>
          <span className="hide-mobile" style={{ fontSize: 10, color: C.orange, background: `${C.orange}18`, padding: "3px 9px", borderRadius: 20, fontWeight: 800, letterSpacing: "0.1em" }}>CITRUS COUNTY</span>
        </button>

        <nav className="top-nav" aria-label="Primary"><NavButtons /></nav>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={() => setPostModal(true)} className="btn-primary" style={{ padding: "8px 16px", fontSize: 12.5, display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="plus" size={14} color="#14100A" /><span className="hide-mobile">Post</span>
          </button>
          <Avatar initials="BB" size={34} />
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="bottom-nav" aria-label="Primary mobile"><NavButtons vertical /></nav>

      {/* Post modal */}
      {postModal && (
        <div role="dialog" aria-modal="true" aria-label="Share a project or update" style={{ position: "fixed", inset: 0, background: "rgba(4,8,16,0.75)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={e => e.target === e.currentTarget && setPostModal(false)}>
          <div className="fade-in" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, width: "100%", maxWidth: 480, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div className="display" style={{ fontWeight: 800, fontSize: 18, color: C.white }}>Share an update</div>
              <button onClick={() => setPostModal(false)} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 4 }}><Icon name="x" size={18} /></button>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              {["Project", "Video", "Hiring", "Seeking work"].map(t => (
                <button key={t} className="btn-ghost" style={{ padding: "6px 12px", fontSize: 11.5 }}>{t}</button>
              ))}
            </div>
            <textarea value={newPost} onChange={e => setNewPost(e.target.value)} aria-label="Post content"
              placeholder="Describe your project, share a before & after, post a job opening…"
              style={{ width: "100%", background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: 12, color: C.text, fontSize: 13, resize: "vertical", minHeight: 120, fontFamily: "inherit", outline: "none", marginBottom: 12 }} />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setPostModal(false)} className="btn-ghost" style={{ flex: 1, padding: 11, fontSize: 13 }}>Cancel</button>
              <button onClick={() => { track("share_update_click", "Crew Board"); window.location.href = `mailto:asanchez@buildbridgefl.com?subject=BuildBridge Post Submission&body=${encodeURIComponent(newPost)}`; setPostModal(false); setNewPost(""); showToast("Thanks! We'll get this live on your profile shortly."); }} className="btn-primary" style={{ flex: 2, padding: 11, fontSize: 13 }}>Publish post</button>
            </div>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="app-shell">
        <main className="main-col">
          <div className="scroll-col">
            {view === "profile" && activeProfile ? (
              <ContractorProfile contractor={activeProfile} reviews={REVIEWS} onBack={() => goView("feed")} onToast={showToast} />

            ) : view === "feed" ? (
              <>
                {/* Homeowner quick-start */}
                <div style={{ background: `linear-gradient(120deg, ${C.card}, #1A2645)`, border: `1px solid ${C.border}`, borderRadius: 16, padding: "18px 18px 16px", marginBottom: 18, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `repeating-linear-gradient(45deg, ${C.orange}, ${C.orange} 10px, #14100A 10px, #14100A 20px)` }} aria-hidden="true" />
                  <div className="eyebrow" style={{ marginBottom: 6, marginTop: 4 }}>Homeowners start here</div>
                  <div className="display" style={{ fontWeight: 800, fontSize: 21, color: C.white, lineHeight: 1.15, marginBottom: 6 }}>Find the right pro for your project</div>
                  <div style={{ fontSize: 13, color: C.dim, marginBottom: 14 }}>Describe the job in plain words — our AI matches you with licensed Citrus County contractors.</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button onClick={() => goView("match")} className="btn-primary" style={{ padding: "10px 18px", fontSize: 13, display: "flex", alignItems: "center", gap: 7 }}>
                      <Icon name="sparkles" size={15} color="#14100A" />Match me with a contractor
                    </button>
                    <button onClick={() => goView("network")} className="btn-ghost" style={{ padding: "10px 18px", fontSize: 13 }}>Browse the network</button>
                  </div>
                </div>
                 {/* Permit Prep banner */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", background: C.card, border: `1px solid ${C.orange}55`, borderLeft: `4px solid ${C.orange}`, borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: C.white, marginBottom: 4 }}>Permit Prep is here — HB 803 exemptions</div>
            <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.5 }}>Projects under $7,500 may not need a permit anymore. We check and file for you. Contractors: first filing free.</div>
          </div>
          <button className="btn-primary" onClick={() => (track("permit_banner_click", "banner"), window.open("https://docs.google.com/forms/d/e/1FAIpQLSefxtPbcIOzoAEZYCuQa8f-HTVmxd1pIQ5WYPtAdxhBcZ1jjg/viewform"))} style={{ padding: "10px 16px", fontSize: 12.5, whiteSpace: "nowrap" }}>Check My Project</button>
        </div>
               {/* Get Listed banner */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "12px 16px", marginBottom: 16 }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.white }}>Contractors: get listed free</div>
            <div style={{ fontSize: 11.5, color: C.dim }}>Verified badge, direct homeowner contact, no fees.</div>
          </div>
          <button className="btn-ghost" onClick={() => (track("get_listed_banner_click", "banner"), window.open("https://docs.google.com/forms/d/e/1FAIpQLSe6VqOYrwFEJFWzycoT3cZtfU76pXTYIC3RpR04y_EO0RngZQ/viewform"))} style={{ padding: "9px 14px", fontSize: 12 }}>Get Listed</button>
        </div>  

                {/* Story bar */}
                <div style={{ display: "flex", gap: 14, marginBottom: 18, overflowX: "auto", paddingBottom: 4 }}>
                  {CONTRACTORS.filter(c => !c.hidden).map(c => (
                    <button key={c.id} onClick={() => openProfile(c)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", flexShrink: 0, background: "none", border: "none", padding: 0 }} aria-label={`View ${c.name}'s profile`}>
                      <div style={{ padding: 2, borderRadius: "50%", background: c.premium ? `linear-gradient(135deg, ${C.orange}, ${C.orangeDk})` : C.border }}>
                        <Avatar initials={c.avatar} size={48} />
                      </div>
                      <span style={{ fontSize: 10.5, color: C.muted, maxWidth: 58, textAlign: "center", lineHeight: 1.2 }}>{c.compnany}</span>
                    </button>
                  ))}
                </div>

                {FEED_POSTS.map(post => (
                  <FeedPost key={post.id} post={post} contractor={CONTRACTORS.find(c => c.id === post.contractorId)} onProfile={openProfile} />
                ))}
              </>

            ) : view === "projects" ? (
              <>
                <SectionHead eyebrow="Open bids" title="Open projects" sub="Homeowners and developers looking for contractors now" />
                {PROJECTS.length === 0 && (
                <div style={{ background: C.card, border: `1px dashed ${C.border}`, borderRadius: 16, padding: "36px 20px", textAlign: "center", marginBottom: 16 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: C.white, marginBottom: 6 }}>No open projects yet</div>
                  <div style={{ fontSize: 12.5, color: C.dim, lineHeight: 1.6, maxWidth: 420, margin: "0 auto 14px" }}>Homeowners: be the first — post your project free and let verified local contractors come to you.</div>
                  <button className="btn-primary" onClick={() => (track("post_project_click", "projects"), window.open("https://docs.google.com/forms/d/e/1FAIpQLSfR4-Vo9J6VdoBETpNWKkz1KntfzW-LpqFnKui8k7QNVUzjDw/viewform"))} style={{ padding: "10px 18px", fontSize: 13 }}>Post a Project</button>
                </div>
              )} 
                {PROJECTS.map(proj => (
                  <div key={proj.id} className="hover-card" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, gap: 10, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 800, fontSize: 16, color: C.white }}>{proj.type}</span>
                          {proj.urgent && <Badge text="Urgent" color={C.red} />}
                        </div>
                        <div style={{ fontSize: 12, color: C.muted }}>Posted by {proj.owner} · {proj.posted}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="display" style={{ fontWeight: 800, fontSize: 17, color: C.orange }}>{proj.budget}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>{proj.bids} bids</div>
                      </div>
                    </div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: C.dim, marginBottom: 10 }}><Icon name="pin" size={14} color={C.muted} />{proj.location}</div>
                    <p style={{ fontSize: 13.5, color: C.dim, lineHeight: 1.55, marginBottom: 14 }}>{proj.description}</p>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={() => showToast("Bid submitted")} className="btn-primary" style={{ flex: 1, padding: 11, fontSize: 13 }}>Submit bid</button>
                      <button className="btn-ghost" style={{ padding: "11px 18px", fontSize: 13 }}>Save</button>
                    </div>
                  </div>
                ))}
              </>

            ) : view === "network" ? (
              <>
                <SectionHead eyebrow="The directory" title="Contractor network" sub="Verified, licensed professionals in Citrus County" />
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
                          {c.verified && <Badge text="Licensed" color={C.green} icon="badge" />}
                          {c.premium && <Badge text="Pro" color={C.orange} icon="star" />}
                        </div>
                      </div>
                      <p style={{ fontSize: 13, color: C.dim, margin: "8px 0", lineHeight: 1.5 }}>{c.bio}</p>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                        <Stars rating={c.rating} />
                        <span style={{ fontSize: 12, color: C.muted }}>{c.jobs} jobs · {c.followers} followers</span>
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                        <button onClick={() => openProfile(c)} className="btn-primary" style={{ padding: "8px 16px", fontSize: 12 }}>View profile</button>
                        <a href={`tel:${c.phone?.replace(/\D/g, "")}`} className="btn-ghost" style={{ padding: "8px 14px", fontSize: 12, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <Icon name="phone" size={13} />Call
                        </a>
                        <button onClick={() => { track("follow_click", c.company); showToast("Thanks for the interest — full accounts coming soon"); }} className="btn-ghost" style={{ padding: "8px 14px", fontSize: 12 }}>+ Follow</button>
                      </div>
                    </div>
                  </div>
                ))}
              </>

            ) : view === "jobs" ? (
              <>
                <SectionHead eyebrow="Crew board" title="Find work" sub="Jobs posted by contractors looking for crews and specialty trades" />
                {JOBS.map((job, i) => (
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
                <SectionHead eyebrow="Smart matching" title="AI project matching" sub="Describe your project in plain words — we find the right contractor instantly" />
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
                  </div>
                  <button onClick={runMatch} disabled={matchLoading} className="btn-primary" style={{ width: "100%", padding: 13, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: matchLoading ? 0.7 : 1 }}>
                    <Icon name="sparkles" size={16} color="#14100A" />{matchLoading ? "Matching…" : "Find matching contractors"}{!matchLoading && <Icon name="arrowRight" size={16} color="#14100A" />}
                  </button>
                </div>

                {matchResults && (
                  <div className="fade-in">
                    {matchSummary && (
                      <div style={{ background: C.card, border: `1px solid ${C.blue}44`, borderRadius: 12, padding: "12px 16px", marginBottom: 14, fontSize: 13.5, color: C.dim, lineHeight: 1.5, display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <Icon name="sparkles" size={16} color={C.blue} style={{ marginTop: 2 }} />
                        <span><span style={{ color: C.white, fontWeight: 700 }}>AI assessment: </span>{matchSummary}</span>
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
                            {c.reasons?.length > 0 && (
                              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, color: C.green, marginBottom: 8, fontWeight: 700 }}>
                                <Icon name="check" size={13} color={C.green} />Matched on: {c.reasons.join(", ")}
                              </div>
                            )}
                            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                              <button onClick={() => openProfile(c)} className="btn-primary" style={{ padding: "8px 16px", fontSize: 12 }}>View profile</button>
                              <button onClick={() => showToast(`Message sent to ${c.name}`)} className="btn-ghost" style={{ padding: "8px 14px", fontSize: 12 }}>Message</button>
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
              <SectionHead eyebrow="BuildBridge LLC Services" title="Permit Prep & Processing" sub="Citrus County permit paperwork — handled. Your license, your permit, our legwork." />

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

              <button onClick={() => (track("permit_request_click", "BuildBridge LLC"), window.location.href = "mailto:asanchez@buildbridgefl.com?subject=Permit Prep Request")} className="btn-primary" style={{ width: "100%", padding: 14, fontSize: 14 }}>Request Permit Help</button>
            </>
          ) : view === "suppliers" ? (             <>               <SectionHead eyebrow="Vendors & Suppliers" title="Material Suppliers" sub="Local suppliers Citrus County contractors trust. Order or reach out directly." />                {SUPPLIERS.map(s => (                 <div key={s.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>                   <div className="eyebrow" style={{ marginBottom: 6, color: C.orange }}>{s.category}</div>                   <div style={{ fontSize: 18, fontWeight: 800, color: C.white, marginBottom: 6 }}>{s.name}</div>                   <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>{s.location}</div>                   <p style={{ fontSize: 13.5, color: C.dim, lineHeight: 1.6, marginTop: 0, marginBottom: 14 }}>{s.bio}</p>                   <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>                     <a href={`${s.website}?utm_source=buildbridge&utm_medium=supplier_catalog`} target="_blank" rel="noopener" onClick={() => track("supplier_click", s.name)} className="btn-primary" style={{ display: "inline-flex", alignItems: "center", padding: "10px 18px", fontSize: 13, textDecoration: "none" }}>Shop Now</a>                     {s.phone && <a href={`tel:${s.phone}`} onClick={() => track("supplier_call_click", s.name)} className="btn-ghost" style={{ padding: "10px 18px", fontSize: 13, textDecoration: "none" }}>Call {s.phone}</a>}                   </div>                 </div>               ))}             </>           ) : null}
          </div>
        </main>

        {/* Right sidebar */}
        <aside className="side-col">
          <div className="scroll-col">
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>Popular Topics</div>
              {["#MetalRoofing", "#KitchenRemodel", "#NewConstruction", "#StormRepair", "#OutdoorLiving"].map((tag, i) => (
                <div key={tag} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 4 ? `1px dashed ${C.line}` : "none" }}>
                  <span style={{ fontSize: 13, color: C.blue, cursor: "pointer", fontWeight: 600 }}>{tag}</span>
                </div>
              ))}
            </div>

            {/* Vendor CTA */}
            <div style={{ background: C.card, border: `1px solid ${C.orange}44`, borderRadius: 14, padding: 16, marginBottom: 16, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `repeating-linear-gradient(45deg, ${C.orange}, ${C.orange} 10px, #14100A 10px, #14100A 20px)` }} aria-hidden="true" />
              <div className="eyebrow" style={{ marginBottom: 8, marginTop: 4 }}>Vendors & suppliers</div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: C.white, marginBottom: 8 }}>Put your business in front of every contractor in the county</div>
              <div style={{ fontSize: 12, color: C.dim, marginBottom: 12, lineHeight: 1.55 }}>List your shop, post deals, and reach the crews buying materials every week. Free to join.</div>
              <button  className="btn-primary" style={{ width: "100%", padding: 10, fontSize: 12.5 }} onClick={() => (track("supplier_signup_click", "sidebar"), window.open("https://docs.google.com/forms/d/e/1FAIpQLSe6VqOYrwFEJFWzycoT3cZtfU76pXTYIC3RpR04y_EO0RngZQ/viewform", "_blank"))}>Feature Your Deals</button>
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
              {CONTRACTORS.filter(c => !c.hidden).slice(0, 3).map((c, i) => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < 2 ? `1px dashed ${C.line}` : "none" }}>
                  <Avatar initials={c.avatar} size={36} premium={c.premium} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{c.trade}</div>
                  </div>
                  <button onClick={() => { track("follow_click", c.company); showToast("Thanks for the interest — full accounts coming soon"); }} style={{ background: "transparent", border: `1px solid ${C.orange}`, borderRadius: 6, padding: "4px 10px", color: C.orange, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>+ Follow</button>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
