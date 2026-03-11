import { redirect } from "react-router";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import crypto from "node:crypto";

const convex = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL as string);

export function getCookieValue(cookieHeader: string | null, name: string) {
    if (!cookieHeader) {
        return null;
    }

    const cookies = cookieHeader.split(";");
    for (const cookie of cookies) {
        const [key, ...rest] = cookie.trim().split("=");
        if (key === name) {
            return rest.join("=");
        }
    }

    return null;
}

export async function getAuthenticatedSession(request: Request) {
    const token = getCookieValue(request.headers.get("cookie"), "session");

    if (!token) {
        return null;
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const session = await convex.query(api.sessions.getSessionByTokenHash, {
        tokenHash,
    });

    if (!session || session.expiresAt <= Date.now()) {
        return null;
    }

    return session;
}

export async function authenticate(request: Request): Promise<Response | void> {
    const session = await getAuthenticatedSession(request);

    if (!session) {
        return redirect("/login");
    }

    return undefined;
}
