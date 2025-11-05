"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function Home() {
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();

    useEffect(() => {
        if (!isPending && !session) {
            router.push("/sign-in");
        }
    }, [session, isPending, router]);

    const handleSignOut = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/sign-in");
                    router.refresh();
                },
            },
        });
    };

    if (isPending) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
                <div className="text-center">
                    <svg
                        className="mx-auto h-8 w-8 animate-spin text-zinc-600 dark:text-zinc-400"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                    <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    const navItems = ["Communities", "Maps", "Lectures", "SAC"];

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-neutral-200/40 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 dark:border-neutral-800/40 dark:bg-neutral-950/80 dark:supports-[backdrop-filter]:bg-neutral-950/60">
                <div className="flex w-full items-center justify-between px-6 py-4">
                    <h1 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
                        Project 0
                    </h1>
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                            <span className="text-sm font-semibold">
                                {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase()}
                            </span>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="rounded-md border cursor-pointer transition-all border-neutral-300 bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:border-neutral-600"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            {/* 3 Column Layout */}
            <div className="mx-auto grid max-w-8xl grid-cols-12 gap-14 px-6 py-8">
                {/* Left Sidebar - Navigation */}
                <aside className="col-span-12 md:col-span-3 lg:col-span-2 md:border-r md:border-neutral-200/50 md:pr-8 dark:md:border-neutral-800/50">
                    <nav className="sticky top-24 space-y-2">

                        {navItems.map((item) => (
                            <button
                                key={item}
                                className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                                tabIndex={0}
                                aria-label={`Navigate to ${item}`}
                            >
                                {item}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Center Column - Main Content */}
                <main className="col-span-12 md:col-span-6 lg:col-span-7 md:border-r md:border-neutral-200/50 md:pr-8 dark:md:border-neutral-800/50">
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h1 className="text-4xl font-semibold tracking-tight text-neutral-700 dark:text-neutral-100">
                                Welcome back,
                                {"  "}
                                <span className="font-bold text-cyan-200">
                                    {session.user.name || session.user.email?.split("@")[0]}!
                                </span>
                            </h1>
                            <p className="text-lg text-neutral-500 dark:text-neutral-400">
                                You are successfully signed in. Your account is connected to Convex and ready to use.
                            </p>
                        </div>

                        {/* Main Content Area */}
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Activity</CardTitle>
                                    <CardDescription>
                                        Your recent activities and updates
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 rounded-lg border border-neutral-200/30 p-4 dark:border-neutral-800/30">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100/50 dark:bg-neutral-800/30">
                                                <span className="text-sm font-semibold text-neutral-300 dark:text-neutral-100">
                                                    📚
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-neutral-400 dark:text-neutral-200">
                                                    New lecture materials available
                                                </p>
                                                <p className="text-xs text-neutral-400 dark:text-neutral-600">
                                                    2 hours ago
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 rounded-lg border border-neutral-200/30 p-4 dark:border-neutral-800/30">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100/50 dark:bg-neutral-800/30">
                                                <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-500">
                                                    👥
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-neutral-400 dark:text-neutral-200">
                                                    Community post in Computer Science
                                                </p>
                                                <p className="text-xs text-neutral-400 dark:text-neutral-600">
                                                    5 hours ago
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 rounded-lg border border-neutral-200/30 p-4 dark:border-neutral-800/30">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100/50 dark:bg-neutral-800/30">
                                                <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-500">
                                                    🎯
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-neutral-400 dark:text-neutral-200">
                                                    SAC event registration open
                                                </p>
                                                <p className="text-xs text-neutral-400 dark:text-neutral-600">
                                                    1 day ago
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>

                {/* Right Sidebar - Account Info */}
                <aside className="col-span-10 md:col-span-3 lg:col-span-3">
                    <div className="sticky top-24 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Account Information</CardTitle>
                                <CardDescription>Your profile details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-200/50 text-neutral-500 dark:bg-neutral-800/30 dark:text-neutral-400">
                                        <span className="text-lg font-bold">
                                            {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="truncate text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                                            {session.user.name || "User"}
                                        </p>
                                        <p className="truncate text-xs text-neutral-400 dark:text-neutral-600">
                                            {session.user.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3 border-t border-neutral-200/30 pt-4 dark:border-neutral-800/30">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-neutral-300 dark:text-neutral-400">Status</span>
                                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100/50 px-2 py-1 text-xs font-medium text-green-600/70 dark:bg-green-900/10 dark:text-green-500/60">
                                            <span className="h-1.5 w-1.5 rounded-full bg-green-600/70 dark:bg-green-500/60"></span>
                                            Active
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-neutral-300 dark:text-neutral-400">Role</span>
                                        <span className="text-sm font-medium text-neutral-400 dark:text-neutral-200">
                                            Student
                                        </span>
                                    </div>
                                    {session.user.name && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-neutral-300 dark:text-neutral-400">Name</span>
                                            <span className="text-sm font-medium text-neutral-400 dark:text-neutral-200">
                                                {session.user.name}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Quick Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-neutral-300 dark:text-neutral-400">Communities</span>
                                    <span className="text-lg font-bold text-neutral-400 dark:text-neutral-200">5</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-neutral-300 dark:text-neutral-400">Lectures</span>
                                    <span className="text-lg font-bold text-neutral-400 dark:text-neutral-200">12</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-neutral-300 dark:text-neutral-400">Events</span>
                                    <span className="text-lg font-bold text-neutral-400 dark:text-neutral-200">3</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </aside>
            </div>
        </div>
    );
}
