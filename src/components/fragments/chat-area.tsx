import { User, Send, Loader2, History, ChevronLeft, ChevronRight, MessageSquare, Bot, Lock, ArrowLeftToLine, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import ReplyRenderer from './reply-renderer';
import { useNavigate } from 'react-router-dom';
import { ShimmeringCTAButton } from './ShimmeringCTAButton';

interface ChatAreaPropsTypes {
	isSidebarOpen?: boolean;
	setIsSidebarOpen?: (open: boolean) => void;
	chatTitle: string;
	currentChatId: string | null;
	messages: any[];
	setInput: (input: string) => void;
	input: string;
	handleNewChat: () => void;
	handleSubmit: (e: React.FormEvent) => void;
	isLoading: boolean;
	messagesEndRef: any;
	isReadOnly?: boolean;
}

const ChatArea = (props: ChatAreaPropsTypes) => {
	const { isSidebarOpen, setIsSidebarOpen, chatTitle, currentChatId, messages, setInput, input, handleNewChat, handleSubmit, isLoading, messagesEndRef, isReadOnly = false } = props;
	const navigate = useNavigate();

	const suggestionsForClosedSidebar = ['Fokus minggu ini apa?', 'Perkembangan terakhir saya bagaimana?', 'Bagaimana cara saya meningkatkan progres?', 'Saya kesulitan, tolong berikan saran!'];

	const suggestionsForOpenSidebar = [
		'Bagaimana cara menjaga kesehatan jantung?',
		'Gejala penyakit jantung apa saja?',
		'Rekomendasi olahraga untuk pemula',
		'Tips diet sehat untuk menurunkan berat badan',
		'Bagaimana kondisi terkahir jantung saya?',
		'Bagaimana hasil analisis sebulan terakhir saya?',
	];

	const activeSuggestions = setIsSidebarOpen ? suggestionsForOpenSidebar : suggestionsForClosedSidebar;

	return (
		<div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'mr-80' : 'mr-0'}`}>
			{/* Header */}
			<div className="bg-white border-b border-gray-200 px-6 py-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-gradient-to-br from-red-400 via-pink-500 to-red-600 hover:from-red-500 hover:via-pink-600 hover:to-red-700 text-white rounded-lg">
							{setIsSidebarOpen ? <Brain className="h-6 w-6 text-white" /> : <Bot className="h-6 w-6 text-white" />}
						</div>
						<div className="hidden md:block">
							<h1 className="text-xl font-bold text-gray-900">{chatTitle || 'AI Chat'}</h1>
							{setIsSidebarOpen ? (
								<p className="text-sm text-gray-600">{currentChatId ? 'Melanjutkan percakapan' : 'Mulai percakapan kesehatan dengan Analis Cerdas'}</p>
							) : (
								<p className="text-sm text-gray-600">{currentChatId ? 'Melanjutkan konsultasi' : 'Mulai konsultasikan langkah sehat Anda dengan AI'}</p>
							)}
						</div>
					</div>
					{setIsSidebarOpen ? (
						<div className="flex items-center gap-5">
							<ShimmeringCTAButton
								shape="rectangle"
								onClick={handleNewChat}
								className="w-full px-4 py-2 text-sm" // Meniru 'size="sm"' dengan padding dan ukuran teks
							>
								<Brain className="h-4 w-4 mr-2" />
								Mulai Percakapan Baru
							</ShimmeringCTAButton>
							<Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-600 hover:bg-gray-100 cursor-pointer">
								{isSidebarOpen ? (
									<ChevronRight className="h-4 w-4" />
								) : (
									<>
										<History className="h-4 w-4 mr-2" />
										<ChevronLeft className="h-4 w-4" />
									</>
								)}
							</Button>
						</div>
					) : (
						<div className="flex items-center gap-2">
							<Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-100 cursor-pointer" onClick={() => navigate(-1)}>
								<span className="me-0.5">Kembali</span>
								<ArrowLeftToLine className="h-4 w-4" />
							</Button>
						</div>
					)}
				</div>
			</div>

			{/* Chat Messages */}
			<ScrollArea className="flex-1 p-6 mb-28 h-full bg-white">
				<div className="max-w-4xl mx-auto space-y-6">
					{messages.length === 0 ? (
						<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center py-12">
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{
									delay: 0.2,
									type: 'spring',
									stiffness: 200,
								}}
								className="p-4 bg-gradient-to-br from-red-400 via-pink-500 to-red-600 hover:from-red-500 hover:via-pink-600 hover:to-red-700 text-white rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center"
							>
								{setIsSidebarOpen ? <Brain className="h-6 w-6 text-white" /> : <Bot className="h-6 w-6 text-white" />}
							</motion.div>
							{setIsSidebarOpen ? (
								<>
									<motion.h3 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-lg font-semibold text-gray-900 mb-2">
										{currentChatId ? 'Lanjutkan Percakapan' : 'Mulai Percakapan'}
									</motion.h3>

									<motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-gray-600 mb-6">
										{currentChatId ? 'Anda dapat melanjutkan percakapan sebelumnya atau memulai topik baru' : 'Tanyakan apa saja tentang kesehatan Anda kepada Analis Cerdas pribadi Anda'}
									</motion.p>
								</>
							) : (
								// Kode ini hanya akan dirender jika isSidebarOpen bernilai false
								<>
									<motion.h3 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-lg font-semibold text-gray-900 mb-2">
										{currentChatId ? 'Lanjutkan Konsultasi' : 'Mulai Konsultasi'}
									</motion.h3>

									<motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-gray-600 mb-6">
										{currentChatId ? 'Anda dapat melanjutkan konsultasi sebelumnya atau memulai konsultasi baru' : 'Konsultasikan langkah sehat Anda kepada AI coach'}
									</motion.p>
								</>
							)}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{
									delay: 0.6,
									staggerChildren: 0.1,
								}}
								className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto"
							>
								{/* 4. Gunakan .map() pada daftar yang sudah dipilih */}
								{activeSuggestions.map((suggestion, index) => (
									<motion.div
										key={index}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{
											delay: 0.7 + index * 0.1,
										}}
										whileHover={{
											scale: 1.02,
											y: -2,
										}}
										whileTap={{ scale: 0.98 }}
									>
										<Button variant="outline" className="p-4 h-auto text-left justify-start hover:bg-rose-50 hover:border-rose-200 w-full transition-all duration-200 cursor-pointer" onClick={() => setInput(suggestion)}>
											<MessageSquare className="h-4 w-4 mr-3 text-rose-500 flex-shrink-0" />
											<span className="text-sm">{suggestion}</span>
										</Button>
									</motion.div>
								))}
							</motion.div>
						</motion.div>
					) : (
						<AnimatePresence mode="popLayout">
							{messages.map((message, index) => (
								<motion.div
									key={message.id}
									initial={{
										opacity: 0,
										y: 50,
										scale: 0.8,
									}}
									animate={{
										opacity: 1,
										y: 0,
										scale: 1,
									}}
									exit={{
										opacity: 0,
										y: -50,
										scale: 0.8,
									}}
									transition={{
										type: 'spring',
										stiffness: 200,
										damping: 20,
										delay: index * 0.1,
									}}
									className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
								>
									{message.role === 'assistant' && (
										<motion.div
											initial={{
												scale: 0,
												rotate: -180,
											}}
											animate={{
												scale: 1,
												rotate: 0,
											}}
											transition={{
												delay: index * 0.1 + 0.2,
												type: 'spring',
											}}
											className="p-2 bg-gradient-to-br from-red-400 via-pink-500 to-red-600 hover:from-red-500 hover:via-pink-600 hover:to-red-700 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0"
										>
											{setIsSidebarOpen ? <Brain className="h-6 w-6  text-white" /> : <Bot className="h-6 w-6  text-white" />}
										</motion.div>
									)}
									<motion.div
										initial={{
											opacity: 0,
											scale: 0.8,
										}}
										animate={{
											opacity: 1,
											scale: 1,
										}}
										transition={{
											delay: index * 0.1 + 0.3,
										}}
										whileHover={{ scale: 1.02 }}
										className={`max-w-3xl p-4 rounded-2xl ${message.role === 'user' ? 'bg-rose-500 text-white' : 'bg-white border border-gray-200 shadow-sm'}`}
									>
										{typeof message.content === 'string' ? (
											<motion.p
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												transition={{
													delay: index * 0.1 + 0.4,
												}}
												className="text-sm leading-relaxed whitespace-pre-wrap"
											>
												{message.content}
											</motion.p>
										) : (
											<motion.div
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												transition={{
													delay: index * 0.1 + 0.4,
												}}
												className="text-sm leading-relaxed"
											>
												<ReplyRenderer components={message.content.reply_components} />
											</motion.div>
										)}
									</motion.div>
									{message.role === 'user' && (
										<motion.div
											initial={{
												scale: 0,
												rotate: 180,
											}}
											animate={{
												scale: 1,
												rotate: 0,
											}}
											transition={{
												delay: index * 0.1 + 0.2,
												type: 'spring',
											}}
											className="p-2 bg-gray-100 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0"
										>
											<User className="h-5 w-5 text-gray-600" />
										</motion.div>
									)}
								</motion.div>
							))}
						</AnimatePresence>
					)}
					<AnimatePresence>
						{isLoading && (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								transition={{
									type: 'spring',
									stiffness: 200,
								}}
								className="flex gap-4 justify-start"
							>
								<motion.div
									animate={{ rotate: 360 }}
									transition={{
										duration: 2,
										repeat: Number.POSITIVE_INFINITY,
										ease: 'linear',
									}}
									className="p-2 bg-gradient-to-br from-red-400 via-pink-500 to-red-600 hover:from-red-500 hover:via-pink-600 hover:to-red-700  rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0"
								>
									{setIsSidebarOpen ? <Brain className="h-6 w-6 text-white" /> : <Bot className="h-6 w-6 text-white" />}
								</motion.div>
								<motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="max-w-3xl p-4 rounded-2xl bg-white border border-gray-200">
									<div className="flex items-center gap-2">
										<motion.div
											animate={{ rotate: 360 }}
											transition={{
												duration: 1,
												repeat: Number.POSITIVE_INFINITY,
												ease: 'linear',
											}}
										>
											<Loader2 className="h-4 w-4 text-rose-500" />
										</motion.div>
										<motion.span
											initial={{ opacity: 0 }}
											animate={{
												opacity: [0, 1, 0],
											}}
											transition={{
												duration: 1.5,
												repeat: Number.POSITIVE_INFINITY,
											}}
											className="text-sm text-gray-600"
										>
											AI sedang mengetik...
										</motion.span>
									</div>
								</motion.div>
							</motion.div>
						)}
						<div ref={messagesEndRef} />
					</AnimatePresence>
				</div>
			</ScrollArea>

			{/* Input Area */}
			{!isReadOnly ? (
				<motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white border-t border-gray-200 p-6 fixed bottom-0 left-0 md:left-60 right-0 shadow-lg">
					<form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
						<motion.div whileFocus={{ scale: 1.02 }} className="flex gap-4">
							<div className="flex-1 relative">
								<motion.div
									whileFocus={{
										boxShadow: '0 0 0 3px rgba(244, 63, 94, 0.1)',
									}}
									className="rounded-lg"
								>
									<Input
										value={input}
										onChange={(e) => setInput(e.target.value)}
										onFocus={() => setIsSidebarOpen && setIsSidebarOpen(false)}
										placeholder="Ketik pertanyaan kesehatan Anda..."
										className="pr-12 h-12 text-base transition-all duration-200"
										disabled={isLoading}
									/>
								</motion.div>
								<motion.div
								// whileHover={{ scale: 1.1 }}
								// whileTap={{ scale: 0.9 }}
								>
									<Button
										type="submit"
										size="sm"
										disabled={!input.trim() || isLoading}
										className="absolute right-2 top-2 h-8 w-8 p-0 bg-gradient-to-br from-red-400 via-pink-500 to-red-600 hover:from-red-500 hover:via-pink-600 hover:to-red-700 text-white transition-all duration-200 cursor-pointer"
									>
										<motion.div animate={isLoading ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 0.5 }}>
											<Send className="h-4 w-4" />
										</motion.div>
									</Button>
								</motion.div>
							</div>
						</motion.div>
						<motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-xs text-gray-500 mt-2 text-center">
							<span className="text-rose-600">🛈</span> AI dapat membuat kesalahan. Selalu konsultasikan dengan dokter untuk masalah kesehatan serius.
						</motion.p>
					</form>
				</motion.div>
			) : (
				<div className="bg-gray-50 border-t border-gray-200 p-6 fixed bottom-0 left-0 md:left-60 right-0 shadow-lg text-center">
					<div className="flex items-center justify-center gap-2 max-w-4xl mx-auto text-gray-600">
						<Lock className="h-4 w-4" />
						<p className="text-sm">Program sedang tidak aktif. Anda tidak dapat mengirim pesan baru di diskusi ini.</p>
					</div>
				</div>
			)}
		</div>
	);
};

export default ChatArea;
