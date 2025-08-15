import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Flame, CheckCircle, Trophy, Sparkles, BarChart, Download, Share2 } from 'lucide-react';
import Confetti from 'react-confetti';

interface GraduationDetails {
	stats: { total_days: number; best_streak: string; achieved_days: number; main_missions: string; bonus_challenges: string };
	narrative: { final_quote: string; certificate_title: string; summary_of_journey: string; greatest_achievement: string };
	user_name: string;
	program_name: string;
	champion_title: string;
	program_period: string;
}

export const GraduationPage = ({ details }: { details: GraduationDetails | null }) => {
	if (!details) {
		return (
			<div className="flex items-center justify-center h-screen bg-slate-100">
				<p>Memuat laporan kelulusan Anda...</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 p-4 md:p-8">
			<Confetti recycle={false} numberOfPieces={300} tweenDuration={20000} />
			<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: 'easeInOut' }} className="max-w-5xl mx-auto">
				<header className="text-center space-y-4 py-8">
					<div className="inline-block p-4 bg-white rounded-full shadow-lg">
						<Trophy className="h-12 w-12 text-amber-500" />
					</div>
					<h1 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight">{details.narrative.certificate_title}</h1>
					<p className="text-xl text-slate-600">
						Selamat, <span className="font-semibold text-blue-600">{details.user_name}</span>! Anda telah berhasil menyelesaikan program.
					</p>
				</header>

				<main className="grid md:grid-cols-3 gap-8 mt-8">
					{/* Main Certificate */}
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 0.2, duration: 0.5 }}
						className="md:col-span-2 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-slate-200 text-center flex flex-col items-center justify-center"
					>
						<p className="text-sm font-semibold text-indigo-500 uppercase tracking-widest">{details.champion_title}</p>
						<h2 className="text-3xl font-bold text-slate-800 my-4">{details.program_name}</h2>
						<p className="text-slate-500 mb-6">{details.program_period}</p>
						<div className="my-6 border-t border-b border-slate-200 py-6 w-full">
							<p className="text-lg italic text-slate-700">"{details.narrative.summary_of_journey}"</p>
						</div>
						<p className="text-sm text-slate-500">Pencapaian Terbesar:</p>
						<p className="font-semibold text-slate-800">{details.narrative.greatest_achievement}</p>
						<div className="mt-8">
							<p className="text-lg font-bold text-amber-600">"{details.narrative.final_quote}"</p>
						</div>
					</motion.div>

					{/* Stats Highlights */}
					<div className="space-y-6">
						<StatCard icon={<Flame className="text-red-500" />} title="Runtutan Terbaik" value={details.stats.best_streak} />
						<StatCard icon={<CheckCircle className="text-green-500" />} title="Misi Utama Selesai" value={details.stats.main_missions} />
						<StatCard icon={<Sparkles className="text-yellow-500" />} title="Tantangan Bonus Selesai" value={details.stats.bonus_challenges} />
						<StatCard icon={<BarChart className="text-blue-500" />} title="Hari Aktif Program" value={`${details.stats.achieved_days} / ${details.stats.total_days} Hari`} />
					</div>
				</main>

				<footer className="text-center mt-12">
					<div className="flex justify-center gap-4">
						<Button variant="outline" className="bg-white">
							<Download className="w-4 h-4 mr-2" /> Unduh Laporan
						</Button>
						<Button className="bg-blue-600 hover:bg-blue-700">
							<Share2 className="w-4 h-4 mr-2" /> Bagikan Pencapaian
						</Button>
					</div>
				</footer>
			</motion.div>
		</div>
	);
};

const StatCard = ({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) => (
	<motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="bg-white/80 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-slate-200 flex items-center gap-4">
		<div className="p-3 bg-slate-100 rounded-full">{icon}</div>
		<div>
			<p className="text-sm font-medium text-slate-500">{title}</p>
			<p className="text-xl font-bold text-slate-800">{value}</p>
		</div>
	</motion.div>
);
