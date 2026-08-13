// api/digest.js — BuildBridge morning digest
// Runs once a day via Vercel Cron. Sends each contractor who has turned on
// "Email me new homeowner projects" in My Profile only the posts that match
// their trade. Posts with no trade go to everyone.
//
// Skips entirely when there are no new posts — no empty digests, ever.
// Skips any individual contractor who has nothing matching — no empty emails.
//
// Manual test:  https://buildbridgefl.com/api/digest?secret=YOUR_CRON_SECRET&dry=1
//   dry=1  → returns what WOULD be sent, to whom, sends nothing.

const SB_URL = "https://jbpwxfaazetfcbwxrmtc.supabase.co";
const FROM = "BuildBridge FL <jobs@buildbridgefl.com>";
const SITE = "https://buildbridgefl.com";
const LOOKBACK_HOURS = 24;

export default async function handler(req, res) {
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const RESEND_KEY = process.env.RESEND_API_KEY;
  const CRON_SECRET = process.env.CRON_SECRET;

  const missing = [];
  if (!SERVICE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!RESEND_KEY) missing.push("RESEND_API_KEY");
  if (!CRON_SECRET) missing.push("CRON_SECRET");
  if (missing.length) {
    return res.status(500).json({ error: "Missing env vars", missing });
  }

  // Auth: Vercel Cron sends "Authorization: Bearer <CRON_SECRET>".
  // ?secret= is allowed too so you can trigger it by hand from a browser.
  const bearer = (req.headers.authorization || "").replace("Bearer ", "");
  const provided = bearer || req.query.secret;
  if (provided !== CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const dryRun = req.query.dry === "1";
  const sbHeaders = {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json",
  };

  try {
    // 1. New approved homeowner projects from the last 24 hours.
    const since = new Date(Date.now() - LOOKBACK_HOURS * 3600 * 1000).toISOString();
    const postsRes = await fetch(
      `${SB_URL}/rest/v1/project_posts?select=id,content,created_at,trade&approved=eq.true&post_type=eq.Project&created_at=gte.${since}&order=created_at.desc`,
      { headers: sbHeaders }
    );
    if (!postsRes.ok) throw new Error(`posts query failed: ${postsRes.status}`);
    const posts = await postsRes.json();

    if (!posts.length) {
      return res.status(200).json({ sent: 0, reason: "no new posts — nothing sent" });
    }

    // 2. Contractors who opted in and have an email.
    const vendRes = await fetch(
      `${SB_URL}/rest/v1/vendor_applications?select=id,name,company,email,trade&notify_jobs=eq.true&approved=eq.true&email=not.is.null`,
      { headers: sbHeaders }
    );
    if (!vendRes.ok) throw new Error(`vendors query failed: ${vendRes.status}`);
    const vendors = (await vendRes.json()).filter(v => v.email && v.email.includes("@"));

    if (!vendors.length) {
      return res.status(200).json({ sent: 0, posts: posts.length, reason: "nobody opted in" });
    }

    const dayName = new Date().toLocaleDateString("en-US", { weekday: "long", timeZone: "America/New_York" });

    // Which posts belong in this contractor's email.
    // A post with no trade goes to everyone, exactly as before.
    const postsFor = (vendor) => {
      const mine = bucket(vendor.trade);
      return posts.filter(p => {
        const t = String(p.trade || "").trim();
        if (!t) return true;
        return t.split(",").some(x => bucket(x) === mine);
      });
    };

    // Build one contractor's email from their posts.
    const buildFor = (mine) => {
      const count = mine.length;
      const subject = `New ${count === 1 ? "project" : "projects"} — ${dayName}`;

      const opener = count === 1
        ? "One homeowner posted a project yesterday. Here's what came in."
        : `${count} homeowners posted projects yesterday. Here's what came in.`;

      const blocks = mine.map(p => {
        const body = String(p.content || "").trim();
        const short = body.length > 260 ? body.slice(0, 257).trimEnd() + "…" : body;
        return `<div style="border-left:3px solid #f97316;padding:2px 0 2px 14px;margin:0 0 20px 0">
  <p style="margin:0;font-size:15px;line-height:1.6;color:#1f2937">${esc(short)}</p>
  <p style="margin:8px 0 0 0"><a href="${SITE}/?view=projects" style="color:#c2410c;font-size:14px;text-decoration:none;font-weight:600">View on BuildBridge &rarr;</a></p>
</div>`;
      }).join("\n");

      const html = `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:28px 22px;color:#1f2937">
  <p style="margin:0 0 22px 0;font-size:18px;font-weight:800;letter-spacing:-0.01em;color:#0f172a">BuildBridge FL</p>
  <p style="margin:0 0 22px 0;font-size:15px;line-height:1.6">${esc(opener)}</p>
  ${blocks}
  <div style="border-top:1px solid #e5e7eb;margin-top:26px;padding-top:18px">
    <p style="margin:0 0 14px 0;font-size:13.5px;line-height:1.65;color:#4b5563">Homeowners contact you through BuildBridge — no lead fees, no bidding against six other companies. If a job isn't a fit, ignore it and nothing happens.</p>
    <p style="margin:0;font-size:12px;line-height:1.6;color:#9ca3af">You're getting this because you turned on project emails in your BuildBridge profile. Turn it off anytime in <a href="${SITE}/?view=myprofile" style="color:#9ca3af">My Profile</a>.</p>
  </div>
</div>`;

      const text = `${opener}\n\n${mine.map(p => `• ${String(p.content || "").trim()}\n  ${SITE}/?view=projects`).join("\n\n")}\n\nHomeowners contact you through BuildBridge — no lead fees, no bidding against six other companies. If a job isn't a fit, ignore it and nothing happens.\n\nYou're getting this because you turned on project emails in your BuildBridge profile. Turn it off anytime in My Profile.`;

      return { subject, html, text };
    };

    if (dryRun) {
      return res.status(200).json({
        dryRun: true,
        posts: posts.length,
        wouldSendTo: vendors
          .map(v => ({ email: v.email, trade: v.trade || null, matched: postsFor(v).length }))
          .filter(x => x.matched > 0),
        skipped: vendors
          .filter(v => postsFor(v).length === 0)
          .map(v => ({ email: v.email, trade: v.trade || null })),
      });
    }

    // 3. Send, one at a time, with a small gap to stay well inside rate limits.
    let sent = 0;
    let skipped = 0;
    const failed = [];
    for (const v of vendors) {
      const mine = postsFor(v);
      if (!mine.length) { skipped++; continue; }
      const { subject, html, text } = buildFor(mine);
      try {
        const r = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ from: FROM, to: [v.email], subject, html, text }),
        });
        if (r.ok) sent++;
        else failed.push({ email: v.email, status: r.status, body: await r.text() });
      } catch (e) {
        failed.push({ email: v.email, error: String(e) });
      }
      await new Promise(r => setTimeout(r, 250));
    }

    return res.status(200).json({ sent, skipped, posts: posts.length, failed });
  } catch (err) {
    console.error("Digest error:", err);
    return res.status(500).json({ error: String(err) });
  }
}

// Mirrors tradeBucket() in App.jsx so a post written as "A/C & Heating"
// still reaches a contractor listed as "HVAC Contractor".
function bucket(trade) {
  const t = String(trade || "").toLowerCase();
  const alias = [["hvac","HVAC"],["air condition","HVAC"],["heating","HVAC"],["cooling","HVAC"],["roof","Roofing"],["plumb","Plumbing"],["electric","Electrical"],["pest","Pest Control"],["termite","Pest Control"],["irrigation","Irrigation"],["sprinkler","Irrigation"],["landscap","Landscaping"],["lawn","Landscaping"],["junk","Junk Removal"],["debris","Junk Removal"],["haul","Junk Removal"],["garage","Garage Doors"],["cabinet","Cabinets"],["fence","Fencing"],["tile","Tile & Masonry"],["masonry","Tile & Masonry"],["concrete","Tile & Masonry"],["general contractor","General Contractor"]];
  const a = alias.find(([k]) => t.includes(k));
  return a ? a[1] : (String(trade || "General")).split(/[,&\/]/)[0].trim();
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
