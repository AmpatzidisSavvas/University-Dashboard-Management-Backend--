import arcjet, { shield, detectBot, slidingWindow } from "@arcjet/node";

if (!process.env.ARCJET_KEY && process.env.NODE_ENV !== "test") {
  throw new Error(
    "ARCJET_KEY environment variable is required."
  );
}

// Configure Arcjet with security rules.
const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({ mode: "LIVE" }),
    // Create a bot detection rule
    detectBot({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
      // Block all bots except the following
      allow: [
        "CATEGORY:SEARCH_ENGINE", 
        "CATEGORY:PREVIEW", 
      ],
    }),
    // Create a token bucket rate limit.
    slidingWindow({
      mode: "LIVE",
      interval: "2s", // Refill every 2 seconds
      max: 5, // Allow 5 requests per interval
    }),
  ],
});

export default aj;