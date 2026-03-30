import { ConvexHttpClient } from "convex/browser";
import { redirect, useActionData, useLoaderData, useNavigation, useNavigate } from "react-router";
import { useQuery } from "convex/react";
import { useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import type { Id } from "../convex/_generated/dataModel";

import { api } from "../convex/_generated/api";
import { Play } from "../views/play";
import { authenticate, getAuthenticatedSession } from "./authenticate";

const convex = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL as string);

/**
 * Handles authentication and extracts route params.
 * Match data is fetched reactively in the component via useQuery.
 */
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

    return {
        matchId: gameId as Id<"match">,
        currentUserId: session.userId,
    };
}

/** Handles starting the match via form submission. */
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
    const { matchId, currentUserId } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const navigate = useNavigate();

    // Real-time subscription to match data
    const match = useQuery(api.matches.getMatchWithPlayers, { matchId });

    const isSubmitting = navigation.state === "submitting";

    // Redirect to join page if match doesn't exist or is deleted
    useEffect(() => {
        if (match === null) {
            navigate("/join");
        }
    }, [match, navigate]);

    // Loading state while waiting for initial query response
    if (match === undefined) {
        return null;
    }

    // Match was deleted/doesn't exist
    if (match === null) {
        return null;
    }

    const isOwner = match.ownerId === currentUserId;

    return (
        <Play
            words={match.words}
            isOwner={isOwner}
            playerCount={match.playerCount}
            maxPlayers={match.maxPlayers}
            matchId={match._id}
            currentUserId={currentUserId}
            status={match.status}
            startedAt={match.startedAt}
            joinCode={match.code}
            isSubmitting={isSubmitting}
            actionError={actionData?.error}
        />
    );
}
