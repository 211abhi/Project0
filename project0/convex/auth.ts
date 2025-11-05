import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { betterAuth } from "better-auth";
import { createAuthMiddleware, APIError } from "better-auth/api";

const siteUrl = process.env.SITE_URL!;

export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (
    ctx: GenericCtx<DataModel>,
    { optionsOnly } = { optionsOnly: false },
) => {
    return betterAuth({
        logger: {
            disabled: optionsOnly,
        },
        baseURL: siteUrl,
        database: authComponent.adapter(ctx),
        emailAndPassword: {
            enabled: true,
            requireEmailVerification: false,
        },
        hooks: {
            before: createAuthMiddleware(async (ctx) => {
                if (ctx.path === "/sign-up/email" || ctx.path === "/sign-in/email") {
                    const email = ctx.body?.email;
                    if (email && !email.endsWith("@nitrkl.ac.in")) {
                        throw new APIError("BAD_REQUEST", {
                            message: "Email must be from @nitrkl.ac.in domain",
                        });
                    }
                }
            }),
            after: createAuthMiddleware(async (ctx) => {
                const newSession = ctx.context.newSession;
                if (newSession && (ctx.path === "/sign-up/email" || ctx.path === "/update-user")) {
                    const user = newSession.user;
                    const convexSiteUrl = process.env.CONVEX_SITE_URL;
                    if (convexSiteUrl) {
                        try {
                            await fetch(`${convexSiteUrl}/sync-user`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    id: user.id,
                                    email: user.email,
                                    name: user.name,
                                    image: user.image,
                                    emailVerified: user.emailVerified,
                                }),
                            });
                        } catch (error) {
                            console.error("Failed to sync user to Convex:", error);
                        }
                    }
                }
            }),
        },
        plugins: [
            convex(),
        ],
    });
};

export const getCurrentUser = query({
    args: {},
    handler: async (ctx) => {
        return authComponent.getAuthUser(ctx);
    },
});

