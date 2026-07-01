import { useState } from "react";

// ── Data ─────────────────────────────────────────────────────────────────────
const CONTRACTORS = [
  { id: 1, name: "Marco Rivera", company: "Rivera & Sons Construction", trade: "General Contractor", location: "Homosassa Springs, FL", rating: 4.9, jobs: 87, followers: 312, following: 44, verified: true, premium: true, avatar: "MR", bio: "20 years building Citrus County. Custom homes, additions, full renovations. Family owned since 2004.", specialties: ["Custom Homes","Additions","Renovations"], license: "CGC1524891", reviews: 64, videoTitle: "2024 Kitchen Transformation — Crystal River" },
  { id: 2, name: "Dana Marsh", company: "Coastal Electric LLC", trade: "Electrical", location: "Crystal River, FL", rating: 4.8, jobs: 134, followers: 198, following: 67, verified: true, premium: false, avatar: "DM", bio: "Licensed master electrician. Panel upgrades, new installs, EV charging stations, commercial work.", specialties: ["Panel Upgrades","EV Charging","Commercial"], license: "EC13007422", reviews: 98, videoTitle: null },
  { id: 3, name: "Bill Tran", company: "SunState Roofing", trade: "Roofing", location: "Inverness, FL", rating: 4.7, jobs: 210, followers: 445, following: 23, verified: true, premium: true, avatar: "BT", bio: "Metal, shingle, flat roofs. Storm damage specialists. 25 years serving Central Florida.", specialties: ["Metal Roofing","Storm Repair","Flat Roof"], license: "CCC1332114", reviews: 156 },
  { id: 4, name: "Pete Alonzo", company: "Gulf Plumbing Co.", trade: "Plumbing", location: "Homosassa, FL", rating: 4.9, jobs: 98, followers: 167, following: 89, verified: true, premium: false, avatar: "PA", bio: "Full-service plumbing for residential and commercial. New construction, repiping, water heaters.", specialties: ["Repiping","New Construction","Water Heaters"], license: "CFC1428833", reviews: 71, videoTitle: null },
  { id: 5, name: "Carmen Ruiz", company: "Apex Tile & Stone", trade: "Tile & Masonry", location: "Crystal River, FL", rating: 5.0, jobs: 43, followers: 289, following: 112, verified: true, premium: true, avatar: "CR", bio: "Custom tile, natural stone, brick. Interior and exterior. Every job a masterpiece.", specialties: ["Natural Stone","Custom Tile","Outdoor Living"], license: "CBC1261098", reviews: 39, videoTitle: "Outdoor Kitchen & Stone Patio — Sugarmill Woods" },
  { id: 6, name: "Alexis Sanchez", company: "BuildBridge LLC", trade: "Project Management", location: "Citrus County, FL", rating: 5.0, jobs: 0, followers: 0, following: 0, verified: false, premium: true, avatar: "AS", bio: "Project Management company for residential builds — overseeing your project from inception to completion. Single point of contact for budget planning, architect coordination, permit management, hiring and vetting builders, construction oversight, and move-in closeout.", specialties: ["Budget Planning","Permit Management","Construction Oversight"], license: "N/A", reviews: 0, videoTitle: "BuildBridge FL — Citrus County's Construction Network", videoUrl: "https://www.youtube.com/embed/dTcSJL5hhpY" },
];

