import { redirect, type ActionFunctionArgs } from "react-router";
import { Login } from "../views/login";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import bcrypt from "bcryptjs";
import { makeSessionCookie } from "./sessionCookieMaker";

const convex = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL as string);

export async function action({ request }: ActionFunctionArgs) {
    const data = await request.formData();
    const emailEntry = data.get("email");
    const passwordEntry = data.get("password");
    if (typeof emailEntry !== "string" || typeof passwordEntry !== "string") {
        return { error: "Invalid input" };
    }
    const email = emailEntry.trim();
    const password = passwordEntry.trim();
    if (!email || !password) {
        return { error: "Invalid input" };
    }

    let userInfo;
    try {
        userInfo = await convex.query((api as any).users.getUserByEmail, {
            email,
        });
    } catch (error) {
        return new Response(
            JSON.stringify({ error: "Invalid email or password" }),
            {
                status: 400,
                headers: { "Content-Type": "application/json" },
            },
        );
    }

    if (!userInfo || !userInfo.password) {
        return new Response(
            JSON.stringify({ error: "Invalid email or password" }),
            {
                status: 400,
                headers: { "Content-Type": "application/json" },
            },
        );
    }

    const passwordCorrect = await bcrypt.compare(password, userInfo.password);
    if (!passwordCorrect) {
        return new Response(
            JSON.stringify({ error: "Invalid email or password" }),
            {
                status: 400,
                headers: { "Content-Type": "application/json" },
            },
        );
    }

    const cookie = await makeSessionCookie({ request, userInfo });

    return redirect("/home", {
        headers: {
            "Set-Cookie": cookie,
        },
    });
}

export default function Page() {
    return <Login />;
}
