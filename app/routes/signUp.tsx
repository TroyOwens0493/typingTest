import { SignUp } from "../views/signUp";
import type { ActionFunctionArgs } from "react-router";
import { ConvexHttpClient } from "convex/browser"
import { api } from "../../convex/_generated/api"
import bcrypt from "bcryptjs"

const convex = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL as string);

export async function action({ request }: ActionFunctionArgs) {
    const data = await request.formData()

    const username = String(data.get("username"))
    const email = String(data.get("email"))
    const password = String(data.get("password"))

    if (!username || !email || !password) {
        return { error: "Invalid input" }
    }

    const passwordHash = await bcrypt.hash(password, 10)

    try {
        await convex.mutation((api as any).users.createUser, {
            username,
            email,
            password: passwordHash,
        })
    } catch (err) {
        return { error: err instanceof Error ? err.message : "Unknown error" }
    }

    return { success: true }
}

export default function Page() {
    return <SignUp />;
}
