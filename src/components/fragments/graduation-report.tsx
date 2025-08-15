// Impor yang ditambahkan
import { useEffect, useRef, useState } from 'react';
// import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Calendar, CalendarDays, CheckCircle, Flame, ShieldCheck, Star } from 'lucide-react';
import Confetti from 'react-confetti';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toPng } from 'html-to-image';
// Tipe data untuk props, sesuai dengan respons API Anda
interface GraduationDetails {
	stats: {
		total_days: number;
		best_streak: string;
		achieved_days: number;
		main_missions: string;
		bonus_challenges: string;
	};
	narrative: {
		final_quote: string;
		certificate_title: string;
		summary_of_journey: string;
		greatest_achievement: string;
	};
	user_name: string;
	program_name: string;
	champion_title: string;
	program_period: string;
}

interface GraduationDialogProps {
	details: GraduationDetails;
}

// Varian animasi untuk kontainer dan item statistik
const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			delayChildren: 0.8,
			staggerChildren: 0.15,
		},
	},
};

const itemVariants = {
	hidden: { y: 20, opacity: 0 },
	visible: {
		y: 0,
		opacity: 1,
		transition: { type: 'spring', stiffness: 100 },
	},
} as const;

export function GraduationDialogContent({ details }: GraduationDialogProps) {
	const [showConfetti, setShowConfetti] = useState(true);

	// --- BARU: State dan Ref untuk fungsionalitas unduh ---
	const certificateRef = useRef<HTMLDivElement>(null);
	const [isDownloading, setIsDownloading] = useState(false);

	const handleDownload = () => {
		if (!certificateRef.current || isDownloading) return;

		const certificateElement = certificateRef.current;
		setIsDownloading(true);

		// Panggil `toPng` secara langsung, bukan `htmlToImage.toPng`
		toPng(certificateElement, {
			quality: 1.0,
			pixelRatio: 3,
			backgroundColor: '#ffffff',
		})
			.then((dataUrl) => {
				const link = document.createElement('a');
				link.download = `sertifikat-${details.user_name}.png`;
				link.href = dataUrl;
				link.click();
			})
			.catch((err) => {
				console.error('Gagal membuat gambar:', err);
				alert('Maaf, terjadi kesalahan saat membuat file sertifikat.');
			})
			.finally(() => {
				setIsDownloading(false);
			});
	};
	// --- AKHIR DARI BLOK BARU ---

	useEffect(() => {
		const timer = setTimeout(() => setShowConfetti(false), 7000);
		return () => clearTimeout(timer);
	}, []);

	return (
		<>
			{showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={500} gravity={0.15} className="!fixed top-0 left-0 z-[100] w-full" />}

			<ScrollArea className="max-h-[85vh] w-full">
				{/* --- MODIFIKASI: Wrapper baru untuk area yang akan diunduh --- */}
				<div ref={certificateRef} className="bg-white">
					<div className="text-center p-4 md:p-6">
						<Card className="border-0 shadow-none bg-transparent">
							<CardContent className="p-0">
								{/* ... Seluruh konten sertifikat dari Header hingga Ringkasan ... */}
								{/* Header Sertifikat */}
								<motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }} className="mb-6">
									<div className="flex justify-center mb-4">
										<div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
											<Medal className="w-10 h-10 text-white" />
										</div>
									</div>
									<h2 className="text-3xl font-bold text-slate-900 mb-2">{details.narrative.certificate_title}</h2>
									<div className="w-20 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto rounded-full"></div>
								</motion.div>

								{/* Isi Sertifikat */}
								<motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }} className="space-y-5">
									<p className="text-md text-slate-700">Sertifikat ini diberikan kepada</p>
									<h3 className="text-2xl font-bold text-slate-900">{details.user_name}</h3>
									<p className="text-md text-slate-700">yang telah berhasil menyelesaikan</p>
									<h4 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">{details.program_name}</h4>
									<div className="flex items-center justify-center gap-2 text-slate-600">
										<Calendar className="w-4 h-4" />
										<span className="text-md">{details.program_period}</span>
									</div>
									<motion.div animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }} className="flex justify-center">
										<Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-md px-4 py-2 rounded-xl shadow-lg border-0">
											<Trophy className="w-4 h-4 mr-2" />
											{details.champion_title}
										</Badge>
									</motion.div>
								</motion.div>

								{/* Bagian Statistik Kunci */}
								<div className="text-left mt-10 pt-6 border-t border-slate-200">
									<h3 className="text-xl font-bold text-slate-800 mb-4 text-center">Statistik Kunci Perjalanan Anda 🚀</h3>
									<motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3 md:gap-4">
										<motion.div variants={itemVariants} className="p-3 bg-green-50 rounded-lg shadow-sm border border-green-200">
											<div className="flex items-center gap-3">
												<CheckCircle className="w-7 h-7 text-green-500" />
												<div>
													<p className="text-xl font-bold text-green-600">{details.stats.achieved_days}</p>
													<p className="text-xs text-slate-500">Hari Aktif</p>
												</div>
											</div>
										</motion.div>
										<motion.div variants={itemVariants} className="p-3 bg-orange-50 rounded-lg shadow-sm border border-orange-200">
											<div className="flex items-center gap-3">
												<Flame className="w-7 h-7 text-orange-500" />
												<div>
													<p className="text-xl font-bold text-orange-600">{details.stats.best_streak}</p>
													<p className="text-xs text-slate-500">Rangkaian Terbaik</p>
												</div>
											</div>
										</motion.div>
										<motion.div variants={itemVariants} className="p-3 bg-rose-50 rounded-lg shadow-sm border border-rose-200">
											<div className="flex items-center gap-3">
												<ShieldCheck className="w-7 h-7 text-rose-500" />
												<div>
													<p className="text-xl font-bold text-rose-600">{details.stats.main_missions}</p>
													<p className="text-xs text-slate-500">Misi Utama</p>
												</div>
											</div>
										</motion.div>
										<motion.div variants={itemVariants} className="p-3 bg-yellow-50 rounded-lg shadow-sm border border-yellow-200">
											<div className="flex items-center gap-3">
												<Star className="w-7 h-7 text-yellow-500" />
												<div>
													<p className="text-xl font-bold text-yellow-600">{details.stats.bonus_challenges}</p>
													<p className="text-xs text-slate-500">Tantangan Bonus</p>
												</div>
											</div>
										</motion.div>
										<motion.div variants={itemVariants} className="col-span-2 p-3 bg-sky-50 rounded-lg shadow-sm border border-sky-200">
											<div className="flex items-center gap-3">
												<CalendarDays className="w-7 h-7 text-sky-500" />
												<div>
													<p className="text-xl font-bold text-sky-600">{details.stats.total_days} Hari</p>
													<p className="text-xs text-slate-500">Total Durasi Program</p>
												</div>
											</div>
										</motion.div>
									</motion.div>
								</div>

								{/* Ringkasan Perjalanan (Narrative) */}
								<div className="text-left mt-8 pt-6 border-t border-slate-200 space-y-5">
									<div>
										<h3 className="font-semibold text-slate-800 mb-2">Ringkasan Perjalanan</h3>
										<p className="text-sm text-slate-600">{details.narrative.summary_of_journey}</p>
									</div>
									<div>
										<h3 className="font-semibold text-slate-800 mb-2">Pencapaian Terbesar</h3>
										<p className="text-sm text-slate-600">{details.narrative.greatest_achievement}</p>
									</div>
									<div>
										<h3 className="font-semibold text-slate-800 mb-2">Pesan Penutup</h3>
										<blockquote className="text-sm italic text-slate-600 border-l-4 border-yellow-400 pl-4">"{details.narrative.final_quote}"</blockquote>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
				{/* --- AKHIR DARI WRAPPER --- */}

				{/* --- BARU: Tombol Unduh dengan state loading --- */}
				<div className="px-6 pb-6 text-center">
					<Button onClick={handleDownload} disabled={isDownloading} className="w-full md:w-auto bg-slate-800 hover:bg-slate-700 text-white cursor-pointer h-[48px]">
						{isDownloading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Mempersiapkan...
							</>
						) : (
							<>
								<Download className="mr-2 h-4 w-4" />
								Unduh Sertifikat Kamu
							</>
						)}
					</Button>
				</div>
				{/* --- AKHIR DARI TOMBOL --- */}
			</ScrollArea>
		</>
	);
}
