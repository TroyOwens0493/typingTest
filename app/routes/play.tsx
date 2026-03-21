import { ConvexHttpClient } from "convex/browser";
import { redirect, useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";

import { api } from "../convex/_generated/api";
import { Play } from "../views/play";
import { authenticate } from "./authenticate";

const convex = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL as string);

export async function loader({ request, params }: LoaderFunctionArgs) {
    await authenticate(request);

    const { gameId } = params;

    if (!gameId) {
        return redirect("/home");
    }

    const match = await convex.query(api.matches.getMatch, {
        matchId: gameId as any,
    });

    if (!match) {
        return redirect("/home");
    }

    return { match };
}

export default function Page() {
    const { match } = useLoaderData<typeof loader>();

    return <Play words={match.words} />;
}
