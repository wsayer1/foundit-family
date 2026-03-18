import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function extractJSON(raw: string): { tag: string; description: string } | null {
  const cleaned = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (parsed.tag && parsed.description) return parsed;
  } catch { /* try regex fallback */ }

  const tagMatch = cleaned.match(/"tag"\s*:\s*"([^"]+)"/);
  const descMatch = cleaned.match(/"description"\s*:\s*"([^"]+)"/);

  if (tagMatch && descMatch) {
    return { tag: tagMatch[1], description: descMatch[1] };
  }

  return null;
}

const PROMPT = `You are an AI assistant that analyzes images of items found on the street and generates structured data about them.

When you receive an image, examine it carefully and:
1. Identify the main item(s) in the image
2. Determine an appropriate tag/category (e.g., "sofa", "bookshelf", "chair", "table", "dresser", "mattress", "television", "refrigerator", "clothing", "toys", "books", "electronics", "kitchen", "tools", "outdoor", "sports", "appliances", "decor", etc.)
3. Write a brief, direct description of the item's condition, color, style, and any notable features

Output your response as valid JSON with this exact structure:
{"tag": "item_category", "description": "Direct description without introductory phrases"}

Requirements:
- Do NOT include phrases like "Here's a description" or "This is a"
- Start descriptions directly with descriptive content
- Keep descriptions concise but informative (2-3 sentences max)
- Use lowercase for tags, keep them simple (single words when possible)
- Return ONLY the JSON object, no additional text or markdown`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { imageData } = await req.json();

    if (!imageData) {
      return jsonResponse({ error: "No image data provided" }, 400);
    }

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

    if (!geminiApiKey) {
      console.error("GEMINI_API_KEY not configured");
      return jsonResponse(
        { tag: "item", description: "Curbside find", success: false, reason: "api_not_configured" },
        503
      );
    }

    const base64Data = imageData.includes(",")
      ? imageData.split(",")[1]
      : imageData;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: PROMPT },
              { inline_data: { mime_type: "image/jpeg", data: base64Data } },
            ],
          }],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 300,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", geminiResponse.status, errorText);
      return jsonResponse(
        { tag: "item", description: "Curbside find", success: false, reason: "api_error" },
        502
      );
    }

    const data = await geminiResponse.json();

    const blockReason = data.candidates?.[0]?.finishReason;
    if (blockReason === "SAFETY" || blockReason === "RECITATION") {
      console.warn("Gemini blocked response:", blockReason);
      return jsonResponse(
        { tag: "item", description: "Curbside find", success: false, reason: "content_blocked" },
        200
      );
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!rawText) {
      console.error("Empty Gemini response:", JSON.stringify(data));
      return jsonResponse(
        { tag: "item", description: "Curbside find", success: false, reason: "empty_response" },
        502
      );
    }

    const parsed = extractJSON(rawText);

    if (parsed) {
      return jsonResponse({
        tag: parsed.tag.toLowerCase(),
        description: parsed.description,
        success: true,
      });
    }

    const trimmed = rawText.trim();
    if (trimmed.length > 10) {
      return jsonResponse({
        tag: "item",
        description: trimmed.slice(0, 300),
        success: true,
      });
    }

    return jsonResponse(
      { tag: "item", description: "Curbside find", success: false, reason: "parse_failed" },
      502
    );
  } catch (error) {
    console.error("Error processing image:", error);
    return jsonResponse(
      { tag: "item", description: "Curbside find", success: false, reason: "exception" },
      500
    );
  }
});