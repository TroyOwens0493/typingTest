import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Royal type" },
        {
            name: "description",
            content: "Create typing battle royals with your friends"
        },
    ];
}

export default function Home() {
    return <Welcome />;
}
