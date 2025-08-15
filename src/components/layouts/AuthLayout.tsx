import { useAuth } from "@/provider/AuthProvider";
import { Navigate, Outlet } from "react-router-dom";

const AuthLayout = () => {
    const auth = useAuth();
    const token = auth?.token;
    const user = auth?.user;

    // Check if the user is authenticated
    if (token && user) {
        // If not authenticated, redirect to the login page
        return <Navigate to="/dashboard" />;
    }

    return (
        <>
            <Outlet />
        </>
    );
};

export default AuthLayout;
