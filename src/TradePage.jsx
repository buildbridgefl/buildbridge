import React, { useMemo, useEffect } from "react";

/**
 * SEO landing page for one trade in one county.
 *
 * Unlike the rest of the app, this page is built to be *read by a crawler*:
 *  - a real <h1>, semantic headings, and body copy in the DOM
 *  - contractor names, license numbers, and towns as plain text (not aria-labels)
 *  - real <a href> links so Google has somewhere to crawl next
 *  - ItemList schema (we don't own these businesses, so no LocalBusiness markup)
 */
export default function TradePage({
  roster, towns, bucket, dist, C, trade, county, theme, toggleTheme,
}) {
  const pros = useMemo(() => {
    const countyTowns = towns.filter(t => t.county === county);
    return roster
      .filter(c => bucket(c.trade) === trade && c.lat != null)
      .map(c => {
        const radius = c.serviceRadiusMiles || 33;
        const covered = countyTowns
          .map(t => ({ name: t.name, d: dist(c.lat, c.lng, t.lat, t.lng) }))
          .filter(t => t.d != null && t.d <= radius)
          .sort((a, b) => a.d - b.d);
        return { ...c, covered };
      })
      .filter(c => c.covered.length > 0)
      .sort((a, b) => b.covered.length - a.covered.length);
  }, [roster, towns, bucket, dist, trade, county]);

  const title = `Verified ${trade} Contractors in ${county} County, FL | BuildBridge FL`;
  const description = `Licensed ${trade} contractors serving ${county} County, Florida. Every license checked against state records before listing. Free to use — no referral fees, no paid placement.`;

  useEffect(() => {
    document.title = title;
    let m = document.querySelector('meta[name="description"]');
    if (!m) { m = document.createElement("meta"); m.name = "description"; document.head.appendChild(m); }
    const prev = m.content;
    m.content = description;
    return () => { m.content = prev; };
  }, [title, description]);

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Verified ${trade} contractors in ${county} County, Florida`,
    numberOfItems: pros.length,
    itemListElement: pros.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.company,
      url: `https://buildbridgefl.com/?vendor=${c.id > 1000 ? c.id - 1000 : c.id}`,
    })),
  };

  const openDbpr = (lic) => {
    navigator.clipboard?.writeText(String(lic).split(/[,&]/)[0].trim());
    window.open("https://www.myfloridalicense.com/wl11.asp?mode=0&SID=", "_blank");
  };

  const allTowns = [...new Set(pros.flatMap(c => c.covered.map(t => t.name)))].sort();

  const card = {
    background: C.card, border: `1px solid ${C.border}`,
    borderRadius: 14, padding: 16, marginBottom: 14,
  };
  const h2 = {
    fontSize: 19, fontWeight: 800, color: C.white,
    textTransform: "uppercase", letterSpacing: "0.05em",
    margin: "30px 0 12px",
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "18px 16px 60px" }}>

        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <a href="/" style={{ textDecoration: "none" }}>
            <div className="display" style={{ fontSize: 22, fontWeight: 800, color: C.white, lineHeight: 1 }}>
              BUILD<span style={{ color: C.orange }}>BRIDGE</span> FL
            </div>
          </a>
          <div style={{ display: "flex", gap: 7 }}>
            <button onClick={toggleTheme} aria-label="Toggle light or dark" className="btn-ghost" style={{ padding: "7px 11px", fontSize: 13 }}>
              {theme === "light" ? "\u263E" : "\u2600"}
            </button>
            <a href="/" className="btn-ghost" style={{ padding: "7px 13px", fontSize: 12, textDecoration: "none" }}>Full site</a>
          </div>
        </div>

        {/* H1 + intro */}
        <h1 className="display" style={{ fontSize: 30, fontWeight: 800, color: C.white, lineHeight: 1.1, margin: "0 0 14px" }}>
          Verified {trade} Contractors in {county} County, FL
        </h1>

        <div style={{ fontSize: 14, color: C.dim, lineHeight: 1.7, marginBottom: 8 }}>
          <p style={{ margin: "0 0 12px" }}>
            Every {trade} contractor on this page holds an active Florida state license, checked against
            Department of Business and Professional Regulation records before we listed them. We show the
            license number on the card so you can confirm it yourself — most people never will, but the
            point is that you could.
          </p>
          <p style={{ margin: 0 }}>
            BuildBridge is free for homeowners and free for contractors. Nobody pays for placement, nobody
            buys their way to the top, and we don't sell your job as a lead. That's the whole model. These{" "}
            {pros.length} {pros.length === 1 ? "company covers" : "companies cover"} {allTowns.length} towns
            across {county} County — {allTowns.slice(0, 4).join(", ")}
            {allTowns.length > 4 ? `, and ${allTowns.length - 4} more` : ""}.
          </p>
        </div>

        {/* contractors */}
        <h2 className="display" style={h2}>The contractors</h2>

        {pros.length === 0 && (
          <div style={{ ...card, borderStyle: "dashed", textAlign: "center", color: C.muted, fontSize: 13 }}>
            No verified {trade} contractors cover {county} County yet.
          </div>
        )}

        {pros.map(c => (
          <article key={c.id} style={card}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: C.white, margin: "0 0 5px", lineHeight: 1.25 }}>
              {c.company}
            </h3>

            {c.license ? (
              <div style={{ fontSize: 12, fontWeight: 800, color: C.green, marginBottom: 7 }}>
                {"\u{1F6E1}"} License Verified ·{" "}
                <span onClick={() => openDbpr(c.license)} style={{ textDecoration: "underline", cursor: "pointer" }}>
                  {c.license}
                </span>
              </div>
            ) : (
              <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 7 }}>
                {"\u2713"} Business Verified · Sunbiz
              </div>
            )}

            <p style={{ fontSize: 12.5, color: C.muted, margin: "0 0 10px", lineHeight: 1.6 }}>
              {trade} · Based in {c.location}. Serving{" "}
              {c.covered.map(t => t.name).join(", ")}.
            </p>

            {c.bio && (
              <p style={{ fontSize: 13, color: C.dim, margin: "0 0 12px", lineHeight: 1.6 }}>{c.bio}</p>
            )}

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {c.phone && (
                <a href={`tel:${c.phone.replace(/\D/g, "")}`} className="btn-primary"
                  style={{ padding: "9px 16px", fontSize: 12.5, textDecoration: "none" }}>
                  Call {c.phone}
                </a>
              )}
              <a href={`/?vendor=${c.id > 1000 ? c.id - 1000 : c.id}`} className="btn-ghost"
                style={{ padding: "9px 16px", fontSize: 12.5, textDecoration: "none" }}>
                Full profile
              </a>
              {c.website && (
                <a href={c.website} target="_blank" rel="noopener noreferrer" className="btn-ghost"
                  style={{ padding: "9px 16px", fontSize: 12.5, textDecoration: "none" }}>
                  Website
                </a>
              )}
            </div>
          </article>
        ))}

        {/* trust block */}
        <h2 className="display" style={h2}>How we verify</h2>
        <div style={{ ...card, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
          <p style={{ margin: "0 0 10px" }}>
            Before a contractor is listed, we look up their license number in the Florida DBPR public
            records and confirm the business is registered and active on Sunbiz. Where a trade doesn't
            require a state license, we verify the business registration only, and label it that way.
          </p>
          <p style={{ margin: 0 }}>
            Licenses lapse and businesses change. A verified badge is a snapshot from when we checked it,
            not continuous monitoring — which is exactly why the license number is printed on every card.
          </p>
        </div>

        {/* FAQ */}
        <h2 className="display" style={h2}>Common questions</h2>

        <div style={card}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: C.white, margin: "0 0 6px" }}>
            How do I check if a Florida {trade} contractor is licensed?
          </h3>
          <p style={{ fontSize: 13, color: C.dim, lineHeight: 1.65, margin: 0 }}>
            Search the license number at the Florida DBPR licensee portal. Choose "Search by License
            Number," enter the full number including letters, and look for a status of Current, Active.
            Tapping any license number above copies it and opens that search page for you.
          </p>
        </div>

        <div style={card}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: C.white, margin: "0 0 6px" }}>
            Does BuildBridge charge contractors to be listed?
          </h3>
          <p style={{ fontSize: 13, color: C.dim, lineHeight: 1.65, margin: 0 }}>
            No. Listing is free, leads are free, and there is no paid placement or referral fee. We don't
            sell your project to multiple contractors — you call the one you pick, directly.
          </p>
        </div>

        <div style={card}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: C.white, margin: "0 0 6px" }}>
            Do I need a permit for {trade} work in {county} County?
          </h3>
          <p style={{ fontSize: 13, color: C.dim, lineHeight: 1.65, margin: 0 }}>
            Often yes, and mechanical work is not covered by Florida's HB 803 exemption for small projects.
            Your contractor pulls the permit under their license. See the Permits section on the main site
            for what HB 803 did and didn't change.
          </p>
        </div>

        {/* internal links */}
        <h2 className="display" style={h2}>Browse more</h2>
        <div style={{ ...card, fontSize: 13.5, lineHeight: 2.1 }}>
          <a href="/pros" style={{ color: C.blue, fontWeight: 700, display: "block", textDecoration: "none" }}>
            Every verified contractor near you →
          </a>
          <a href="/?view=network" style={{ color: C.blue, fontWeight: 700, display: "block", textDecoration: "none" }}>
            The full {county} &amp; Hernando County network →
          </a>
          <a href="/?view=match" style={{ color: C.blue, fontWeight: 700, display: "block", textDecoration: "none" }}>
            Describe your job and get matched →
          </a>
          <a href="/?view=permits" style={{ color: C.blue, fontWeight: 700, display: "block", textDecoration: "none" }}>
            Permit prep and HB 803 exemptions →
          </a>
        </div>

        <footer style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.7, marginTop: 26, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
          BuildBridge verifies each contractor's license and business registration before listing them. The
          contract and the work are between you and the contractor — BuildBridge isn't the contractor and
          doesn't oversee, manage, or guarantee the job.
        </footer>

      </div>
    </div>
  );
}
