import { useNavigate } from "react-router";

import { Welcome } from "../views/welcome";

export default function Page() {
    const navigate = useNavigate();

    return <Welcome
        login={() => navigate("/login")}
        signUp={() => navigate("/signup")}
        practice={() => navigate("/practice")}
    />;
}
