/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Target, CheckCircle2, Sparkles, Trophy, Pause, Trash2, Loader2, Award, XCircle, Calendar, Clock, Flag, Info, Star, BookOpen, Coffee, Flame, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/provider/AuthProvider';
import { deleteProgram, getGraduationDetails, getProgramDetails, updateCompletionMissions, updateProgramStatus } from '@/hooks/api/program';
import { fetchDashboard } from '@/hooks/api/dashboard';
import { toast } from 'sonner';
import WarningCard from '@/components/fragments/warning-card';
import { useNavigate, useParams } from 'react-router-dom';
import { GraduationDialogContent } from '@/components/fragments/graduation-report';
import confetti from 'canvas-confetti';
import { DiscussionHub } from '@/components/fragments/discussion-hub';

// --- TYPE DEFINITIONS (ENHANCED) ---
interface ProgramData {
	slug: string;
	title: string;
	description: string;
	status: 'active' | 'completed' | 'paused';
	streak: number; // NEW: For gamification
	overall_progress: {
		current_week_number: number;
		overall_completion_percentage: number;
		days_remaining: number;
	};
	weeks: any[];
	threads: any[];
}

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

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
			delayChildren: 0.2,
		},
	},
};

const itemVariants: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { type: 'spring', stiffness: 100 },
	},
};

// --- DATE HELPER FUNCTIONS ---
const convertAPIDateToISO = (dateString: string): string => {
	if (!dateString) return '';
	const cleanDateString = dateString.replace(/(\d+)(st|nd|rd|th)/, '$1');
	const date = new Date(cleanDateString);
	if (isNaN(date.getTime())) return '';
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};

const getTodayISO = (): string => {
	const today = new Date();
	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, '0');
	const day = String(today.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};

// --- HELPER & SKELETON COMPONENTS ---
const Skeleton = ({ className }: { className?: string }) => <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} />;

const ProgramHeroSkeleton = () => (
	<div className="relative bg-white rounded-3xl p-6 md:p-8 shadow-lg border border-slate-200/80">
		<div className="flex flex-col md:flex-row items-center justify-between gap-8">
			<div className="flex-1 w-full space-y-4">
				<Skeleton className="h-8 w-1/3" />
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-6 w-4/5" />
			</div>
			<div className="flex-shrink-0">
				<Skeleton className="w-[100px] h-[100px] md:w-[120px] md:h-[120px] rounded-full" />
			</div>
		</div>
		<div className="mt-8 pt-6 border-t border-slate-200/80 flex flex-wrap gap-4">
			<Skeleton className="h-16 w-full sm:w-40 rounded-lg sm:rounded-full" />
			<Skeleton className="h-16 w-full sm:w-32 rounded-lg sm:rounded-full" />
			<Skeleton className="h-16 w-full sm:w-36 rounded-lg sm:rounded-full" />
		</div>
	</div>
);

const MissionCardSkeleton = () => (
	<Card className="shadow-lg rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200/80">
		<CardHeader>
			<Skeleton className="h-8 w-1/2" />
			<Skeleton className="h-5 w-3/4 mt-2" />
		</CardHeader>
		<CardContent className="space-y-4">
			{[...Array(2)].map((_, i) => (
				<div key={i} className="flex flex-col sm:flex-row items-start gap-4 p-4">
					<Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
					<div className="flex-1 w-full space-y-2">
						<Skeleton className="h-6 w-3/4" />
						<Skeleton className="h-4 w-full" />
					</div>
					<Skeleton className="w-14 h-14 rounded-full self-end sm:self-center" />
				</div>
			))}
		</CardContent>
	</Card>
);

