import axios from "axios";

export const login = async (email: string, password: string) => {
    try {
        const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/login`, {
            email,
            password
        },
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    } catch (error) {
        console.error("Login failed:", error);
        throw new Error("Login failed. Please check your credentials.");
    }
}

export const register = async (email: string, password: string, password_confirmation: string) => {
    try {
        const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/register`, {
            email,
            password,
            password_confirmation
        },
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    } catch (error) {
        console.error("Registration failed:", error);
        throw new Error("Registration failed. Please check your details.");
    }
}

export const logout = async (token: string) => {
    try {
        const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/logout`, {},
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        console.log("Logout successful:", response.data);
        return response.data;
    } catch (error) {
        console.error("Logout failed:", error);
        throw new Error("Logout failed. Please try again later.");
    }
}

export const fetchProfile = async (token: string) => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        console.log("Profile fetched successfully:", response.data);
         // Assuming the API returns the user profile data in response.data
         // Adjust this based on your actual API response structure
        return response.data;
    } catch (error) {
        console.error("Failed to fetch profile:", error);
        throw new Error("Failed to fetch profile. Please try again later.");
    }
}

export const updateProfile = async (token: string, userData: any) => {
    try {
        const response = await axios.patch(`${import.meta.env.VITE_BASE_URL}/profile`, userData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: userData
        });
        console.log("Profile updated successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Failed to update profile:", error);
        throw new Error("Failed to update profile. Please try again later.");
    }
}

export const resetPassword = async (token: string, email:string, password: string, passwordConf: string) => {
    try {
        const response = await axios.patch(`${import.meta.env.VITE_BASE_URL}/reset-password`, {
            email,
            password: password,
            password_confirmation: passwordConf
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        console.log("Password reset successful:", response.data);
        return response.data;
    } catch (error) {
        console.error("Failed to reset password:", error);
        throw new Error("Failed to reset password. Please check your details.");
    }
}

export const deleteAccount = async (token: string, password: string) => {
    try {
        const response = await axios.delete(`${import.meta.env.VITE_BASE_URL}/delete-account`, {
            headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            },
            data: {
                password
            }
        });
        console.log("Account deleted successfully:", response.data);
    } catch (error) {
        console.error("Failed to delete account:", error);
        throw new Error("Failed to delete account. Please try again later.");
    }
}