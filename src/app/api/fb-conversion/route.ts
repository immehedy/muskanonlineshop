import { NextRequest } from "next/server";

const FACEBOOK_PIXEL_ID = process.env.FACEBOOK_PIXEL_ID!;
const FB_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN!;

export async function POST(req: NextRequest) {
  const body = await req.json();

  const payload = {
    event_name: body.event_name,
    event_time: Math.floor(Date.now() / 1000),
    action_source: "website",
    event_source_url: body.url,
    user_data: {
      client_user_agent: req.headers.get("user-agent") || "",
    },
  };

  const response = await fetch(
    `https://graph.facebook.com/v19.0/${FACEBOOK_PIXEL_ID}/events?access_token=${FB_ACCESS_TOKEN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [payload] }),
    }
  );

  const result = await response.json();
  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
}
