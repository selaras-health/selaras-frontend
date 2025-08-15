import Homepage from "@/app";
import Login from "@/app/auth/login";
import Register from "@/app/auth/register";
import DashboardPage from "@/app/dashboard";
import AIChatPage from "@/app/dashboard/ai-chat";
import NewAnalysis from "@/app/dashboard/analysis";
// import HelpPage from "@/app/dashboard/help";
import HistoryPage from "@/app/dashboard/history";
import CoachingDashboard from "@/app/dashboard/program";
import ChatPage from "@/app/dashboard/program/chat";
import SettingsPage from "@/app/dashboard/settings";
import AuthLayout from "@/components/layouts/AuthLayout";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import MainPageLayout from "@/components/layouts/MainPageLayout";
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
    {
        path: "/",
        Component: MainPageLayout,
        children: [
            {
                index: true,
                Component: Homepage
            }
        ]
    },
    {
        path: '/auth',
        Component: AuthLayout,
        children: [
            {
                index: true,
                loader: () => {
                    return { redirect: "/auth/login" };
                }
            },
            {
                path: "login",
                Component: Login
            },
            {
                path: "register",
                Component: Register
            }
        ]
    },
    {
        path: "/dashboard",
        Component: DashboardLayout,
        children: [
            {
                index: true,
                Component: DashboardPage
            },
            {
                path: "analysis",
                Component: NewAnalysis
            },
            {
                path: "history",
                Component: HistoryPage
            },
            {
                path: "ai-chat",
                Component: AIChatPage
            },
            {
                path: "profile",
                Component: SettingsPage
            },
            {
                path: "program",
                Component: CoachingDashboard
            },
            {
                path: "program/:slug",
                Component: CoachingDashboard
            },
            {
                path: "program/chat/:threadId",
                Component: ChatPage,
                
            }
            // {
            //     path: "help",
            //     Component: HelpPage
            // }
        ]
    }
])