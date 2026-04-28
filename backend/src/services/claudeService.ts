import Groq from "groq-sdk";

function getClient() {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not set");
  return new Groq({ apiKey: key });
}

export interface ReviewRequest {
  code: string;
  language: string;
  focusAreas?: string[];
}

export interface ReviewResponse {
  review: string;
  model: string;
}

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

export async function reviewCode(
  request: ReviewRequest
): Promise<ReviewResponse> {
  const client = getClient();

  const focusSection =
    request.focusAreas && request.focusAreas.length > 0
      ? `\n\nPay special attention to: ${request.focusAreas.join(", ")}.`
      : "";

  const userMessage = `Please review the following ${request.language} code:${focusSection}

\`\`\`${request.language}
${request.code}
\`\`\``;

  const completion = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    max_tokens: 4096,
  });

  const review = completion.choices[0]?.message?.content;
  if (!review) throw new Error("No response from Groq");

  return {
    review,
    model: completion.model,
  };
}