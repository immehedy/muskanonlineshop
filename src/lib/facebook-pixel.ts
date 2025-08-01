// src/lib/facebook-pixel.ts
export const FACEBOOK_PIXEL_ID = process.env.FACEBOOK_PIXEL_ID;

// Standard pixel event
export const pageview = () => {
  if (typeof window.fbq !== "undefined") {
    window.fbq("track", "PageView");
  }
};

// Custom pixel event
export const event = (name: string, options: Record<string, any> = {}) => {
  if (typeof window.fbq !== "undefined") {
    window.fbq("trackCustom", name, options);
  }
};
