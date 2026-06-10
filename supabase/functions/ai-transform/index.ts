import { getAuthenticatedUser, AuthError, errorResponse, jsonResponse } from "../_shared/auth.ts";

const MAX_TEXT_LENGTH = 100_000;

const SYSTEM_PROMPTS: Record<string, string> = {
  summarize: "Summarize the following markdown text concisely. Preserve markdown formatting.",
  keypoints: "Extract the key points from the following markdown text as a markdown bullet list.",
  rewrite: "Rewrite the following markdown text to improve clarity and flow. Preserve the meaning and markdown formatting.",
};

const VALID_ACTIONS = ["summarize", "keypoints", "rewrite", "custom"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, content-type, x-client-info, apikey",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", "METHOD_NOT_ALLOWED", 405);
  }

  try {
    await getAuthenticatedUser(req);
  } catch (e) {
    if (e instanceof AuthError) {
      return errorResponse(e.message, e.code, 401);
    }
    return errorResponse("Authentication failed", "UNAUTHORIZED", 401);
  }

  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiKey) {
    return errorResponse("OpenAI API key not configured", "SERVER_ERROR", 500);
  }

  let body: { text?: string; action?: string; customPrompt?: string };
  try {
    body = await req.json();
  } catch {
    return errorResponse("Request must be JSON", "INVALID_REQUEST", 400);
  }

  const { text, action, customPrompt } = body;

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return errorResponse("'text' field is required and must be non-empty", "EMPTY_TEXT", 400);
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return errorResponse(`Text exceeds ${MAX_TEXT_LENGTH} character limit`, "EMPTY_TEXT", 400);
  }

  if (!action || !VALID_ACTIONS.includes(action)) {
    return errorResponse(`'action' must be one of: ${VALID_ACTIONS.join(", ")}`, "INVALID_ACTION", 400);
  }

  let systemPrompt: string;
  if (action === "custom") {
    if (!customPrompt || typeof customPrompt !== "string" || customPrompt.trim().length === 0) {
      return errorResponse("'customPrompt' is required when action is 'custom'", "INVALID_ACTION", 400);
    }
    systemPrompt = customPrompt;
  } else {
    systemPrompt = SYSTEM_PROMPTS[action];
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        instructions: systemPrompt,
        input: text,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenAI Responses API error:", err);
      return errorResponse("AI transformation failed", "OPENAI_ERROR", 502);
    }

    const data = await response.json();
    const result = data.output_text ?? data.choices?.[0]?.message?.content ?? "";

    return jsonResponse({ result });
  } catch (e) {
    console.error("OpenAI request failed:", e);
    return errorResponse("Failed to reach AI service", "OPENAI_ERROR", 502);
  }
});
