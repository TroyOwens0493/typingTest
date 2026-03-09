import { Create } from "../views/create";
import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "./authenticate";

export async function loader({ request }: LoaderFunctionArgs) {
    return authenticate(request);
}

export default function Page() {
    return <Create />;
}
