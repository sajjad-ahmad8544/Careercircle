// Calls Claude when ANTHROPIC_API_KEY is set; otherwise returns the fallback.
module.exports.ai = async (prompt, fallback) => {
  if (!process.env.ANTHROPIC_API_KEY) return fallback;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
        max_tokens: 700,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    return (await res.json()).content[0].text;
  } catch {
    return fallback;
  }
};