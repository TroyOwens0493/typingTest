import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import crypto from "node:crypto";
import type { Doc } from "../convex/_generated/dataModel";

const convex = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL as string);

export async function makeSessionCookie({
    request,
    userInfo,
}: {
    request: Request;
    userInfo: Doc<"user">;
}): Promise<string> {
    try {
        // Create a session token
        const rawToken = crypto.randomBytes(32).toString("hex");
        const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
        const createdAt = Date.now();
        const expiresAt = createdAt + 1000 * 60 * 60 * 24 * 30;

        // Add session token to db
        await convex.mutation((api as any).sessions.createSession, {
            userId: userInfo._id,
            tokenHash,
            createdAt,
            expiresAt,
            userAgent: request.headers.get("user-agent") ?? undefined,
            ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
        });

        // Create cookie with token
        const isProduction = process.env.NODE_ENV === "production";
        const cookie = [
            `session=${rawToken}`,
            "Path=/",
            "HttpOnly",
            "SameSite=Lax",
            `Max-Age=${60 * 60 * 24 * 30}`,
            isProduction ? "Secure" : "",
        ]
            .filter(Boolean)
            .join("; ");

        return cookie;
    } catch (err) {
        throw err instanceof Error
            ? err
            : new Error("Unknown error");
    }
}
