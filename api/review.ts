import type { VercelRequest, VercelResponse } from "@vercel/node";
import Groq from "groq-sdk";

const SYSTEM_PROMPT = `You are an expert code reviewer with deep knowledge across multiple programming languages and best practices. Your reviews are thorough, constructive, and educational.

When reviewing code, analyze the following aspects (as applicable):
1. **Code Quality**: Readability, naming conventions, code structure
2. **Bugs & Logic Errors**: Potential bugs, edge cases, logic flaws
3. **Performance**: Inefficiencies, bottlenecks, optimization opportunities
4. **Security**: Vulnerabilities, injection risks, unsafe practices
5. **Best Practices**: Language idioms, design patterns, SOLID principles
6. **Error Handling**: Missing error handling, exception safety
7. **Testing Considerations**: Testability, missing test scenarios

Format your response using Markdown with clear sections. Be specific — reference line numbers or code snippets when pointing out issues. Provide concrete suggestions and improved code examples where helpful. Be encouraging and educational, not just critical.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { code, language, focusAreas } = req.body ?? {};

  if (!code || typeof code !== "string" || code.trim().length === 0) {
    return res.status(400).json({ error: "code is required and must be a non-empty string" });
  }
  if (!language || typeof language !== "string") {
    return res.status(400).json({ error: "language is required" });
  }
  if (code.length > 50000) {
    return res.status(400).json({ error: "Code exceeds maximum length of 50,000 characters" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GROQ_API_KEY is not configured" });

  try {
    const client = new Groq({ apiKey });

    const focusSection =
      Array.isArray(focusAreas) && focusAreas.length > 0
        ? `\n\nPay special attention to: ${focusAreas.join(", ")}.`
        : "";

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Please review the following ${language} code:${focusSection}\n\n\`\`\`${language}\n${code}\n\`\`\``,
        },
      ],
      max_tokens: 4096,
    });

    const review = completion.choices[0]?.message?.content;
    if (!review) throw new Error("No response from Groq");

    return res.json({ review, model: completion.model });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: `Failed to review code: ${message}` });
  }
}