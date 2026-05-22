'use server';

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";
import { z } from "zod";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | null = null;
let ratelimit: Ratelimit | null = null;

if (redisUrl && redisToken) {
  redis = new Redis({
    url: redisUrl,
    token: redisToken,
  });
  
  ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(5, "10 s"), // 5 requests per 10 seconds
  });
}

// Implement strict input validation and zero tolerance for truncated data inputs.
const RequestSchema = z.object({
  queryId: z.string().min(1, "Query ID must not be empty"),
  timestamp: z.number().int().positive("Timestamp must be a valid positive integer"),
}).strict();

// Metrik operasional KDKMP Pamekasan
const KDKMP_METRICS = {
  region: "KDKMP Pamekasan",
  latency_ms: 12,
  throughput_mbps: 450,
  status: "active" as const
};

export async function getKdkmpMetrics(input: { queryId: string, timestamp: number }) {
  // Idempotensi sekarang ditangani sepenuhnya di middleware.ts (Edge)
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  
  let ip = "127.0.0.1";
  
  if (forwardedFor) {
    const parts = forwardedFor.split(',');
    const firstPart = parts[0];
    if (firstPart) {
      ip = firstPart.trim();
    }
  }
  
  const validationResult = RequestSchema.safeParse(input);
  if (!validationResult.success) {
    return {
      success: false as const,
      error: "Invalid input: " + validationResult.error.issues.map(e => e.message).join(', '),
      status: 400
    };
  }

  if (ratelimit) {
    try {
      const { success, limit, remaining, reset } = await ratelimit.limit(`ratelimit_${ip}`);
      if (!success) {
        return {
          success: false as const,
          error: "Rate limit exceeded. Please try again later.",
          status: 429,
          rateLimitInfo: { limit, remaining, reset }
        };
      }
    } catch (e: any) {
      if (e?.message?.includes("WRONGPASS")) {
        console.warn("Upstash Redis rate limiting bypassed: Invalid credentials (WRONGPASS).");
      } else {
        console.warn("Rate limiting failed. Bypassing...", e?.message);
      }
    }
  } else {
    console.warn("Upstash credentials missing. Rate limiting is currently bypassed.");
  }
  
  return {
    success: true as const,
    data: KDKMP_METRICS,
    ip: ip,
    timestamp: Date.now()
  };
}
