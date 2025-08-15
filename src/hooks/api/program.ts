import axios from "axios"

export const getProgramDetails = async (slug: string, token: string) => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/coaching/programs/${slug}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })

        return response.data;
    } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch program details. Please try again later.");
    }
}

export const startNewProgram = async (token: string, slug: string, difficulty: string) => {
    try {
        console.log("Starting new program with slug:", slug, "and difficulty:", difficulty);
        const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/coaching/programs`, {
            risk_assessment_slug: slug,
            difficulty: difficulty
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })

        return response.data;
    } catch (error) {
        console.error(error);
        throw new Error("Failed to start new program. Please try again later.");
    }
}

export const updateCompletionMissions = async (token: string, uuid: string) => {
    try {
        const response = await axios.patch(`${import.meta.env.VITE_BASE_URL}/coaching/tasks/${uuid}/toggle-task-status`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })

        return response.data;
    } catch (error) {
        console.error(error);
        throw new Error("Failed to update completion status. Please try again later.");
    }
}

export const updateProgramStatus = async (token: string, slug: string) => {
    try {
        const response = await axios.patch(`${import.meta.env.VITE_BASE_URL}/coaching/programs/${slug}/toggle-program-status`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })

        return response.data;
    } catch (error) {
        console.error(error)
        throw new Error("Failed to update program status. Please try again later.");
    }
}

export const deleteProgram = async (token: string, slug: string) => {
    try {
        const response = await axios.delete(`${import.meta.env.VITE_BASE_URL}/coaching/programs/${slug}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })

        return response.data;
    } catch (error) {
        console.error(error)
        throw new Error("Failed to delete the program");
    }
}

export const getGraduationDetails = async (token: string, slug: string) => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/coaching/programs/${slug}/graduation-report`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        return response.data;
    } catch (error) {
        console.error("Failed to fetch graduation details:", error);
        throw new Error("Failed to fetch graduation details. Please try again later.");
    }
}

export const createNewThread = async (slug: string, token: string, message: string) => {
    try {
        const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/coaching/programs/${slug}/threads`,{
            message: message
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        return response.data;
    } catch (error) {
        console.error(error);
        throw new Error("Gagal membuat thread baru");
    }
}

export const getThreadDetails = async (slug: string, token: string) => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/coaching/threads/${slug}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        return response.data;
    } catch (error) {
        console.error("Failed to fetch thread details:", error);
        throw new Error("Failed to fetch thread details. Please try again later.");
    }
}

export const sendThreadMessage = async (token: string, slug: string, message: string) => {
    try {
        const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/coaching/threads/${slug}/messages`, {
            message: message
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        return response.data;
    } catch (error) {
        console.error("Failed to send thread message:", error);
        throw new Error("Failed to send message. Please try again later.");
    }
}