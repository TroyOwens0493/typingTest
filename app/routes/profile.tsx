import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { redirect, useLoaderData } from "react-router";
import { Profile } from "../views/profile";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import crypto from "node:crypto";
import { getAuthenticatedSession, getCookieValue } from "./authenticate";
import bcrypt from "bcryptjs";

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

    return redirectToLoginWithClearedCookie();
}

/** Clears the active session cookie and redirects to login. */
function redirectToLoginWithClearedCookie() {
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

    await convex.mutation(api.users.updateUsername, {
        id: session.userId,
        username,
    });

    return {
        ok: true,
        displayName: username,
    };
}

async function validateUsername(
    usernameEntry: FormDataEntryValue | null,
    session: NonNullable<Awaited<ReturnType<typeof getAuthenticatedSession>>>,
) {
    if (typeof usernameEntry !== "string") {
        return "";
    }

    const username = usernameEntry.trim();

    if (!username) {
        return "You cannot have an empty username";
    }

    const existingUser = await convex.query(api.users.getUserByUsername, {
        username,
    });

    const userInfo = await convex.query(api.users.getUser, {
        id: session.userId
    });

    if (existingUser && existingUser.username !== userInfo.username) {
        return "That username is already taken";
    }


    return "";
}

/** Updates the authenticated user's password after verifying the current password. */
async function updatePassword(
    formData: FormData,
    session: NonNullable<Awaited<ReturnType<typeof getAuthenticatedSession>>>,
) {
    const currentPasswordEntry = formData.get("currentPassword");
    const newPasswordEntry = formData.get("newPassword");
    const confirmPasswordEntry = formData.get("confirmPassword");

    if (
        typeof currentPasswordEntry !== "string" ||
        typeof newPasswordEntry !== "string" ||
        typeof confirmPasswordEntry !== "string"
    ) {
        return { error: "Invalid input" };
    }

    const currentPassword = currentPasswordEntry.trim();
    const newPassword = newPasswordEntry.trim();
    const confirmPassword = confirmPasswordEntry.trim();

    if (!currentPassword || !newPassword || !confirmPassword) {
        return { error: "All password fields are required" };
    }

    if (newPassword.length < 8) {
        return { error: "New password must be at least 8 characters" };
    }

    if (newPassword !== confirmPassword) {
        return { error: "New passwords do not match" };
    }

    if (currentPassword === newPassword) {
        return { error: "New password must be different from current password" };
    }

    const user = await convex.query(api.users.getUser, {
        id: session.userId,
    });

    const passwordCorrect = await bcrypt.compare(currentPassword, user.password);

    if (!passwordCorrect) {
        return { error: "Current password is incorrect" };
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await convex.mutation(api.users.updatePassword, {
        id: session.userId,
        password: passwordHash,
    });

    await convex.mutation(api.sessions.deleteSessionsByUser, {
        userId: session.userId,
    });

    return redirectToLoginWithClearedCookie();
}

/** Deletes the authenticated user's account after verifying their password. */
async function deleteAccount(
    formData: FormData,
    session: NonNullable<Awaited<ReturnType<typeof getAuthenticatedSession>>>,
) {
    const currentPasswordEntry = formData.get("currentPassword");

    if (typeof currentPasswordEntry !== "string") {
        return { error: "Invalid input" };
    }

    const currentPassword = currentPasswordEntry.trim();

    if (!currentPassword) {
        return { error: "Current password is required" };
    }

    const user = await convex.query(api.users.getUser, {
        id: session.userId,
    });

    const passwordCorrect = await bcrypt.compare(currentPassword, user.password);

    if (!passwordCorrect) {
        return { error: "Current password is incorrect" };
    }

    await convex.mutation(api.sessions.deleteSessionsByUser, {
        userId: session.userId,
    });

    await convex.mutation(api.users.deleteUser, {
        id: session.userId,
    });

    return redirectToLoginWithClearedCookie();
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
            return validateUsername(usernameEntry, session);
        }

        case "update-password": {
            return updatePassword(formData, session);
        }

        case "delete-account": {
            return deleteAccount(formData, session);
        }

        default:
            return null;
    }
}

export default function Page() {
    const { profile } = useLoaderData<typeof loader>();

    return <Profile profile={profile} />;
}
