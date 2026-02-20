import { Card } from "~/components/card";

export function Welcome() {
    return (
        <main className="flex items-center justify-center pt-16 pb-4">
            <Card
                title="Title"
                eyebrow="eyebrow"
            />
        </main>
    );
}
