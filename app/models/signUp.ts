import type { ActionFunctionArgs } from "react-router";

export function action({ request }: ActionFunctionArgs) {
    console.log('req', request);
}
