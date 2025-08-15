/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ChatArea from '@/components/fragments/chat-area';
import { createNewThread, getThreadDetails, sendThreadMessage } from '@/hooks/api/program';
import { useAuth } from '@/provider/AuthProvider';

// Tipe data Message disesuaikan dengan struktur API
interface Message {
	id: string;
	role: 'user' | 'assistant';
	content: string | { reply_components: any[] };
	timestamp?: string;
}

export default function ChatPage() {
	const auth = useAuth();
	const token = auth?.token;
	const params = useParams<{ threadId: string }>();
	const navigate = useNavigate();

	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [chatTitle, setChatTitle] = useState('');
	const [currentChatId, setCurrentChatId] = useState<string | null>(null);

	const messagesEndRef = useRef<HTMLDivElement>(null);

	const isNewChat = params.threadId === 'new';
	const programParam = new URLSearchParams(window.location.search).get('program');
	const readOnly = new URLSearchParams(window.location.search).get('readOnly') === 'true';

	useEffect(() => {
		if (isNewChat && !programParam) {
			navigate('/dashboard/program');
		}
	}, [isNewChat, programParam, navigate]);

	useEffect(() => {
		if (isNewChat) {
			setChatTitle('AI Coach');
			setMessages([]);
			setCurrentChatId(null);
		} else {
			setIsLoading(true);
			if (params.threadId && token) {
				getThreadDetails(params.threadId, token)
					.then((data) => {
						const formattedMessages: Message[] = data.data.messages.map((msg: any, index: any) => ({
							id: index.toString(),
							role: msg.role,
							content: msg.content,
							timestamp: msg.created_at_human,
						}));
						setMessages(formattedMessages);
						setChatTitle(data.data.title);
						setCurrentChatId(data.data.slug);
					})
					.catch((error) => {
						console.error('Failed to load chat details:', error);
					})
					.finally(() => {
						setIsLoading(false);
					});
			}
		}
	}, [params.threadId, isNewChat, token]);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || !token) {
			if (!token) console.error('No authentication token found');
			return;
		}

		const userMessage: Message = {
			id: Date.now().toString(),
			role: 'user',
			content: input,
			timestamp: 'Just now',
		};

		setMessages((prev) => [...prev, userMessage]);
		setInput('');
		setIsLoading(true);

		try {
			// Logika untuk memulai percakapan baru
			if (isNewChat) {
				if (!programParam) return;

				// Panggil API untuk membuat thread baru
				const res = await createNewThread(programParam, token, input);

				// Periksa apakah slug (ID unik) dari thread baru ada
				if (res?.thread?.slug) {
					// BENTUK URL BARU DENGAN MENYERTAKAN KEMBALI `programParam`
					const newUrl = `/dashboard/program/chat/${res.thread.slug}?program=${programParam}`;

					// Arahkan ke URL baru yang sudah lengkap.
					// Ini akan me-render ulang komponen dengan data thread yang baru.
					navigate(newUrl);
				} else {
					console.error('Thread slug is undefined after creation.');
				}

				// Logika jika ini adalah percakapan yang sudah ada
			} else if (params.threadId) {
				// Kirim pesan ke thread yang sudah ada
				const res = await sendThreadMessage(token, params.threadId, input);

				// Siapkan objek pesan dari asisten
				const assistantMessage: Message = {
					id: Date.now().toString() + 'ai',
					role: 'assistant',
					content: {
						reply_components: res.reply.reply_components,
					},
				};

				// Tambahkan balasan dari asisten ke daftar pesan
				setMessages((prev) => [...prev, assistantMessage]);
				setCurrentChatId(params.threadId || null);
			}
		} catch (err) {
			console.error('Error sending message:', err);
		} finally {
			setIsLoading(false);
		}
	};

	const handleNewChat = () => {
		navigate('/chat/new');
	};

	return (
		<div className="flex flex-col h-screen bg-white">
			<ChatArea
				messages={messages}
				input={input}
				setInput={setInput}
				isLoading={isLoading}
				handleSubmit={handleSubmit}
				chatTitle={chatTitle}
				messagesEndRef={messagesEndRef}
				currentChatId={currentChatId}
				handleNewChat={handleNewChat}
				isReadOnly={readOnly}
			/>
		</div>
	);
}
