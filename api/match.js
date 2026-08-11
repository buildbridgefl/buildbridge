// api/match.js — Vercel serverless function
// Keeps your Anthropic API key private on the server.
// Browser calls POST /api/match → this function calls Claude → returns either
// a follow-up question OR ranked matches.
//
// Accepts EITHER:
//   { description, budget, timeline, contractors }            ← old one-shot shape (still works)
//   { history: [{role, content}, ...], budget, timeline, contractors }  ← new conversation shape
//
// Returns EITHER:
//   { question: "..." }                                        ← Pablo needs more info
//   { summary: "...", matches: [{id, reason}] }                ← Pablo is ready

const MAX_QUESTIONS = 2;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { description, budget, timeline, town, contractors, history } = req.body || {};

  // Build a normalized turn list. Old callers send only `description`.
  const turns = Array.isArray(history) && history.length > 0
    ? history.slice(-8).filter(m => m && typeof m.content === "string" && m.content.trim())
    : (description ? [{ role: "user", content: description }] : []);

  if (turns.length === 0 || !Array.isArray(contractors) || contractors.length === 0) {
    return res.status(400).json({ error: "Missing description or contractors" });
  }

  // How many questions has Pablo already asked in this conversation?
  const askedCount = turns.filter(m => m.role === "assistant").length;
  const mustAnswerNow = askedCount >= MAX_QUESTIONS;

  const roster = contractors
    .map(c => `id:${c.id} | ${c.name} — ${c.company} | trade: ${c.trade} | specialties: ${(c.specialties || []).join(", ")} | location: ${c.location} | rating: ${c.rating} | jobs: ${c.jobs} | licensed: ${c.verified ? "yes" : "no"}`)
    .join("\n");

  const transcript = turns
    .map(m => (m.role === "assistant" ? `Pablo asked: "${m.content}"` : `Homeowner: "${m.content}"`))
    .join("\n");

  const questionRules = mustAnswerNow
    ? `You have already asked enough questions. Do NOT ask another one. Return matches now using whatever you know.`
    : `Before matching, decide whether ONE short follow-up question would meaningfully change which contractors you'd recommend.

Ask a question ONLY if the answer would change the trade, the urgency, or the scope. Good examples:
- "Is water actively coming into the house right now, or is it just a stain on the ceiling?"
- "Is the unit blowing warm air, or not turning on at all?"
- "Which town are you in?" (only if no town was mentioned anywhere)

Do NOT ask a question when:
- The description already names the trade, the problem, and the town clearly.
- The question is just polite conversation, or about budget or scheduling preference.
- You'd only be confirming something the homeowner already said.

Most clear descriptions need no question at all. When in doubt, skip it and match.
Ask about one thing only, in one plain sentence, the way a contractor would ask it. No preamble, no greeting.`;

  const prompt = `You are Pablo, the matching assistant for BuildBridge, a free verified contractor network in Citrus and Hernando County, Florida.

Roster of available contractors:

${roster}

Conversation so far:
${transcript}

Budget: ${budget || "not specified"}
Timeline: ${timeline || "not specified"} Homeowner's town: ${town || "not specified"}

${questionRules}

When you return matches:
- Identify the trade(s) the project actually needs, even if the homeowner uses vague or plain language.
- If the project spans multiple trades or needs coordination, include the Project Management contractor and say why.
- Rank best fit first. Only include genuinely relevant contractors (1 to 4 of them).
- Keep each reason to one short sentence a homeowner would understand.
- If nobody on the roster genuinely fits, return an empty matches array and say so plainly in the summary.  Also write "outreach": a short message the HOMEOWNER can send to the contractor. Rules for it: - Write it in first person as the homeowner ("My water heater stopped..."). - Plain, calm, specific. Four to six sentences, no more. - Include: what's wrong, the town, the timeline, and anything the homeowner told you in the conversation that a contractor would need before quoting. - No greeting with a name, no sign-off, no invented details, no phone number or address. - Do not mention BuildBridge, Pablo, or that AI wrote it.

Respond with ONLY valid JSON, no markdown, no backticks, in exactly ONE of these two shapes:

To ask a follow-up question:
{"question": "your one short question here"}

To return matches:
{"summary": "one sentence describing what this project needs", "outreach": "the homeowner's message to send", "matches": [{"id": 3, "reason": "one short sentence why this contractor fits"}]}`;

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
        max_tokens: 900,
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

    // Follow-up question path — only honored if we haven't hit the cap.
    if (!mustAnswerNow && typeof parsed.question === "string" && parsed.question.trim()) {
      return res.status(200).json({ question: parsed.question.trim() });
    }

    if (!Array.isArray(parsed.matches)) {
      return res.status(502).json({ error: "AI returned invalid response" });
    }

    return res.status(200).json({
      summary: typeof parsed.summary === "string" ? parsed.summary : "",       outreach: typeof parsed.outreach === "string" ? parsed.outreach : "",
      matches: parsed.matches
        .filter(m => m && typeof m.id === "number")
        .map(m => ({ id: m.id, reason: String(m.reason || "") })),
    });
  } catch (err) {
    console.error("Match function error:", err);
    return res.status(500).json({ error: "Matching failed" });
  }
}
