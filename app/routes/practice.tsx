import type { LoaderFunctionArgs } from "react-router";
import { Practice } from "~/views/practice";

export function loader({ request }: LoaderFunctionArgs) {
    return null;
}

export default function Page() {
    return <Practice />;
}
