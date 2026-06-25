import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

// DeepL language code mapping
const DEEPL_LANG_MAP: Record<string, string> = {
  ja: "JA",
  "es-MX": "ES",
  "pt-BR": "PT-BR",
  ko: "KO",
  zh: "ZH-HANS",
  ar: "AR",
  he: "HE",
};

// Google Translate language code mapping
const GOOGLE_LANG_MAP: Record<string, string> = {
  ja: "ja",
  "es-MX": "es",
  "pt-BR": "pt",
  ko: "ko",
  vi: "vi",
  zh: "zh-CN",
  ar: "ar",
  hy: "hy",
  he: "iw",
  tl: "tl",
};

// Medical terms that should not be translated
const PROTECTED_TERMS = [
  "LASIK",
  "PRK",
  "ICL",
  "FDA",
  "Dr. Charles Flowers",
  "Atelier",
  "Visian ICL",
  "Femtosecond",
  "Excimer",
  "Keratomileusis",
  "Keratectomy",
  "Topography",
  "Wavefront",
  "Aberrometry",
];

function protectTerms(translated: string): string {
  let result = translated;
  for (const term of PROTECTED_TERMS) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "gi");
    result = result.replace(regex, term);
  }
  return result;
}

async function translateWithDeepL(
  text: string,
  targetLang: string,
  sourceLang: string,
  apiKey: string,
  apiUrl: string
): Promise<string> {
  const deeplTarget = DEEPL_LANG_MAP[targetLang];
  if (!deeplTarget) throw new Error(`DeepL: unsupported language ${targetLang}`);

  const response = await fetch(`${apiUrl}/translate`, {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${apiKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      text,
      source_lang: sourceLang.toUpperCase(),
      target_lang: deeplTarget,
      preserve_formatting: "1",
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`DeepL ${response.status}: ${body}`);
  }

  const data = await response.json();
  return data.translations[0].text;
}

async function translateWithGoogle(
  text: string,
  targetLang: string,
  sourceLang: string,
  apiKey: string
): Promise<string> {
  const googleTarget = GOOGLE_LANG_MAP[targetLang];
  if (!googleTarget) throw new Error(`Google: unsupported language ${targetLang}`);

  const response = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: googleTarget,
        format: "text",
      }),
    }
  );

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Google Translate ${response.status}: ${body}`);
  }

  const data = await response.json();
  return data.data.translations[0].translatedText;
}

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
    const { text, targetLang, sourceLang = "en" } = await req.json();

    if (!text || !targetLang) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: text, targetLang" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (targetLang === sourceLang || targetLang === "en") {
      return new Response(
        JSON.stringify({ translation: text, service: "none" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const deeplKey = Deno.env.get("DEEPL_API_KEY");
    const deeplUrl = Deno.env.get("DEEPL_API_URL") || "https://api-free.deepl.com/v2";
    const googleKey = Deno.env.get("GOOGLE_TRANSLATE_API_KEY");

    const deeplSupported = targetLang in DEEPL_LANG_MAP;
    const googleSupported = targetLang in GOOGLE_LANG_MAP;

    // Try DeepL first (higher quality)
    if (deeplKey && deeplSupported) {
      try {
        const translation = await translateWithDeepL(text, targetLang, sourceLang, deeplKey, deeplUrl);
        return new Response(
          JSON.stringify({ translation: protectTerms(translation), service: "deepl" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (err) {
        console.warn("DeepL failed, trying Google:", err);
      }
    }

    // Fall back to Google Translate
    if (googleKey && googleSupported) {
      try {
        const translation = await translateWithGoogle(text, targetLang, sourceLang, googleKey);
        return new Response(
          JSON.stringify({ translation: protectTerms(translation), service: "google" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (err) {
        console.warn("Google Translate failed:", err);
      }
    }

    // No service available or all failed
    return new Response(
      JSON.stringify({ translation: text, service: "none", reason: "no_service_available" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Translation edge function error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
