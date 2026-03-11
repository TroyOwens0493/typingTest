import { ConvexHttpClient } from "convex/browser";
import type { LoaderFunctionArgs } from "react-router";
import { redirect, useLoaderData } from "react-router";
import { api } from "../convex/_generated/api";
import { Main } from "../views/home";
import { getAuthenticatedSession } from "./authenticate";

const convex = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL as string);

export async function loader({ request }: LoaderFunctionArgs) {
    const session = await getAuthenticatedSession(request);

    if (!session) {
        return redirect("/login");
    }

    const user = await convex.query((api as any).users.getUser, {
        id: session.userId,
    });

    const hasRecentSession =
        user.recentSessions.time.length > 0 ||
        user.recentSessions.result.length > 0 ||
        user.recentSessions.place > 0;

    return {
        dashboard: {
            name: user.username,
            rank: user.rank,
            level: user.level,
            gamesPlayed: user.gamesPlayed,
            gamesWon: user.gamesWon,
            averageWPM: user.averageWPM,
            peakWPM: user.peakWPM,
            totalTime: user.totalTime,
            averageAccuracy: user.averageAccuracy,
            recentSessions: hasRecentSession
                ? [
                    {
                        id: 1,
                        duration: user.recentSessions.time,
                        wpm: user.recentSessions.wpm,
                        accuracy: user.recentSessions.accuracy,
                        result: user.recentSessions.result,
                        place: user.recentSessions.place,
                    },
                ]
                : [],
        },
    };
}

export default function Page() {
    const { dashboard } = useLoaderData<typeof loader>();

    return <Main dashboard={dashboard} />;
}
