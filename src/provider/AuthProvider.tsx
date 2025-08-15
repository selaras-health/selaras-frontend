import { fetchProfile } from '@/hooks/api/auth';
import type { User } from '@/types';
import axios from 'axios';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext<
	| {
			token: string | null;
			user: User | null;
			setToken: (newToken: string | null) => void;
			refreshUserProfile: () => Promise<void>;
			resetContext: () => void;
	  }
	| undefined
>(undefined);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [token, setToken_] = useState(localStorage.getItem('token'));
	const [user, setUser] = useState<User | null>(null);

	const setToken = (newToken: string | null) => {
		setToken_(newToken);
	};

	// refresh user profile function
	const refreshUserProfile = async () => {
		if (token) {
			try {
				axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
				const response = await fetchProfile(token);
				console.log('Refreshed user profile:', response);
				setUser(response.data);
			} catch (error) {
				console.error('Failed to refresh user profile:', error);
				setToken(null); // Clear token if validation fails
				setUser(null);
			}
		}
    };
    
    const resetContext = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    }

	useEffect(() => {
		const fetchUserProfile = async () => {
			if (token) {
				try {
					axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
					localStorage.setItem('token', token);

					const response = await fetchProfile(token);
					console.log('Fetched user profile:', response);

					setUser(response.data);
				} catch (error) {
					console.error('Failed to fetch user profile:', error);
					setToken(null); // Clear token if validation fails
					setUser(null);
				}
			} else {
				delete axios.defaults.headers.common['Authorization'];
				localStorage.removeItem('token');
				setUser(null);
			}
		};

		fetchUserProfile();
	}, [token]);

	const contextValue = useMemo(
		() => ({
			token,
			user,
			setToken,
            refreshUserProfile,
            resetContext
		}),
		[token, user]
	);

	return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	return useContext(AuthContext);
};

export default AuthProvider;
