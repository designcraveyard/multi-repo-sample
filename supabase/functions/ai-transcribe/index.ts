import { getAuthenticatedUser, AuthError, errorResponse, jsonResponse } from "../_shared/auth.ts";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB (Whisper limit)

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

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return errorResponse("Request must be multipart/form-data", "INVALID_REQUEST", 400);
  }

  const audioFile = formData.get("audio");
  if (!audioFile || !(audioFile instanceof File)) {
    return errorResponse("Missing 'audio' file in form data", "INVALID_AUDIO", 400);
  }

  if (audioFile.size > MAX_FILE_SIZE) {
    return errorResponse(`Audio file exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`, "INVALID_AUDIO", 400);
  }

  const language = formData.get("language") as string | null;

  // Forward to OpenAI Whisper
  const whisperForm = new FormData();
  whisperForm.append("file", audioFile, audioFile.name || "audio.webm");
  whisperForm.append("model", "whisper-1");
  if (language) {
    whisperForm.append("language", language);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}` },
      body: whisperForm,
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Whisper API error:", err);
      return errorResponse("Transcription failed", "WHISPER_ERROR", 502);
    }

    const result = await response.json();
    return jsonResponse({ text: result.text, language: language || "auto" });
  } catch (e) {
    console.error("Whisper request failed:", e);
    return errorResponse("Failed to reach transcription service", "WHISPER_ERROR", 502);
  }
});
