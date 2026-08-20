import React, { useState, useMemo } from "react";

export default function ProsPage({ roster, towns, bucket, dist, C, onBack, onAskPablo, theme, toggleTheme }) {
  const RADIUS = 33;
  const SHOW_PER_TRADE = 3; const EMERG = ["Plumbing", "Electrical", "HVAC", "Roofing", "Well", "Septic", "Garage Doors", "Locksmith", "Tree Service"];

  const [town, setTown] = useState(null);
  const [openTrade, setOpenTrade] = useState(null);

  const t = towns.find(x => x.name === town);

  const nearby = useMemo(() => {
    if (!t) return [];
    return roster
      .map(c => ({ ...c, d: dist(t.lat, t.lng, c.lat, c.lng) }))
      .filter(c => c.d != null && c.d <= RADIUS)
      .sort((a, b) => a.d - b.d);
  }, [t, roster, dist]);

  const byTrade = useMemo(() => {
    const m = {};
    nearby.forEach(c => {
      const k = bucket(c.trade);
      (m[k] = m[k] || []).push(c);
    });
      return Object.keys(m).filter(k => EMERG.includes(k)).sort((x, y) => EMERG.indexOf(x) - EMERG.indexOf(y)).map(k => ({
      trade: k,
      all: m[k],
      shown: m[k].slice(0, SHOW_PER_TRADE),
    }));
  }, [nearby, bucket]);

  const visible = openTrade ? byTrade.filter(g => g.trade === openTrade) : byTrade;

  const pill = (text, gold) => (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 10, fontWeight: 800, letterSpacing: "0.08em",
      textTransform: "uppercase", padding: "3px 8px", borderRadius: 20,
      background: gold ? `${C.gold}1F` : "transparent",
      border: `1px solid ${gold ? C.gold + "77" : C.border}`,
      color: gold ? C.gold : C.muted, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: gold ? C.gold : C.muted }} />
      {text}
    </span>
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
          <div style={{ display: "flex", gap: 7 }}><button onClick={toggleTheme} aria-label="Toggle light or dark" className="btn-ghost" style={{ padding: "7px 11px", fontSize: 13 }}>{theme === "light" ? "\u263E" : "\u2600"}</button><button onClick={onBack} className="btn-ghost" style={{ padding: "7px 13px", fontSize: 12 }}>Full site</button></div>
        </div>

        <div style={{
          background: C.card, border: `1px solid ${C.border}`,
          borderLeft: `3px solid ${C.orange}`, borderRadius: 12,
          padding: "15px 16px", marginBottom: 18,
        }}>
          <div className="display" style={{ fontSize: 21, fontWeight: 800, color: C.white, marginBottom: 5 }}>
            Your pros are in your phone.
          </div>
          <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.55 }}>
            Licensed, verified, and local. Pick your town and you'll see who actually covers it — nearest first. No account, no fees, no middleman.
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: C.orange, marginBottom: 9 }}>
          Where's the job?
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: town ? 20 : 0 }}>
          {towns.filter(x => !x.hideInHeader).map(x => (
            <button key={x.name}
              onClick={() => { setOpenTrade(null); setTown(town === x.name ? null : x.name); }}
              style={{
                background: town === x.name ? C.orange : "transparent",
                color: town === x.name ? "#14100A" : C.dim,
                border: `1px solid ${town === x.name ? C.orange : C.border}`,
                borderRadius: 20, padding: "7px 13px", fontSize: 12.5,
                fontWeight: 700, cursor: "pointer",
              }}>{x.name}</button>
          ))}
        </div>

        {town && byTrade.length === 0 && (
          <div style={{
            background: C.panel, border: `1px dashed ${C.line}`, borderRadius: 12,
            padding: "22px 16px", textAlign: "center", fontSize: 12.5,
            color: C.muted, lineHeight: 1.55,
          }}>
            Nobody on the roster covers {town} within {RADIUS} miles yet. We're adding verified contractors every week — try a nearby town.
          </div>
        )}

        {town && byTrade.length > 0 && (
          <div className="fade-in">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 18 }}>
              <button onClick={() => setOpenTrade(null)}
                style={{
                  background: !openTrade ? C.blue : "transparent",
                  color: !openTrade ? "#0B1220" : C.dim,
                  border: `1px solid ${!openTrade ? C.blue : C.border}`,
                  borderRadius: 20, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer",
                }}>All trades</button>
              {byTrade.map(g => (
                <button key={g.trade} onClick={() => setOpenTrade(openTrade === g.trade ? null : g.trade)}
                  style={{
                    background: openTrade === g.trade ? C.blue : "transparent",
                    color: openTrade === g.trade ? "#0B1220" : C.dim,
                    border: `1px solid ${openTrade === g.trade ? C.blue : C.border}`,
                    borderRadius: 20, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer",
                  }}>{g.trade}</button>
              ))}
            </div>

            {visible.map(g => (
              <div key={g.trade} style={{ marginBottom: 26 }}>
                <div style={{
                  display: "flex", alignItems: "baseline", justifyContent: "space-between",
                  gap: 8, paddingBottom: 7, marginBottom: 11,
                  borderBottom: `1px solid ${C.border}`,
                }}>
                  <div className="display" style={{ fontSize: 17, fontWeight: 800, color: C.white }}>{g.trade}</div>
                  <div style={{ fontSize: 10.5, color: C.muted, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                    {g.all.length > SHOW_PER_TRADE
                      ? `Nearest ${SHOW_PER_TRADE} of ${g.all.length} · ${RADIUS} mi`
                      : `${g.all.length} within ${RADIUS} mi`}
                  </div>
                </div>

                {g.shown.map(c => {
                  const isClaimed = c.claimed !== false;
                  return (
                    <div key={c.id} style={{
                      background: C.card,
                      border: `1px solid ${isClaimed ? C.gold + "55" : C.border}`,
                      borderRadius: 12, padding: 14, marginBottom: 9,
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 14.5, fontWeight: 800, color: C.white, lineHeight: 1.25 }}>{c.company}</div>
                          <div style={{ fontSize: 11.5, color: C.muted, marginTop: 3 }}>
                            {c.license ? `${c.license} · ` : ""}{c.location || ""}{c.d != null ? ` · ${Math.round(c.d)} mi` : ""}
                          </div>
                        </div>
                        {pill(isClaimed ? "Claimed & Verified" : "License-verified", isClaimed)}
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                        <a href={`tel:${(c.phone || "").replace(/\D/g, "")}`} className="btn-primary"
                          style={{ flex: 1, textAlign: "center", padding: "9px 10px", fontSize: 12.5, textDecoration: "none" }}>
                          Call {c.phone}
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {town && byTrade.length > 0 && (
          <div style={{
            border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px",
            fontSize: 12, color: C.dim, lineHeight: 1.65, marginBottom: 20,
          }}>
            <strong style={{ color: C.gold }}>Claimed &amp; Verified</strong> means the owner has signed in and keeps their own page current.{" "}
            <strong style={{ color: C.dim }}>License-verified</strong> means we confirmed their license and registration, but they haven't claimed the listing yet. Both are real, licensed businesses. Neither one paid to be here.
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
