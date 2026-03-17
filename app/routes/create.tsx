import { ConvexHttpClient } from "convex/browser";
import { redirect, useActionData } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

import { api } from "../convex/_generated/api";
import { Create } from "../views/create";
import { authenticate, getAuthenticatedSession } from "./authenticate";
import { getTypingWords } from "~/models/gameHelpers";
import type { Difficulties } from "~/models/typingTypes";

const convex = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL as string);

type CreateActionData = {
    error?: string;
};

/** Parses and validates the create-match form payload. */
function parseCreateMatchForm(formData: FormData) {
    const gamemode = formData.get("gamemode");
    const maxPlayers = formData.get("maxPlayers");
    const difficulty = formData.get("difficulty");
    const visibility = formData.get("visibility");

    if (
        typeof gamemode !== "string" ||
        typeof maxPlayers !== "string" ||
        typeof difficulty !== "string" ||
        typeof visibility !== "string"
    ) {
        return { error: "Invalid match settings" };
    }

    const parsedMaxPlayers = Number.parseInt(maxPlayers, 10);

    if (!Number.isInteger(parsedMaxPlayers) || parsedMaxPlayers < 2 || parsedMaxPlayers > 50) {
        return { error: "Player count must be between 2 and 50" };
    }

    if (!["easy", "medium", "hard"].includes(difficulty)) {
        return { error: "Invalid difficulty" };
    }

    if (!["private", "public"].includes(visibility)) {
        return { error: "Invalid visibility" };
    }

    return {
        gamemode,
        maxPlayers: parsedMaxPlayers,
        difficulty,
        visibility,
    };
}

export async function loader({ request }: LoaderFunctionArgs) {
    return authenticate(request);
}

/** Creates a match for the authenticated user from the submitted form values. */
export async function action({ request }: ActionFunctionArgs) {
    const session = await getAuthenticatedSession(request);

    if (!session) {
        return redirect("/login");
    }

    const formData = await request.formData();
    const parsedForm = parseCreateMatchForm(formData);

    if ("error" in parsedForm) {
        return { error: parsedForm.error } satisfies CreateActionData;
    }

    try {
        const match = await convex.mutation(api.matches.createMatch, {
            ownerId: session.userId,
            gamemode: parsedForm.gamemode,
            maxPlayers: parsedForm.maxPlayers,
            difficulty: parsedForm.difficulty,
            visibility: parsedForm.visibility,
            words: getTypingWords(parsedForm.difficulty as Difficulties),
        });

        return redirect(`/play/${match.matchId}`);
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Unable to create match",
        } satisfies CreateActionData;
    }
}

/** Renders the create page with any action error state. */
export default function Page() {
    const actionData = useActionData<typeof action>();

    return <Create actionData={actionData} />;
}
