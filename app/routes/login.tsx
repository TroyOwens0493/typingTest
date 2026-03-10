import { redirect, type ActionFunctionArgs } from "react-router";
import { Login } from "../views/login";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { makeSessionCookie } from "./sessionCookieMaker";

const convex = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL as string);

export async function action({ request }: ActionFunctionArgs) {
    const data = await request.formData();
    const email = String(data.get("email"));
    const password = String(data.get("password"));
    if (!email || !password) {
        return { error: "Invalid input" };
    }

    const userInfo = await convex.query((api as any).users.getUserByEmail, {
        email,
    });
    const passwordCorrect = await bcrypt.compare(password, userInfo.password);
    if (passwordCorrect) {
        const cookie = await makeSessionCookie({ request, userInfo });

        return redirect("/home", {
            headers: {
                "Set-Cookie": cookie,
            },
        });
    }
}

export default function Page() {
    return <Login />;
}
