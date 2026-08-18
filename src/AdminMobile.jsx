// src/AdminMobile.jsx — BuildBridge mobile admin
// Step 4: key gate + pending claims list + approve & claim.
// Talks only to /api/admin, never to Supabase directly.

import React, { useState, useEffect, useCallback } from "react";

const C = {
  bg: "#0B1220", panel: "#0F1729", card: "#141E33", border: "#22304F",
  orange: "#FF8A1E", green: "#34D178", red: "#FF5C5C", gold: "#D9AE3B",
  text: "#DCE4F2", dim: "#93A3C0", muted: "#5D6E8F",
};

const KEY_STORE = "bb_admin_key";

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

export default function AdminMobile() {
  const [secret, setSecret] = useState("");
  const [entry, setEntry] = useState("");
  const [remember, setRemember] = useState(true);
  const [pending, setPending] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [confirmId, setConfirmId] = useState(null);   // claim awaiting confirmation
  const [confirmEmail, setConfirmEmail] = useState("");
  const [done, setDone] = useState(null);             // { company, email } after approval

  const load = useCallback(async (key) => {
    setBusy(true);
    setErr("");
    try {
      const data = await callAdmin(key, "list");
      setPending(data.pending || []);
      setSecret(key);
      setLoaded(true);
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
    setBusy(true);
    setErr("");
    try {
      const data = await callAdmin(key, "list");
      setPending(data.pending || []);
      setSecret(key);
      setLoaded(true);
      if (remember) {
        try { window.localStorage.setItem(KEY_STORE, key); } catch (e) {}
      }
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setBusy(false);
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

  const forget = () => {
    try { window.localStorage.removeItem(KEY_STORE); } catch (e) {}
    setSecret("");
    setEntry("");
    setPending([]);
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
          Back to pending claims
        </button>
      </div>
    );
  }

  // ---------- Pending list ----------
  return (
    <div style={wrap}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Pending claims</div>
          <div style={{ fontSize: 13, color: C.dim }}>
            {pending.length === 0 ? "Nothing waiting" : `${pending.length} waiting`}
          </div>
        </div>
        <button
          onClick={() => load(secret)}
          disabled={busy}
          style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.dim, borderRadius: 8, padding: "7px 12px", fontSize: 13, cursor: "pointer" }}
        >
          {busy ? "…" : "Refresh"}
        </button>
      </div>

      {err ? (
        <div style={{ ...cardBox, borderColor: C.red, color: C.red, fontSize: 13 }}>{err}</div>
      ) : null}

      {pending.length === 0 && !busy && !err ? (
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
                <div style={{ fontSize: 18, color: C.dim, lineHeight: 1 }}>{open ? "\u2212" : "+"}</div>
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
                      This becomes his permanent login. He can't change it later —
                      fix any typo now.
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

      <button
        onClick={forget}
        style={{ width: "100%", marginTop: 20, padding: 11, fontSize: 12, background: "transparent", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, cursor: "pointer" }}
      >
        Forget key on this device
      </button>
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
