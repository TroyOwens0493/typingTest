import { ConvexHttpClient } from "convex/browser";
import { redirect, useActionData, useLoaderData, useNavigation } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

import { api } from "../convex/_generated/api";
import { Play } from "../views/play";
import { authenticate, getAuthenticatedSession } from "./authenticate";

const convex = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL as string);

export async function loader({ request, params }: LoaderFunctionArgs) {
    await authenticate(request);

    const session = await getAuthenticatedSession(request);
    if (!session) {
        return redirect("/login");
    }

    const { gameId } = params;

    if (!gameId) {
        return redirect("/home");
    }

    const match = await convex.query(api.matches.getMatchWithPlayers, {
        matchId: gameId as any,
    });

    if (!match) {
        return redirect("/home");
    }

    const isOwner = match.ownerId === session.userId;

    return { match, isOwner, currentUserId: session.userId };
}

export async function action({ request, params }: ActionFunctionArgs) {
    const session = await getAuthenticatedSession(request);
    if (!session) {
        return redirect("/login");
    }

    const { gameId } = params;
    if (!gameId) {
        return { error: "Match not found" };
    }

    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === "start-match") {
        try {
            await convex.mutation(api.matches.startMatch, {
                matchId: gameId as any,
                userId: session.userId,
            });
            return { success: true };
        } catch (error) {
            return {
                error: error instanceof Error ? error.message : "Failed to start match",
            };
        }
    }

    return { error: "Invalid action" };
}

export default function Page() {
    const { match, isOwner, currentUserId } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();

    const isSubmitting = navigation.state === "submitting";

    return (
        <Play
            words={match.words}
            isOwner={isOwner}
            playerCount={match.playerCount}
            maxPlayers={match.maxPlayers}
            matchId={match._id}
            currentUserId={currentUserId}
            status={match.status}
            joinCode={match.code}
            isSubmitting={isSubmitting}
            actionError={actionData?.error}
        />
    );
}
