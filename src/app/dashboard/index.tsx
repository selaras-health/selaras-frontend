/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { AlertTriangle, ArrowDown, ArrowRight, BarChart, CheckCircle2, GitCompareArrows, HeartPulse, History, Loader2, PieChart, ShieldCheck, Star, TrendingUp, Trophy, XCircle, Zap, X, Award, ArrowUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RiwayatDetailModal } from '@/components/fragments/riwayat-detail-modal';
import { useAuth } from '@/provider/AuthProvider';
import { fetchDashboard } from '@/hooks/api/dashboard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { startNewProgram, updateProgramStatus } from '@/hooks/api/program';
import { toast } from 'sonner';
import type { AnalysisRecord } from '@/types';

// --- TYPE DEFINITIONS (Based on new API structure) ---
type HealthTrend = { direction: string; change_value: number; text: string };
type ProgramProgress = { current_week: number; total_weeks: number; current_day_in_program: number; total_days_in_program: number };
type ProgramOverview = { is_active: boolean; slug: string; title: string; description: string; status: string; start_date: string; end_date: string; progress: ProgramProgress };
type PriorityAction = { rank: number; title: string; target: string; description: string; estimatedImpact: string };
type SuggestedTest = { title: string; description: string };
type ImpactSimulation = { message: string; timeEstimation: string; riskAfterChange: number };
type LatestAssessmentDetails = {
	actionPlan: { priorityLifestyleActions: PriorityAction[]; medicalConsultation: { suggestedTests: SuggestedTest[]; recommendationLevel: { code: string; description: string } }; impactSimulation: ImpactSimulation };
	riskSummary: { riskPercentage: number };
};
type DashboardData = {
	program_overview: ProgramOverview;
	summary: { total_assessments: number; last_assessment_date_human: string; latest_status: { category_code: string; category_title: string; description: string }; health_trend: HealthTrend };
	graph_data_30_days: { labels: Record<string, string>; values: Record<string, number> };
	latest_assessment_details: LatestAssessmentDetails;
	assessment_history: AnalysisRecord[];
};

// --- ANIMATION VARIANTS ---
const pageVariants: Variants = { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0.5, ease: 'easeInOut' } } };
const itemVariants: Variants = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeInOut' } } };

// --- HELPER FUNCTIONS ---
const formatDate = (dateString: string | Date) => new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
const formatRiskPercentage = (value: number | null | undefined): string => (value || 0).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const getRiskStyling = (code?: string) => {
	switch (code) {
		case 'LOW_MODERATE':
			return { color: 'green', icon: <CheckCircle2 className="w-full h-full text-white" />, badge: 'bg-green-100 text-green-800' };
		case 'HIGH':
			return { color: 'yellow', icon: <AlertTriangle className="w-full h-full text-white" />, badge: 'bg-yellow-100 text-yellow-800' };
		case 'VERY_HIGH':
			return { color: 'red', icon: <XCircle className="w-full h-full text-white" />, badge: 'bg-red-100 text-red-800' };
		default:
			return { color: 'slate', icon: <History className="w-full h-full text-white" />, badge: 'bg-slate-100 text-slate-800' };
	}
};

/**
 * HealthyControlDashboard
 * @version 10.0.0
 * @description The ultimate dashboard with an advanced date range selection calendar.
 * This version introduces intuitive range filtering, enhanced UI feedback, and a more powerful
 * data exploration experience.
 */