const DailyGreeting = ({ userName }: { userName: string }) => {
	const [greeting, setGreeting] = useState('');
	const quotes = useMemo(
		() => [
			'Setiap langkah kecil adalah kemajuan. Teruslah bergerak.',
			'Kesehatan adalah investasi terbaik yang bisa Anda buat.',
			'Hari ini adalah kesempatan baru untuk menjadi versi terbaik dari diri Anda.',
			'Jangan meremehkan kekuatan konsistensi.',
			'Percayalah pada prosesnya. Anda lebih kuat dari yang Anda kira.',
		],
		[]
	);
	const [quote, setQuote] = useState('');

	useEffect(() => {
		const hour = new Date().getHours();
		if (hour < 11) setGreeting('Selamat Pagi');
		else if (hour < 15) setGreeting('Selamat Siang');
		else if (hour < 19) setGreeting('Selamat Sore');
		else setGreeting('Selamat Malam');

		setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
	}, [quotes]);

	return (
		<div className="p-4 mb-4 shadow-xl rounded-md bg-gradient-to-br from-red-400 via-pink-500 to-red-600 text-white">
			<h3 className="font-bold text-lg text-white">
				{greeting}, {userName}!
			</h3>
			<p className="text-sm text-white italic mt-1">"{quote}"</p>
		</div>
	);
};

const RadialProgress = ({ value, size = 120, strokeWidth = 10 }: { value: number; size?: number; strokeWidth?: number }) => {
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference - (value / 100) * circumference;

	return (
		<div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
			<svg width={size} height={size} className="transform -rotate-90">
				<circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" className="text-slate-200" />
				<motion.circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke="currentColor"
					strokeWidth={strokeWidth}
					fill="transparent"
					strokeDasharray={circumference}
					strokeDashoffset={offset}
					className="text-rose-500"
					strokeLinecap="round"
					initial={{ strokeDashoffset: circumference }}
					animate={{ strokeDashoffset: offset }}
					transition={{ duration: 1.5, ease: 'circOut' }}
				/>
			</svg>
			<motion.span className="absolute text-2xl md:text-3xl font-bold text-slate-800" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.5 }}>
				{Math.round(value)}
				<span className="text-base md:text-lg text-slate-500">%</span>
			</motion.span>
		</div>
	);
};

const StatPill = ({ icon: Icon, label, value, colorClass = 'text-slate-700' }: { icon: React.ElementType; label: string; value: string | number; colorClass?: string }) => (
	<div className="flex w-full sm:w-auto items-center gap-3 p-3 bg-slate-100/80 rounded-xl sm:rounded-full">
		<div className={`p-2 bg-white rounded-full shadow-sm`}>
			<Icon className={`w-5 h-5 ${colorClass}`} />
		</div>
		<div>
			<p className="text-sm font-medium text-slate-500">{label}</p>
			<p className="text-base font-bold text-slate-800">{value}</p>
		</div>
	</div>
);

