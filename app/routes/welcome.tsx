import { useNavigate } from "react-router";

import { Welcome } from "../views/welcome";

export default function Home() {
    const navigate = useNavigate();

    function login() {
        navigate("/login");
    }

    function signUp() {
        navigate("/signup");
    }

    return <Welcome
        login={login}
        signUp={signUp}
    />;
}
