import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { redirect, useLoaderData } from "react-router";
import { Profile } from "../views/profile";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import crypto from "node:crypto";
import { getAuthenticatedSession, getCookieValue } from "./authenticate";

const convex = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL as string);

export async function loader({ request }: LoaderFunctionArgs) {
    const session = await getAuthenticatedSession(request);

    if (!session) {
        return redirect("/login");
    }

    const user = await convex.query((api as any).users.getUser, {
        id: session.userId,
    });

    return {
        profile: {
            displayName: user.username,
            email: user.email,
            rank: user.rank,
            level: user.level,
            memberSince: user._creationTime,
        },
    };
}

async function logout(
    request: Request
) {
    const token = getCookieValue(request.headers.get("cookie"), "session");

    if (token) {
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

        await convex.mutation((api as any).sessions.deleteSessionByTokenHash, {
            tokenHash,
        });
    }

    const isProduction = process.env.NODE_ENV === "production";
    const clearCookie = [
        "session=",
        "Path=/",
        "HttpOnly",
        "SameSite=Lax",
        "Max-Age=0",
        "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
        isProduction ? "Secure" : "",
    ]
        .filter(Boolean)
        .join("; ");
    return redirect("/login", {
        headers: {
            "Set-Cookie": clearCookie,
        },
    });
}

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const intent = formData.get("intent");

    switch (intent) {
        case "logout":
            return logout(request);
        default:
            return null;
    }
}

export default function Page() {
    const { profile } = useLoaderData<typeof loader>();

    return <Profile profile={profile} />;
}
