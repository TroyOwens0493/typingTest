import { SignUp } from "../views/signUp";
import { redirect, type ActionFunctionArgs } from "react-router";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

const convex = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL as string);

export async function action({ request }: ActionFunctionArgs) {
    const data = await request.formData();

    const username = String(data.get("username"));
    const email = String(data.get("email"));
    const password = String(data.get("password"));

    if (!username || !email || !password) {
        return { error: "Invalid input" };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    try {
        // Create a new user
        const userId = await convex.mutation((api as any).users.createUser, {
            username,
            email,
            password: passwordHash,
        });

        // Create a session token
        const rawToken = crypto.randomBytes(32).toString("hex");
        const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
        const createdAt = Date.now();
        const expiresAt = createdAt + 1000 * 60 * 60 * 24 * 30;

        // Add session token to db
        await convex.mutation((api as any).sessions.createSession, {
            userId,
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

        return redirect("/home", {
            headers: {
                "Set-Cookie": cookie,
            },
        });
    } catch (err) {
        return { error: err instanceof Error ? err.message : "Unknown error" };
    }

}

export default function Page() {
    return <SignUp />;
}
