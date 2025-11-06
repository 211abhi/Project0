import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";
import { syncUserHttp } from "./syncUser";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

http.route({
    path: "/sync-user",
    method: "POST",
    handler: syncUserHttp,
});

export default http;

