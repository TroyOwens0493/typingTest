import { ConvexHttpClient } from "convex/browser";
import { redirect, useLoaderData, useNavigate, useNavigation } from "react-router";
import { useQuery } from "convex/react";
import { useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import type { Id } from "~/convex/_generated/dataModel";

import { api } from "~/convex/_generated/api";
import { Results } from "../views/results";
import { authenticate, getAuthenticatedSession } from "./authenticate";

const convex = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL as string);

/** Verifies access to the results page and returns the current match context. */
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

/** Handles owner-triggered round restarts from the results screen. */
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

    if (intent === "restart-match") {
        try {
            await convex.mutation(api.matches.restartMatch, {
                matchId: gameId as Id<"match">,
                userId: session.userId,
            });

            return redirect(`/play/${gameId}`);
        } catch (error) {
            return {
                error: error instanceof Error ? error.message : "Failed to restart match",
            };
        }
    }

    return { error: "Invalid action" };
}

export default function Page() {
    const { matchId, currentUserId } = useLoaderData<typeof loader>();
    const navigate = useNavigate();
    const navigation = useNavigation();
    const match = useQuery(api.matches.getMatchWithPlayers, {
        matchId,
        userId: currentUserId,
    });
    const normalizedStatus = match?.status;

    useEffect(() => {
        if (normalizedStatus && normalizedStatus !== "finished") {
            navigate(`/play/${matchId}`);
        }
    }, [matchId, navigate, normalizedStatus]);

    if (match === undefined) {
        return null;
    }

    if (match === null) {
        return null;
    }

    if (normalizedStatus === undefined) {
        return null;
    }

    return (
        <Results
            matchId={match._id}
            currentUserId={currentUserId}
            ownerId={match.ownerId}
            winnerId={match.winnerId}
            eliminatedPlayers={match.eliminatedPlayers}
            players={match.playerEntries}
            joinCode={match.code}
            gamemode={match.gamemode}
            status={normalizedStatus}
            isSubmitting={navigation.state === "submitting"}
        />
    );
}