const FEED_POSTS = [{ id: 6, contractorId: 6, type: "video", time: "Just now", title: "Welcome to BuildBridge FL — Citrus County's Construction Network", description: "BuildBridge is live and open for business in Citrus County. If you're a contractor, vendor, or homeowner — this is your platform. Free to join, built by someone with 25+ years in the trades. Let's build something great together.", images: ["🏗️"], likes: 0, comments: 0, saves: 0, tags: ["CitrusCounty","BuildBridge","Welcome"], isVideo: true },
  { id: 1, contractorId: 3, type: "project", time: "2h ago", title: "Before & After: Full Roof Replacement", description: "48-hour turnaround on this storm-damaged home in Inverness. Architectural shingles with 30-year warranty. Homeowner had been dealing with leaks for 2 years — couldn't be happier with how it turned out.", images: ["🏠","✅"], likes: 47, comments: 12, saves: 8, tags: ["Roofing","StormRepair","Inverness"] },
  { id: 2, contractorId: 5, type: "video", time: "5h ago", title: "Outdoor Kitchen Build — Start to Finish", description: "This one took 3 weeks but every stone was worth it. Custom outdoor kitchen with built-in grill, pizza oven, and travertine countertops in Sugarmill Woods. Video walkthrough below.", images: ["🎬"], likes: 134, comments: 28, saves: 41, tags: ["OutdoorLiving","CustomStone","PremiumBuild"], isVideo: true },
  { id: 3, contractorId: 1, type: "project", time: "1d ago", title: "Kitchen Addition Complete — Crystal River", description: "580 sq ft addition including a brand new chef's kitchen, dining room bump-out, and French doors to the lanai. 11-week project, on time and under budget. Huge shoutout to the crew.", images: ["🍳","🏗️"], likes: 89, comments: 19, saves: 22, tags: ["Addition","KitchenRemodel","GC"] },
  { id: 4, contractorId: 2, type: "job", time: "3h ago", title: "Looking for Work: Electrical Crew Available", description: "Full 3-man electrical crew available for new construction starts in July. Rough-in, trim, panel work. Currently booking July 15+. DM or call. References on request.", images: [], likes: 23, comments: 7, saves: 3, tags: ["Hiring","Electrical","NewConstruction"], isJob: true },
  { id: 5, contractorId: 4, type: "project", time: "2d ago", title: "Whole-House Repipe — Homosassa Springs", description: "3-bed 2-bath full repipe with PEX-A and new water heater. Completed in one day with water restored same evening. No drywall damage thanks to our camera locating system.", images: ["🔧","💧"], likes: 56, comments: 9, saves: 14, tags: ["Plumbing","Repipe","Homosassa"] },
];

const REVIEWS = [
  { id: 1, contractorId: 1, author: "Susan H.", rating: 5, date: "May 2026", text: "Marco managed our entire addition from permits to punch list. One call, one person, zero headaches. The crew was respectful and the quality is outstanding.", project: "580 sq ft Kitchen Addition" },
  { id: 2, contractorId: 3, rating: 5, author: "Tom B.", date: "April 2026", text: "Roof replaced in 2 days after the storm. Bill was on-site the whole time. Insurance handled, cleanup perfect. Can't ask for more.", project: "Full Roof Replacement" },
  { id: 3, contractorId: 5, rating: 5, author: "Maria G.", date: "March 2026", text: "Carmen's tilework is genuinely art. The outdoor kitchen looks like something from a magazine. Worth every penny.", project: "Outdoor Kitchen & Patio" },
];

const PROJECTS = [
  { id: 1, owner: "Linda F.", type: "Bathroom Remodel", budget: "$15K–$25K", location: "Homosassa Springs, FL", posted: "1h ago", description: "Master bath gut renovation — new tile, vanity, walk-in shower, fixtures. About 85 sq ft.", bids: 3, urgent: false },
  { id: 2, owner: "Ray M.", type: "Roof Replacement", budget: "$8K–$15K", location: "Crystal River, FL", posted: "4h ago", description: "Shingle roof, approx 2,200 sq ft. Some decking damage from recent storm. Need assessment first.", bids: 7, urgent: true },
  { id: 3, owner: "Dev Group LLC", type: "Commercial Buildout", budget: "$150K+", location: "Inverness, FL", posted: "2d ago", description: "4,500 sq ft medical office buildout. Full GC needed. Plans available. Start date August 1.", bids: 2, urgent: false },
];

// ── Colors ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#0a0d14", panel: "#111520", card: "#161c2a",
  border: "#1e2640", orange: "#F5A623", blue: "#3B82F6",
  green: "#22c55e", red: "#ef4444", text: "#e2e8f0",
  muted: "#64748b", white: "#ffffff"
};

const css = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; font-family: 'Inter', system-ui, sans-serif; color: ${C.text}; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: ${C.bg}; }
  ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
  .feed-scroll { overflow-y: auto; height: calc(100vh - 60px); padding: 20px 16px; }
  .right-scroll { overflow-y: auto; height: calc(100vh - 60px); padding: 20px 16px; }
  @keyframes fadeIn { from { opacity:0; transform:translateY(8px);} to { opacity:1; transform:none; } }
  .fade-in { animation: fadeIn 0.25s ease; }
  .hover-card:hover { border-color: ${C.orange}44 !important; transition: border-color 0.2s; }
  .nav-btn { transition: all 0.15s; }
  .nav-btn:hover { background: rgba(245,166,35,0.1) !important; }
  .action-btn:hover { opacity: 0.85; }
