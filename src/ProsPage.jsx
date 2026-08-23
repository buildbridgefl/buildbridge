import React, { useState, useMemo, useEffect } from "react";

export default function ProsPage({ roster, towns, bucket, dist, C, onBack, onAskPablo, theme, toggleTheme }) {
  const RADIUS = 33;
  const SHOW_PER_TRADE = 3;
  const EMERG = ["Plumbing", "Electrical", "HVAC", "Roofing", "Well & Septic", "Garage Doors", "Locksmith", "Tree Service", "Water Damage"];

  // origin = { lat, lng, label, exact }
  const [origin, setOrigin] = useState(null);
  const [geo, setGeo] = useState("asking");        // asking | ok | denied | off
  const [picking, setPicking] = useState(false);   // manual town picker open
  const [openTrade, setOpenTrade] = useState(null);
  const [showAll, setShowAll] = useState(false); const [copied, setCopied] = useState(null);

  // ---- try device location once on load, fall back to town chips ----
  useEffect(() => {
    if (!navigator.geolocation) { setGeo("off"); setPicking(true); return; }
    let done = false;
    const bail = setTimeout(() => { if (!done) { done = true; setGeo("denied"); setPicking(true); } }, 8000);
    navigator.geolocation.getCurrentPosition(
      p => {
        if (done) return;
        done = true; clearTimeout(bail);
        const { latitude: lat, longitude: lng } = p.coords;
        let near = null, best = Infinity;
        towns.forEach(t => {
          const d = dist(lat, lng, t.lat, t.lng);
          if (d != null && d < best) { best = d; near = t; }
        });
        setOrigin({ lat, lng, label: near ? near.name : "your location", exact: true });
        setGeo("ok");
      },
      () => { if (done) return; done = true; clearTimeout(bail); setGeo("denied"); setPicking(true); },
      { enableHighAccuracy: false, timeout: 7000, maximumAge: 600000 }
    );
    return () => clearTimeout(bail);
  }, [towns, dist]);

  const pickTown = (t) => {
    setOrigin({ lat: t.lat, lng: t.lng, label: t.name, exact: false });
    setPicking(false); setOpenTrade(null);
  };

  const nearby = useMemo(() => {
    if (!origin) return [];
    return roster
      .map(c => ({ ...c, d: dist(origin.lat, origin.lng, c.lat, c.lng) }))
      .filter(c => c.d != null && c.d <= RADIUS)
      .sort((a, b) => a.d - b.d);
  }, [origin, roster, dist]);

  const byTrade = useMemo(() => {
    const m = {};
    nearby.forEach(c => {
      const b0 = bucket(c.trade);
      const k = (b0 === "Well" || b0 === "Septic") ? "Well & Septic" : b0;
      (m[k] = m[k] || []).push(c);
    });
    return Object.keys(m)
      .filter(k => showAll || EMERG.includes(k))
      .sort((x, y) => (((EMERG.indexOf(x) + 1) || 99) - ((EMERG.indexOf(y) + 1) || 99)) || x.localeCompare(y))
      .map(k => ({ trade: k, all: m[k], shown: m[k].slice(0, SHOW_PER_TRADE) }));
  }, [nearby, bucket, showAll]);

  const visible = openTrade ? byTrade.filter(g => g.trade === openTrade) : byTrade;

  const initials = (c) =>
    c.avatar ||
    (c.company || "?").replace(/[^A-Za-z ]/g, "").split(/\s+/).filter(Boolean)
      .slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";

  const pill = (text, gold) => (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 9.5, fontWeight: 800, letterSpacing: "0.08em",
      textTransform: "uppercase", padding: "3px 8px", borderRadius: 20,
      background: gold ? `${C.gold}1F` : "transparent",
      border: `1px solid ${gold ? C.gold + "77" : C.border}`,
      color: gold ? C.gold : C.muted, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: gold ? C.gold : C.muted }} />
      {text}
    </span>
  );

  const chip = (label, on, onClick, dashed) => (
    <button key={label} onClick={onClick} style={{
      background: on ? C.orange : "transparent",
      color: on ? "#14100A" : C.dim,
      border: `1px ${dashed ? "dashed" : "solid"} ${on ? C.orange : C.border}`,
      borderRadius: 5, padding: "6px 10px", fontSize: 10.5, fontWeight: 800,
      letterSpacing: "0.09em", textTransform: "uppercase", cursor: "pointer",
      fontFamily: "inherit", whiteSpace: "nowrap",
    }}>{label}</button>
  );

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "18px 16px 60px" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div className="display" style={{ fontSize: 24, fontWeight: 800, color: C.white, lineHeight: 1 }}>
              BUILD<span style={{ color: C.orange }}>BRIDGE</span> FL
            </div>
            <div style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted, marginTop: 5 }}>
              Citrus &amp; Hernando · License-verified · Free
            </div>
          </div>
          <div style={{ display: "flex", gap: 7 }}>
            <button onClick={toggleTheme} aria-label="Toggle light or dark" className="btn-ghost" style={{ padding: "7px 11px", fontSize: 13 }}>
              {theme === "light" ? "\u263E" : "\u2600"}
            </button>
            <button onClick={onBack} className="btn-ghost" style={{ padding: "7px 13px", fontSize: 12 }}>Full site</button>
          </div>
        </div>

        <div style={{
          background: C.card, border: `1px solid ${C.border}`,
          borderLeft: `3px solid ${C.orange}`, borderRadius: 12,
          padding: "15px 16px", marginBottom: 16,
        }}>
          <div className="display" style={{ fontSize: 21, fontWeight: 800, color: C.white, marginBottom: 5 }}>
            Your pros are in your phone.
          </div>
          <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.55 }}>
            Verified, licensed, and local — pulled fresh every time you open this. No account, no fees, no middleman.
          </div>
        </div>

        {geo === "asking" && !origin && (
          <div style={{
            background: C.panel, border: `1px dashed ${C.line}`, borderRadius: 12,
            padding: "18px 16px", textAlign: "center", fontSize: 12.5, color: C.muted,
          }}>
            Finding contractors near you…
            <div style={{ marginTop: 10 }}>
              <button onClick={() => setPicking(true)} className="btn-ghost" style={{ padding: "7px 13px", fontSize: 12 }}>
                Pick my town instead
              </button>
            </div>
          </div>
        )}

        {origin && !picking && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 8, marginBottom: 16, fontSize: 12, color: C.dim,
          }}>
            <div style={{ minWidth: 0 }}>
              <span style={{ color: C.orange, fontWeight: 800, letterSpacing: "0.1em", fontSize: 10.5, textTransform: "uppercase" }}>
                {origin.exact ? "Near you" : "Showing"}
              </span>
              <span style={{ marginLeft: 8, color: C.white, fontWeight: 700 }}>{origin.label}</span>
            </div>
            <button onClick={() => setPicking(true)} className="btn-ghost" style={{ padding: "6px 11px", fontSize: 11.5 }}>
              Change
            </button>
          </div>
        )}

        {picking && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: C.orange, marginBottom: 9 }}>
              Where's the job?
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {towns.filter(x => !x.hideInHeader).map(x => (
                <button key={x.name} onClick={() => pickTown(x)} style={{
                  background: origin && origin.label === x.name ? C.orange : "transparent",
                  color: origin && origin.label === x.name ? "#14100A" : C.dim,
                  border: `1px solid ${origin && origin.label === x.name ? C.orange : C.border}`,
                  borderRadius: 20, padding: "7px 13px", fontSize: 12.5, fontWeight: 700, cursor: "pointer",
                }}>{x.name}</button>
              ))}
            </div>
          </div>
        )}

        {origin && byTrade.length === 0 && (
          <div style={{
            background: C.panel, border: `1px dashed ${C.line}`, borderRadius: 12,
            padding: "22px 16px", textAlign: "center", fontSize: 12.5, color: C.muted, lineHeight: 1.55,
          }}>
            Nobody on the roster covers {origin.label} within {RADIUS} miles yet. We're adding verified contractors every week — try a nearby town.
          </div>
        )}

        {origin && byTrade.length > 0 && (
          <div className="fade-in">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
              {chip("Trades", !openTrade, () => setOpenTrade(null))}
              {byTrade.map(g => chip(g.trade, openTrade === g.trade, () => setOpenTrade(openTrade === g.trade ? null : g.trade)))}
              {chip(showAll ? "\u2190 Emergency only" : "+ All other trades", false, () => { setShowAll(!showAll); setOpenTrade(null); }, true)}
            </div>

            {visible.map(g => (
              <div key={g.trade} style={{ marginBottom: 26 }}>
                <div style={{
                  display: "flex", alignItems: "baseline", justifyContent: "space-between",
                  gap: 8, paddingBottom: 7, marginBottom: 11, borderBottom: `1px solid ${C.border}`,
                }}>
                  <div className="display" style={{ fontSize: 17, fontWeight: 800, color: C.white, textTransform: "uppercase" }}>{g.trade}</div>
                  <div style={{ fontSize: 10.5, color: C.muted, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                    {g.all.length > SHOW_PER_TRADE
                      ? `Nearest ${SHOW_PER_TRADE} of ${g.all.length} · ${RADIUS} mi`
                      : `${g.all.length} within ${RADIUS} mi`}
                  </div>
                </div>

                {g.shown.map(c => {
                  const isClaimed = c.claimed === true;
                  return (
                    <div key={c.id} style={{
                      background: C.card,
                      border: `1px solid ${isClaimed ? C.gold + "55" : C.border}`,
                      borderRadius: 12, padding: 13, marginBottom: 9,
                    }}>
                      <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: 7, flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: isClaimed ? `${C.gold}1A` : C.panel,
                          border: `1px solid ${isClaimed ? C.gold + "55" : C.border}`,
                          color: isClaimed ? C.gold : C.muted,
                          fontSize: 11.5, fontWeight: 800, letterSpacing: "0.03em",
                        }}>{initials(c)}</div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: 14.5, fontWeight: 800, color: C.white, lineHeight: 1.25 }}>{c.company}</div>
                          <div style={{ fontSize: 11, color: C.muted, marginTop: 3, fontFamily: "ui-monospace, monospace" }}>
                            {c.location || ""}{c.d != null ? ` · ${Math.round(c.d)} mi` : ""}
                          </div>
                          <div style={{ marginTop: 6, fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>{c.license ? (<span onClick={() => { navigator.clipboard?.writeText(String(c.license).split(/[,&]/)[0].trim()); setCopied(c.id); setTimeout(() => setCopied(null), 2200); window.open("https://www.myfloridalicense.com/wl11.asp?mode=0&SID=", "_blank"); }} style={{ color: C.green, cursor: "pointer", textDecoration: "underline" }}>{"\u{1F6E1}"} License Verified · {c.license}</span>) : (<span style={{ color: C.muted }}>{"\u2713"} Business Verified · Sunbiz</span>)}{copied === c.id && <span style={{ color: C.dim, fontWeight: 600, fontSize: 10 }}>copied — paste into DBPR</span>}{isClaimed && <span style={{ color: C.muted, fontWeight: 600, fontSize: 10 }}>Claimed</span>}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                        <a href={`tel:${(c.phone || "").replace(/\D/g, "")}`} className="btn-primary"
                          style={{ flex: c.website ? 1.35 : 1, textAlign: "center", padding: "9px 10px", fontSize: 12.5, textDecoration: "none" }}>
                          Call {c.phone}
                        </a>
                        {c.website && (
                          <a href={c.website} target="_blank" rel="noopener noreferrer" className="btn-ghost"
                            style={{ flex: 1, textAlign: "center", padding: "9px 10px", fontSize: 12.5, textDecoration: "none" }}>
                            Website
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {origin && byTrade.length > 0 && (
          <div style={{
            border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px",
            fontSize: 12, color: C.dim, lineHeight: 1.65, marginBottom: 20,
          }}>
            <strong style={{ color: C.green }}>License Verified</strong> means we checked the number against Florida DBPR before listing — tap it to check for yourself.{" "}
            <strong style={{ color: C.muted }}>Business Verified</strong> means the trade doesn't require a state license, so we confirmed the business on Sunbiz instead. Nobody paid to be here.
          </div>
        )}

        <div style={{
          background: `linear-gradient(120deg, ${C.card}, ${C.panel})`,
          border: `1px solid ${C.orange}55`, borderRadius: 14,
          padding: "18px 16px", textAlign: "center",
        }}>
          <div className="display" style={{ fontSize: 19, fontWeight: 800, color: C.white, marginBottom: 6 }}>
            Not sure who you need?
          </div>
          <div style={{ fontSize: 12.5, color: C.dim, lineHeight: 1.55, marginBottom: 13 }}>
            Describe the job in plain words. Pablo finds the verified contractors who cover your town.
          </div>
          <button onClick={onAskPablo} className="btn-primary" style={{ padding: "10px 22px", fontSize: 13 }}>
            Ask Pablo
          </button>
        </div>

        <div style={{ textAlign: "center", fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, marginTop: 24, lineHeight: 2 }}>
          No pay-to-play. Ever.<br />buildbridgefl.com
        </div>

      </div>
    </div>
  );
}