export default function HealthyControlDashboard() {
	const auth = useAuth();
	const token = auth?.token;
	const navigate = useNavigate();

	// --- STATE MANAGEMENT ---
	const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [activeFilters, setActiveFilters] = useState<string[]>([]);
	const [comparisonMode, setComparisonMode] = useState<{ a: AnalysisRecord | null; b: AnalysisRecord | null }>({ a: null, b: null });
	const [notes, setNotes] = useState<Record<string, string>>({});
	const [selectedRecord, setSelectedRecord] = useState<AnalysisRecord | null>(null);
	const [activeActionTab, setActiveActionTab] = useState<'lifestyle' | 'medical' | 'potential'>('lifestyle');
	const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
	const [showAllHistory, setShowAllHistory] = useState(false);
	const [sortBy, setSortBy] = useState('date-desc');
	const [riskCategoryFilter, setRiskCategoryFilter] = useState('all');

	// Program Action States
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [confirmText, setConfirmText] = useState('');
	const [programDiffModalOpen, setProgramDiffModalOpen] = useState(false);
	const [programDifficulty, setProgramDifficulty] = useState<'Santai & Bertahap' | 'Standar & Konsisten' | 'Intensif & Menantang'>('Standar & Konsisten');
	const [isNewProgramLoading, setIsNewProgramLoading] = useState(false);
	const [programSlug, setProgramSlug] = useState<string | null>(null);
	const [showResumeConfirmModal, setShowResumeConfirmModal] = useState(false);
	console.log(setProgramSlug);

	// --- DATA FETCHING & INITIALIZATION ---
	useEffect(() => {
		const loadData = async () => {
			if (!token) return setIsLoading(false);
			try {
				const responseData = await fetchDashboard(token);
				if (responseData && responseData.data) {
					setDashboardData(responseData.data);
				}
				const savedNotes = localStorage.getItem('analysisNotes');
				if (savedNotes) setNotes(JSON.parse(savedNotes));
			} catch (error) {
				console.error('Gagal mengambil data dasbor:', error);
				toast.error('Gagal memuat data dasbor Anda.');
			} finally {
				setIsLoading(false);
			}
		};
		loadData();
	}, [token]);

	// --- MEMOIZED DATA PROCESSING ---
	const processedData = useMemo(() => {
		if (!dashboardData) return null;
		const { assessment_history, graph_data_30_days } = dashboardData;

		const chartData = Object.keys(graph_data_30_days.labels)
			.map((key) => ({
				isoDate: graph_data_30_days.labels[key],
				date: new Date(graph_data_30_days.labels[key]).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
				Risiko: graph_data_30_days.values[key],
			}))
			.sort((a, b) => new Date(a.isoDate).getTime() - new Date(b.isoDate).getTime());

		const total = assessment_history.length;
		const risks = assessment_history.map((r) => r.risk_percentage);
		const average = total > 0 ? risks.reduce((sum, risk) => sum + risk, 0) / total : 0;
		const highest = total > 0 ? Math.max(...risks) : 0;
		const lowest = total > 0 ? Math.min(...risks) : 0;

		const achievements = [];
		if (total > 0) achievements.push({ icon: Star, title: 'Langkah Pertama' });
		if (total >= 5) achievements.push({ icon: Award, title: 'Konsisten' });
		if (dashboardData.program_overview.status === 'completed') achievements.push({ icon: Trophy, title: 'Pemenang Program' });
		if (lowest < 20) achievements.push({ icon: Zap, title: 'Risiko Rendah' });

		// Filtering Logic
		let baseHistory = assessment_history;
		if (dateRange.start && dateRange.end) {
			const startTime = new Date(dateRange.start).setHours(0, 0, 0, 0);
			const endTime = new Date(dateRange.end).setHours(23, 59, 59, 999);
			baseHistory = assessment_history.filter((record) => {
				const recordTime = new Date(record.date).getTime();
				return recordTime >= startTime && recordTime <= endTime;
			});
		} else if (!showAllHistory) {
			baseHistory = [];
		}

		const filtered = baseHistory.filter((record) => {
			const searchTermLower = searchTerm.toLowerCase();
			const matchesSearch =
				(record.result_details?.riskSummary?.executiveSummary || '').toLowerCase().includes(searchTermLower) ||
				formatDate(record.date).toLowerCase().includes(searchTermLower) ||
				(notes[record.slug] || '').toLowerCase().includes(searchTermLower);
			if (!matchesSearch) return false;

			const matchesRiskCategory = riskCategoryFilter === 'all' || record.result_details?.riskSummary?.riskCategory?.code === riskCategoryFilter;
			if (!matchesRiskCategory) return false;

			if (activeFilters.length === 0) return true;

			const recordIndex = assessment_history.findIndex((h) => h.slug === record.slug);
			const predecessor = assessment_history[recordIndex + 1];

			return activeFilters.every((filter) => {
				if (filter === 'risiko-membaik') return predecessor && record.risk_percentage < predecessor.risk_percentage;
				if (filter === 'risiko-memburuk') return predecessor && record.risk_percentage > predecessor.risk_percentage;
				if (filter === 'program-aktif') return record.program_status === 'active';
				if (filter === 'dengan-catatan') return !!notes[record.slug];
				return true;
			});
		});

		// Sorting Logic
		const sorted = [...filtered].sort((a, b) => {
			switch (sortBy) {
				case 'date-asc':
					return new Date(a.date).getTime() - new Date(b.date).getTime();
				case 'risk-desc':
					return b.risk_percentage - a.risk_percentage;
				case 'risk-asc':
					return a.risk_percentage - b.risk_percentage;
				case 'date-desc':
				default:
					return new Date(b.date).getTime() - new Date(a.date).getTime();
			}
		});

		const riskCategories = [...new Set(assessment_history.map((r) => r.result_details?.riskSummary?.riskCategory?.code).filter(Boolean))];

		return { chartData, achievements, filteredHistory: sorted, average, highest, lowest, riskCategories };
	}, [dashboardData, searchTerm, activeFilters, notes, dateRange, showAllHistory, sortBy, riskCategoryFilter]);

	// --- EVENT HANDLERS ---
	const handleClearFilters = () => {
		setDateRange({ start: null, end: null });
		setShowAllHistory(false);
		setActiveFilters([]);
		setSortBy('date-desc');
		setSearchTerm('');
		setRiskCategoryFilter('all');
	};

	const handleConfirmNewProgram = () => {
		if (confirmText === 'LANGKAH BARU') {
			setShowConfirmModal(false);
			setConfirmText('');
			setProgramDiffModalOpen(true);
		}
	};
	const handleNewProgram = async () => {
		if (!token || !programSlug) return;
		setIsNewProgramLoading(true);
		try {
			await startNewProgram(token, programSlug, programDifficulty);
			toast.success('Program baru berhasil dimulai!');
			setTimeout(() => navigate(`/dashboard/program/`), 1000);
		} catch (err) {
			toast.error('Gagal memulai program baru. Silakan coba lagi.');
		} finally {
			setIsNewProgramLoading(false);
			setProgramDiffModalOpen(false);
		}
	};
	const handleResumeProgram = async () => {
		if (!token || !programSlug) return;
		setIsNewProgramLoading(true);
		try {
			await updateProgramStatus(token, programSlug);
			toast.success('Program berhasil diaktifkan!');
			setTimeout(() => navigate(`/dashboard/program/`), 1000);
		} catch (err) {
			toast.error('Gagal mengaktifkan program. Silakan coba lagi.');
		} finally {
			setIsNewProgramLoading(false);
			setShowResumeConfirmModal(false);
		}
	};

	// --- RENDER LOGIC ---
	if (isLoading)
		return (
			<div className="flex items-center justify-center h-screen bg-slate-100">
				<Loader2 className="animate-spin h-12 w-12 text-rose-500" />
			</div>
		);
	if (!dashboardData || !processedData) return <div className="text-center py-20">Data tidak ditemukan.</div>;

	const { summary, program_overview, latest_assessment_details } = dashboardData;
	const { chartData, achievements, filteredHistory, average, highest, lowest } = processedData;

	const removeArrowsFromText = (text: string) => {
		if (typeof text !== 'string') {
			return text;
		}
		const arrowRegex = /[↑↓←→↖↗↘↙]/g;

		return text.replace(arrowRegex, '').trim();
	};

	return (
		<>
			<style>{`.highlight-animation { animation: highlight 2s ease-out; } @keyframes highlight { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(225, 29, 72, 0.4); } 50% { transform: scale(1.02); box-shadow: 0 0 0 12px rgba(225, 29, 72, 0); } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(225, 29, 72, 0); } }`}</style>
			<div className="min-h-screen bg-slate-100 font-sans">
				<motion.div variants={pageVariants} initial="initial" animate="animate" className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
					<motion.header variants={itemVariants} className="text-center mb-12 space-y-3">
						<h1 className="text-3xl md:text-5xl font-bold text-slate-800 tracking-tight">Selamat Datang, Budi!</h1>
						<p className="text-lg md:text-xl text-slate-500 max-w-3xl mx-auto">Analisis terakhir Anda {summary.last_assessment_date_human}. Ini adalah pusat komando kesehatan Anda.</p>
						<div className="flex justify-center items-center gap-4 pt-2">
							<Badge className={`${getRiskStyling(summary.latest_status.category_code).badge} text-base px-4 py-2`}>{summary.latest_status.category_title}</Badge>
							<span className={`font-semibold flex items-center gap-1 ${summary.health_trend.direction === 'improving' ? 'text-green-600' : 'text-red-600'}`}>
								{summary.health_trend.direction === 'improving' ? <ArrowDown size={18} /> : <ArrowUp size={18} />}
								{removeArrowsFromText(summary.health_trend.text)}
							</span>
						</div>
					</motion.header>

					<div className="flex flex-col lg:grid lg:grid-cols-3 lg:gap-8 items-start">
						<main className="lg:col-span-2 space-y-8 w-full">
							<FocusActionCard details={latest_assessment_details} activeTab={activeActionTab} setActiveTab={setActiveActionTab} />
							<motion.section variants={itemVariants}>
								<Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200/80">
									<CardHeader className="mb-2">
										<CardTitle className="flex items-center gap-2">
											<TrendingUp className="text-rose-500" /> Tren Risiko 30 Hari Terakhir
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="h-[25rem]">
											<TrendChart data={chartData} />
										</div>
									</CardContent>
								</Card>
							</motion.section>

							<ActiveFilterDisplay dateRange={dateRange} showAllHistory={showAllHistory} onClear={handleClearFilters} filteredCount={filteredHistory.length} />
						</main>

						<aside className="w-full mt-8 lg:mt-0 lg:sticky lg:top-5 space-y-8">
							<ProgramCard program={program_overview} />

							<SidebarCard title="Statistik Kamu" icon={<BarChart />}>
								<div className="grid grid-cols-2 gap-4 mb-1">
									<StatCard icon={<BarChart />} title="Total Analisis" value={summary.total_assessments} />
									<StatCard icon={<PieChart />} title="Rata-rata" value={`${formatRiskPercentage(average)}%`} />
									<StatCard icon={<TrendingUp />} title="Tertinggi" value={`${highest.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}%`} color="text-red-500" />
									<StatCard icon={<ShieldCheck />} title="Terendah" value={`${lowest.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}%`} color="text-green-500" />{' '}
								</div>
							</SidebarCard>
							<SidebarCard title="Pencapaian Anda" icon={<Trophy className="text-amber-500" />}>
								<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-4 mt-1">
									{achievements.map((ach) => (
										<div key={ach.title} className="flex flex-col items-center text-center p-3 bg-slate-100/80 rounded-lg transition-transform hover:scale-105">
											<div className="p-2 bg-amber-200 rounded-full mb-2">
												<ach.icon className="w-6 h-6 text-amber-600" />
											</div>
											<p className="font-semibold text-sm text-slate-800">{ach.title}</p>
										</div>
									))}
								</div>
							</SidebarCard>
						</aside>
					</div>
				</motion.div>
				{selectedRecord && <RiwayatDetailModal key={selectedRecord.slug} record={selectedRecord} isOpen={!!selectedRecord} onClose={() => setSelectedRecord(null)} />}
				<ComparisonModal mode={comparisonMode} onClose={() => setComparisonMode({ a: null, b: null })} />
				<ConfirmationDialog
					isOpen={showConfirmModal}
					onClose={() => {
						setShowConfirmModal(false);
						setConfirmText('');
					}}
					title="Konfirmasi Program Baru"
					description="Memulai program baru akan membatalkan program aktif saat ini. Tindakan ini tidak dapat diurungkan. Yakin ingin melanjutkan?"
					confirmTextValue={confirmText}
					onConfirmTextChange={setConfirmText}
					confirmKeyword="LANGKAH BARU"
					onConfirm={handleConfirmNewProgram}
					confirmButtonText="Ya, Mulai Program Baru"
					confirmButtonVariant="destructive"
				/>
				<ConfirmationDialog
					isOpen={showResumeConfirmModal}
					onClose={() => setShowResumeConfirmModal(false)}
					title="Lanjutkan Program Sebelumnya?"
					description="Anda memiliki program yang dijeda. Apakah Anda ingin mengaktifkannya kembali dan melanjutkan dari progres terakhir?"
					onConfirm={handleResumeProgram}
					isLoading={isNewProgramLoading}
					loadingText="Mengaktifkan..."
					confirmButtonText="Ya, Lanjutkan"
					confirmButtonVariant="default"
				/>
				<Dialog open={programDiffModalOpen} onOpenChange={setProgramDiffModalOpen}>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle className="text-xl font-bold text-slate-900">Pilih Tingkat Kesulitan</DialogTitle>
							<DialogDescription>Pilih intensitas yang paling sesuai dengan kondisi dan tujuan kesehatan Anda saat ini.</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<Select value={programDifficulty} onValueChange={(value: any) => setProgramDifficulty(value)}>
								<SelectTrigger className="w-full rounded-md border-slate-300 h-12 text-base">
									<SelectValue placeholder="Pilih Tingkat Kesulitan" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Santai & Bertahap">Santai & Bertahap</SelectItem>
									<SelectItem value="Standar & Konsisten">Standar & Konsisten</SelectItem>
									<SelectItem value="Intensif & Menantang">Intensif & Menantang</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<DialogFooter>
							<Button onClick={() => setProgramDiffModalOpen(false)} variant="outline">
								Batal
							</Button>
							<Button onClick={handleNewProgram} className="bg-rose-600 hover:bg-rose-700 text-white" disabled={isNewProgramLoading}>
								{isNewProgramLoading ? (
									<>
										<Loader2 className="animate-spin h-4 w-4 mr-2" /> Memulai...
									</>
								) : (
									'Mulai Program'
								)}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</>
	);
}