`;

// ── Sub-components ────────────────────────────────────────────────────────────
function Avatar({ initials, size = 40, color = C.orange, premium = false }) {
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg, ${color}33, ${color}66)`, border: `2px solid ${premium ? C.orange : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, color: C.orange }}>
        {initials}
      </div>
      {premium && <div style={{ position: "absolute", bottom: -2, right: -2, width: 14, height: 14, background: C.orange, borderRadius: "50%", border: `2px solid ${C.bg}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7 }}>★</div>}
    </div>
  );
}

function Badge({ text, color = C.orange, bg }) {
  return <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: bg || `${color}18`, color, letterSpacing: "0.4px" }}>{text}</span>;
}

function StarRating({ rating }) {
  return <span style={{ color: C.orange, fontSize: 12 }}>{"★".repeat(Math.floor(rating))}{"☆".repeat(5 - Math.floor(rating))} <span style={{ color: C.muted, fontSize: 11 }}>{rating}</span></span>;
}

// ── Feed Post ─────────────────────────────────────────────────────────────────
function FeedPost({ post, contractor, onProfile }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showComment, setShowComment] = useState(false);

  return (
    <div className="hover-card fade-in" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, marginBottom: 16, overflow: "hidden" }}>
      {/* Post header */}
      <div style={{ padding: "16px 16px 12px", display: "flex", alignItems: "center", gap: 12 }}>
        <div onClick={() => onProfile(contractor)} style={{ cursor: "pointer" }}>
          <Avatar initials={contractor.avatar} size={44} premium={contractor.premium} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span onClick={() => onProfile(contractor)} style={{ fontWeight: 700, fontSize: 14, color: C.white, cursor: "pointer" }}>{contractor.name}</span>
            {contractor.verified && <Badge text="✓ Licensed" color={C.green} />}
            {contractor.premium && <Badge text="★ Premium" color={C.orange} />}
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{contractor.company} · {contractor.trade} · {post.time}</div>
        </div>
        {post.isJob && <Badge text="HIRING" color={C.blue} />}
        {post.isVideo && <Badge text="▶ VIDEO" color="#a855f7" />}
      </div>

      {/* Post content */}
      <div style={{ padding: "0 16px 14px" }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: C.white, marginBottom: 8 }}>{post.title}</div>
        <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, marginBottom: 12 }}>{post.description}</div>

        {/* Image/video placeholder */}
        {(post.images.length > 0 || post.isVideo) && (
          <div style={{ background: C.panel, borderRadius: 12, padding: "20px", display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 12, border: `1px solid ${C.border}` }}>
          {post.isVideo ? (
              contractor.videoUrl ? (
                <div style={{ width: "100%" }}>
                  <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: 10, overflow: "hidden" }}>
                    <iframe src={contractor.videoUrl} title={contractor.videoTitle} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }} allowFullScreen />
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: C.white, marginTop: 8 }}>{contractor.videoTitle}</div>
                </div>
              ) : (
                <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", gap: 16 }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: `${C.orange}22`, border: `2px solid ${C.orange}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>▶</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: C.white }}>{contractor.videoTitle}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>Video coming soon</div>
                  </div>
                </div>
              )
            ) : (  
              post.images.map((img, i) => (
                <div key={i} style={{ width: 80, height: 80, borderRadius: 10, background: `${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>{img}</div>
              ))
            )}
          </div>
        )}

        {/* Tags */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {post.tags.map(t => <span key={t} style={{ fontSize: 11, color: C.blue, background: `${C.blue}15`, padding: "2px 8px", borderRadius: 20 }}>#{t}</span>)}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 6, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
          {[
            { icon: liked ? "❤️" : "🤍", label: `${post.likes + (liked ? 1 : 0)}`, action: () => setLiked(!liked), active: liked },
            { icon: "💬", label: `${post.comments}`, action: () => setShowComment(!showComment) },
            { icon: saved ? "🔖" : "📌", label: `${post.saves + (saved ? 1 : 0)}`, action: () => setSaved(!saved) },
            { icon: "↗️", label: "Share" },
          ].map(({ icon, label, action }) => (
            <button key={label} onClick={action} className="action-btn" style={{ display: "flex", alignItems: "center", gap: 5, background: "transparent", border: "none", color: C.muted, fontSize: 12, cursor: "pointer", padding: "5px 10px", borderRadius: 8 }}>
              <span>{icon}</span><span>{label}</span>
            </button>
          ))}
        </div>

        {showComment && (
          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <input placeholder="Add a comment..." style={{ flex: 1, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 12, outline: "none" }} />
            <button style={{ background: C.orange, border: "none", borderRadius: 8, padding: "8px 14px", color: C.bg, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Post</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Contractor Profile ────────────────────────────────────────────────────────
function ContractorProfile({ contractor, reviews, onBack }) {
  const [activeTab, setActiveTab] = useState("portfolio");
  const myReviews = reviews.filter(r => r.contractorId === contractor.id);

  return (
    <div className="fade-in" style={{ background: C.bg, minHeight: "100%" }}>
      {/* Cover */}
      <div style={{ background: `linear-gradient(135deg, ${C.panel}, #1a2340)`, height: 120, borderBottom: `1px solid ${C.border}`, position: "relative" }}>
        <button onClick={onBack} style={{ position: "absolute", top: 16, left: 16, background: `${C.bg}cc`, border: `1px solid ${C.border}`, color: C.text, padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>← Back</button>
        <div style={{ position: "absolute", top: 16, right: 16, display: "flex", gap: 8 }}>
          {contractor.premium && <Badge text="★ PREMIUM PRO" color={C.orange} />}
          {contractor.verified && <Badge text="✓ VERIFIED" color={C.green} />}
        </div>
      </div>

      <div style={{ padding: "0 20px 20px", maxWidth: 680, margin: "0 auto" }}>
        {/* Profile header */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginTop: -28, marginBottom: 20 }}>
          <Avatar initials={contractor.avatar} size={72} premium={contractor.premium} />
          <div style={{ flex: 1, paddingBottom: 4 }}>
            <div style={{ fontWeight: 800, fontSize: 20, color: C.white }}>{contractor.name}</div>
            <div style={{ fontSize: 13, color: C.muted }}>{contractor.company} · {contractor.trade}</div>
          </div>
          <button style={{ background: C.orange, border: "none", borderRadius: 10, padding: "10px 20px", color: C.bg, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Follow</button>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
          {[["⭐", contractor.rating, "Rating"], ["🔨", contractor.jobs, "Jobs Done"], ["👥", contractor.followers, "Followers"], ["📝", contractor.reviews, "Reviews"]].map(([icon, val, label]) => (
            <div key={label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 18 }}>{icon}</div>
              <div style={{ fontWeight: 800, fontSize: 18, color: C.orange, marginTop: 4 }}>{val}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Bio */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: C.orange, fontWeight: 700, marginBottom: 8, letterSpacing: "0.5px" }}>ABOUT</div>
          <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, marginBottom: 12 }}>{contractor.bio}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {contractor.specialties.map(s => <Badge key={s} text={s} color={C.blue} />)}
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: C.muted }}>📍 {contractor.location} · 🪪 License: {contractor.license}</div>
        </div>

        {/* Video commercial slot */}
        {contractor.videoTitle && (
          <div style={{ background: `linear-gradient(135deg, #1a0a2e, #2d1b4e)`, border: `1px solid #7c3aed44`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: "#a855f7", fontWeight: 700, letterSpacing: "0.5px", marginBottom: 10 }}>★ PREMIUM FEATURE — VIDEO COMMERCIAL</div>
            {contractor.videoUrl ? (
              <div>
                <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: 10, overflow: "hidden" }}>
                  <iframe src={contractor.videoUrl} title={contractor.videoTitle} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }} allowFullScreen />
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.white, marginTop: 10 }}>{contractor.videoTitle}</div>
                <div style={{ fontSize: 12, color: "#a855f7", marginTop: 4 }}>HD Project Walkthrough · Featured on BuildBridge</div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#7c3aed33", border: "2px solid #7c3aed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>▶</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.white }}>{contractor.videoTitle}</div>
                  <div style={{ fontSize: 12, color: "#a855f7", marginTop: 4 }}>Video coming soon</div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 16, background: C.panel, borderRadius: 10, padding: 4 }}>
          {["portfolio", "reviews", "contact"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, background: activeTab === tab ? C.orange : "transparent", color: activeTab === tab ? C.bg : C.muted, border: "none", borderRadius: 8, padding: "8px", fontSize: 13, fontWeight: 700, cursor: "pointer", textTransform: "capitalize", transition: "all 0.15s" }}>{tab}</button>
          ))}
        </div>

        {activeTab === "portfolio" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {["Kitchen Remodel", "Room Addition", "Deck Build", "Bathroom Renovation"].map((proj, i) => (
                <div key={proj} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ height: 80, background: `linear-gradient(135deg, ${["#1e3a5f","#1a3a1e","#3a1e1e","#2d1b4e"][i]}, ${C.panel})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>{["🏠","🏗️","🌿","🚿"][i]}</div>
                  <div style={{ padding: "10px 12px" }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: C.white }}>{proj}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{contractor.location}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div>
            {myReviews.length > 0 ? myReviews.map(r => (
              <div key={r.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.white }}>{r.author}</div>
                  <StarRating rating={r.rating} />
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>{r.project} · {r.date}</div>
                <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, fontStyle: "italic" }}>"{r.text}"</div>
              </div>
            )) : (
              <div style={{ textAlign: "center", padding: 40, color: C.muted }}>No reviews yet for this contractor.</div>
            )}
          </div>
        )}

        {activeTab === "contact" && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: C.white, marginBottom: 16 }}>Send a Message</div>
            <textarea placeholder="Describe your project..." style={{ width: "100%", background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px", color: C.text, fontSize: 13, resize: "vertical", minHeight: 100, fontFamily: "inherit", outline: "none", marginBottom: 12 }} />
            <button style={{ width: "100%", background: C.orange, border: "none", borderRadius: 10, padding: "12px", color: C.bg, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Send Message</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function BuildBridgeSocial() {
  const [view, setView] = useState("feed");
  const [activeProfile, setActiveProfile] = useState(null);
  const [postModal, setPostModal] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [toast, setToast] = useState(null);
  const [matchResults, setMatchResults] = useState([]);
const [matchSearched, setMatchSearched] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const handleProfile = (contractor) => { setActiveProfile(contractor); setView("profile"); };

  const navItems = [
    { id: "feed", icon: "🏠", label: "Feed" },
    { id: "projects", icon: "📋", label: "Projects" },
    { id: "network", icon: "👥", label: "Network" },
    { id: "jobs", icon: "🔨", label: "Find Work" },
    { id: "match", icon: "🤖", label: "AI Match" },
  ];

  return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{css}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 70, left: "50%", transform: "translateX(-50%)", background: C.green, color: C.white, padding: "10px 20px", borderRadius: 10, fontWeight: 700, fontSize: 13, zIndex: 1000, boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>{toast}</div>
      )}

      {/* Header */}
      <header style={{ background: C.panel, borderBottom: `1px solid ${C.border}`, height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: `linear-gradient(135deg, ${C.orange}, #e8841a)`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🏗️</div>
          <span style={{ fontWeight: 800, fontSize: 17, color: C.white, letterSpacing: "-0.3px" }}>BuildBridge</span>
          <span style={{ fontSize: 10, color: C.orange, background: `${C.orange}18`, padding: "2px 8px", borderRadius: 20, fontWeight: 700 }}>SOCIAL</span>
        </div>

        <nav style={{ display: "flex", gap: 2 }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => { setView(n.id); setActiveProfile(null); }} className="nav-btn"
              style={{ background: view === n.id ? `${C.orange}18` : "transparent", color: view === n.id ? C.orange : C.muted, border: "none", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
              <span style={{ fontSize: 16 }}>{n.icon}</span>
              <span style={{ fontSize: 9 }}>{n.label}</span>
            </button>
          ))}
        </nav>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => setPostModal(true)} style={{ background: C.orange, border: "none", borderRadius: 8, padding: "7px 14px", color: C.bg, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>+ Post</button>
          <Avatar initials="AS" size={34} color={C.blue} />
        </div>
      </header>

      {/* Post Modal */}
      {postModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, width: "100%", maxWidth: 480, padding: 24 }} className="fade-in">
            <div style={{ fontWeight: 800, fontSize: 17, color: C.white, marginBottom: 16 }}>Share a Project or Update</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {["📸 Project", "🎬 Video", "💼 Hiring", "🔍 Seeking Work"].map(type => (
                <button key={type} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 10px", color: C.muted, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>{type}</button>
              ))}
            </div>
            <textarea value={newPost} onChange={e => setNewPost(e.target.value)}
              placeholder="Describe your project, share a before & after, post a job opening..." 
              style={{ width: "100%", background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px", color: C.text, fontSize: 13, resize: "vertical", minHeight: 120, fontFamily: "inherit", outline: "none", marginBottom: 12 }} />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setPostModal(false)} style={{ flex: 1, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px", color: C.muted, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => { setPostModal(false); setNewPost(""); showToast("✅ Post published!"); }}
                style={{ flex: 2, background: C.orange, border: "none", borderRadius: 10, padding: "10px", color: C.bg, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Publish Post</button>
            </div>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div style={{ display: "flex", flex: 1, maxWidth: 1100, margin: "0 auto", width: "100%" }}>

        {/* Feed / main content */}
        <div style={{ flex: 1, borderRight: `1px solid ${C.border}` }}>
          {view === "profile" && activeProfile ? (
            <div className="feed-scroll">
              <ContractorProfile contractor={activeProfile} reviews={REVIEWS} onBack={() => { setView("feed"); setActiveProfile(null); }} />
            </div>
          ) : view === "feed" ? (
            <div className="feed-scroll">
              {/* Story bar */}
              <div style={{ display: "flex", gap: 12, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
                {CONTRACTORS.map(c => (
                  <div key={c.id} onClick={() => handleProfile(c)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", flexShrink: 0 }}>
                    <div style={{ padding: 2, borderRadius: "50%", background: c.premium ? `linear-gradient(135deg, ${C.orange}, #ff6b35)` : `linear-gradient(135deg, ${C.border}, ${C.border})` }}>
                      <Avatar initials={c.avatar} size={48} premium={false} />
                    </div>
                    <span style={{ fontSize: 10, color: C.muted, maxWidth: 56, textAlign: "center", lineHeight: 1.2 }}>{c.name.split(" ")[0]}</span>
                  </div>
                ))}
              </div>

              {FEED_POSTS.map(post => {
                const contractor = CONTRACTORS.find(c => c.id === post.contractorId);
                return <FeedPost key={post.id} post={post} contractor={contractor} onProfile={handleProfile} />;
              })}
            </div>

          ) : view === "projects" ? (
            <div className="feed-scroll">
              <div style={{ fontWeight: 800, fontSize: 18, color: C.white, marginBottom: 4 }}>Open Projects</div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Homeowners and developers looking for contractors now</div>
              {PROJECTS.map(proj => (
                <div key={proj.id} className="hover-card" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 16, color: C.white }}>{proj.type}</span>
                        {proj.urgent && <Badge text="URGENT" color={C.red} />}
                      </div>
                      <div style={{ fontSize: 12, color: C.muted }}>Posted by {proj.owner} · {proj.posted}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: C.orange }}>{proj.budget}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{proj.bids} bids</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 12 }}>📍 {proj.location}</div>
                  <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.5, marginBottom: 14 }}>{proj.description}</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => showToast("✅ Bid submitted!")} style={{ flex: 1, background: C.orange, border: "none", borderRadius: 10, padding: "10px", color: C.bg, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Submit Bid</button>
                    <button style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 16px", color: C.muted, fontSize: 13, cursor: "pointer" }}>Save</button>
                  </div>
                </div>
              ))}
            </div>

          ) : view === "network" ? (
            <div className="feed-scroll">
              <div style={{ fontWeight: 800, fontSize: 18, color: C.white, marginBottom: 4 }}>Contractor Network</div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Verified, licensed professionals in your area</div>
              {CONTRACTORS.map(c => (
                <div key={c.id} className="hover-card" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, marginBottom: 14, display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div onClick={() => handleProfile(c)} style={{ cursor: "pointer" }}>
                    <Avatar initials={c.avatar} size={52} premium={c.premium} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div onClick={() => handleProfile(c)} style={{ fontWeight: 700, fontSize: 15, color: C.white, cursor: "pointer", marginBottom: 2 }}>{c.name}</div>
                        <div style={{ fontSize: 12, color: C.muted }}>{c.company} · {c.trade}</div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        {c.verified && <Badge text="✓" color={C.green} />}
                        {c.premium && <Badge text="★" color={C.orange} />}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: "#94a3b8", margin: "8px 0", lineHeight: 1.5 }}>{c.bio}</div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <StarRating rating={c.rating} />
                      <span style={{ fontSize: 12, color: C.muted }}>· {c.jobs} jobs · {c.followers} followers</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                      <button onClick={() => { handleProfile(c); }} style={{ background: C.orange, border: "none", borderRadius: 8, padding: "7px 16px", color: C.bg, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>View Profile</button>
                      <button onClick={() => showToast(`✅ Following ${c.name}!`)} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 16px", color: C.muted, fontSize: 12, cursor: "pointer" }}>+ Follow</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          ) : view === "jobs" ? (
            <div className="feed-scroll">
              <div style={{ fontWeight: 800, fontSize: 18, color: C.white, marginBottom: 4 }}>Find Work</div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Jobs posted by contractors looking for crews and specialty trades</div>
              {[
                { title: "Electrical Rough-In Crew Needed", company: "Rivera & Sons Construction", pay: "$28–$35/hr", type: "Subcontract", location: "Homosassa Springs", urgent: true, desc: "Need 2-man electrical rough-in crew for 2,400 sq ft new build. Starts July 15. Est. 3 weeks." },
                { title: "Tile Setter — Master Bath Project", company: "Gulf Plumbing Co.", pay: "$22–$28/hr", type: "1099 Contract", location: "Crystal River", urgent: false, desc: "Experienced tile setter needed for master bath renovation. Shower, floor, backsplash. 5-day job." },
                { title: "Framing Crew — Addition Project", company: "SunState Roofing", pay: "$26–$32/hr", type: "Subcontract", location: "Inverness", urgent: true, desc: "3-man framing crew needed for 580 sq ft addition. Plans ready. Start date flexible August 2026." },
              ].map((job, i) => (
                <div key={i} className="hover-card" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: C.white }}>{job.title}</span>
                        {job.urgent && <Badge text="URGENT" color={C.red} />}
                      </div>
                      <div style={{ fontSize: 12, color: C.muted }}>{job.company} · {job.location}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700, color: C.green, fontSize: 14 }}>{job.pay}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{job.type}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.5, marginBottom: 12 }}>{job.desc}</div>
                  <button onClick={() => showToast("✅ Application sent!")} style={{ background: C.green, border: "none", borderRadius: 10, padding: "9px 20px", color: C.white, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Apply Now</button>
                </div>
              ))}
            </div>

       ) : view === "match" ? (
    <div className="feed-scroll">
      <div style={{ fontWeight: 800, fontSize: 18, color: C.white, marginBottom: 4 }}>AI Project Matching</div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Describe your project — AI finds the right contractor instantly</div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 20 }}>
        <textarea
          id="match-input"
          placeholder="Describe your project in detail — type of work, location, budget, timeline..."
          style={{ width: "100%", background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px", color: C.text, fontSize: 13, resize: "vertical", minHeight: 120, fontFamily: "inherit", outline: "none", marginBottom: 14 }}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          {[["Budget", ["Under $5K","$5K–$15K","$15K–$50K","$50K+"]], ["Timeline", ["ASAP","1 Month","3 Months","Flexible"]]].map(([label, opts]) => (
            <div key={label}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 6 }}>{label.toUpperCase()}</div>
              <select id={`match-${label.toLowerCase()}`} style={{ width: "100%", background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", color: C.text, fontSize: 13, outline: "none" }}>
                <option value="">Select...</option>
                {opts.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>
        <button onClick={() => {
          const input = document.getElementById("match-input").value.toLowerCase();
          const keywords = {
            "Roofing": ["roof","shingle","metal roof","leak","storm","flat roof"],
            "Electrical": ["electric","panel","wiring","outlet","ev charging","breaker"],
            "Plumbing": ["plumb","pipe","water heater","repipe","leak","drain","faucet"],
            "Tile & Masonry": ["tile","stone","brick","masonry","grout","travertine","outdoor kitchen","patio"],
            "General Contractor": ["addition","renovation","remodel","build","construction","kitchen","bathroom","home","room"],
            "Project Management": ["manage","budget","permit","oversee","coordinate","project manager","inception","closeout"],
          };
          const scored = CONTRACTORS.map(c => {
            const tradeKeys = keywords[c.trade] || [];
            const score = tradeKeys.filter(k => input.includes(k)).length + (input.includes(c.trade.toLowerCase()) ? 2 : 0) + c.rating * 0.5;
            const reasons = tradeKeys.filter(k => input.includes(k));
            return { ...c, score, reasons };
          }).filter(c => c.score > 0).sort((a, b) => b.score - a.score);
          setMatchResults(scored.length > 0 ? scored : CONTRACTORS.sort((a,b) => b.rating - a.rating));
          setMatchSearched(true);
        }} style={{ width: "100%", background: C.orange, border: "none", borderRadius: 10, padding: "12px", color: C.bg, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
          🤖 Find Matching Contractors →
        </button>
      </div>

      {matchSearched && (
        <div>
          <div style={{ fontSize: 13, color: C.orange, fontWeight: 700, marginBottom: 12 }}>🤖 AI MATCHED {matchResults.length} CONTRACTORS</div>
          {matchResults.map((c, i) => (
            <div key={c.id} className="hover-card" style={{ background: C.card, border: `1px solid ${i === 0 ? C.orange : C.border}`, borderRadius: 16, padding: 18, marginBottom: 14 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ position: "relative" }}>
                  <Avatar initials={c.avatar} size={48} premium={c.premium} />
                  {i === 0 && <div style={{ position: "absolute", top: -6, right: -6, background: C.orange, color: C.bg, fontSize: 9, fontWeight: 800, padding: "2px 5px", borderRadius: 6 }}>TOP</div>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: C.white }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>{c.company} · {c.trade}</div>
                    </div>
                    <StarRating rating={c.rating} />
                  </div>
                  <div style={{ fontSize: 13, color: "#94a3b8", margin: "8px 0" }}>{c.bio}</div>
                  {c.reasons && c.reasons.length > 0 && (
                    <div style={{ fontSize: 11, color: C.green, marginBottom: 8 }}>✓ Matched on: {c.reasons.join(", ")}</div>
                  )}
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button onClick={() => handleProfile(c)} style={{ background: C.orange, border: "none", borderRadius: 8, padding: "7px 16px", color: C.bg, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>View Profile</button>
                    <button onClick={() => showToast(`✅ Message sent to ${c.name}!`)} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 16px", color: C.muted, fontSize: 12, cursor: "pointer" }}>Message</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  ) : null}
        </div>

        {/* Right sidebar */}
        <div style={{ width: 280, flexShrink: 0 }}>
          <div className="right-scroll">
            {/* Trending tags */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.orange, marginBottom: 12, letterSpacing: "0.5px" }}>TRENDING IN CITRUS COUNTY</div>
              {["#MetalRoofing", "#KitchenRemodel", "#NewConstruction", "#StormRepair", "#OutdoorLiving"].map((tag, i) => (
                <div key={tag} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: i < 4 ? `1px solid ${C.border}` : "none" }}>
                  <span style={{ fontSize: 13, color: C.blue, cursor: "pointer" }}>{tag}</span>
                  <span style={{ fontSize: 11, color: C.muted }}>{[312, 198, 156, 134, 89][i]} posts</span>
                </div>
              ))}
            </div>

            {/* Premium CTA */}
            <div style={{ background: `linear-gradient(135deg, #1a0a2e, #2d1b4e)`, border: `1px solid #7c3aed44`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#a855f7", marginBottom: 8, letterSpacing: "0.5px" }}>★ GO PREMIUM</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.white, marginBottom: 8 }}>Get your HD video commercial</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 12, lineHeight: 1.5 }}>Featured placement, verified badge, priority matching, and a pro video shoot of your best project.</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.orange, marginBottom: 12 }}>$149<span style={{ fontSize: 12, color: C.muted, fontWeight: 400 }}>/mo</span></div>
              <button style={{ width: "100%", background: "#7c3aed", border: "none", borderRadius: 10, padding: "10px", color: C.white, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Upgrade to Premium</button>
            </div>

            {/* Suggested connections */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.orange, marginBottom: 12, letterSpacing: "0.5px" }}>PEOPLE TO FOLLOW</div>
              {CONTRACTORS.slice(0, 3).map(c => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                  <Avatar initials={c.avatar} size={36} premium={c.premium} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.white }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{c.trade}</div>
                  </div>
                  <button onClick={() => showToast(`✅ Following ${c.name}!`)} style={{ background: "transparent", border: `1px solid ${C.orange}`, borderRadius: 6, padding: "4px 10px", color: C.orange, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Follow</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
