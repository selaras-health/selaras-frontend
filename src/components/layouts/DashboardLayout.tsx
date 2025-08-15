import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { AppSidebar } from "../fragments/app-sidebar";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import { SidebarToggle } from "../fragments/sidebar-toggle";
import { useAuth } from "@/provider/AuthProvider";
import { logout } from "@/hooks/api/auth";
import { Toaster } from "sonner";

const DashboardLayout = () => {
    const auth = useAuth();
    const navigate = useNavigate();
    const token = auth?.token;
    const user = auth?.user;

    // Check if the user is authenticated
    if (!token || !user) {
        // If not authenticated, redirect to the login page
        return <Navigate to="/auth/login" />;
    }

    const handleLogout = async () => {
        try {
            const response = await logout(token);
            console.log("Logout response:", response);
            // Clear the token and user state
            auth.setToken(null);
            // Redirect to the login page after logout
            navigate("/auth/login");
        } catch (error) {
            console.error("Logout failed:", error);
            // Optionally, you can show an error message to the user
        }
    };
    return (
        <SidebarProvider>
            <AppSidebar user={user} handleLogout={handleLogout} />
            <SidebarInset>
                <div className="flex flex-col min-h-screen">
                    <SidebarToggle />
                    <main className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50/30">
                        <div className=" bg-white dark:bg-slate-900">
                            <Outlet />
                            <Toaster richColors/>
                        </div>
                    </main>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default DashboardLayout;