const WeeklyReflectionCard = ({ weekData }: { weekData: any }) => {
	const reflection = useMemo(() => {
		// Jika tidak ada data minggu atau tidak ada array tugas, atau array tugasnya kosong
		if (!weekData || !weekData.tasks || weekData.tasks.length === 0) {
			return { hasTasks: false }; // Kembalikan objek yang menandakan tidak ada tugas
		}

		// Jika ada tugas, lanjutkan kalkulasi seperti biasa
		const totalMissions = weekData.tasks.length;
		const completedMissions = weekData.tasks.filter((t: any) => t.is_completed).length;
		const completionRate = totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0;
		const missionsByDay = weekData.tasks.reduce((acc: any, task: any) => {
			const date = convertAPIDateToISO(task.task_date);
			if (!acc[date]) acc[date] = { completed: 0, total: 0 };
			if (task.is_completed) acc[date].completed++;
			acc[date].total++;
			return acc;
		}, {});
		let bestDay = 'Tidak ada';
		let maxRate = -1;
		for (const date in missionsByDay) {
			const day = missionsByDay[date];
			const rate = day.total > 0 ? day.completed / day.total : 0;
			if (rate > maxRate) {
				maxRate = rate;
				bestDay = new Date(date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long' });
			}
		}
		return { hasTasks: true, completionRate, bestDay, completedMissions, totalMissions };
	}, [weekData]);

	// Komponen sekarang tidak pernah mengembalikan null, jadi tidak akan ada celah kosong
	return (
		<motion.div variants={itemVariants} className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
			<div className="flex items-center gap-3">
				<BarChart2 className="w-6 h-6 text-blue-600 flex-shrink-0" />
				<div>
					<h4 className="text-lg font-bold text-blue-900">Refleksi Minggu Ini</h4>
					{/* Tampilkan konten berdasarkan apakah ada tugas atau tidak */}
					{reflection.hasTasks ? (
						<p className="mt-1 text-sm text-blue-800">
							Anda menyelesaikan{' '}
							<strong>
								{reflection.completedMissions} dari {reflection.totalMissions} misi
							</strong>{' '}
							({reflection.completionRate}%). Hari terbaik Anda adalah <strong>{reflection.bestDay}</strong>. Terus pertahankan momentumnya!
						</p>
					) : (
						<p className="mt-1 text-sm text-blue-700 italic">Tidak ada misi yang tercatat untuk minggu ini.</p>
					)}
				</div>
			</div>
		</motion.div>
	);
};

const ProgramHero = ({ program, onAction }: { program: ProgramData; onAction: (action: 'pause' | 'resume' | 'delete') => void }) => {
	const { title, status, overall_progress, streak } = program;
	const isPaused = status === 'paused';

	const getStatusInfo = () => {
		switch (status) {
			case 'active':
				return { label: 'Program Aktif', color: 'bg-green-500', icon: <Flag className="w-4 h-4" /> };
			case 'paused':
				return { label: 'Program Dijeda', color: 'bg-yellow-500', icon: <Pause className="w-4 h-4" /> };
			case 'completed':
				return { label: 'Program Selesai!', color: 'bg-sky-500', icon: <Trophy className="w-4 h-4" /> };
			default:
				return { label: 'Status Tidak Diketahui', color: 'bg-slate-500', icon: <Info className="w-4 h-4" /> };
		}
	};
	const statusInfo = getStatusInfo();

	return (
		<motion.div variants={itemVariants} className="relative bg-gradient-to-br from-white to-slate-50 rounded-3xl p-6 md:p-8 shadow-lg border border-slate-200/80 overflow-hidden">
			<div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8">
				<div className="flex-1 space-y-4 text-center md:text-left">
					<div className="flex justify-center md:justify-start">
						<Badge className={`flex items-center gap-2 text-white ${statusInfo.color} pl-2 pr-3 py-1.5 rounded-full text-sm`}>
							{statusInfo.icon}
							{statusInfo.label}
						</Badge>
					</div>
					<h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">{title}</h1>
					<p className="text-slate-600 max-w-xl mx-auto md:mx-0">{program.description}</p>
				</div>
				<div className="flex-shrink-0">
					<RadialProgress value={overall_progress.overall_completion_percentage} size={100} strokeWidth={8} />
				</div>
			</div>
			<div className="mt-8 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row sm:flex-wrap justify-center md:justify-start gap-4">
				<StatPill icon={Calendar} label="Minggu Berjalan" value={`${overall_progress.current_week_number} / ${program.weeks.length}`} colorClass="text-rose-500" />
				<StatPill icon={Clock} label="Sisa Hari" value={overall_progress.days_remaining} colorClass="text-blue-500" />
				<StatPill icon={Flame} label="Streak" value={`${streak} Hari`} colorClass="text-orange-500" />
				{status !== 'completed' && (
					<div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
						<Dialog>
							<DialogTrigger asChild>
								<Button variant="outline" className="flex-1 sm:flex-none sm:rounded-full sm:w-10 sm:h-10 sm:p-0">
									{isPaused ? <Sparkles className="w-4 h-4 text-green-500" /> : <Pause className="w-4 h-4" />}
									<span className="sm:hidden ml-2">{isPaused ? 'Lanjutkan Program' : 'Jeda Program'}</span>
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>{isPaused ? 'Lanjutkan Program?' : 'Jeda Program?'}</DialogTitle>
									<DialogDescription>{isPaused ? 'Siap untuk kembali ke jalur? Lanjutkan program Anda dari progres terakhir.' : 'Perlu istirahat? Anda dapat menjeda program dan melanjutkannya nanti kapan saja.'}</DialogDescription>
								</DialogHeader>
								<DialogFooter>
									<DialogClose asChild>
										<Button variant="ghost">Batal</Button>
									</DialogClose>
									<Button onClick={() => onAction(isPaused ? 'resume' : 'pause')} className={isPaused ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-500 hover:bg-yellow-600'}>
										Ya, {isPaused ? 'Lanjutkan' : 'Jeda'}
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
						<Dialog>
							<DialogTrigger asChild>
								<Button variant="destructive" className="flex-1 sm:flex-none sm:rounded-full sm:w-10 sm:h-10 sm:p-0 hover:bg-red-700">
									<Trash2 className="w-4 h-4" />
									<span className="sm:hidden ml-2">Batalkan Program</span>
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Batalkan Program Ini?</DialogTitle>
									<DialogDescription>Tindakan ini tidak dapat diurungkan. Semua progres Anda akan dihapus secara permanen. Anda yakin?</DialogDescription>
								</DialogHeader>
								<DialogFooter>
									<DialogClose asChild>
										<Button variant="ghost">Jangan Batalkan</Button>
									</DialogClose>
									<Button variant="destructive" onClick={() => onAction('delete')}>
										Ya, Batalkan Program
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>
				)}
			</div>
		</motion.div>
	);
};

// --- RESPONSIVE MissionItem COMPONENT (UPDATED) ---
const MissionItem = ({ mission, onComplete, isReadOnly, isMissed, isGlowing }: { mission: any; onComplete: (id: string, currentState: boolean) => void; isReadOnly: boolean; isMissed: boolean; isGlowing: boolean }) => {
	const { id, title, description, is_completed, task_type } = mission;
	const isMainMission = task_type === 'main_mission';

	const statusStyles = {
		completed: { icon: <CheckCircle2 className="w-6 h-6 text-white" />, bgColor: 'bg-green-50', borderColor: 'border-green-200', buttonColor: 'bg-green-500 border-green-600', titleClass: 'line-through text-slate-400' },
		missed: { icon: <XCircle className="w-6 h-6 text-red-500" />, bgColor: 'bg-red-50', borderColor: 'border-red-200', buttonColor: 'bg-red-200 border-red-300', titleClass: 'line-through text-slate-400' },
		active: {
			icon: isMainMission ? <Target className="w-6 h-6 text-rose-500" /> : <Star className="w-6 h-6 text-amber-500" />,
			bgColor: 'bg-white',
			borderColor: 'border-slate-200',
			buttonColor: 'bg-white border-slate-300 hover:border-green-400',
			titleClass: 'text-slate-900',
		},
	};

	const currentStatus = is_completed ? 'completed' : isMissed ? 'missed' : 'active';
	const styles = statusStyles[currentStatus];

	return (
		<motion.div
			layout
			variants={itemVariants}
			initial="hidden"
			animate="visible"
			exit={{ opacity: 0, scale: 0.8 }}
			className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${styles.bgColor} ${styles.borderColor} ${isGlowing ? 'shadow-lg shadow-green-500/30' : ''}`}
		>
			<div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${isMainMission ? 'bg-rose-100' : 'bg-amber-100'}`}>{styles.icon}</div>
			<div className="flex-1 min-w-0">
				<h4 className={`font-semibold text-base ${styles.titleClass}`}>{title}</h4>
				<p className="text-sm text-slate-500 mt-1">{description}</p>
			</div>
			<div className="flex items-center gap-4 self-end sm:self-center">
				<Badge variant={isMainMission ? 'destructive' : 'default'} className={`capitalize text-xs hidden sm:flex ${isMainMission ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
					{isMainMission ? 'Misi Utama' : 'Bonus'}
				</Badge>
				<motion.button
					onClick={() => onComplete(id, is_completed)}
					disabled={isReadOnly || isMissed}
					className={`flex-shrink-0 w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${styles.buttonColor} ${isReadOnly || isMissed ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
					whileHover={isReadOnly || isMissed ? {} : { scale: 1.1, rotate: is_completed ? -10 : 10 }}
					whileTap={isReadOnly || isMissed ? {} : { scale: 0.9 }}
				>
					{is_completed && <CheckCircle2 className="w-8 h-8 text-white" />}
				</motion.button>
			</div>
		</motion.div>
	);
};

const InteractiveWeeklyTimeline = ({ weeks, currentWeek, completedWeeks, onWeekSelect, selectedWeek }: { weeks: any[]; currentWeek: number; completedWeeks: number[]; onWeekSelect: (week: number) => void; selectedWeek: number }) => {
	const selectedWeekRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		selectedWeekRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
	}, [selectedWeek]);

	return (
		<motion.div variants={itemVariants}>
			<Card className="shadow-lg rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200/80">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calendar className="w-5 h-5 text-rose-500" />
						Jelajah Mingguan
					</CardTitle>
					<CardDescription>Pilih minggu untuk melihat fokus dan misi.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-2 overflow-x-auto pb-4 -mb-4 pt-2">
						{weeks.map(({ week_number }) => {
							const isCompleted = completedWeeks.includes(week_number);
							const isCurrent = week_number == currentWeek;
							const isSelected = week_number == selectedWeek;

							return (
								<motion.button
									key={week_number}
									ref={isSelected ? selectedWeekRef : null}
									onClick={() => onWeekSelect(Number(week_number))}
									className={`relative flex-shrink-0 w-20 h-24 flex flex-col items-center justify-center rounded-xl border-2 transition-all duration-300
                    ${
											isSelected
												? 'bg-gradient-to-br from-red-400 via-pink-500 to-red-600 text-white shadow-lg'
												: isCurrent
												? 'bg-gradient-to-br from-red-100 via-pink-100 to-red-200 border-red-300 text-red-800'
												: isCompleted
												? 'bg-green-100 border-green-300 text-green-800'
												: 'bg-slate-100 border-slate-200 text-slate-600 hover:border-slate-400'
										}`}
									whileHover={{ y: -5 }}
								>
									<span className="text-xs font-medium">{isCurrent ? 'Kini' : `Minggu`}</span>
									<span className="text-3xl font-bold">{week_number}</span>
									{isCompleted && !isSelected && <div className="absolute top-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>}
								</motion.button>
							);
						})}
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
};

const GraduationCelebration = ({ details, onOpenReport }: { details: GraduationDetails; onOpenReport: () => void }) => {
	useEffect(() => {
		confetti({
			particleCount: 150,
			spread: 90,
			origin: { y: 0.6 },
			zIndex: 1000,
		});
	}, []);

	return (
		<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-gradient-to-br from-sky-100 via-rose-50 to-amber-100 z-50 flex items-center justify-center p-4">
			<div className="text-center space-y-6 max-w-2xl">
				<motion.div initial={{ scale: 0 }} animate={{ scale: 1, transition: { type: 'spring', delay: 0.2 } }}>
					<Trophy className="w-24 h-24 mx-auto text-amber-400" />
				</motion.div>
				<motion.h1
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1, transition: { delay: 0.4 } }}
					className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-sky-500 to-amber-500"
				>
					Selamat, {details.user_name}!
				</motion.h1>
				<motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1, transition: { delay: 0.6 } }} className="text-lg text-slate-600">
					Anda telah berhasil menyelesaikan program <strong>{details.program_name}</strong> dan meraih gelar <strong>{details.champion_title}</strong>. Perjalanan Anda luar biasa!
				</motion.p>
				<motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1, transition: { delay: 0.8 } }}>
					<Button size="lg" className="bg-gradient-to-br from-red-400 via-pink-500 to-red-600 hover:from-red-500 hover:via-pink-600 hover:to-red-700 h-14 text-lg rounded-full shadow-lg" onClick={onOpenReport}>
						<Award className="w-6 h-6 mr-3" />
						Lihat Laporan Kelulusan
					</Button>
				</motion.div>
			</div>
		</motion.div>
	);
};

