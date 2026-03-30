import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/welcome.tsx"),
    route("signup", "routes/signUp.tsx"),
    route("home", "routes/home.tsx"),
    route("play/:gameId", "routes/play.tsx"),
    route("results/:gameId", "routes/results.tsx"),
    route("login", "routes/login.tsx"),
    route("practice", "routes/practice.tsx"),
    route("create", "routes/create.tsx"),
    route("join", "routes/join.tsx"),
    route("profile", "routes/profile.tsx"),
] satisfies RouteConfig;
