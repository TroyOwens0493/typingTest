import { useNavigate } from "react-router";

import { Welcome } from "../views/welcome";

export default function Home() {
    const navigate = useNavigate();

    return <Welcome
        login={() => navigate("/login")}
        signUp={() => navigate("/signup")}
    />;
}
