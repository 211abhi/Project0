import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

export const syncUserHttp = httpAction(async (ctx, request) => {
    const body = await request.json();
    const { id, email, name, image, emailVerified } = body;

    await ctx.runMutation(internal.users.syncUser, {
        id,
        email,
        name,
        image,
        emailVerified,
    });

    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
});

