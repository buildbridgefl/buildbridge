// api/admin.js — BuildBridge mobile admin
// Serverless approvals from Alex's phone. Uses the service role key, so it can
// write to any vendor row — which is exactly why every call checks ADMIN_SECRET
// server-side first.
//
// Manual test:  https://buildbridgefl.com/api/admin?secret=YOUR_ADMIN_SECRET&action=list
//
// Actions:
//   list     → pending claim requests, each with its matching vendor row
//   approve  → writes email + claimed=true on the vendor, marks the claim approved
//   (photo comes later — step 6)

const SB_URL = "https://jbpwxfaazetfcbwxrmtc.supabase.co";

export default async function handler(req, res) {
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const ADMIN_SECRET = process.env.ADMIN_SECRET;

  const missing = [];
  if (!SERVICE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!ADMIN_SECRET) missing.push("ADMIN_SECRET");
  if (missing.length) {
    return res.status(500).json({ error: "Missing env vars", missing });
  }

  // Secret can arrive in the body (from the app) or the query string (browser test).
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const provided = body.secret || req.query.secret;
  if (provided !== ADMIN_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const action = body.action || req.query.action || "list";

  const sbHeaders = {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json",
  };

  try {
    // ---------- list ----------
    if (action === "list") {
      const claimsRes = await fetch(
        `${SB_URL}/rest/v1/claim_requests?select=*&order=created_at.desc`,
        { headers: sbHeaders }
      );
      if (!claimsRes.ok) {
        throw new Error(`claim_requests query failed: ${claimsRes.status}`);
      }
      const allClaims = await claimsRes.json();

      // Anything not yet resolved. status is text: pending / approved / rejected.
      const done = ["approved", "rejected", "declined"];
      const pending = allClaims.filter(
        (c) => !done.includes(String(c.status || "pending").toLowerCase())
      );

      if (!pending.length) {
        return res.status(200).json({ pending: [], count: 0 });
      }

      const ids = [...new Set(pending.map((c) => c.vendor_id).filter(Boolean))];
      let vendors = [];
      if (ids.length) {
        const vendRes = await fetch(
          `${SB_URL}/rest/v1/vendor_applications?select=id,name,company,trade,city,phone,email,claimed,approved&id=in.(${ids.join(",")})`,
          { headers: sbHeaders }
        );
        if (!vendRes.ok) throw new Error(`vendor query failed: ${vendRes.status}`);
        vendors = await vendRes.json();
      }
      const vendorById = {};
      vendors.forEach((v) => { vendorById[v.id] = v; });

      const out = pending.map((c) => ({
        claim_id: c.id,
        vendor_id: c.vendor_id,
        submitted: c.created_at || null,
        status: c.status || "pending",
        claimant_name: c.claimant_name || "",
        role: c.role || "",
        email: c.email || "",
        phone: c.phone || "",
        note: c.note || "",
        company: c.company || (vendorById[c.vendor_id] || {}).company || "",
        vendor: vendorById[c.vendor_id] || null,
        already_claimed: !!(vendorById[c.vendor_id] || {}).claimed,
      }));

      return res.status(200).json({ pending: out, count: out.length });
    }

    // ---------- approve ----------
    if (action === "approve") {
      const claimId = body.claim_id;
      const vendorId = body.vendor_id;
      const email = String(body.email || "").trim().toLowerCase();

      if (!claimId || !vendorId) {
        return res.status(400).json({ error: "claim_id and vendor_id are required" });
      }
      // This email becomes their permanent login. A bad one locks them out.
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        return res.status(400).json({ error: `That doesn't look like a valid email: ${email}` });
      }

      // Refuse if another vendor already owns this email — RLS keys on it, so a
      // duplicate would hand one person access to two listings.
      const dupRes = await fetch(
        `${SB_URL}/rest/v1/vendor_applications?select=id,company&email=eq.${encodeURIComponent(email)}`,
        { headers: sbHeaders }
      );
      if (dupRes.ok) {
        const dups = await dupRes.json();
        const other = dups.find((d) => d.id !== vendorId);
        if (other) {
          return res.status(409).json({
            error: `${email} is already on ${other.company} (id ${other.id}). Use a different address.`,
          });
        }
      }

      // 1. The vendor row — email + claimed in one write.
      const vendRes = await fetch(
        `${SB_URL}/rest/v1/vendor_applications?id=eq.${vendorId}`,
        {
          method: "PATCH",
          headers: { ...sbHeaders, Prefer: "return=representation" },
          body: JSON.stringify({ email: email, claimed: true }),
        }
      );
      if (!vendRes.ok) {
        const detail = await vendRes.text();
        throw new Error(`vendor update failed (${vendRes.status}): ${detail}`);
      }
      const updated = await vendRes.json();
      if (!updated.length) {
        return res.status(404).json({ error: `No vendor row with id ${vendorId}` });
      }

      // 2. Mark the claim resolved so it leaves the queue.
      let claimMarked = true;
      const claimRes = await fetch(
        `${SB_URL}/rest/v1/claim_requests?id=eq.${claimId}`,
        {
          method: "PATCH",
          headers: { ...sbHeaders, Prefer: "return=minimal" },
          body: JSON.stringify({ status: "approved" }),
        }
      );
      if (!claimRes.ok) claimMarked = false;

      return res.status(200).json({
        ok: true,
        vendor: updated[0],
        claim_marked: claimMarked,
      });
    }

    return res.status(400).json({ error: "Unknown action", action });
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
}
