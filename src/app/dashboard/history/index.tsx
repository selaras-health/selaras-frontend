/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
	AlertTriangle,
	ArrowDown,
	ArrowLeft,
	ArrowRight,
	BarChart,
	BookOpen,
	Calendar,
	CheckCircle2,
	GitCompareArrows,
	History,
	Loader2,
	MessageSquarePlus,
	PieChart,
	Play,
	Search,
	ShieldCheck,
	Sparkles,
	Star,
	TrendingUp,
	Trophy,
	XCircle,
	Zap,
	Eye,
	X,
	List,
	FilterX,
	SortAsc,
	Award,
	ArrowUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { DOTS, usePagination } from '@/hooks/usePagination';
import type { AnalysisRecord } from '@/types';

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

const pageVariants: Variants = { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0.5, ease: 'easeInOut' } } };
const itemVariants: Variants = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeInOut' } } };

const formatDate = (dateString: string | Date): string => {
	if (dateString instanceof Date) {
		return dateString.toLocaleDateString('id-ID', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	}

	const monthMap: { [key: string]: number } = {
		Januari: 0,
		Februari: 1,
		Maret: 2,
		April: 3,
		Mei: 4,
		Juni: 5,
		Juli: 6,
		Agustus: 7,
		September: 8,
		Oktober: 9,
		November: 10,
		Desember: 11,
	};

	const parts = dateString.split(' ');
	if (parts.length !== 3) {
		const d = new Date(dateString);
		if (!isNaN(d.getTime())) return formatDate(d);
		return 'Tanggal Tidak Valid';
	}

	const day = parseInt(parts[0], 10);
	const monthName = parts[1];
	const year = parseInt(parts[2], 10);

	const monthIndex = monthMap[monthName];

	if (isNaN(day) || monthIndex === undefined || isNaN(year)) {
		return 'Tanggal Tidak Valid';
	}

	const date = new Date(year, monthIndex, day);

	return date.toLocaleDateString('id-ID', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
};

const formatDay = (dateString: string): string => {
	const monthMap: { [key: string]: number } = {
		Januari: 0,
		Februari: 1,
		Maret: 2,
		April: 3,
		Mei: 4,
		Juni: 5,
		Juli: 6,
		Agustus: 7,
		September: 8,
		Oktober: 9,
		November: 10,
		Desember: 11,
	};
	const parts = dateString.split(' ');
	if (parts.length === 3) {
		const day = parseInt(parts[0], 10);
		const monthIndex = monthMap[parts[1]];
		const year = parseInt(parts[2], 10);
		if (!isNaN(day) && monthIndex !== undefined && !isNaN(year)) {
			return new Date(year, monthIndex, day).toLocaleDateString('id-ID', { weekday: 'long' });
		}
	}
	const d = new Date(dateString);
	if (!isNaN(d.getTime())) {
		return d.toLocaleDateString('id-ID', { weekday: 'long' });
	}
	return 'Hari Tidak Valid';
};

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
	const timelineRefs = useRef<Record<string, HTMLDivElement | null>>({});

	// --- STATE MANAGEMENT ---
	const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [activeFilters, setActiveFilters] = useState<string[]>([]);
	const [comparisonMode, setComparisonMode] = useState<{ a: AnalysisRecord | null; b: AnalysisRecord | null }>({ a: null, b: null });
	const [notes, setNotes] = useState<Record<string, string>>({});
	const [selectedRecord, setSelectedRecord] = useState<AnalysisRecord | null>(null);
	const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
	const [showAllHistory, setShowAllHistory] = useState(true);
	const [sortBy, setSortBy] = useState('date-desc');
	const [riskCategoryFilter, setRiskCategoryFilter] = useState('all');
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(4);

	console.log(setItemsPerPage);

	// Program Action States
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [confirmText, setConfirmText] = useState('');
	const [programDiffModalOpen, setProgramDiffModalOpen] = useState(false);
	const [programDifficulty, setProgramDifficulty] = useState<'Santai & Bertahap' | 'Standar & Konsisten' | 'Intensif & Menantang'>('Standar & Konsisten');
	const [isNewProgramLoading, setIsNewProgramLoading] = useState(false);
	const [programSlug, setProgramSlug] = useState<string | null>(null);
	const [showResumeConfirmModal, setShowResumeConfirmModal] = useState(false);

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

		const totalPages = Math.ceil(sorted.length / itemsPerPage);

		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		const paginatedHistory = sorted.slice(startIndex, endIndex);

		return {
			chartData,
			achievements,
			paginatedHistory,
			totalFilteredHistory: sorted.length,
			totalPages,
			average,
			highest,
			lowest,
			riskCategories,
		};
	}, [dashboardData, searchTerm, activeFilters, notes, dateRange, showAllHistory, sortBy, riskCategoryFilter, currentPage, itemsPerPage]);

	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, activeFilters, dateRange, showAllHistory, riskCategoryFilter]);

	if (isLoading)
		return (
			<div className="flex items-center justify-center h-screen bg-slate-100">
				<Loader2 className="animate-spin h-12 w-12 text-rose-500" />
			</div>
		);

	const handleNoteChange = (slug: string, text: string) => {
		const newNotes = { ...notes, [slug]: text };
		setNotes(newNotes);
		localStorage.setItem('analysisNotes', JSON.stringify(newNotes));
	};

	const handleSelectForComparison = (record: AnalysisRecord) => {
		if (!comparisonMode.a) {
			setComparisonMode({ a: record, b: null });
			toast.info('Pilih satu riwayat lagi untuk dibandingkan.');
		} else if (comparisonMode.a.slug !== record.slug) {
			setComparisonMode({ ...comparisonMode, b: record });
		}
	};

	const handleDateRangeSelect = (range: { start: Date | null; end: Date | null }) => {
		setDateRange(range);
		setShowAllHistory(false);
	};

	const handleShowAll = () => {
		setDateRange({ start: null, end: null });
		setShowAllHistory(true);
	};

	const handleClearFilters = () => {
		setDateRange({ start: null, end: null });
		setShowAllHistory(false);
		setActiveFilters([]);
		setSortBy('date-desc');
		setSearchTerm('');
		setRiskCategoryFilter('all');
	};

	// Program Action Handlers
	const handleStartNewProgram = (slug: string) => {
		setProgramSlug(slug);
		setShowConfirmModal(true);
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

	const { summary } = dashboardData;
	const { paginatedHistory, totalFilteredHistory, achievements, average, highest, lowest } = processedData;
	const isFilterActive = activeFilters.length > 0 || sortBy !== 'date-desc' || (dateRange.start && dateRange.end) || showAllHistory || searchTerm !== '' || riskCategoryFilter !== 'all';

	return (
		<>
			<style>{`.highlight-animation { animation: highlight 2s ease-out; } @keyframes highlight { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(225, 29, 72, 0.4); } 50% { transform: scale(1.02); box-shadow: 0 0 0 12px rgba(225, 29, 72, 0); } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(225, 29, 72, 0); } }`}</style>
			<div className="min-h-screen bg-slate-100 font-sans">
				<motion.div variants={pageVariants} initial="initial" animate="animate" className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
					<motion.header variants={itemVariants} className="text-center mb-12 space-y-3">
						<h1 className="text-3xl md:text-5xl font-bold text-slate-800 tracking-tight">Lihat apa saja yang sudah kamu lakukan, Budi!</h1>
						<p className="text-lg md:text-xl text-slate-500 max-w-3xl mx-auto">Ini adalah semua riwayat kesehatan Anda.</p>
					</motion.header>

					<div className="flex flex-col lg:grid lg:grid-cols-3 lg:gap-8 items-start">
						<main className="lg:col-span-2 space-y-8 w-full">
							<FilterControlPanel
								searchTerm={searchTerm}
								setSearchTerm={setSearchTerm}
								activeFilters={activeFilters}
								setActiveFilters={setActiveFilters}
								sortBy={sortBy}
								setSortBy={setSortBy}
								onClear={handleClearFilters}
								isFilterActive={isFilterActive}
								riskCategoryFilter={riskCategoryFilter}
								setRiskCategoryFilter={setRiskCategoryFilter}
								riskCategories={processedData.riskCategories}
							/>
							<ActiveFilterDisplay dateRange={dateRange} showAllHistory={showAllHistory} onClear={handleClearFilters} filteredCount={totalFilteredHistory} />

							<div className="space-y-8">
								<AnimatePresence>
									{paginatedHistory.length > 0 ? (
										paginatedHistory.map((record) => (
											<div
												key={record.slug}
												ref={(el) => {
													timelineRefs.current[record.slug] = el;
												}}
											>
												<TimelineCard
													record={record}
													note={notes[record.slug] || ''}
													onNoteChange={handleNoteChange}
													onSelectForComparison={handleSelectForComparison}
													setSelectedRecord={setSelectedRecord}
													onStartNewProgram={handleStartNewProgram}
													onResumeProgram={() => {
														setProgramSlug(record.program_slug);
														setShowResumeConfirmModal(true);
													}}
													navigate={navigate}
												/>
											</div>
										))
									) : (
										<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
											<div className="w-24 h-24 mx-auto mb-6 rounded-full bg-rose-100 flex items-center justify-center">
												<Calendar className="h-12 w-12 text-rose-400" />
											</div>
											<h3 className="text-xl font-bold text-slate-800 mb-2">Pilih Rentang Tanggal atau Hapus Filter</h3>
											<p className="text-base text-slate-500 mb-6">Tidak ada riwayat yang cocok dengan kriteria filter Anda.</p>
											<Button onClick={handleShowAll} variant="outline">
												<List className="w-4 h-4 mr-2" /> Tampilkan Semua Riwayat
											</Button>
										</motion.div>
									)}
								</AnimatePresence>

								<AdvancedPaginationControls currentPage={currentPage} totalCount={processedData.totalFilteredHistory} pageSize={itemsPerPage} onPageChange={setCurrentPage} />
							</div>
						</main>

						<aside className="w-full mt-8 lg:mt-0 lg:sticky lg:top-5 space-y-8">
							<motion.section variants={itemVariants}>
								<JourneyCalendar history={dashboardData.assessment_history} onDateRangeSelect={handleDateRangeSelect} />
							</motion.section>
							<SidebarCard title="Ringkasan Statistik" icon={<BarChart />}>
								<div className="grid grid-cols-2 gap-4 mb-1">
									<StatCard icon={<BarChart />} title="Total Analisis" value={summary.total_assessments} />
									<StatCard icon={<PieChart />} title="Rata-rata" value={`${formatRiskPercentage(average)}%`} />
									<StatCard icon={<TrendingUp />} title="Tertinggi" value={`${formatRiskPercentage(highest)}%`} color="text-red-500" />
									<StatCard icon={<ShieldCheck />} title="Terendah" value={`${formatRiskPercentage(lowest)}%`} color="text-green-500" />
								</div>
							</SidebarCard>
							<SidebarCard title="Semua Pencapaian" icon={<Trophy className="text-amber-500" />}>
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

const AdvancedPaginationControls = ({ currentPage, totalCount, pageSize, onPageChange }: { currentPage: number; totalCount: number; pageSize: number; onPageChange: (page: number) => void }) => {
	const totalPages = Math.ceil(totalCount / pageSize);

	const paginationRange = usePagination({
		currentPage,
		totalCount,
		pageSize,
	});

	if (currentPage === 0 || (paginationRange && paginationRange.length < 2)) {
		return null;
	}

	const onNext = () => {
		onPageChange(currentPage + 1);
	};

	const onPrevious = () => {
		onPageChange(currentPage - 1);
	};

	const onFirst = () => {
		onPageChange(1);
	};

	const onLast = () => {
		onPageChange(totalPages);
	};

	return (
		<motion.div variants={itemVariants} className="flex items-center justify-center gap-2 mt-8">
			{/* Tombol ke Halaman Pertama */}
			<Button variant="outline" size="icon" onClick={onFirst} disabled={currentPage === 1}>
				<ArrowLeft className="w-4 h-4" />
				<ArrowLeft className="w-4 h-4 -ml-2" />
			</Button>
			{/* Tombol Halaman Sebelumnya */}
			<Button variant="outline" size="icon" onClick={onPrevious} disabled={currentPage === 1}>
				<ArrowLeft className="w-4 h-4" />
			</Button>

			{/* Nomor Halaman */}
			{paginationRange?.map((pageNumber, index) => {
				if (pageNumber === DOTS) {
					return (
						<span key={index} className="px-2 py-1 text-slate-500">
							&#8230;
						</span>
					);
				}

				return (
					<Button key={index} variant={pageNumber === currentPage ? 'default' : 'outline'} size="icon" onClick={() => onPageChange(pageNumber as number)} className={pageNumber === currentPage ? 'bg-rose-600 text-white' : ''}>
						{pageNumber}
					</Button>
				);
			})}

			{/* Tombol Halaman Berikutnya */}
			<Button variant="outline" size="icon" onClick={onNext} disabled={currentPage === totalPages}>
				<ArrowRight className="w-4 h-4" />
			</Button>
			{/* Tombol ke Halaman Terakhir */}
			<Button variant="outline" size="icon" onClick={onLast} disabled={currentPage === totalPages}>
				<ArrowRight className="w-4 h-4" />
				<ArrowRight className="w-4 h-4 -ml-2" />
			</Button>
		</motion.div>
	);
};

const JourneyCalendar = ({ history, onDateRangeSelect }: { history: AnalysisRecord[]; onDateRangeSelect: (range: { start: Date | null; end: Date | null }) => void }) => {
	const [currentDate, setCurrentDate] = useState(new Date());
	const [startDate, setStartDate] = useState<Date | null>(null);
	const [hoverDate, setHoverDate] = useState<Date | null>(null);

	const handleDayClick = (day: number) => {
		const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
		if (startDate && clickedDate.getTime() === startDate.getTime()) {
			onDateRangeSelect({ start: clickedDate, end: clickedDate });
			setStartDate(null);
			return;
		}
		if (!startDate) {
			setStartDate(clickedDate);
		} else {
			if (clickedDate < startDate) {
				onDateRangeSelect({ start: clickedDate, end: startDate });
			} else {
				onDateRangeSelect({ start: startDate, end: clickedDate });
			}
			setStartDate(null);
		}
	};

	const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
	const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
	const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
	const emptyDays = Array.from({ length: firstDayOfMonth });
	const today = new Date();

	const analysesByDay = useMemo(() => {
		const map = new Map<number, any>();
		history.forEach((record) => {
			const recordDate = new Date(record.date);
			if (recordDate.getFullYear() === currentDate.getFullYear() && recordDate.getMonth() === currentDate.getMonth()) {
				map.set(recordDate.getDate(), record);
			}
		});
		return map;
	}, [history, currentDate]);

	return (
		<Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200/80">
			<CardHeader className="flex flex-row items-center justify-between mb-3">
				<CardTitle>{currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</CardTitle>
				<div className="flex gap-2">
					<Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>
						<ArrowRight className="h-4 w-4" />
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 mb-2">
					{['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
						<div key={day}>{day}</div>
					))}
				</div>
				<div className="grid grid-cols-7 gap-1">
					{emptyDays.map((_, i) => (
						<div key={`empty-${i}`}></div>
					))}
					{monthDays.map((day) => {
						const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
						const record = analysesByDay.get(day);
						const isToday = date.toDateString() === today.toDateString();
						const hasRecord = !!record;

						let inRange = false;
						if (startDate && hoverDate) {
							const start = Math.min(startDate.getTime(), hoverDate.getTime());
							const end = Math.max(startDate.getTime(), hoverDate.getTime());
							inRange = date.getTime() >= start && date.getTime() <= end;
						}

						if (isToday) {
							return (
								<div key={day} className="rounded-lg p-0.5 bg-gradient-to-br from-red-400 via-pink-500 to-red-600 hover:from-red-500 hover:via-pink-600 hover:to-red-700">
									<motion.div
										whileHover={{ scale: 1.1 }}
										onMouseEnter={() => setHoverDate(date)}
										onMouseLeave={() => setHoverDate(null)}
										onClick={() => handleDayClick(day)}
										className={`relative h-full w-full flex items-center justify-center rounded-[7px] transition-all text-sm cursor-pointer bg-white text-slate-800`}
									>
										{day}
									</motion.div>
								</div>
							);
						}

						return (
							<motion.div
								key={day}
								whileHover={{ scale: 1.1 }}
								onMouseEnter={() => setHoverDate(date)}
								onMouseLeave={() => setHoverDate(null)}
								onClick={() => handleDayClick(day)}
								className={`relative h-10 flex items-center justify-center rounded-lg transition-all text-sm cursor-pointer ${
									startDate?.getTime() === date.getTime() ? 'bg-rose-500 text-white' : inRange ? 'bg-rose-100' : hasRecord ? 'bg-gradient-to-br from-red-400 via-pink-500 to-red-600  text-white' : 'bg-slate-100 hover:bg-slate-200'
								}`}
							>
								{day}
							</motion.div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
};

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

const FilterChip = ({ label, filterKey, activeFilters, onToggle, icon }: any) => {
	const isActive = activeFilters.includes(filterKey);
	return (
		<Button
			variant={isActive ? 'default' : 'outline'}
			onClick={onToggle}
			className={`h-auto py-1.5 px-3 rounded-full text-sm transition-all duration-200 ${isActive ? 'bg-rose-600 text-white border-rose-600' : 'bg-white/80 text-slate-700 border-slate-300 hover:bg-slate-200'}`}
		>
			{icon} {label}
		</Button>
	);
};

const TimelineCard = ({ record, note, onNoteChange, onSelectForComparison, setSelectedRecord, onStartNewProgram, onResumeProgram, navigate }: any) => {
	const [isNoteOpen, setIsNoteOpen] = useState(false);
	const styling = getRiskStyling(record.result_details?.riskSummary?.riskCategory?.code);
	return (
		<motion.div layout variants={itemVariants} className="relative flex items-start gap-4 sm:gap-6">
			<div className="relative z-10 mt-1 flex-shrink-0">
				<div className={`w-10 h-10 rounded-full bg-${styling.color}-500 flex items-center justify-center p-2 shadow-md`}>{styling.icon}</div>
			</div>
			<div className="flex-1 min-w-0">
				<Card className={`transition-all duration-300 rounded-2xl shadow-lg hover:shadow-xl bg-white/80 backdrop-blur-sm border-t border-l border-${styling.color}-500 border-opacity-30`}>
					<CardContent className="p-5 md:p-6 space-y-4">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
							<div>
								<p className="font-semibold text-slate-800 text-lg">{formatDate(record.date)}</p>
								<p className="text-sm text-slate-500">{formatDay(record.date)}</p>
							</div>
							<div className="flex flex-wrap items-center justify-start sm:justify-end gap-2">
								<ProgramStatusBadge status={record?.program_status || 'default'} />
								<Badge className={`${styling.badge} font-medium border-transparent`}>{record.result_details?.riskSummary?.riskCategory?.title || 'Tidak Diketahui'}</Badge>
							</div>
						</div>
						<div className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-slate-50/80 p-4 rounded-xl">
							<div className="flex-1">
								<h4 className="font-semibold text-slate-900 mb-1">Ringkasan Analisis</h4>
								<p className="text-slate-600 text-sm leading-relaxed line-clamp-2">{record.result_details?.riskSummary?.executiveSummary}</p>
							</div>
							<div className="bg-white p-4 rounded-lg shadow-inner-sm text-center w-full md:w-auto">
								<h4 className="text-sm font-medium text-slate-500">Risiko</h4>
								<p className={`text-3xl font-bold text-${styling.color}-600`}>{formatRiskPercentage(record.risk_percentage)}%</p>
							</div>
						</div>
						<AnimatePresence>
							{isNoteOpen && (
								<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
									<div className="pt-4 border-t border-slate-200/80">
										<label className="text-sm font-medium text-slate-600">Catatan Personal (hanya tersimpan di perangkat ini)</label>
										<Textarea value={note} onChange={(e: any) => onNoteChange(record.slug, e.target.value)} placeholder="Contoh: Mulai rutin jalan pagi minggu ini..." className="mt-2 bg-white/50" />
									</div>
								</motion.div>
							)}
						</AnimatePresence>
						<ActionButtons
							record={record}
							onSelectForComparison={onSelectForComparison}
							setSelectedRecord={setSelectedRecord}
							onToggleNote={() => setIsNoteOpen(!isNoteOpen)}
							isNoteOpen={isNoteOpen}
							onStartNewProgram={onStartNewProgram}
							onResumeProgram={onResumeProgram}
							navigate={navigate}
						/>
					</CardContent>
				</Card>
			</div>
		</motion.div>
	);
};

const ActionButtons = ({ record, onSelectForComparison, setSelectedRecord, onToggleNote, isNoteOpen, onStartNewProgram, onResumeProgram, navigate }: any) => {
	const programAction = () => {
		switch (record.program_status) {
			case 'active':
				return (
					<Button
						onClick={() => navigate('/dashboard/program')}
						className="flex-1 bg-gradient-to-r from-red-400 via-pink-500 to-red-600 hover:from-red-500 hover:via-pink-600 hover:to-red-700 text-white font-semibold shadow-md hover:shadow-lg transition-all rounded-lg h-11"
					>
						<ArrowRight className="w-4 h-4 mr-2" /> Lanjutkan
					</Button>
				);
			case 'completed':
				return (
					<Button
						onClick={() => navigate(`/dashboard/program/${record.program_slug}`)}
						className="flex-1 bg-gradient-to-r from-sky-400 via-blue-500 to-blue-600 text-white font-semibold shadow-md hover:shadow-lg transition-all rounded-lg h-11"
					>
						<BookOpen className="w-4 h-4 mr-2" /> Laporan
					</Button>
				);
			case 'paused':
				return (
					<Button onClick={() => onResumeProgram(record)} className="flex-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-amber-600 text-white font-semibold shadow-md hover:shadow-lg transition-all rounded-lg h-11">
						<Play className="w-4 h-4 mr-2" /> Aktifkan
					</Button>
				);
			default:
				return (
					<Button onClick={() => onStartNewProgram(record.slug)} className="flex-1 bg-gradient-to-r from-teal-400 via-emerald-500 to-emerald-600 text-white font-semibold shadow-md hover:shadow-lg transition-all rounded-lg h-11">
						<Sparkles className="w-4 h-4 mr-2" /> Mulai Program
					</Button>
				);
		}
	};

	return (
		<div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200/80">
			{programAction()}
			<Button onClick={() => setSelectedRecord(record)} variant="outline" className="flex-1">
				<Eye className="w-4 h-4 mr-2" /> Detail
			</Button>
			<Button variant="outline" onClick={() => onSelectForComparison(record)} className="flex-1">
				<GitCompareArrows className="h-4 w-4 mr-2" /> Bandingkan
			</Button>
			<Button variant="outline" onClick={onToggleNote} className="flex-1">
				<MessageSquarePlus className="h-4 w-4 mr-2" /> {isNoteOpen ? 'Tutup' : 'Catatan'}
			</Button>
		</div>
	);
};

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

const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
	<textarea {...props} className={`w-full p-2 border rounded-md border-slate-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition ${props.className}`} rows={3} />
);

const ProgramStatusBadge = ({ status }: { status: string }) => {
	const styles = { active: 'bg-rose-100 text-rose-800', completed: 'bg-green-100 text-green-800', paused: 'bg-yellow-100 text-yellow-800', default: 'bg-slate-100 text-slate-700' };
	const text = { active: 'Program Aktif', completed: 'Selesai', paused: 'Dijeda', default: 'Belum Dimulai' };
	const currentStatus = status as keyof typeof styles;
	return <Badge className={`${styles[currentStatus] || styles.default} font-medium border-transparent`}>{text[currentStatus] || text.default}</Badge>;
};

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
const FilterControlPanel = ({ searchTerm, setSearchTerm, activeFilters, setActiveFilters, sortBy, setSortBy, onClear, isFilterActive, riskCategoryFilter, setRiskCategoryFilter, riskCategories }: any) => (
	<motion.section variants={itemVariants} className="sticky top-5 z-20">
		<Card className="shadow-lg rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200/80 p-4">
			<div className="flex flex-col md:flex-row items-center gap-4 mb-4">
				<div className="relative w-full md:flex-1">
					<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
					<Input placeholder="Cari di riwayat..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-12 text-base h-12 rounded-xl bg-white/70" />
				</div>

				<Select value={riskCategoryFilter} onValueChange={setRiskCategoryFilter}>
					<SelectTrigger className="h-12 rounded-xl w-full md:w-auto">
						<div className="flex items-center gap-2">
							<FilterX size={16} /> Filter Kategori
						</div>
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Semua Kategori</SelectItem>
						{riskCategories.map((cat: string) => (
							<SelectItem key={cat} value={cat}>
								{cat
									.replace(/_/g, ' ')
									.toLowerCase()
									.replace(/\b\w/g, (l) => l.toUpperCase())}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select value={sortBy} onValueChange={setSortBy}>
					<SelectTrigger className="h-12 rounded-xl w-full md:w-auto">
						<div className="flex items-center gap-2">
							<SortAsc size={16} /> Urutkan
						</div>
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="date-desc">Tanggal: Terbaru</SelectItem>
						<SelectItem value="date-asc">Tanggal: Terlama</SelectItem>
						<SelectItem value="risk-desc">Risiko: Tertinggi</SelectItem>
						<SelectItem value="risk-asc">Risiko: Terendah</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="flex flex-wrap gap-2">
				<FilterChip
					label="Membaik"
					filterKey="risiko-membaik"
					activeFilters={activeFilters}
					onToggle={() => setActiveFilters((p: any) => (p.includes('risiko-membaik') ? p.filter((f: any) => f !== 'risiko-membaik') : [...p, 'risiko-membaik']))}
					icon={<ArrowDown className="w-4 h-4 mr-1.5" />}
				/>
				<FilterChip
					label="Memburuk"
					filterKey="risiko-memburuk"
					activeFilters={activeFilters}
					onToggle={() => setActiveFilters((p: any) => (p.includes('risiko-memburuk') ? p.filter((f: any) => f !== 'risiko-memburuk') : [...p, 'risiko-memburuk']))}
					icon={<ArrowUp className="w-4 h-4 mr-1.5" />}
				/>
				<FilterChip
					label="Dengan Catatan"
					filterKey="dengan-catatan"
					activeFilters={activeFilters}
					onToggle={() => setActiveFilters((p: any) => (p.includes('dengan-catatan') ? p.filter((f: any) => f !== 'dengan-catatan') : [...p, 'dengan-catatan']))}
					icon={<MessageSquarePlus className="w-4 h-4 mr-1.5" />}
				/>
			</div>

			{isFilterActive && (
				<div className="pt-4 mt-4 border-t border-slate-200">
					<Button onClick={onClear} variant="ghost" className="w-full text-rose-500 hover:text-rose-600">
						<X size={16} className="mr-2" /> Hapus Semua Filter
					</Button>
				</div>
			)}
		</Card>
	</motion.section>
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
