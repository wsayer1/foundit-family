import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { imageData } = await req.json();

    if (!imageData) {
      return new Response(
        JSON.stringify({ error: "No image data provided", debug: "missing_image" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({
          tag: "item",
          description: "Curbside find",
          debug: "no_api_key",
          message: "GEMINI_API_KEY not configured"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const base64Data = imageData.includes(",")
      ? imageData.split(",")[1]
      : imageData;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are an AI assistant that analyzes images of items found on the street and generates structured data about them. Your task is to identify household items that people commonly leave outside and provide specific information in JSON format.

When you receive an image, examine it carefully and:

1. Identify the main item(s) in the image
2. Determine an appropriate tag/category for the item (e.g., "sofa", "bookshelf", "chair", "table", "dresser", "mattress", "television", "refrigerator", etc.)
3. Write a brief, direct description of the item's condition, color, style, and any notable features

Output your response as valid JSON with the following structure:
{
  "tag": "item_category",
  "description": "Direct description without introductory phrases"
}

Requirements:
- Do NOT include phrases like "Here's a description" or "This is a" in your description
- Start descriptions directly with descriptive content
- Focus on items that are typically household furniture, appliances, or common personal belongings
- Keep descriptions concise but informative (2-3 sentences maximum)
- Use lowercase for tags and keep them simple (single words when possible)
- Return ONLY the JSON object, no additional text or markdown`,
                },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 200,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      return new Response(
        JSON.stringify({
          tag: "item",
          description: "Curbside find",
          debug: "api_error",
          error: errorText
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let tag = "item";
    let description = "Curbside find";

    try {
      const cleanedText = rawText.replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(cleanedText);
      tag = parsed.tag || "item";
      description = parsed.description || "Curbside find";
    } catch {
      description = rawText.trim() || "Curbside find";
    }

    return new Response(
      JSON.stringify({ tag, description }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing image:", error);
    return new Response(
      JSON.stringify({
        tag: "item",
        description: "Curbside find",
        debug: "exception",
        error: error instanceof Error ? error.message : String(error)
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});