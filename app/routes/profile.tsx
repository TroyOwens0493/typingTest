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

    const user = await convex.query(api.users.getUser, {
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

        await convex.mutation(api.sessions.deleteSessionByTokenHash, {
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

async function changeName(
    usernameEntry: FormDataEntryValue | null,
    session: NonNullable<Awaited<ReturnType<typeof getAuthenticatedSession>>>,
) {
    if (typeof usernameEntry !== "string") {
        return { error: "Invalid username" };
    }

    const username = usernameEntry.trim();

    if (!username) {
        return { error: "Invalid username" };
    }

    await convex.mutation((api as any).users.updateUsername, {
        id: session.userId,
        username,
    });

    return {
        ok: true,
        displayName: username,
    };
}

async function validateUsername(usernameEntry: FormDataEntryValue | null) {
    if (typeof usernameEntry !== "string") {
        return "";
    }

    const username = usernameEntry.trim();

    if (!username) {
        return "You cannot have an empty username";
    }

    const existingUser = await convex.query((api as any).users.getUserByUsername, {
        username,
    });

    if (existingUser) {
        return "That username is already taken";
    }

    return "";
}

export async function action({ request }: ActionFunctionArgs) {
    const session = await getAuthenticatedSession(request);

    if (!session) {
        return redirect("/login");
    }

    const formData = await request.formData();
    const intent = formData.get("intent");

    switch (intent) {
        case "logout":
            return logout(request);

        case "change-username": {
            const usernameEntry = formData.get("username");
            return changeName(usernameEntry, session);
        }

        case "validate-username": {
            const usernameEntry = formData.get("username");
            return validateUsername(usernameEntry);
        }

        default:
            return null;
    }
}

export default function Page() {
    const { profile } = useLoaderData<typeof loader>();

    return <Profile profile={profile} />;
}
