// api/match.js — Vercel serverless function
// Keeps your Anthropic API key private on the server.
// Browser calls POST /api/match → this function calls Claude → returns ranked matches.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { description, budget, timeline, contractors } = req.body || {};
  if (!description || !Array.isArray(contractors) || contractors.length === 0) {
    return res.status(400).json({ error: "Missing description or contractors" });
  }

  const roster = contractors
    .map(c => `id:${c.id} | ${c.name} — ${c.company} | trade: ${c.trade} | specialties: ${c.specialties.join(", ")} | location: ${c.location} | rating: ${c.rating} | jobs: ${c.jobs} | licensed: ${c.verified ? "yes" : "no"}`)
    .join("\n");

  const prompt = `You are the matching engine for BuildBridge, a contractor network in Citrus County, Florida.

A homeowner describes their project. Match them with the right contractors from this roster:

${roster}

Homeowner's project description: "${description}"
Budget: ${budget || "not specified"}
Timeline: ${timeline || "not specified"}

Rules:
- Identify the trade(s) the project actually needs, even if the homeowner uses vague or plain language.
- If the project spans multiple trades or needs coordination, include the Project Management contractor and say why.
- Rank best fit first. Only include genuinely relevant contractors (1 to 4 of them).
- Keep each reason to one short sentence a homeowner would understand.

Respond with ONLY valid JSON, no markdown, no backticks, in exactly this shape:
{"summary": "one sentence describing what this project needs", "matches": [{"id": 3, "reason": "one short sentence why this contractor fits"}]}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", response.status, errText);
      return res.status(502).json({ error: "AI service unavailable" });
    }

    const data = await response.json();
    const text = (data.content || [])
      .map(b => (b.type === "text" ? b.text : ""))
      .join("")
      .replace(/```json|```/g, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      console.error("Could not parse AI response:", text);
      return res.status(502).json({ error: "AI returned invalid response" });
    }

    if (!Array.isArray(parsed.matches)) {
      return res.status(502).json({ error: "AI returned invalid response" });
    }

    return res.status(200).json({
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
      matches: parsed.matches
        .filter(m => m && typeof m.id === "number")
        .map(m => ({ id: m.id, reason: String(m.reason || "") })),
    });
  } catch (err) {
    console.error("Match function error:", err);
    return res.status(500).json({ error: "Matching failed" });
  }
}
