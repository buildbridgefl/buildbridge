// api/admin.js — BuildBridge mobile admin
// Serverless approvals from Alex's phone. Uses the service role key, so it can
// write to any vendor row — which is exactly why every call checks ADMIN_SECRET
// server-side first.
//
// Manual test:  https://buildbridgefl.com/api/admin?secret=YOUR_ADMIN_SECRET&action=list
//
// Actions:
//   list           → pending claim requests, each with its matching vendor row
//   approve        → writes email + claimed=true on the vendor, marks the claim approved
//   photos         → pending (unapproved) photos with vendor name and public URL
//   photo_approve  → flips approved=true on one photo
//   photo_reject   → deletes the storage object and the vendor_photos row
//   vendors        → approved roster, for the capture picker
//   photo_upload   → base64 JPEG from Alex's camera, lands pre-approved

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

    // ---------- photos (pending queue) ----------
    if (action === "photos") {
      const photoRes = await fetch(
        `${SB_URL}/rest/v1/vendor_photos?select=*&approved=eq.false&order=created_at.desc`,
        { headers: sbHeaders }
      );
      if (!photoRes.ok) {
        throw new Error(`vendor_photos query failed: ${photoRes.status}`);
      }
      const photos = await photoRes.json();

      if (!photos.length) {
        return res.status(200).json({ photos: [], count: 0 });
      }

      const pIds = [...new Set(photos.map((p) => p.vendor_id).filter(Boolean))];
      let pVendors = [];
      if (pIds.length) {
        const pvRes = await fetch(
          `${SB_URL}/rest/v1/vendor_applications?select=id,name,company,trade,city&id=in.(${pIds.join(",")})`,
          { headers: sbHeaders }
        );
        if (pvRes.ok) pVendors = await pvRes.json();
      }
      const pvById = {};
      pVendors.forEach((v) => { pvById[v.id] = v; });

      const photoOut = photos.map((p) => ({
        photo_id: p.id,
        vendor_id: p.vendor_id,
        path: p.path,
        caption: p.caption || "",
        submitted: p.created_at || null,
        url: `${SB_URL}/storage/v1/object/public/vendor-photos/${p.path}`,
        company: (pvById[p.vendor_id] || {}).company || `Vendor ${p.vendor_id}`,
        city: (pvById[p.vendor_id] || {}).city || "",
        trade: (pvById[p.vendor_id] || {}).trade || "",
      }));

      return res.status(200).json({ photos: photoOut, count: photoOut.length });
    }

    // ---------- photo_approve ----------
    if (action === "photo_approve") {
      const photoId = body.photo_id;
      if (!photoId) {
        return res.status(400).json({ error: "photo_id is required" });
      }
      const okRes = await fetch(
        `${SB_URL}/rest/v1/vendor_photos?id=eq.${photoId}`,
        {
          method: "PATCH",
          headers: { ...sbHeaders, Prefer: "return=representation" },
          body: JSON.stringify({ approved: true }),
        }
      );
      if (!okRes.ok) {
        const detail = await okRes.text();
        throw new Error(`photo approve failed (${okRes.status}): ${detail}`);
      }
      const okRows = await okRes.json();
      if (!okRows.length) {
        return res.status(404).json({ error: `No photo with id ${photoId}` });
      }
      return res.status(200).json({ ok: true, photo: okRows[0] });
    }

    // ---------- photo_reject ----------
    if (action === "photo_reject") {
      const photoId = body.photo_id;
      const photoPath = body.path;
      if (!photoId) {
        return res.status(400).json({ error: "photo_id is required" });
      }

      // Storage object first. If it fails we still drop the row — an orphaned
      // file is harmless, an orphaned row shows a broken image in the queue.
      let fileDeleted = true;
      if (photoPath) {
        const delRes = await fetch(
          `${SB_URL}/storage/v1/object/vendor-photos/${photoPath}`,
          { method: "DELETE", headers: sbHeaders }
        );
        if (!delRes.ok) fileDeleted = false;
      }

      const rowRes = await fetch(
        `${SB_URL}/rest/v1/vendor_photos?id=eq.${photoId}`,
        { method: "DELETE", headers: { ...sbHeaders, Prefer: "return=minimal" } }
      );
      if (!rowRes.ok) {
        const detail = await rowRes.text();
        throw new Error(`photo delete failed (${rowRes.status}): ${detail}`);
      }

      return res.status(200).json({ ok: true, file_deleted: fileDeleted });
    }

    // ---------- vendors (roster for the capture picker) ----------
    if (action === "vendors") {
      const vRes = await fetch(
        `${SB_URL}/rest/v1/vendor_applications?select=id,company,name,trade,city&approved=eq.true&order=company.asc`,
        { headers: sbHeaders }
      );
      if (!vRes.ok) throw new Error(`vendor roster query failed: ${vRes.status}`);
      const rows = await vRes.json();
      const roster = rows.map((v) => ({
        id: v.id,
        company: v.company || v.name || `Vendor ${v.id}`,
        trade: v.trade || "",
        city: v.city || "",
      }));
      return res.status(200).json({ vendors: roster, count: roster.length });
    }

    // ---------- photo_upload (Alex's camera, pre-approved) ----------
    if (action === "photo_upload") {
      const vendorId = body.vendor_id;
      const caption = String(body.caption || "").trim();
      const dataUrl = String(body.image || "");

      if (!vendorId) {
        return res.status(400).json({ error: "vendor_id is required" });
      }
      // Client sends a data URL from the canvas. Strip the prefix if present.
      const b64 = dataUrl.includes(",") ? dataUrl.split(",").pop() : dataUrl;
      if (!b64 || b64.length < 100) {
        return res.status(400).json({ error: "No image received" });
      }

      const bytes = Buffer.from(b64, "base64");
      // Vercel caps the request body around 4.5MB; the client compresses well
      // under that, so anything this big means compression didn't run.
      if (bytes.length > 4000000) {
        return res.status(413).json({ error: "Image too large — retake it" });
      }

      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.jpg`;
      const path = `${vendorId}/${fileName}`;

      const upRes = await fetch(
        `${SB_URL}/storage/v1/object/vendor-photos/${path}`,
        {
          method: "POST",
          headers: {
            apikey: SERVICE_KEY,
            Authorization: `Bearer ${SERVICE_KEY}`,
            "Content-Type": "image/jpeg",
            "x-upsert": "false",
          },
          body: bytes,
        }
      );
      if (!upRes.ok) {
        const detail = await upRes.text();
        throw new Error(`storage upload failed (${upRes.status}): ${detail}`);
      }

      const rowRes = await fetch(`${SB_URL}/rest/v1/vendor_photos`, {
        method: "POST",
        headers: { ...sbHeaders, Prefer: "return=representation" },
        body: JSON.stringify({
          vendor_id: vendorId,
          path: path,
          caption: caption,
          approved: true,
        }),
      });
      if (!rowRes.ok) {
        const detail = await rowRes.text();
        // Row insert failed — don't leave the file orphaned in the bucket.
        await fetch(`${SB_URL}/storage/v1/object/vendor-photos/${path}`, {
          method: "DELETE",
          headers: sbHeaders,
        }).catch(() => {});
        throw new Error(`photo row insert failed (${rowRes.status}): ${detail}`);
      }
      const rows = await rowRes.json();

      return res.status(200).json({
        ok: true,
        photo: rows[0] || null,
        url: `${SB_URL}/storage/v1/object/public/vendor-photos/${path}`,
      });
    }

    return res.status(400).json({ error: "Unknown action", action });
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
}
