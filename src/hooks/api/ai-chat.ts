import axios from "axios";

/*    
    AI CHAT
*/
export const fetchChatHistory = async (token: string) => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/chat/conversations`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        console.log("Chat history fetched successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch chat history:", error);
        throw new Error("Failed to fetch chat history. Please try again later.");
    }
}

export const fetchConversation = async (token: string, slug: string) => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/chat/conversations/${slug}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        console.log("Conversation fetched successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch conversation:", error);
        throw new Error("Failed to fetch conversation. Please try again later.");
    }
}

export const newConversation = async (token: string, conversationData: any) => {
    try {
        const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/chat/conversations`, conversationData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: conversationData
        });
        console.log("New conversation created successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Failed to create new conversation:", error);
        throw new Error("Failed to create new conversation. Please try again later.");
    }
}

export const continueConversation = async (token: string, slug: string, message: string) => {
    try {
        const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/chat/conversations/${slug}/messages`, {
            message: message
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        console.log("Conversation continued successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Failed to continue conversation:", error);
        throw new Error("Failed to continue conversation. Please try again later.");
    }
}

export const updateConversationTitle = async (token: string, title: string, slug: string) => {
    try {
        const response = await axios.patch(`${import.meta.env.VITE_BASE_URL}/chat/conversations/${slug}`, {
            title: title
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        console.log("Conversation title updated successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Failed to update conversation title:", error);
        throw new Error("Failed to update conversation title. Please try again later.");
    }
}

export const deleteConversation = async (token: string, slug: string) => {
    try {
        const response = await axios.delete(`${import.meta.env.VITE_BASE_URL}/chat/conversations/${slug}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        console.log("Conversation deleted successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Failed to delete conversation:", error);
        throw new Error("Failed to delete conversation. Please try again later.");
    }
}