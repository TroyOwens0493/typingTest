import { Create } from "../views/create";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { authenticate } from "./authenticate";

export async function loader({ request }: LoaderFunctionArgs) {
    return authenticate(request);
}

export async function action({ request }: ActionFunctionArgs) {
}

export default function Page() {
    return <Create />;
}
