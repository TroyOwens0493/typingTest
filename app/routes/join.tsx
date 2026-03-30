import { Join } from "../views/join";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { redirect, useActionData, useNavigation } from "react-router";
import { authenticate, getAuthenticatedSession } from "./authenticate";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const convex = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL as string);

export async function loader({ request }: LoaderFunctionArgs) {
    return authenticate(request);
}

/** Validates that a code is exactly 6 alphanumeric characters. */
function isValidMatchCode(code: string): boolean {
    return /^[A-Z0-9]{6}$/.test(code);
}

/** Handles joining a match by code or finding a random public match. */
export async function action({ request }: ActionFunctionArgs) {
    const session = await getAuthenticatedSession(request);
    if (!session) {
        return redirect("/login");
    }

    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === "joinWithCode") {
        const codeEntry = formData.get("code");

        if (typeof codeEntry !== "string") {
            return { error: "Invalid code" };
        }

        const code = codeEntry.trim().toUpperCase();
        if (!isValidMatchCode(code)) {
            return { error: "Code must be 6 alphanumeric characters" };
        }

        try {
            const match = await convex.query(api.matches.getMatchByCode, { code });
            if (!match) {
                return { error: "Match not found" };
            }

            await convex.mutation(api.matches.joinMatch, {
                matchId: match._id,
                userId: session.userId,
            });

            return redirect(`/play/${match._id}`);
        } catch (error) {
            return {
                error: error instanceof Error ? error.message : "Failed to join match",
            };
        }
    }

    if (intent === "joinRandom") {
        try {
            const matches = await convex.query(
                api.matches.getPublicWaitingMatches,
                {},
            );

            if (!matches || matches.length === 0) {
                return { error: "No public matches available" };
            }

            const targetMatch = matches[0];

            await convex.mutation(api.matches.joinMatch, {
                matchId: targetMatch._id,
                userId: session.userId,
            });

            return redirect(`/play/${targetMatch._id}`);
        } catch (error) {
            return {
                error: error instanceof Error ? error.message : "Failed to join match",
            };
        }
    }

    return { error: "Invalid action" };
}

export default function Page() {
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    return <Join isSubmitting={isSubmitting} actionError={actionData?.error} />;
}