// --- NEW & ENHANCED COMPONENTS ---

const FocusActionCard = ({ details, activeTab, setActiveTab }: { details: LatestAssessmentDetails; activeTab: string; setActiveTab: Function }) => (
	<motion.section variants={itemVariants}>
		<Card className="shadow-xl rounded-2xl bg-gradient-to-br from-red-400 via-pink-500 to-red-600 text-white overflow-hidden">
			<CardHeader className="mb-2">
				<CardTitle>Fokus Anda Saat Ini</CardTitle>
				<CardDescription className="text-rose-100">Rencana aksi yang dipersonalisasi dari analisis terakhir Anda.</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex border-b border-white/20 mb-4">
					<TabButton label="Gaya Hidup" isActive={activeTab === 'lifestyle'} onClick={() => setActiveTab('lifestyle')} />
					<TabButton label="Saran Medis" isActive={activeTab === 'medical'} onClick={() => setActiveTab('medical')} />
					<TabButton label="Potensi Anda" isActive={activeTab === 'potential'} onClick={() => setActiveTab('potential')} />
				</div>
				<AnimatePresence mode="wait">
					<motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
						{activeTab === 'lifestyle' && (
							<ul className="space-y-3">
								{details.actionPlan.priorityLifestyleActions.map((action) => (
									<li key={action.rank} className="flex items-start gap-3">
										<div className="w-6 h-6 flex-shrink-0 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm">{action.rank}</div>
										<div>
											<p className="font-semibold">{action.title}</p>
											<p className="text-sm text-rose-100">{action.description}</p>
										</div>
									</li>
								))}
							</ul>
						)}
						{activeTab === 'medical' && (
							<ul className="space-y-3">
								{details.actionPlan.medicalConsultation.suggestedTests.map((test) => (
									<li key={test.title} className="flex items-start gap-3">
										<CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-rose-200" />
										<div>
											<p className="font-semibold">{test.title}</p>
											<p className="text-sm text-rose-100">{test.description}</p>
										</div>
									</li>
								))}
							</ul>
						)}
						{activeTab === 'potential' && (
							<div className="text-center p-4">
								<p className="text-rose-100 mb-2">{details.actionPlan.impactSimulation.message}</p>
								<div className="flex items-center justify-center gap-4">
									<span className="text-2xl font-bold">{details.riskSummary.riskPercentage}%</span>
									<ArrowRight className="text-rose-200" />
									<span className="text-4xl font-bold text-white">{details.actionPlan.impactSimulation.riskAfterChange}%</span>
								</div>
								<p className="text-sm font-semibold mt-2">Potensi Risiko Baru Anda</p>
							</div>
						)}
					</motion.div>
				</AnimatePresence>
			</CardContent>
		</Card>
	</motion.section>
);

