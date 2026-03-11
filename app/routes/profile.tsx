import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Profile } from "../views/profile";
import { authenticate } from "./authenticate";

export async function loader({ request }: LoaderFunctionArgs) {
    await authenticate(request);
}

export async function action({ request }: ActionFunctionArgs) {
    console.log('req', request);
}

export default function Page() {
    return <Profile />;
}