// --- MAIN COMPONENT (FINAL VERSION) ---
export default function ProgramDashboardRevamped() {
	const auth = useAuth();
	const token = auth?.token;
	const [isLoading, setIsLoading] = useState(true);
	const [programData, setProgramData] = useState<ProgramData | null>(null);
	const [graduationDetails, setGraduationDetails] = useState<GraduationDetails | null>(null);
	const [selectedWeek, setSelectedWeek] = useState<number | undefined>(undefined);
	const [showGraduationReport, setShowGraduationReport] = useState(false);
	const [glowingMissionId, setGlowingMissionId] = useState<string | null>(null);

	const params = useParams<{ slug: string }>();
	const navigate = useNavigate();

	useEffect(() => {
		const loadProgramDetails = async () => {
			if (!token) {
				setIsLoading(false);
				return;
			}
			setIsLoading(true);
			try {
				let slugToFetch = params.slug;
				if (!slugToFetch) {
					const programOverview = await fetchDashboard(token).then((data) => data.data?.program_overview);
					if (programOverview?.is_active && programOverview.slug) {
						slugToFetch = programOverview.slug;
					} else {
						throw new Error('No active program found.');
					}
				}

				if (!slugToFetch) {
					throw new Error('No active program slug could be determined.');
				}

				const response = await getProgramDetails(slugToFetch, token);
				if (response && response.data) {
					const dataWithStreak = { ...response.data, streak: response.data.streak || 0 };
					setProgramData(dataWithStreak);
					setSelectedWeek(response.data.overall_progress.current_week_number);
					if (response.data.status === 'completed') {
						const graduationResponse = await getGraduationDetails(token, response.data.slug);
						setGraduationDetails(graduationResponse.data);
					}
				} else {
					throw new Error('Failed to fetch program details.');
				}
			} catch (error) {
				console.error('Gagal mengambil data program:', error);
				setProgramData(null);
			} finally {
				setIsLoading(false);
			}
		};
		loadProgramDetails();
	}, [token, params.slug, navigate]);

	const { currentWeekData, completedWeeks, isReadOnly, todayISO, groupedTasks } = useMemo(() => {
		if (!programData) return { isReadOnly: true, completedWeeks: [], groupedTasks: {}, todayISO: '', currentWeekData: null };
		const currentWeekData = programData.weeks.find((week) => Number(week.week_number) == selectedWeek);
		const completedWeeks = programData.weeks.filter((week) => week.status === 'completed' || week.completion_percentage == 100).map((week) => week.week_number);
		const isProgramInactive = programData.status !== 'active';
		const isReadOnly = isProgramInactive || (selectedWeek ?? 0) < programData.overall_progress.current_week_number;
		const todayISO = getTodayISO();
		const groupedTasks =
			currentWeekData?.tasks?.reduce((acc: any, task: any) => {
				const isoDate = convertAPIDateToISO(task.task_date);
				if (!isoDate) return acc;
				if (!acc[isoDate]) acc[isoDate] = [];
				acc[isoDate].push(task);
				return acc;
			}, {}) || {};
		return { currentWeekData, completedWeeks, isReadOnly, todayISO, groupedTasks };
	}, [programData, selectedWeek]);

	const handleMissionComplete = async (id: string, currentState: boolean) => {
		if (isReadOnly || !programData || !token) return;

		const newStatus = !currentState;

		if (newStatus) {
			confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
			setGlowingMissionId(id);
			setTimeout(() => setGlowingMissionId(null), 2000);
		}

		const originalProgramData = programData;

		setProgramData((prevData) => {
			if (!prevData) return null;

			const updatedWeeks = prevData.weeks.map((week) => {
				if (Number(week.week_number) !== selectedWeek) return week;

				const updatedTasks = week.tasks.map((task: any) => (task.id == id ? { ...task, is_completed: newStatus } : task));

				const completedTasksInWeek = updatedTasks.filter((t: any) => t.is_completed).length;
				const totalTasksInWeek = updatedTasks.length;
				const completion_percentage = totalTasksInWeek > 0 ? Math.round((completedTasksInWeek / totalTasksInWeek) * 100) : 0;

				return { ...week, tasks: updatedTasks, completion_percentage };
			});

			const overallCompletedTasks = updatedWeeks.reduce((acc: number, week: any) => acc + week.tasks.filter((t: any) => t.is_completed).length, 0);
			const overallTotalTasks = updatedWeeks.reduce((acc: number, week: any) => acc + week.tasks.length, 0);
			const overall_completion_percentage = overallTotalTasks > 0 ? Math.round((overallCompletedTasks / overallTotalTasks) * 100) : 0;

			return {
				...prevData,
				weeks: updatedWeeks,
				overall_progress: {
					...prevData.overall_progress,
					overall_completion_percentage,
				},
			};
		});

		try {
			await updateCompletionMissions(token, id);
			toast.success(newStatus ? 'Misi berhasil diselesaikan! Kerja bagus!' : 'Misi ditandai belum selesai.');
		} catch (error) {
			setProgramData(originalProgramData);
			toast.error('Gagal memperbarui misi. Silakan coba lagi.');
			console.error(error);
		}
	};

	const handleProgramAction = async (action: 'pause' | 'resume' | 'delete') => {
		if (!token || !programData) return;
		const slug = programData.slug;
		const actionMap = {
			pause: { api: updateProgramStatus, success: 'Program berhasil dijeda.', loading: 'Menjeda...' },
			resume: { api: updateProgramStatus, success: 'Program berhasil dilanjutkan!', loading: 'Melanjutkan...' },
			delete: { api: deleteProgram, success: 'Program berhasil dibatalkan.', loading: 'Membatalkan...' },
		};
		const currentAction = actionMap[action];
		const toastId = toast.loading(currentAction.loading);
		try {
			await currentAction.api(token, slug);
			toast.success(currentAction.success, { id: toastId });
			if (action === 'delete') {
				navigate('/dashboard/history');
			} else {
				const response = await getProgramDetails(slug, token);
				setProgramData(response.data);
			}
		} catch (error) {
			toast.error(`Gagal ${action} program.`, { id: toastId });
			console.error(error);
		}
	};

	const handleEditThreadTitle = (threadId: string, newTitle: string) => {
		console.log(`TODO: Edit thread ${threadId} menjadi "${newTitle}"`);
		toast.info('Fitur edit judul diskusi belum diimplementasikan.');
	};

	const handleDeleteThread = (threadId: string) => {
		console.log(`TODO: Hapus thread ${threadId}`);
		toast.info('Fitur hapus diskusi belum diimplementasikan.');
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-slate-50 font-sans">
				<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
					<div className="space-y-8">
						<ProgramHeroSkeleton />
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
							<div className="lg:col-span-2 space-y-6">
								<MissionCardSkeleton />
							</div>
							<div className="lg:col-span-1 space-y-8">
								<Skeleton className="h-48 w-full rounded-2xl" />
								<Skeleton className="h-32 w-full rounded-2xl" />
							</div>
						</div>
					</div>
				</main>
			</div>
		);
	}

	if (!programData) {
		return <WarningCard title="Tidak Ada Program Aktif" description="Sepertinya Anda belum memulai program. Mulai perjalanan Anda dari halaman riwayat analisis." btnText="Ke Riwayat Analisis" btnHref="/dashboard/history" />;
	}

	if (programData.status === 'completed' && graduationDetails) {
		return (
			<>
				<GraduationCelebration details={graduationDetails} onOpenReport={() => setShowGraduationReport(true)} />
				<Dialog open={showGraduationReport} onOpenChange={setShowGraduationReport}>
					<DialogContent className="max-w-4xl w-full p-0">
						<GraduationDialogContent details={graduationDetails} />
					</DialogContent>
				</Dialog>
			</>
		);
	}

	const todayTasks = groupedTasks?.[todayISO] || [];
	const isRestDay = todayTasks.length == 0 && programData.status === 'active' && !((selectedWeek || 0) < programData.overall_progress.current_week_number);
	const isPastWeek = (selectedWeek || 0) < programData.overall_progress.current_week_number;
	const userName = auth?.user?.first_name?.split(' ')[0] || 'Pejuang';

	return (
		<div className="min-h-screen bg-slate-50 font-sans">
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
				<motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
					<ProgramHero program={programData} onAction={handleProgramAction} />
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
						<motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
							<motion.div variants={itemVariants}>
								<Card className="shadow-lg rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200/80">
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Target className="w-5 h-5 text-rose-500" />
											Fokus Minggu #{selectedWeek}
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-3">
										<h3 className="font-bold text-slate-800">{currentWeekData?.title || 'Memuat...'}</h3>
										<p className="text-slate-600 text-sm mb-3">{currentWeekData?.description || 'Deskripsi untuk minggu ini akan segera ditampilkan.'}</p>
										{currentWeekData && (
											<div>
												<div className="flex justify-between text-sm mb-1">
													<span className="text-slate-500 font-medium">Progres Minggu Ini</span>
													<span className="font-bold text-slate-700">{currentWeekData?.completion_percentage || 0}%</span>
												</div>
												<Progress value={currentWeekData?.completion_percentage || 0} className="h-2.5" />
											</div>
										)}
									</CardContent>
								</Card>
							</motion.div>
							<Card className="shadow-lg rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200/80">
								<CardHeader className="mb-2">
									<CardTitle className="flex items-center gap-3 text-2xl font-bold">
										<Flag className="w-7 h-7 text-rose-500" />
										{isPastWeek ? `Tinjauan Misi Minggu #${selectedWeek}` : `Misi Hari Ini`}
									</CardTitle>
									<CardDescription>{isPastWeek ? 'Refleksi perjalanan Anda untuk pembelajaran di masa depan.' : 'Fokus pada langkah kecil hari ini untuk hasil besar nanti.'}</CardDescription>
								</CardHeader>
								<CardContent>
									<AnimatePresence mode="wait">
										{isPastWeek ? (
											<motion.div key="past-week" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
												<WeeklyReflectionCard weekData={currentWeekData} />
												{Object.keys(groupedTasks).length > 0 ? (
													Object.entries(groupedTasks)
														.sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
														.map(([date, missions]) => (
															<div key={date} className="mb-6">
																<h4 className="font-semibold text-slate-600 pb-2 mb-4 border-b">{new Date(date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</h4>
																<div className="space-y-4">
																	{(missions as any[]).map((mission: any) => (
																		<MissionItem key={mission.id} mission={mission} onComplete={() => {}} isReadOnly={true} isMissed={!mission.is_completed} isGlowing={false} />
																	))}
																</div>
															</div>
														))
												) : (
													<div className="text-center py-12">
														<BookOpen className="mx-auto w-12 h-12 text-slate-400 mb-4" />
														<h3 className="text-xl font-bold text-slate-700">Belum Ada Misi</h3>
														<p className="mt-2">Tidak ada misi yang dijadwalkan untuk minggu ini.</p>
													</div>
												)}
											</motion.div>
										) : (
											<motion.div key="current-week" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
												<DailyGreeting userName={userName} />
												{isRestDay ? (
													<div className="text-center py-12 px-4 border-2 border-dashed rounded-xl bg-sky-50 text-sky-700">
														<Coffee className="mx-auto w-12 h-12 text-sky-400 mb-4" />
														<h3 className="text-xl font-bold text-sky-800">Waktunya Bersantai!</h3>
														<p className="mt-2">Tidak ada misi terjadwal untuk saat ini. Nikmati waktu istirahat Anda.</p>
													</div>
												) : (
													<div className="space-y-4">
														{todayTasks.length > 0 ? (
															todayTasks.map((mission: any) => {
																const missionISO = convertAPIDateToISO(mission.task_date);
																const isMissed = missionISO < todayISO && !mission.is_completed;
																return <MissionItem key={mission.id} mission={mission} onComplete={handleMissionComplete} isReadOnly={isReadOnly} isMissed={isMissed} isGlowing={glowingMissionId == mission.id} />;
															})
														) : (
															<div className="text-center py-12">
																<Loader2 className="mx-auto w-12 h-12 text-slate-400 mb-4 animate-spin" />
																<h3 className="text-xl font-bold text-slate-700">Memuat Misi...</h3>
																<p className="mt-2">Misi untuk minggu ini sedang disiapkan.</p>
															</div>
														)}
													</div>
												)}
											</motion.div>
										)}
									</AnimatePresence>
								</CardContent>
							</Card>
						</motion.div>
						<div className="lg:col-span-1 space-y-8 lg:sticky lg:top-8">
							<InteractiveWeeklyTimeline
								weeks={programData.weeks}
								currentWeek={programData.overall_progress.current_week_number}
								completedWeeks={completedWeeks || []}
								onWeekSelect={(week) => setSelectedWeek(week)}
								selectedWeek={selectedWeek || 0}
							/>
							<DiscussionHub programSlug={programData.slug} discussions={programData.threads} isReadOnly={isReadOnly} onEditTitle={handleEditThreadTitle} onDeleteThread={handleDeleteThread} />{' '}
						</div>
					</div>
				</motion.div>
			</main>
		</div>
	);
}
