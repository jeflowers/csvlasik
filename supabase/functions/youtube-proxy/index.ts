import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { videoId, videoIds } = await req.json();

    const ids = videoIds || (videoId ? [videoId] : null);

    if (!ids || ids.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing required field: videoId or videoIds" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (ids.length > 50) {
      return new Response(
        JSON.stringify({ error: "Maximum 50 video IDs per request" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("YOUTUBE_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "YouTube API key not configured" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = `${YOUTUBE_BASE_URL}/videos?id=${ids.join(",")}&key=${apiKey}&part=snippet`;
    const response = await fetch(url);

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error(`YouTube API error ${response.status}: ${body}`);
      return new Response(
        JSON.stringify({ error: "YouTube API request failed", status: response.status }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    const videos = (data.items || []).map((item: Record<string, unknown>) => {
      const snippet = item.snippet as Record<string, unknown>;
      return {
        id: item.id,
        title: snippet.title,
        description: snippet.description,
        thumbnails: snippet.thumbnails,
        channelTitle: snippet.channelTitle,
        publishedAt: snippet.publishedAt,
      };
    });

    return new Response(
      JSON.stringify({ videos }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("YouTube proxy edge function error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
