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
                  text: "You are helping describe items found on the street/curb that people are giving away for free. Look at this image and write a brief, helpful description (2-3 sentences max) of what the item is. Focus on: what it is, its apparent condition, and any notable features. If there are multiple items of furniture, mention each one. Be factual and concise. Don't mention that it's on a curb or street.",
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
            maxOutputTokens: 150,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      return new Response(
        JSON.stringify({ 
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
    const description =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "Curbside find";

    return new Response(
      JSON.stringify({ description: description.trim() }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing image:", error);
    return new Response(
      JSON.stringify({ 
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