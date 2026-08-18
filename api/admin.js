// api/admin.js — BuildBridge mobile admin
// Serverless approvals from Alex's phone. Uses the service role key, so it can
// write to any vendor row — which is exactly why every call checks ADMIN_SECRET
// server-side first.
//
// Manual test:  https://buildbridgefl.com/api/admin?secret=YOUR_ADMIN_SECRET&action=list
//
// Actions:
//   list     → pending claim requests, each with its matching vendor row
//   (approve and photo come later — step 4 and step 6)

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
    if (action === "list") {
      // All claims, newest first. Filtering for "pending" happens below in JS
      // rather than in the query, so this still works whether the approved
      // column defaults to false or to null.
      const claimsRes = await fetch(
        `${SB_URL}/rest/v1/claim_requests?select=*&order=created_at.desc`,
        { headers: sbHeaders }
      );
      if (!claimsRes.ok) {
        throw new Error(`claim_requests query failed: ${claimsRes.status}`);
      }
      const allClaims = await claimsRes.json();

      const pending = allClaims.filter((c) => c.approved !== true);

      if (!pending.length) {
        return res.status(200).json({ pending: [], count: 0 });
      }

      // Pull the vendor rows these claims point at, in one request.
      const ids = [...new Set(pending.map((c) => c.vendor_id).filter(Boolean))];
      let vendors = [];
      if (ids.length) {
        const vendRes = await fetch(
          `${SB_URL}/rest/v1/vendor_applications?select=id,name,company,trade,city,phone,email,claimed,approved&id=in.(${ids.join(",")})`,
          { headers: sbHeaders }
        );
        if (!vendRes.ok) {
          throw new Error(`vendor query failed: ${vendRes.status}`);
        }
        vendors = await vendRes.json();
      }
      const vendorById = {};
      vendors.forEach((v) => { vendorById[v.id] = v; });

      const out = pending.map((c) => ({
        claim_id: c.id,
        vendor_id: c.vendor_id,
        submitted: c.created_at || null,
        claimant_name: c.claimant_name || "",
        role: c.role || "",
        email: c.email || "",
        phone: c.phone || "",
        note: c.note || "",
        company: c.company || (vendorById[c.vendor_id] || {}).company || "",
        vendor: vendorById[c.vendor_id] || null,
        // True when the vendor row is already claimed — a duplicate or stale
        // request. Worth showing so Alex doesn't approve the same one twice.
        already_claimed: !!(vendorById[c.vendor_id] || {}).claimed,
      }));

      return res.status(200).json({ pending: out, count: out.length });
    }

    return res.status(400).json({ error: "Unknown action", action });
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
}
