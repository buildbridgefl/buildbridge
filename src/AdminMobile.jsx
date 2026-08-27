// src/AdminMobile.jsx — BuildBridge mobile admin
// Step 10: adds an Apps tab — approve new contractor applications from the phone.
// Talks only to /api/admin, never to Supabase directly.

import React, { useState, useEffect, useCallback } from "react";

const C = {
  bg: "#0B1220", panel: "#0F1729", card: "#141E33", border: "#22304F",
  orange: "#FF8A1E", green: "#34D178", red: "#FF5C5C", gold: "#D9AE3B",
  text: "#DCE4F2", dim: "#93A3C0", muted: "#5D6E8F",
};

const KEY_STORE = "bb_admin_key";

const TOOLS = [
  { label: "Live site", url: "https://buildbridgefl.com" },
  { label: "Supabase", url: "https://supabase.com/dashboard/project/jbpwxfaazetfcbwxrmtc" },
  { label: "Vercel", url: "https://vercel.com/dashboard" },
  { label: "GitHub", url: "https://github.com/buildbridgefl/buildbridge/blob/main/src/AdminMobile.jsx" },
  { label: "Resend", url: "https://resend.com/emails" },
  { label: "Zoho Mail", url: "https://mail.zoho.com" },
];

async function callAdmin(secret, action, payload) {
  const r = await fetch("/api/admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret, action, ...(payload || {}) }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || `Request failed (${r.status})`);
  return data;
}

function fmtWhen(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString();
}

// Shrink before upload. Vercel caps the request body around 4.5MB and a raw
// iPhone shot blows past that on its own.
async function compressImage(file, maxEdge, quality) {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  let { width, height } = bitmap;
  const longest = Math.max(width, height);
  if (longest > maxEdge) {
    const scale = maxEdge / longest;
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d").drawImage(bitmap, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}

export default function AdminMobile() {
  const [secret, setSecret] = useState("");
  const [entry, setEntry] = useState("");
  const [remember, setRemember] = useState(true);
  const [tab, setTab] = useState("claims");
  const [pending, setPending] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(null);
  const [rejectId, setRejectId] = useState(null);
  const [err, setErr] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [done, setDone] = useState(null);
  const [roster, setRoster] = useState([]);
  const [rosterLoaded, setRosterLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [pickedVendor, setPickedVendor] = useState(null);
  const [shot, setShot] = useState("");          // compressed data URL
  const [shotCaption, setShotCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(null);
  const [leads, setLeads] = useState([]);
  const [leadsLoaded, setLeadsLoaded] = useState(false);
  const [leadVendor, setLeadVendor] = useState(null);
  const [leadSearch, setLeadSearch] = useState("");
  const [leadForm, setLeadForm] = useState({ job: "", homeowner_name: "", homeowner_phone: "", town: "" });
  const [sending, setSending] = useState(false);
  const [sentLead, setSentLead] = useState(null);
  const [statusBusy, setStatusBusy] = useState(null);
  const [apps, setApps] = useState([]);
  const [appsLoaded, setAppsLoaded] = useState(false);
  const [appOpenId, setAppOpenId] = useState(null);
  const [appBusy, setAppBusy] = useState(null);
  const [appRejectId, setAppRejectId] = useState(null);

  // Pulls both queues. A photo failure shouldn't blank the claims list.
  const load = useCallback(async (key) => {
    setBusy(true);
    setErr("");
    try {
      const data = await callAdmin(key, "list");
      setPending(data.pending || []);
      setSecret(key);
      setLoaded(true);
      try {
        const pdata = await callAdmin(key, "photos");
        setPhotos(pdata.photos || []);
      } catch (pe) {
        setPhotos([]);
      }
      try {
        const adata = await callAdmin(key, "apps");
        setApps(adata.apps || []);
        setAppsLoaded(true);
      } catch (ae) {
        setApps([]);
      }
    } catch (e) {
      setErr(String(e.message || e));
      setLoaded(false);
    } finally {
      setBusy(false);
    }
  }, []);

  // Auto-unlock if this device already has the key.
  useEffect(() => {
    let saved = "";
    try { saved = window.localStorage.getItem(KEY_STORE) || ""; } catch (e) {}
    if (saved) load(saved);
  }, [load]);

  const unlock = async () => {
    const key = entry.trim();
    if (!key) return;
    await load(key);
    if (remember) {
      try { window.localStorage.setItem(KEY_STORE, key); } catch (e) {}
    }
  };

  const startConfirm = (c) => {
    setErr("");
    setConfirmId(c.claim_id);
    setConfirmEmail(c.email || "");
  };

  const cancelConfirm = () => {
    setConfirmId(null);
    setConfirmEmail("");
  };

  const doApprove = async (c) => {
    setBusy(true);
    setErr("");
    try {
      const r = await callAdmin(secret, "approve", {
        claim_id: c.claim_id,
        vendor_id: c.vendor_id,
        email: confirmEmail,
      });
      setPending((p) => p.filter((x) => x.claim_id !== c.claim_id));
      setConfirmId(null);
      setOpenId(null);
      setDone({
        company: c.company,
        email: r.vendor ? r.vendor.email : confirmEmail,
        vendor_id: c.vendor_id,
      });
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setBusy(false);
    }
  };

  const approvePhoto = async (p) => {
    setPhotoBusy(p.photo_id);
    setErr("");
    try {
      await callAdmin(secret, "photo_approve", { photo_id: p.photo_id });
      setPhotos((list) => list.filter((x) => x.photo_id !== p.photo_id));
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setPhotoBusy(null);
    }
  };

  const rejectPhoto = async (p) => {
    setPhotoBusy(p.photo_id);
    setErr("");
    try {
      await callAdmin(secret, "photo_reject", { photo_id: p.photo_id, path: p.path });
      setPhotos((list) => list.filter((x) => x.photo_id !== p.photo_id));
      setRejectId(null);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setPhotoBusy(null);
    }
  };

  const loadRoster = useCallback(async (key) => {
    try {
      const data = await callAdmin(key, "vendors");
      setRoster(data.vendors || []);
      setRosterLoaded(true);
    } catch (e) {
      setErr(String(e.message || e));
    }
  }, []);

  const openCapture = () => {
    setTab("capture");
    setErr("");
    if (!rosterLoaded && secret) loadRoster(secret);
  };

  const takeShot = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setErr("");
    try {
      const dataUrl = await compressImage(file, 1600, 0.8);
      setShot(dataUrl);
    } catch (ex) {
      setErr("Couldn't read that photo. Try again.");
    }
  };

  const uploadShot = async () => {
    if (!pickedVendor || !shot) return;
    setUploading(true);
    setErr("");
    try {
      const r = await callAdmin(secret, "photo_upload", {
        vendor_id: pickedVendor.id,
        caption: shotCaption,
        image: shot,
      });
      setUploaded({ company: pickedVendor.company, url: r.url });
      setShot("");
      setShotCaption("");
    } catch (ex) {
      setErr(String(ex.message || ex));
    } finally {
      setUploading(false);
    }
  };

  const resetCapture = () => {
    setUploaded(null);
    setShot("");
    setShotCaption("");
  };

  const loadLeads = useCallback(async (key) => {
    try {
      const data = await callAdmin(key, "leads");
      setLeads(data.leads || []);
      setLeadsLoaded(true);
    } catch (e) {
      setErr(String(e.message || e));
    }
  }, []);

  const loadApps = useCallback(async (key) => {
    try {
      const data = await callAdmin(key, "apps");
      setApps(data.apps || []);
      setAppsLoaded(true);
    } catch (e) {
      setErr(String(e.message || e));
    }
  }, []);

  const openApps = () => {
    setTab("apps");
    setErr("");
    setAppRejectId(null);
    if (!appsLoaded && secret) loadApps(secret);
  };

  // Verification helpers. Neither DBPR nor Sunbiz can be deep-linked — both
  // search by form POST — so copy the value and open the empty search form.
  const checkLicense = (lic) => {
    const first = String(lic || "").split(/[,&]/)[0].trim();
    try { navigator.clipboard && navigator.clipboard.writeText(first); } catch (e) {}
    window.open("https://www.myfloridalicense.com/wl11.asp?mode=0&SID=", "_blank");
  };

  const checkSunbiz = (company) => {
    try { navigator.clipboard && navigator.clipboard.writeText(String(company || "").trim()); } catch (e) {}
    window.open("https://search.sunbiz.org/Inquiry/CorporationSearch/ByName", "_blank");
  };

  const approveApp = async (a) => {
    setAppBusy(a.vendor_id);
    setErr("");
    try {
      await callAdmin(secret, "app_approve", { vendor_id: a.vendor_id });
      setApps((prev) => prev.filter((x) => x.vendor_id !== a.vendor_id));
      setAppOpenId(null);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setAppBusy(null);
    }
  };

  const rejectApp = async (a) => {
    setAppBusy(a.vendor_id);
    setErr("");
    try {
      await callAdmin(secret, "app_reject", { vendor_id: a.vendor_id });
      setApps((prev) => prev.filter((x) => x.vendor_id !== a.vendor_id));
      setAppOpenId(null);
      setAppRejectId(null);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setAppBusy(null);
    }
  };

  const openLeads = () => {
    setTab("leads");
    setErr("");
    if (!rosterLoaded && secret) loadRoster(secret);
    if (!leadsLoaded && secret) loadLeads(secret);
  };

  const sendLead = async () => {
    if (!leadVendor || !leadForm.job.trim()) return;
    setSending(true);
    setErr("");
    try {
      const r = await callAdmin(secret, "lead_send", {
        vendor_id: leadVendor.id,
        job: leadForm.job,
        homeowner_name: leadForm.homeowner_name,
        homeowner_phone: leadForm.homeowner_phone,
        town: leadForm.town,
      });
      setSentLead({
        company: r.company || leadVendor.company,
        emailed: r.emailed,
        reason: r.reason,
        to: r.to || "",
      });
      setLeadForm({ job: "", homeowner_name: "", homeowner_phone: "", town: "" });
      loadLeads(secret);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setSending(false);
    }
  };

  const setLeadStatus = async (lead, status) => {
    setStatusBusy(lead.lead_id);
    setErr("");
    try {
      await callAdmin(secret, "lead_status", { lead_id: lead.lead_id, status: status });
      setLeads((list) =>
        list.map((l) => (l.lead_id === lead.lead_id ? { ...l, status: status } : l))
      );
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setStatusBusy(null);
    }
  };

  const resetLead = () => {
    setSentLead(null);
    setLeadVendor(null);
    setLeadSearch("");
  };

  const forget = () => {
    try { window.localStorage.removeItem(KEY_STORE); } catch (e) {}
    setSecret("");
    setEntry("");
    setPending([]);
    setPhotos([]);
    setRoster([]);
    setRosterLoaded(false);
    setPickedVendor(null);
    setShot("");
    setUploaded(null);
    setLeads([]);
    setLeadsLoaded(false);
    setLeadVendor(null);
    setSentLead(null);
    setLoaded(false);
    setOpenId(null);
  };

  const wrap = {
    minHeight: "100vh", background: C.bg, color: C.text,
    fontFamily: "'Barlow','Inter',system-ui,-apple-system,sans-serif",
    padding: "18px 14px 60px", maxWidth: 520, margin: "0 auto",
  };
  const cardBox = {
    background: C.card, border: `1px solid ${C.border}`,
    borderRadius: 12, padding: 14, marginBottom: 10,
  };
  const btn = {
    width: "100%", padding: 14, fontSize: 15, fontWeight: 700,
    background: C.orange, color: "#0B1220", border: "none",
    borderRadius: 10, cursor: "pointer",
  };

  // ---------- Gate ----------
  if (!loaded) {
    return (
      <div style={wrap}>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
          BuildBridge Admin
        </div>
        <div style={{ fontSize: 13, color: C.dim, marginBottom: 20 }}>
          Enter your admin key to unlock.
        </div>
        <div style={cardBox}>
          <input
            type="password"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") unlock(); }}
            placeholder="Admin key"
            autoComplete="off"
            style={{
              width: "100%", padding: 12, fontSize: 15, background: C.panel,
              border: `1px solid ${C.border}`, borderRadius: 8, color: C.text,
              outline: "none", marginBottom: 12,
            }}
          />
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.dim, marginBottom: 14 }}>
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Remember on this device
          </label>
          <button onClick={unlock} disabled={busy} style={{ ...btn, opacity: busy ? 0.6 : 1 }}>
            {busy ? "Checking…" : "Unlock"}
          </button>
        </div>
        {err ? (
          <div style={{ color: C.red, fontSize: 13, textAlign: "center" }}>{err}</div>
        ) : null}
      </div>
    );
  }

  // ---------- Just approved ----------
  if (done) {
    return (
      <div style={wrap}>
        <div style={{ textAlign: "center", padding: "40px 0 26px" }}>
          <div style={{ fontSize: 46, marginBottom: 10 }}>✅</div>
          <div style={{ fontSize: 23, fontWeight: 800, marginBottom: 6 }}>
            {done.company} is live
          </div>
          <div style={{ fontSize: 14, color: C.dim }}>
            Claimed and verified. The gold badge is on the listing now.
          </div>
        </div>
        <div style={cardBox}>
          <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
            His login email
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.orange, wordBreak: "break-all", marginBottom: 12 }}>
            {done.email}
          </div>
          <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.55 }}>
            Tell him: go to buildbridgefl.com, tap Sign in, enter that address,
            and click the link in his email. No password to remember.
          </div>
        </div>
        <a
          href="/"
          style={{ ...btn, display: "block", textAlign: "center", textDecoration: "none", marginBottom: 10 }}
        >
          Open his listing
        </a>
        <button
          onClick={() => { setDone(null); load(secret); }}
          style={{ width: "100%", padding: 12, fontSize: 14, background: "transparent", border: `1px solid ${C.border}`, color: C.dim, borderRadius: 10, cursor: "pointer" }}
        >
          Back to the queue
        </button>
      </div>
    );
  }

  const tabBtn = (active) => ({
    flex: "1 1 28%", padding: "11px 6px", fontSize: 13.5, fontWeight: 700,
    background: active ? C.card : "transparent",
    color: active ? C.text : C.muted,
    border: `1px solid ${active ? C.border : "transparent"}`,
    borderRadius: 9, cursor: "pointer",
  });

  // ---------- Queue ----------
  return (
    <div style={wrap}>
      <style>{`input::placeholder { color: ${C.muted}; opacity: 0.55; font-style: italic; }`}</style>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 20, fontWeight: 800 }}>Admin</div>
        <button
          onClick={() => load(secret)}
          disabled={busy}
          style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.dim, borderRadius: 8, padding: "7px 12px", fontSize: 13, cursor: "pointer" }}
        >
          {busy ? "…" : "Refresh"}
        </button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, background: C.panel, padding: 4, borderRadius: 11, marginBottom: 14 }}>
        <button onClick={openApps} style={tabBtn(tab === "apps")}>
          Apps{apps.length ? ` (${apps.length})` : ""}
        </button>
        <button onClick={() => { setTab("claims"); setErr(""); }} style={tabBtn(tab === "claims")}>
          Claims{pending.length ? ` (${pending.length})` : ""}
        </button>
        <button onClick={() => { setTab("photos"); setErr(""); }} style={tabBtn(tab === "photos")}>
          Photos{photos.length ? ` (${photos.length})` : ""}
        </button>
        <button onClick={openCapture} style={tabBtn(tab === "capture")}>
          Capture
        </button>
        <button onClick={openLeads} style={tabBtn(tab === "leads")}>
          Leads
        </button>
      </div>

      {err ? (
        <div style={{ ...cardBox, borderColor: C.red, color: C.red, fontSize: 13 }}>{err}</div>
      ) : null}

      {tab === "leads" ? (
        sentLead ? (
          <>
            <div style={{ textAlign: "center", padding: "26px 0 20px" }}>
              <div style={{ fontSize: 42, marginBottom: 8 }}>{sentLead.emailed ? "✉️" : "⚠️"}</div>
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
                {sentLead.emailed ? `Sent to ${sentLead.company}` : `Saved for ${sentLead.company}`}
              </div>
              <div style={{ fontSize: 13.5, color: C.dim, lineHeight: 1.55, padding: "0 8px" }}>
                {sentLead.emailed
                  ? `His phone is buzzing right now. It went to ${sentLead.to}.`
                  : sentLead.reason === "no_email"
                    ? "No email on file for him, so nothing was sent. The lead is recorded — give him a call and pass it along yourself."
                    : "The lead is recorded, but the email didn't go out. Call him directly."}
              </div>
            </div>
            <button onClick={() => setSentLead(null)} style={{ ...btn, marginBottom: 10 }}>
              Send another to {leadVendor ? leadVendor.company : "someone"}
            </button>
            <button
              onClick={resetLead}
              style={{ width: "100%", padding: 12, fontSize: 14, background: "transparent", border: `1px solid ${C.border}`, color: C.dim, borderRadius: 10, cursor: "pointer" }}
            >
              Done
            </button>
          </>
        ) : !leadVendor ? (
          <>
            <div style={{ fontSize: 13, color: C.dim, marginBottom: 10 }}>
              Who gets this job?
            </div>
            <input
              value={leadSearch}
              onChange={(e) => setLeadSearch(e.target.value)}
              placeholder="Search by trade, name, or town"
              autoCapitalize="off"
              autoCorrect="off"
              style={{ width: "100%", padding: 13, fontSize: 16, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 9, color: C.text, outline: "none", marginBottom: 12 }}
            />
            {leadSearch.trim() ? (
              roster
                .filter((v) => {
                  const q = leadSearch.trim().toLowerCase();
                  return (
                    v.company.toLowerCase().includes(q) ||
                    (v.trade || "").toLowerCase().includes(q) ||
                    (v.city || "").toLowerCase().includes(q)
                  );
                })
                .slice(0, 25)
                .map((v) => (
                  <div
                    key={v.id}
                    onClick={() => { setLeadVendor(v); setLeadSearch(""); }}
                    style={{ ...cardBox, padding: 13, cursor: "pointer" }}
                  >
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{v.company}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                      {[v.trade, v.city].filter(Boolean).join(" · ") || `Vendor ${v.id}`}
                    </div>
                  </div>
                ))
            ) : (
              <>
                <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, margin: "18px 0 8px" }}>
                  Sent so far{leads.length ? ` (${leads.length})` : ""}
                </div>
                {leads.length === 0 ? (
                  <div style={{ ...cardBox, textAlign: "center", color: C.muted, fontSize: 14, padding: 26 }}>
                    No leads sent yet.
                  </div>
                ) : null}
                {leads.map((l) => {
                  const acting = statusBusy === l.lead_id;
                  const tone =
                    l.status === "won" ? C.green :
                    l.status === "lost" ? C.muted :
                    l.status === "contacted" ? C.gold : C.orange;
                  return (
                    <div key={l.lead_id} style={cardBox}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 15, fontWeight: 700 }}>{l.job}</div>
                          <div style={{ fontSize: 12.5, color: C.dim, marginTop: 3 }}>
                            {l.company}
                            {l.town ? ` · ${l.town}` : ""}
                          </div>
                          {l.homeowner_name || l.homeowner_phone ? (
                            <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
                              {[l.homeowner_name, l.homeowner_phone].filter(Boolean).join(" · ")}
                            </div>
                          ) : null}
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontSize: 11, fontWeight: 800, color: tone, textTransform: "uppercase", letterSpacing: 0.5 }}>
                            {l.status}
                          </div>
                          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                            {fmtWhen(l.created_at)}
                          </div>
                        </div>
                      </div>
                      {l.status === "won" || l.status === "lost" ? (
                        <button
                          onClick={() => setLeadStatus(l, "sent")}
                          disabled={acting}
                          style={{ width: "100%", marginTop: 11, padding: 10, fontSize: 12.5, background: "transparent", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, cursor: "pointer", opacity: acting ? 0.6 : 1 }}
                        >
                          {acting ? "…" : "Reopen"}
                        </button>
                      ) : (
                        <div style={{ display: "flex", gap: 7, marginTop: 12 }}>
                          <button
                            onClick={() => setLeadStatus(l, "won")}
                            disabled={acting}
                            style={{ flex: 1, padding: 11, fontSize: 13, fontWeight: 800, background: C.green, color: "#0B1220", border: "none", borderRadius: 8, cursor: "pointer", opacity: acting ? 0.6 : 1 }}
                          >
                            Won it
                          </button>
                          <button
                            onClick={() => setLeadStatus(l, "contacted")}
                            disabled={acting}
                            style={{ flex: 1, padding: 11, fontSize: 13, fontWeight: 700, background: "transparent", border: `1px solid ${C.border}`, color: C.dim, borderRadius: 8, cursor: "pointer" }}
                          >
                            Called
                          </button>
                          <button
                            onClick={() => setLeadStatus(l, "lost")}
                            disabled={acting}
                            style={{ flex: 1, padding: 11, fontSize: 13, fontWeight: 700, background: "transparent", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, cursor: "pointer" }}
                          >
                            Lost
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </>
        ) : (
          <>
            <div style={{ ...cardBox, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Sending to
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, marginTop: 3 }}>
                  {leadVendor.company}
                </div>
              </div>
              <button
                onClick={() => setLeadVendor(null)}
                style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.dim, borderRadius: 8, padding: "7px 11px", fontSize: 12, cursor: "pointer", flexShrink: 0 }}
              >
                Change
              </button>
            </div>

            <LeadField
              label="The job"
              value={leadForm.job}
              onChange={(v) => setLeadForm({ ...leadForm, job: v })}
              placeholder="e.g. Tankless water heater install"
            />
            <LeadField
              label="Homeowner"
              value={leadForm.homeowner_name}
              onChange={(v) => setLeadForm({ ...leadForm, homeowner_name: v })}
              placeholder="e.g. Bob Reyes"
            />
            <LeadField
              label="Phone"
              value={leadForm.homeowner_phone}
              onChange={(v) => setLeadForm({ ...leadForm, homeowner_phone: v })}
              placeholder="e.g. 352-555-0134"
              type="tel"
            />
            <LeadField
              label="Town"
              value={leadForm.town}
              onChange={(v) => setLeadForm({ ...leadForm, town: v })}
              placeholder="e.g. Lecanto"
            />

            <button
              onClick={sendLead}
              disabled={sending || !leadForm.job.trim()}
              style={{ width: "100%", padding: 15, fontSize: 16, fontWeight: 800, background: C.green, color: "#0B1220", border: "none", borderRadius: 10, cursor: "pointer", opacity: sending || !leadForm.job.trim() ? 0.5 : 1, marginTop: 4 }}
            >
              {sending ? "Sending…" : "Send the lead"}
            </button>
          </>
        )
      ) : null}

      {tab === "capture" ? (
        uploaded ? (
          <>
            <div style={{ textAlign: "center", padding: "26px 0 20px" }}>
              <div style={{ fontSize: 42, marginBottom: 8 }}>✅</div>
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
                Added to {uploaded.company}
              </div>
              <div style={{ fontSize: 13, color: C.dim }}>
                Live on the portfolio now — no approval needed.
              </div>
            </div>
            {uploaded.url ? (
              <img
                src={uploaded.url}
                alt="Uploaded"
                style={{ width: "100%", borderRadius: 12, display: "block", marginBottom: 12 }}
              />
            ) : null}
            <button onClick={resetCapture} style={{ ...btn, marginBottom: 10 }}>
              Take another
            </button>
            <button
              onClick={() => { resetCapture(); setPickedVendor(null); }}
              style={{ width: "100%", padding: 12, fontSize: 14, background: "transparent", border: `1px solid ${C.border}`, color: C.dim, borderRadius: 10, cursor: "pointer" }}
            >
              Different contractor
            </button>
          </>
        ) : !pickedVendor ? (
          <>
            <div style={{ fontSize: 13, color: C.dim, marginBottom: 10 }}>
              Whose work is this?
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contractors"
              autoCapitalize="off"
              autoCorrect="off"
              style={{ width: "100%", padding: 13, fontSize: 16, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 9, color: C.text, outline: "none", marginBottom: 12 }}
            />
            {!rosterLoaded ? (
              <div style={{ ...cardBox, textAlign: "center", color: C.muted, fontSize: 14, padding: 24 }}>
                Loading roster…
              </div>
            ) : null}
            {roster
              .filter((v) => {
                const q = search.trim().toLowerCase();
                if (!q) return true;
                return (
                  v.company.toLowerCase().includes(q) ||
                  (v.trade || "").toLowerCase().includes(q) ||
                  (v.city || "").toLowerCase().includes(q)
                );
              })
              .slice(0, 40)
              .map((v) => (
                <div
                  key={v.id}
                  onClick={() => { setPickedVendor(v); setSearch(""); }}
                  style={{ ...cardBox, padding: 13, cursor: "pointer" }}
                >
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{v.company}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                    {[v.trade, v.city].filter(Boolean).join(" · ") || `Vendor ${v.id}`}
                  </div>
                </div>
              ))}
          </>
        ) : (
          <>
            <div style={{ ...cardBox, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Adding to
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, marginTop: 3 }}>
                  {pickedVendor.company}
                </div>
              </div>
              <button
                onClick={() => { setPickedVendor(null); setShot(""); setShotCaption(""); }}
                style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.dim, borderRadius: 8, padding: "7px 11px", fontSize: 12, cursor: "pointer", flexShrink: 0 }}
              >
                Change
              </button>
            </div>

            {shot ? (
              <>
                <img
                  src={shot}
                  alt="Preview"
                  style={{ width: "100%", borderRadius: 12, display: "block", marginBottom: 10 }}
                />
                <input
                  value={shotCaption}
                  onChange={(e) => setShotCaption(e.target.value)}
                  placeholder="Caption — what and where"
                  style={{ width: "100%", padding: 13, fontSize: 16, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 9, color: C.text, outline: "none", marginBottom: 12 }}
                />
                <button
                  onClick={uploadShot}
                  disabled={uploading}
                  style={{ width: "100%", padding: 15, fontSize: 16, fontWeight: 800, background: C.green, color: "#0B1220", border: "none", borderRadius: 10, cursor: "pointer", opacity: uploading ? 0.6 : 1, marginBottom: 8 }}
                >
                  {uploading ? "Uploading…" : "Add to portfolio"}
                </button>
                <button
                  onClick={() => setShot("")}
                  disabled={uploading}
                  style={{ width: "100%", padding: 11, fontSize: 13, background: "transparent", border: "none", color: C.muted, cursor: "pointer" }}
                >
                  Retake
                </button>
              </>
            ) : (
              <>
                <label style={{ ...btn, display: "block", textAlign: "center", marginBottom: 10 }}>
                  Take photo
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={takeShot}
                    style={{ display: "none" }}
                  />
                </label>
                <label
                  style={{ width: "100%", padding: 13, fontSize: 14, background: "transparent", border: `1px solid ${C.border}`, color: C.dim, borderRadius: 10, cursor: "pointer", display: "block", textAlign: "center", boxSizing: "border-box" }}
                >
                  Choose from library
                  <input
                    type="file"
                    accept="image/*"
                    onChange={takeShot}
                    style={{ display: "none" }}
                  />
                </label>
              </>
            )}
          </>
        )
      ) : null}

      {tab === "photos" ? (
        <>
          {photos.length === 0 && !busy ? (
            <div style={{ ...cardBox, textAlign: "center", color: C.muted, fontSize: 14, padding: 30 }}>
              No photos waiting.
            </div>
          ) : null}

          {photos.map((p) => {
            const acting = photoBusy === p.photo_id;
            const confirmingReject = rejectId === p.photo_id;
            return (
              <div key={p.photo_id} style={{ ...cardBox, padding: 0, overflow: "hidden" }}>
                <img
                  src={p.url}
                  alt={p.caption || "Pending photo"}
                  style={{ width: "100%", display: "block", background: C.panel, maxHeight: 420, objectFit: "cover" }}
                />
                <div style={{ padding: 14 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>
                    {p.company}
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>
                    {[p.trade, p.city].filter(Boolean).join(" · ")}
                    {p.submitted ? ` · ${fmtWhen(p.submitted)}` : ""}
                  </div>
                  {p.caption ? (
                    <div style={{ fontSize: 13.5, color: C.dim, lineHeight: 1.5, marginBottom: 12 }}>
                      {p.caption}
                    </div>
                  ) : (
                    <div style={{ fontSize: 12.5, color: C.muted, fontStyle: "italic", marginBottom: 12 }}>
                      No caption
                    </div>
                  )}

                  {confirmingReject ? (
                    <div style={{ padding: 12, background: C.panel, border: `1px solid ${C.red}66`, borderRadius: 10 }}>
                      <div style={{ fontSize: 12.5, color: C.dim, lineHeight: 1.5, marginBottom: 10 }}>
                        This deletes the photo permanently. He won't be told, so
                        it's worth a text if it's a good contractor.
                      </div>
                      <button
                        onClick={() => rejectPhoto(p)}
                        disabled={acting}
                        style={{ width: "100%", padding: 13, fontSize: 15, fontWeight: 800, background: C.red, color: "#0B1220", border: "none", borderRadius: 9, cursor: "pointer", opacity: acting ? 0.6 : 1, marginBottom: 8 }}
                      >
                        {acting ? "Deleting…" : "Yes, delete it"}
                      </button>
                      <button
                        onClick={() => setRejectId(null)}
                        disabled={acting}
                        style={{ width: "100%", padding: 10, fontSize: 13, background: "transparent", border: "none", color: C.muted, cursor: "pointer" }}
                      >
                        Keep it
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => approvePhoto(p)}
                        disabled={acting}
                        style={{ flex: 2, padding: 14, fontSize: 15, fontWeight: 800, background: C.green, color: "#0B1220", border: "none", borderRadius: 9, cursor: "pointer", opacity: acting ? 0.6 : 1 }}
                      >
                        {acting ? "…" : "Approve"}
                      </button>
                      <button
                        onClick={() => setRejectId(p.photo_id)}
                        disabled={acting}
                        style={{ flex: 1, padding: 14, fontSize: 14, fontWeight: 700, background: "transparent", border: `1px solid ${C.border}`, color: C.dim, borderRadius: 9, cursor: "pointer" }}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </>
      ) : null}

      {tab === "apps" ? (
        <>
          <div style={{ fontSize: 12.5, color: C.dim, lineHeight: 1.5, marginBottom: 12 }}>
            Straight from the sign-up form. Verify the license on DBPR and the
            business on Sunbiz before you publish — that check is the whole product.
          </div>

          {apps.length === 0 && !busy ? (
            <div style={{ ...cardBox, textAlign: "center", color: C.muted, fontSize: 14, padding: 30 }}>
              No applications waiting.
            </div>
          ) : null}

          {apps.map((a) => {
            const open = appOpenId === a.vendor_id;
            const rejecting = appRejectId === a.vendor_id;
            const working = appBusy === a.vendor_id;
            return (
              <div key={a.vendor_id} style={cardBox}>
                <div
                  onClick={() => { setAppOpenId(open ? null : a.vendor_id); setAppRejectId(null); }}
                  style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {a.company || "(no company)"}
                    </div>
                    <div style={{ fontSize: 13, color: C.dim, marginTop: 2 }}>
                      {a.trade || "no trade given"}
                      {a.name ? ` · ${a.name}` : ""}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: C.muted }}>{fmtWhen(a.submitted)}</div>
                    <div style={{ fontSize: 18, color: C.dim, lineHeight: 1 }}>{open ? "−" : "+"}</div>
                  </div>
                </div>

                <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
                  {a.type === "supplier" ? (
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.gold }}>Supplier</span>
                  ) : null}
                  {a.license ? (
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.green }}>Has license #</span>
                  ) : (
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.muted }}>No license — Sunbiz only</span>
                  )}
                </div>

                {open ? (
                  <div style={{ marginTop: 14, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
                    <Row label="Phone" value={a.phone} />
                    <Row label="Email" value={a.email} />
                    <Row label="City" value={a.city} />
                    <Row label="Vendor ID" value={String(a.vendor_id)} />
                    {a.bio ? <Row label="Bio" value={a.bio} /> : null}

                    {a.website ? (
                      <a
                        href={a.website.startsWith("http") ? a.website : `https://${a.website}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: "block", fontSize: 13, color: C.orange, wordBreak: "break-all", marginBottom: 12, textDecoration: "none" }}
                      >
                        {a.website} ↗
                      </a>
                    ) : null}

                    <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 7 }}>
                      Verify first
                    </div>
                    <div style={{ display: "flex", gap: 7, marginBottom: 14, flexWrap: "wrap" }}>
                      {a.license ? (
                        <button
                          onClick={() => checkLicense(a.license)}
                          style={{ flex: "1 1 45%", padding: "11px 8px", fontSize: 13, fontWeight: 700, background: C.panel, border: `1px solid ${C.green}66`, color: C.green, borderRadius: 9, cursor: "pointer" }}
                        >
                          Copy {a.license} → DBPR
                        </button>
                      ) : null}
                      <button
                        onClick={() => checkSunbiz(a.company)}
                        style={{ flex: "1 1 45%", padding: "11px 8px", fontSize: 13, fontWeight: 700, background: C.panel, border: `1px solid ${C.border}`, color: C.dim, borderRadius: 9, cursor: "pointer" }}
                      >
                        Copy name → Sunbiz
                      </button>
                    </div>

                    {rejecting ? (
                      <div style={{ padding: 14, background: C.panel, border: `1px solid ${C.red}66`, borderRadius: 10 }}>
                        <div style={{ fontSize: 12.5, color: C.dim, lineHeight: 1.5, marginBottom: 10 }}>
                          This deletes the application for good — there's no undo and
                          no record kept. Sure?
                        </div>
                        <button
                          onClick={() => rejectApp(a)}
                          disabled={working}
                          style={{ width: "100%", padding: 14, fontSize: 15, fontWeight: 800, background: C.red, color: "#0B1220", border: "none", borderRadius: 10, cursor: "pointer", opacity: working ? 0.6 : 1, marginBottom: 8 }}
                        >
                          {working ? "Working…" : "Yes, delete it"}
                        </button>
                        <button
                          onClick={() => setAppRejectId(null)}
                          disabled={working}
                          style={{ width: "100%", padding: 11, fontSize: 13, background: "transparent", border: "none", color: C.muted, cursor: "pointer" }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => approveApp(a)}
                          disabled={working}
                          style={{ width: "100%", padding: 15, fontSize: 16, fontWeight: 800, background: C.green, color: "#0B1220", border: "none", borderRadius: 10, cursor: "pointer", opacity: working ? 0.6 : 1 }}
                        >
                          {working ? "Working…" : "Approve & Publish"}
                        </button>
                        <div style={{ fontSize: 11.5, color: C.muted, textAlign: "center", margin: "8px 0 4px", lineHeight: 1.45 }}>
                          {/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(a.email || "").trim())
                            ? "Goes live now, and their email becomes their login."
                            : "Goes live now. No email on file — they can't sign in yet."}
                        </div>
                        <button
                          onClick={() => setAppRejectId(a.vendor_id)}
                          disabled={working}
                          style={{ width: "100%", padding: 11, fontSize: 13, background: "transparent", border: "none", color: C.red, cursor: "pointer" }}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </>
      ) : null}

      {tab === "claims" ? (
        <>
          {pending.length === 0 && !busy ? (
            <div style={{ ...cardBox, textAlign: "center", color: C.muted, fontSize: 14, padding: 30 }}>
              No claims waiting.
            </div>
          ) : null}

          {pending.map((c) => {
            const open = openId === c.claim_id;
            const confirming = confirmId === c.claim_id;
            return (
              <div key={c.claim_id} style={cardBox}>
                <div
                  onClick={() => { setOpenId(open ? null : c.claim_id); cancelConfirm(); }}
                  style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {c.company || "(no company)"}
                    </div>
                    <div style={{ fontSize: 13, color: C.dim, marginTop: 2 }}>
                      {c.claimant_name}
                      {c.role ? ` · ${c.role}` : ""}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: C.muted }}>{fmtWhen(c.submitted)}</div>
                    <div style={{ fontSize: 18, color: C.dim, lineHeight: 1 }}>{open ? "−" : "+"}</div>
                  </div>
                </div>

                {c.already_claimed ? (
                  <div style={{ marginTop: 8, fontSize: 12, color: C.gold }}>
                    Already claimed — likely a duplicate
                  </div>
                ) : null}

                {open ? (
                  <div style={{ marginTop: 14, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
                    <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Login email — read this back to him
                    </div>
                    <div style={{ fontSize: 19, fontWeight: 700, color: C.orange, wordBreak: "break-all", margin: "6px 0 14px" }}>
                      {c.email || "(none given)"}
                    </div>

                    <Row label="Phone" value={c.phone} />
                    <Row label="Trade" value={c.vendor ? c.vendor.trade : ""} />
                    <Row label="City" value={c.vendor ? c.vendor.city : ""} />
                    <Row label="Listed phone" value={c.vendor ? c.vendor.phone : ""} />
                    <Row label="Vendor ID" value={String(c.vendor_id)} />
                    {c.note ? <Row label="Note" value={c.note} /> : null}

                    {confirming ? (
                      <div style={{ marginTop: 14, padding: 14, background: C.panel, border: `1px solid ${C.orange}66`, borderRadius: 10 }}>
                        <div style={{ fontSize: 12.5, color: C.dim, lineHeight: 1.5, marginBottom: 10 }}>
                          This becomes his permanent login. He can't change it later,
                          so fix any typo now.
                        </div>
                        <input
                          type="email"
                          value={confirmEmail}
                          onChange={(e) => setConfirmEmail(e.target.value)}
                          autoCapitalize="off"
                          autoCorrect="off"
                          spellCheck={false}
                          style={{ width: "100%", padding: 12, fontSize: 16, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, outline: "none", marginBottom: 12 }}
                        />
                        <button
                          onClick={() => doApprove(c)}
                          disabled={busy}
                          style={{ width: "100%", padding: 15, fontSize: 16, fontWeight: 800, background: C.green, color: "#0B1220", border: "none", borderRadius: 10, cursor: "pointer", opacity: busy ? 0.6 : 1, marginBottom: 8 }}
                        >
                          {busy ? "Working…" : "Confirm & Claim"}
                        </button>
                        <button
                          onClick={cancelConfirm}
                          disabled={busy}
                          style={{ width: "100%", padding: 11, fontSize: 13, background: "transparent", border: "none", color: C.muted, cursor: "pointer" }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startConfirm(c)}
                        disabled={busy}
                        style={{ width: "100%", marginTop: 14, padding: 15, fontSize: 16, fontWeight: 800, background: C.green, color: "#0B1220", border: "none", borderRadius: 10, cursor: "pointer", opacity: busy ? 0.6 : 1 }}
                      >
                        Approve &amp; Claim
                      </button>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </>
      ) : null}

      <div style={{ marginTop: 26, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 9 }}>
          Tools
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {TOOLS.map((t) => (
            <a
              key={t.label}
              href={t.url}
              target="_blank"
              rel="noreferrer"
              style={{ padding: "9px 13px", fontSize: 13, fontWeight: 600, background: C.card, border: `1px solid ${C.border}`, color: C.dim, borderRadius: 8, textDecoration: "none" }}
            >
              {t.label}
            </a>
          ))}
        </div>
      </div>

      <button
        onClick={forget}
        style={{ width: "100%", marginTop: 18, padding: 11, fontSize: 12, background: "transparent", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, cursor: "pointer" }}
      >
        Forget key on this device
      </button>
    </div>
  );
}

function LeadField({ label, value, onChange, placeholder, type }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>
        {label}
      </div>
      <input
        type={type || "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: "100%", padding: 13, fontSize: 16, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 9, color: C.text, outline: "none", boxSizing: "border-box" }}
      />
    </div>
  );
}

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", gap: 10, fontSize: 13, marginBottom: 7 }}>
      <div style={{ color: C.muted, width: 96, flexShrink: 0 }}>{label}</div>
      <div style={{ color: C.text, wordBreak: "break-word" }}>{value}</div>
    </div>
  );
}