const TabButton = ({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) => (
	<button onClick={onClick} className={`px-4 py-2 text-sm font-semibold transition-all duration-200 rounded-t-md ${isActive ? 'bg-white/20' : 'hover:bg-white/10'}`}>
		{label}
	</button>
);

const ProgramCard = ({ program }: { program: ProgramOverview }) => {
	const { status, progress, slug, is_active } = program;
	const current_day_in_program = progress?.current_day_in_program * -1 || 0;

	const getProgressPercentage = () => {
		if (status === 'completed') {
			return 100;
		}
		if (!is_active) {
			return 0;
		} // Jika tidak ada data progress, total hari 0, ATAU hari saat ini negatif, kembalikan 0.
		if (!progress || !progress.total_days_in_program || current_day_in_program < 0) {
			return 0;
		} // Jika aktif dan data valid, baru hitung progres sebenarnya
		return (current_day_in_program / progress.total_days_in_program) * 100 * 5;
	};

	const progressPercentage = getProgressPercentage();

	return (
		<motion.section variants={itemVariants}>
			<SidebarCard title="Program Anda" icon={<HeartPulse className="text-rose-500" />}>
				<p className="font-semibold text-slate-800">{program.title}</p>
				<div className="flex items-center justify-between text-sm text-slate-500 my-2">
					<span>
						{program.start_date} - {program.end_date}
					</span>
					<Badge className={`${program.status === 'completed' ? 'bg-rose-100 text-rose-800' : 'bg-rose-100 text-rose-800'}`}>{program.status}</Badge>
				</div>
				<div className="w-full bg-slate-200 rounded-full h-2.5">
					<div className="bg-gradient-to-br from-red-400 via-pink-500 to-red-600 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
				</div>
				<Link to={`/dashboard/program/${slug}`} className="w-full md:w-auto">
					<Button className="w-full py-[1.4rem] mt-4 bg-gradient-to-br from-red-400 via-pink-500 to-red-600 hover:from-red-500 hover:via-pink-600 hover:to-red-700">{program.is_active ? 'Lanjutkan Program' : 'Lihat Laporan Program'}</Button>
				</Link>
			</SidebarCard>
		</motion.section>
	);
};

// --- Other components are mostly unchanged but adapted to receive props ---
// (StatCard, FilterChip, TimelineCard, ComparisonModal, ConfirmationDialog etc.)
// These are included below for completeness and to ensure no errors.

const StatCard = ({ icon, title, value, color = 'text-slate-800' }: { icon: React.ReactElement; title: string; value: string | number; color?: string }) => (
	<motion.div whileHover={{ scale: 1.05, y: -2 }} className="bg-white/50 p-4 rounded-xl shadow-sm text-center flex flex-col items-center justify-center gap-1">
		<div className="text-rose-500">{React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'w-5 h-5' })}</div>
		<h3 className="text-xs font-semibold text-slate-500">{title}</h3>
		<p className={`text-2xl font-bold ${color}`}>{value}</p>
	</motion.div>
);

