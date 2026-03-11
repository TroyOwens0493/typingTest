import { SignUp } from "../views/signUp";
import { redirect, type ActionFunctionArgs } from "react-router";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import bcrypt from "bcryptjs";
import { makeSessionCookie } from "./sessionCookieMaker";

const convex = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL as string);

export async function action({ request }: ActionFunctionArgs) {
    const data = await request.formData();

    const rawUsername = data.get("username");
    const rawEmail = data.get("email");
    const rawPassword = data.get("password");

    if (
        typeof rawUsername !== "string" ||
        typeof rawEmail !== "string" ||
        typeof rawPassword !== "string"
    ) {
        return { error: "Invalid input" };
    }

    const username = rawUsername.trim();
    const email = rawEmail.trim();
    const password = rawPassword.trim();
    if (!username || !email || !password) {
        return { error: "Invalid input" };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    try {
        // Create a new user
        const userId = await convex.mutation(api.users.createUser, {
            username,
            email,
            password: passwordHash,
        });

        const userInfo = await convex.query(api.users.getUser, {
            id: userId,
        });

        const cookie = await makeSessionCookie({ request, userInfo });

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
