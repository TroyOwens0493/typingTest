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

    const [user, recentMatches] = await Promise.all([
        convex.query(api.users.getUser, {
            id: session.userId,
        }),
        convex.query(api.users.getRecentMatchesByUser, {
            userId: session.userId,
            limit: 5,
        }),
    ]);

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
            recentSessions: recentMatches.map((recentMatch, index) => ({
                id: index + 1,
                duration: `${recentMatch.timeInSeconds}s`,
                wpm: recentMatch.wpm,
                accuracy: recentMatch.accuracy,
                result: recentMatch.result,
                place: recentMatch.place,
            })),
        },
    };
}

export default function Page() {
    const { dashboard } = useLoaderData<typeof loader>();

    return <Main dashboard={dashboard} />;
}