const SidebarCard = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
	<Card className="shadow-lg rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200/80">
		<CardHeader>
			<CardTitle className="flex items-center gap-2">
				{icon} {title}
			</CardTitle>
		</CardHeader>
		<CardContent>{children}</CardContent>
	</Card>
);

const ComparisonModal = ({ mode, onClose }: { mode: { a: AnalysisRecord | null; b: AnalysisRecord | null }; onClose: () => void }) => {
	if (!mode.a || !mode.b) return null;
	const [a, b] = [mode.a, mode.b].sort((x, y) => new Date(x.date).getTime() - new Date(y.date).getTime());
	const riskDiff = b.risk_percentage - a.risk_percentage;
	const isImproving = riskDiff < 0;
	return (
		<Dialog open={true} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
						<GitCompareArrows className="w-6 h-6 text-rose-500" /> Hasil Perbandingan
					</DialogTitle>
					<DialogDescription>Melihat kemajuan Anda dari waktu ke waktu adalah kunci.</DialogDescription>
				</DialogHeader>
				<div className="grid grid-cols-2 gap-6 py-4">
					<ComparisonColumn record={a} />
					<ComparisonColumn record={b} isLatest />
				</div>
				<div className="p-4 bg-slate-100 rounded-lg text-center">
					<p className="text-sm text-slate-600">Perubahan Risiko</p>
					<p className={`text-2xl font-bold ${isImproving ? 'text-green-600' : 'text-red-600'}`}>
						{isImproving ? <ArrowDown className="inline-block w-5 h-5 mr-1" /> : <ArrowUp className="inline-block w-5 h-5 mr-1" />}
						{Math.abs(riskDiff).toFixed(1)}%
					</p>
					<p className="text-sm font-semibold">{isImproving ? 'Sebuah kemajuan yang luar biasa!' : 'Sebuah area untuk diperhatikan.'}</p>
				</div>
				<DialogFooter>
					<Button onClick={onClose}>Tutup</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

const ComparisonColumn = ({ record, isLatest = false }: { record: AnalysisRecord; isLatest?: boolean }) => (
	<div className={`p-4 rounded-lg border-2 ${isLatest ? 'border-rose-500 bg-rose-50' : 'border-slate-200'}`}>
		<p className="font-bold text-lg text-slate-800">{new Date(record.date).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
		<p className="text-sm text-slate-500 mb-4">{isLatest ? 'Terbaru' : 'Sebelumnya'}</p>
		<div className="space-y-2">
			<p className="text-sm">
				Risiko: <span className="font-bold text-xl">{record.risk_percentage.toFixed(1)}%</span>
			</p>
			<p className="text-sm">
				Kategori: <span className="font-semibold">{record.result_details?.riskSummary?.riskCategory?.title}</span>
			</p>
			<p className="text-sm">
				Status Program: <span className="font-semibold">{record.program_status || 'Belum ada'}</span>
			</p>
		</div>
	</div>
);

const ConfirmationDialog = ({ isOpen, onClose, title, description, confirmTextValue, onConfirmTextChange, confirmKeyword, onConfirm, isLoading, loadingText, confirmButtonText, confirmButtonVariant = 'destructive' }: any) => (
	<Dialog open={isOpen} onOpenChange={onClose}>
		<DialogContent className="sm:max-w-md">
			<DialogHeader>
				<DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
					<AlertTriangle className={`w-6 h-6 ${confirmButtonVariant === 'destructive' ? 'text-red-500' : 'text-rose-500'}`} />
					{title}
				</DialogTitle>
				<DialogDescription>{description}</DialogDescription>
			</DialogHeader>
			{confirmKeyword && onConfirmTextChange && (
				<div className="space-y-2 py-4">
					<label className="text-sm font-medium text-slate-700">
						Ketik <span className="font-semibold text-red-600">{confirmKeyword}</span> untuk konfirmasi:
					</label>
					<Input value={confirmTextValue} onChange={(e) => onConfirmTextChange(e.target.value)} placeholder={`Ketik ${confirmKeyword}`} className="rounded-md border-slate-300 focus:border-red-500 focus:ring-red-500 mt-1" />
				</div>
			)}
			<DialogFooter className="pt-4">
				<Button variant="outline" onClick={onClose}>
					Batal
				</Button>
				<Button onClick={onConfirm} disabled={isLoading || (confirmKeyword && confirmTextValue !== confirmKeyword)} variant={confirmButtonVariant}>
					{isLoading ? (
						<>
							<Loader2 className="animate-spin h-4 w-4 mr-2" />
							{loadingText || 'Memproses...'}
						</>
					) : (
						confirmButtonText
					)}
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
);

const TrendChart = ({ data }: { data: any[] }) => (
	<ResponsiveContainer width="100%" height="100%">
		<LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
			<CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
			<XAxis dataKey="date" stroke="#64748b" fontSize={12} />
			<YAxis stroke="#64748b" fontSize={12} unit="%" domain={['dataMin - 5', 'dataMax + 20']} />
			<Tooltip
				formatter={(value: number) => `${value}%`}
				contentStyle={{
					backgroundColor: 'rgba(255, 255, 255, 0.8)',
					backdropFilter: 'blur(4px)',
					borderRadius: '0.75rem',
					borderColor: '#e2e8f0',
				}}
			/>
			{/* <Legend /> */}
			<Line type="monotone" dataKey="Risiko" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e' }} activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }} />
		</LineChart>
	</ResponsiveContainer>
);

const ActiveFilterDisplay = ({ dateRange, showAllHistory, onClear, filteredCount }: { dateRange: { start: Date | null; end: Date | null }; showAllHistory: boolean; onClear: () => void; filteredCount: number }) => {
	if (!dateRange.start && !showAllHistory) return null;

	let text;
	if (showAllHistory) {
		text = 'Menampilkan Semua Riwayat';
	} else if (dateRange.start && dateRange.end) {
		if (dateRange.start.toDateString() === dateRange.end.toDateString()) {
			text = `Menampilkan: ${formatDate(dateRange.start)}`;
		} else {
			text = `Rentang: ${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`;
		}
	}

	return (
		<motion.div variants={itemVariants} className="flex justify-center">
			<div className="inline-flex items-center gap-4 bg-rose-100 text-rose-800 font-semibold px-4 py-2 rounded-full">
				<span>
					{text} ({filteredCount} hasil)
				</span>
				<button onClick={onClear} className="p-1 rounded-full hover:bg-rose-200 transition-colors">
					<X size={16} />
				</button>
			</div>
		</motion.div>
	);
};
