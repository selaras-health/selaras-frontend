import axios from "axios";

/*
    HISTORY
*/
export const fetchDashboard = async(token: string) => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/dashboard`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        console.log("Dashboard data fetched successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        throw new Error("Failed to fetch dashboard data. Please try again later.");
    }
}