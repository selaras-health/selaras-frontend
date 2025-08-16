/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
	X,
	TrendingUp,
	Activity,
	Heart,
	Target,
	Zap,
	BookOpen,
	MessageCircle,
	Stethoscope,
	TestTube,
	Award,
	Info,
	ChevronDown,
	User,
	Cigarette,
	Droplets,
	TestTube2,
	ShieldCheck,
	AlertTriangle,
	Sparkles,
	FileText,
	CheckCircle,
	MapPin,
	ArrowRight,
	// Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// --- TYPE DEFINITIONS ---
type AnalysisRecord = any;
interface RiwayatDetailModalProps {
	record: AnalysisRecord | null;
	isOpen: boolean;
	onClose: () => void;
}

// --- ANIMATION VARIANTS ---
const modalVariants: Variants = {
	hidden: { opacity: 0, y: 50, scale: 0.95 },
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: {
			duration: 0.4,
			ease: [0.25, 1, 0.5, 1],
			staggerChildren: 0.1,
		},
	},
	exit: { opacity: 0, y: 50, scale: 0.95, transition: { duration: 0.3, ease: [0.5, 0, 0.75, 0] } },
};
const overlayVariants: Variants = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { duration: 0.3 } },
	exit: { opacity: 0, transition: { duration: 0.3 } },
};
const contentContainerVariants: Variants = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: 0.07,
		},
	},
};
const itemVariants: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

// --- MAIN COMPONENT: RiwayatDetailModal ---
export function RiwayatDetailModal({ record, isOpen, onClose }: RiwayatDetailModalProps) {
	const [activeSection, setActiveSection] = useState('summary');
	const contentRef = useRef<HTMLDivElement | null>(null);
	const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

	useEffect(() => {
		if (!isOpen || !contentRef.current) return;
		const mainContent = contentRef.current;
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setActiveSection(entry.target.id);
					}
				});
			},
			{ root: mainContent, rootMargin: '-40% 0px -60% 0px', threshold: 0 }
		);
		const currentRefs = sectionRefs.current;
		Object.values(currentRefs).forEach((section) => {
			if (section) observer.observe(section);
		});
		return () => {
			Object.values(currentRefs).forEach((section) => {
				if (section) observer.unobserve(section);
			});
		};
	}, [isOpen, record]);

	// const handleExportPDF = () => {
	// 	window.print();
	// };

	const processedData = useMemo(() => {
		if (!record) return null;
		const getUserInputData = (rec: AnalysisRecord) => {
			const { generated_value, input } = rec;
			const coreData = {
				age: generated_value.age,
				gender: generated_value.sex_label,
				smokingStatus: input.smoking_status === 'Bukan perokok saat ini' ? 'never' : 'current',
				region: 'Indonesia',
				diabetesStatus: input.has_diabetes ? 'yes' : 'no',
				diabetesAge: input.has_diabetes ? input.age_at_diabetes_diagnosis : undefined,
			};
			const healthMetrics = {
				sbp: generated_value.sbp,
				totalCholesterol: generated_value.tchol,
				hdl: generated_value.hdl,
				hba1c: generated_value.hba1c,
				scr: generated_value.scr,
			};
			const estimatedParameters: any[] = [];
			const processProxy = (inputType: string, proxyAnswers: any, name: string, value: any, unit: string, method: string) => {
				if (inputType === 'proxy' && proxyAnswers) {
					estimatedParameters.push({
						name,
						value: `${value}`,
						unit,
						estimationMethod: method,
						proxyResponses: Object.entries(proxyAnswers).map(([qKey, answer]) => ({
							question: qKey
								.replace('q_', '')
								.replace(/_/g, ' ')
								.replace(/\b\w/g, (l) => l.toUpperCase()),
							answer,
						})),
					});
				}
			};
			processProxy(input.hdl_input_type, input.hdl_proxy_answers, 'Kolesterol HDL', generated_value.hdl, 'mg/dL', 'Berdasarkan jawaban proxy terkait HDL');
			processProxy(input.sbp_input_type, input.sbp_proxy_answers, 'Tekanan Darah (SBP)', generated_value.sbp, 'mmHg', 'Berdasarkan jawaban proxy terkait tekanan darah');
			processProxy(input.tchol_input_type, input.tchol_proxy_answers, 'Kolesterol Total', generated_value.tchol, 'mg/dL', 'Berdasarkan jawaban proxy terkait kolesterol');
			return { coreData, healthMetrics, estimatedParameters };
		};
		const getDetailedAnalysis = (rec: AnalysisRecord) => {
			const { riskSummary, actionPlan, personalizedEducation, closingStatement } = rec.result_details;
			return {
				riskSummary: {
					riskPercentage: parseFloat(riskSummary.riskPercentage.toString()),
					riskCategory: riskSummary.riskCategory,
					executiveSummary: riskSummary.executiveSummary,
					primaryContributors: riskSummary.primaryContributors || [],
					contextualRiskExplanation: riskSummary.contextualRiskExplanation,
					positiveFactors: riskSummary.positiveFactors || [],
				},
				actionPlan: {
					medicalConsultation: actionPlan.medicalConsultation,
					lifestyleActions: (actionPlan.priorityLifestyleActions || []).sort((a: any, b: any) => a.rank - b.rank),
					impactSimulation: {
						message: actionPlan.impactSimulation.message,
						timeEstimation: actionPlan.impactSimulation.timeEstimation,
						riskAfterChange: parseFloat(actionPlan.impactSimulation.riskAfterChange.toString()),
					},
				},
				personalizedEducation: {
					keyHealthMetrics: personalizedEducation.keyHealthMetrics || [],
					mythsVsFacts: personalizedEducation.mythVsFact || [],
				},
				closingStatement,
			};
		};
		return { userInput: getUserInputData(record), analysis: getDetailedAnalysis(record) };
	}, [record]);

	if (!isOpen || !record || !processedData) return null;

	const { userInput, analysis } = processedData;
	const { riskSummary, actionPlan, personalizedEducation, closingStatement } = analysis;

	const getRiskStyling = (level: string) => {
		switch (level) {
			case 'LOW_MODERATE':
				return { textColor: 'text-green-400', ringColor: 'ring-green-500', gradient: 'from-green-500 to-emerald-500', icon: <ShieldCheck /> };
			case 'HIGH':
				return { textColor: 'text-amber-400', ringColor: 'ring-amber-500', gradient: 'from-amber-500 to-orange-500', icon: <AlertTriangle /> };
			case 'VERY_HIGH':
				return { textColor: 'text-red-400', ringColor: 'ring-red-500', gradient: 'from-red-500 to-rose-500', icon: <Heart /> };
			default:
				return { textColor: 'text-slate-400', ringColor: 'ring-slate-500', gradient: 'from-slate-500 to-gray-500', icon: <Info /> };
		}
	};

	const riskStyling = getRiskStyling(riskSummary.riskCategory.code);

	const navItems = [
		{ id: 'summary', label: 'Ringkasan Risiko', icon: <TrendingUp /> },
		{ id: 'action-plan', label: 'Rencana Aksi', icon: <Target /> },
		{ id: 'education', label: 'Edukasi Personal', icon: <BookOpen /> },
		{ id: 'input-data', label: 'Data Input', icon: <FileText /> },
	];

	return (
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 font-sans">
					<motion.div variants={overlayVariants} initial="hidden" animate="visible" exit="exit" className="fixed inset-0 bg-slate-900/70 backdrop-blur-md" onClick={onClose} />
					<motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" className="relative w-full h-full md:max-w-6xl bg-white md:rounded-2xl shadow-2xl flex flex-col md:flex-row md:max-h-[90vh] overflow-hidden">
						{/* --- Left Column (Sticky Navigation on Desktop) --- */}
						<motion.aside variants={itemVariants} className="w-full md:w-1/4 flex-shrink-0 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col p-4 md:p-6">
							<div className="flex items-center justify-between md:justify-start gap-3 mb-4 md:mb-8">
								<div className="flex items-center gap-3">
									<div className={`bg-gradient-to-br from-red-400 via-pink-500 to-red-600 hover:from-red-500 hover:via-pink-600 hover:to-red-700 w-10 h-10 rounded-full flex items-center justify-center text-white ${riskStyling.gradient}`}>
										{React.cloneElement(riskStyling.icon as React.ReactElement<any>, { className: 'w-6 h-6' })}
									</div>
									<div>
										<h2 className="text-lg font-bold text-slate-800">Laporan Analisis</h2>
										<p className="text-sm text-slate-500">{record.date}</p>
									</div>
								</div>
								<Button variant="ghost" size="icon" onClick={onClose} className="md:hidden h-9 w-9 rounded-full bg-slate-200">
									<X className="h-5 w-5" />
								</Button>
							</div>
							<div className="hidden md:block text-center mb-8">
								<p className="text-sm text-slate-500">Risiko Kardiovaskular</p>
								<p className="text-xs text-slate-500 mb-1">10 Tahun ke Depan</p>
								<motion.div
									key={riskSummary.riskPercentage}
									initial={{ scale: 0.8, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									transition={{ duration: 0.5, ease: 'easeOut' }}
									className={`text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r ${riskStyling.gradient}`}
								>
									{riskSummary.riskPercentage.toFixed(1)}%
								</motion.div>
								<Badge variant="outline" className={`mt-2 ${riskStyling.textColor.replace('text-', 'border-').replace('400', '500/30')} ${riskStyling.textColor.replace('text-', 'bg-').replace('400', '500/10')}`}>
									{riskSummary.riskCategory.title}
								</Badge>
							</div>
							<nav className="hidden md:relative md:block space-y-2">
								{navItems.map((item) => (
									<a
										key={item.id}
										href={`#${item.id}`}
										onClick={(e) => {
											e.preventDefault();
											sectionRefs.current[item.id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
										}}
										className={`relative flex items-center gap-3 px-3 py-2 rounded-md text-sm font-semibold transition-colors z-10 ${activeSection === item.id ? 'text-red-700' : 'text-slate-600 hover:bg-slate-100'}`}
									>
										{activeSection === item.id && (
											<motion.div
												layoutId="active-nav-indicator"
												className="absolute inset-0 bg-gradient-to-br from-red-400/20 via-pink-500/20 to-red-600/20 hover:from-red-500/20 hover:via-pink-600/20 hover:to-red-700/20 rounded-md"
												transition={{ type: 'spring', stiffness: 300, damping: 30 }}
											/>
										)}
										<span className="relative z-10">{React.cloneElement(item.icon as React.ReactElement<any>, { className: 'w-5 h-5' })}</span>
										<span className="relative z-10">{item.label}</span>
									</a>
								))}
							</nav>
							{/* <div className="hidden md:block mt-auto space-y-2">
								<Button variant="outline" className="w-full" onClick={handleExportPDF}>
									<Download className="w-4 h-4 mr-2" /> Ekspor PDF
								</Button>
								<Button variant="ghost" onClick={onClose} className="w-full text-slate-500">
									<X className="w-4 h-4 mr-2" /> Tutup Laporan
								</Button>
							</div> */}
						</motion.aside>
						{/* --- Right Column (Scrollable Content) --- */}
						<main ref={contentRef} className="w-full md:w-3/4 flex-grow overflow-y-auto p-6 md:p-10">
							<motion.div variants={contentContainerVariants} initial="hidden" animate="visible" className="space-y-12">
								<motion.section
									id="summary"
									ref={(el) => {
										sectionRefs.current['summary'] = el;
									}}
									variants={itemVariants}
									className="pt-2"
								>
									<AdaptiveMessage summary={riskSummary.executiveSummary} riskCode={riskSummary.riskCategory.code} />
									<p className="text-base text-slate-500 leading-relaxed mb-8">{riskSummary.contextualRiskExplanation}</p>
									<div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
										<div className="lg:col-span-12">
											<h3 className="text-lg font-bold text-slate-800 mb-3">Faktor Kontributor Utama</h3>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
												<ContributorBarChart data={riskSummary.primaryContributors} />
												<AchievementCard factors={riskSummary.positiveFactors} className="h-fit" />
											</div>
										</div>
									</div>
								</motion.section>
								<ThematicSeparator />
								<motion.section
									id="action-plan"
									ref={(el) => {
										sectionRefs.current['action-plan'] = el;
									}}
									variants={itemVariants}
								>
									<h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-6">Rencana Aksi Personal Anda</h2>
									<div className="space-y-6">
										<InfoCard icon={<Stethoscope />} title="Saran Konsultasi Medis" color="sky">
											<p className="text-base text-sky-800 mb-4">{actionPlan.medicalConsultation.recommendationLevel.description}</p>
											<h4 className="font-semibold text-base text-sky-900 mb-3">Tes Laboratorium yang Disarankan:</h4>
											<div className="space-y-2">
												{actionPlan.medicalConsultation.suggestedTests.map((test: any, index: number) => (
													<SuggestedTestItem key={index} test={test} />
												))}
											</div>
										</InfoCard>
										<div>
											<h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
												<Activity className="w-6 h-6 text-green-600" />
												Prioritas Perubahan Gaya Hidup
											</h3>
											<div className="space-y-4">
												{actionPlan.lifestyleActions.map((action: any) => (
													<ActionItem key={action.rank} {...action} isHighlighted={action.rank === 1} />
												))}
											</div>
										</div>
										<ImpactSimulationCard {...actionPlan.impactSimulation} currentRisk={riskSummary.riskPercentage} />
									</div>
								</motion.section>
								<ThematicSeparator />
								<motion.section
									id="education"
									ref={(el) => {
										sectionRefs.current['education'] = el;
									}}
									variants={itemVariants}
								>
									<h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-6">Pahami Kesehatan Anda Lebih Baik</h2>
									<div className="space-y-8">
										<div>
											<h3 className="text-xl font-bold text-slate-800 mb-4">Metrik Kesehatan Utama Anda</h3>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												{personalizedEducation.keyHealthMetrics.map((metric: any, index: number) => (
													<MetricDetailCard key={index} {...metric} />
												))}
											</div>
										</div>
										<div>
											<h3 className="text-xl font-bold text-slate-800 mb-4">Mitos vs. Fakta</h3>
											<div className="space-y-4">
												{personalizedEducation.mythsVsFacts.map((item: any, index: number) => (
													<MythBuster key={index} myth={item.myth} fact={item.fact} />
												))}
											</div>
										</div>
									</div>
								</motion.section>
								<ThematicSeparator />
								<motion.section
									id="input-data"
									ref={(el) => {
										sectionRefs.current['input-data'] = el;
									}}
									variants={itemVariants}
								>
									<h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-6">Data yang Anda Berikan</h2>
									<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
										<DataPoint icon={<User />} label="Usia" value={`${userInput.coreData.age} tahun`} />
										<DataPoint icon={<User />} label="Jenis Kelamin" value={userInput.coreData.gender === 'male' ? 'Pria' : 'Wanita'} />
										<DataPoint icon={<Cigarette />} label="Status Merokok" value={userInput.coreData.smokingStatus === 'never' ? 'Tidak Pernah' : 'Perokok'} />
										<DataPoint icon={<Droplets />} label="Riwayat Diabetes" value={userInput.coreData.diabetesStatus === 'no' ? 'Tidak' : `Ya (usia ${userInput.coreData.diabetesAge})`} />
										<DataPoint icon={<Activity />} label="Tekanan Darah (SBP)" value={`${userInput.healthMetrics.sbp} mmHg`} estimationDetails={userInput.estimatedParameters.find((p) => p.name.includes('SBP'))} />
										<DataPoint icon={<TestTube2 />} label="Kolesterol Total" value={`${userInput.healthMetrics.totalCholesterol} mg/dL`} estimationDetails={userInput.estimatedParameters.find((p) => p.name.includes('Kolesterol Total'))} />
										<DataPoint icon={<Heart />} label="Kolesterol HDL" value={`${userInput.healthMetrics.hdl} mg/dL`} estimationDetails={userInput.estimatedParameters.find((p) => p.name.includes('HDL'))} />
									</div>
								</motion.section>
								<ClosingStatementCard {...closingStatement} />
							</motion.div>
						</main>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}

// --- SUB-COMPONENTS ---
const AdaptiveMessage = ({ summary, riskCode }: { summary: string; riskCode: string }) => {
	const greeting = useMemo(() => {
		switch (riskCode) {
			case 'VERY_HIGH':
			case 'HIGH':
				return 'Mari kita lihat hasil ini bersama. Ada beberapa area penting yang perlu kita perhatikan untuk menjaga kesehatan jantung Anda.';
			case 'LOW_MODERATE':
				return 'Kabar baik! Hasil analisis Anda menunjukkan fondasi yang kuat untuk kesehatan jantung. Mari kita lihat detailnya.';
			default:
				return 'Berikut adalah hasil analisis kesehatan Anda.';
		}
	}, [riskCode]);
	return (
		<p className="  leading-relaxed mb-4">
			<span className="text-xl text-slate-700 font-semibold">{greeting}</span>
			<div className="text-base text-slate-500 mt-4">{summary}</div>
		</p>
	);
};

const ContributorBarChart = ({ data }: { data: any[] }) => (
	<div className="space-y-4 p-4 bg-slate-100 rounded-xl">
		{data.map((item, index) => (
			<ContributorItem key={index} item={item} index={index} />
		))}
	</div>
);

const ContributorItem = ({ item, index }: { item: any; index: number }) => {
	const [isOpen, setIsOpen] = useState(false);
	const severityMap = { HIGH: 3, MEDIUM: 2, LOW: 1 };
	const maxSeverity = 3;
	const severityStyles = {
		HIGH: { text: 'Tinggi', bar: 'bg-red-400' },
		MEDIUM: { text: 'Sedang', bar: 'bg-amber-400' },
		LOW: { text: 'Rendah', bar: 'bg-green-400' },
	};
	const severityValue = severityMap[item.severity as keyof typeof severityMap] || 1;
	const widthPercentage = (severityValue / maxSeverity) * 100;
	const style = severityStyles[item.severity as keyof typeof severityStyles];
	return (
		<Collapsible open={isOpen} onOpenChange={setIsOpen}>
			<CollapsibleTrigger className="w-full text-left group p-2 rounded-md hover:bg-slate-200/50 transition-colors">
				<div className="flex justify-between items-center mb-1 text-sm">
					<span className="font-semibold text-slate-700">{item.title}</span>
					<div className="flex items-center gap-2">
						<span className={`font-bold ${style.bar.replace('bg-', 'text-')}`}>{style.text}</span>
						<ChevronDown className="w-4 h-4 text-slate-400 group-data-[state=open]:rotate-180 transition-transform" />
					</div>
				</div>
				<div className="w-full bg-slate-200 rounded-full h-2.5">
					<motion.div className={`h-2.5 rounded-full ${style.bar}`} initial={{ width: 0 }} animate={{ width: `${widthPercentage}%` }} transition={{ duration: 0.8, delay: 0.2 * index, ease: 'easeOut' }} />
				</div>
			</CollapsibleTrigger>
			<AnimatePresence initial={false}>
				{isOpen && (
					<CollapsibleContent asChild forceMount>
						<motion.div
							initial="collapsed"
							animate="open"
							exit="collapsed"
							variants={{ open: { opacity: 1, height: 'auto' }, collapsed: { opacity: 0, height: 0 } }}
							transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
							className="overflow-hidden"
						>
							<div className="text-sm text-slate-600 mt-2 px-2 pt-2 pb-1 border-t border-slate-200">{item.description}</div>
						</motion.div>
					</CollapsibleContent>
				)}
			</AnimatePresence>
		</Collapsible>
	);
};

const SuggestedTestItem = ({ test }: { test: any }) => {
	const [isOpen, setIsOpen] = useState(false);
	return (
		<Collapsible open={isOpen} onOpenChange={setIsOpen}>
			<CollapsibleTrigger className="w-full flex items-center justify-between text-left p-2 rounded-md hover:bg-sky-100/50 group">
				<span className="font-semibold text-sm text-sky-800 flex items-center gap-2">
					<TestTube className="w-4 h-4" />
					{test.title}
				</span>
				<ChevronDown className="w-4 h-4 text-sky-600 group-data-[state=open]:rotate-180 transition-transform" />
			</CollapsibleTrigger>
			<AnimatePresence initial={false}>
				{isOpen && (
					<CollapsibleContent asChild forceMount>
						<motion.div
							initial="collapsed"
							animate="open"
							exit="collapsed"
							variants={{ open: { opacity: 1, height: 'auto' }, collapsed: { opacity: 0, height: 0 } }}
							transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
							className="overflow-hidden"
						>
							<div className="text-sm text-sky-700 px-2 pt-2 pb-1 border-t border-sky-200/70">{test.description}</div>
						</motion.div>
					</CollapsibleContent>
				)}
			</AnimatePresence>
		</Collapsible>
	);
};

const InfoCard = ({ icon, title, color, children, className }: { icon: React.ReactElement; title: string; color: 'green' | 'sky' | 'amber'; children: React.ReactNode; className?: string }) => {
	const colors = { green: 'bg-green-100/50 border-green-200 text-green-900', sky: 'bg-sky-100/50 border-sky-200 text-sky-900', amber: 'bg-amber-100/50 border-amber-200 text-amber-900' };
	const iconColors = { green: 'text-green-600', sky: 'text-sky-600', amber: 'text-amber-600' };
	return (
		<div className={`p-5 rounded-xl border ${colors[color]} ${className}`}>
			<div className="flex items-center gap-3 mb-2">
				<div className={iconColors[color]}>{React.cloneElement(icon as React.ReactElement<any>, { className: 'w-5 h-5' })}</div>
				<h4 className="font-semibold text-base">{title}</h4>
			</div>
			{children}
		</div>
	);
};

const AchievementCard = ({ factors, className }: { factors: string[]; className?: string }) => (
	<InfoCard icon={<Sparkles />} title="Pencapaian Positif Anda" color="green" className={className}>
		<div className="grid grid-cols-2 gap-3 mt-3">
			{factors.map((factor, index) => (
				<div key={index} className="flex flex-col items-center text-center p-3 bg-white/50 rounded-lg">
					<div className="p-2 bg-green-200 rounded-full mb-2">
						<CheckCircle className="w-5 h-5 text-green-700" />
					</div>
					<p className="font-semibold text-xs text-green-800">{factor.split(',')[0]}</p>
				</div>
			))}
		</div>
	</InfoCard>
);

const ActionItem = ({ rank, title, description, target, estimatedImpact, isHighlighted }: any) => (
	<motion.div
		variants={itemVariants}
		whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
		className={`p-5 rounded-xl border bg-white shadow-sm transition-all duration-300 ${isHighlighted ? 'border-green-300 ring-2 ring-green-500/50 ring-offset-2 ring-offset-white' : 'border-slate-200'}`}
	>
		<div className="flex items-start gap-4">
			<div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-green-600 text-white font-bold text-lg">{rank}</div>
			<div className="flex-grow">
				<h4 className="font-semibold text-lg text-slate-900">{title}</h4>
				<p className="text-base text-slate-700 mt-1 mb-3">{description}</p>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
					<div className="p-3 rounded-md bg-green-50">
						<p className="font-semibold text-green-800">Target Anda:</p>
						<p className="text-green-700">{target}</p>
					</div>
					<div className="p-3 rounded-md bg-green-50">
						<p className="font-semibold text-green-800">Estimasi Dampak:</p>
						<p className="text-green-700">{estimatedImpact}</p>
					</div>
				</div>
			</div>
		</div>
	</motion.div>
);

const MythBuster = ({ myth, fact }: { myth: string; fact: string }) => {
	const [isOpen, setIsOpen] = useState(false);
	return (
		<Collapsible open={isOpen} onOpenChange={setIsOpen}>
			<CollapsibleTrigger className="w-full p-4 rounded-xl border border-slate-200 bg-white shadow-sm text-left group hover:bg-slate-50 transition-colors">
				<div className="flex items-center justify-between">
					<div className="flex items-start gap-3">
						<AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
						<div>
							<p className="text-sm font-semibold text-amber-600">MITOS</p>
							<p className="font-semibold text-base text-slate-800">{myth}</p>
						</div>
					</div>
					<ChevronDown className="w-5 h-5 text-slate-400 group-data-[state=open]:rotate-180 transition-transform" />
				</div>
			</CollapsibleTrigger>
			<AnimatePresence initial={false}>
				{isOpen && (
					<CollapsibleContent asChild forceMount>
						<motion.div
							initial="collapsed"
							animate="open"
							exit="collapsed"
							variants={{ open: { opacity: 1, height: 'auto' }, collapsed: { opacity: 0, height: 0 } }}
							transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
							className="overflow-hidden"
						>
							<div className="p-4 mt-2 rounded-xl bg-green-50 border border-green-200">
								<div className="flex items-start gap-3">
									<ShieldCheck className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
									<div>
										<p className="text-sm font-semibold text-green-700">FAKTA</p>
										<p className="text-base text-green-800 leading-relaxed">{fact}</p>
									</div>
								</div>
							</div>
						</motion.div>
					</CollapsibleContent>
				)}
			</AnimatePresence>
		</Collapsible>
	);
};

const ImpactSimulationCard = ({ message, timeEstimation, riskAfterChange, currentRisk }: any) => (
	<div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-200 text-center">
		<div className="flex justify-center items-center gap-2 mb-2">
			<Zap className="w-5 h-5 text-indigo-500" />
			<h3 className="text-lg font-bold text-slate-800">Simulasi Dampak Positif</h3>
		</div>
		<p className="text-base text-slate-700 max-w-2xl mx-auto mb-4">{message}</p>
		<div className="flex items-center justify-center gap-4 md:gap-8">
			<div className="text-center">
				<p className="text-4xl md:text-5xl font-extrabold text-red-500">{currentRisk.toFixed(1)}%</p>
				<p className="text-sm text-slate-500 font-medium mt-1">Risiko Saat Ini</p>
			</div>
			<ArrowRight className="h-8 w-8 text-slate-400" />
			<div className="text-center">
				<p className="text-4xl md:text-5xl font-extrabold text-green-500">{riskAfterChange.toFixed(1)}%</p>
				<p className="text-sm text-slate-500 font-medium mt-1">Potensi Risiko Baru</p>
			</div>
		</div>
		<p className="text-sm text-slate-500 mt-4">Estimasi waktu: {timeEstimation}</p>
	</div>
);

const MetricDetailCard = ({ code, title, yourValue, idealRange, description }: any) => {
	const statusStyles = {
		POOR: { text: 'Perlu Perhatian', badge: 'bg-red-100 text-red-800', scaleColor: 'bg-red-400' },
		FAIR: { text: 'Cukup', badge: 'bg-amber-100 text-amber-800', scaleColor: 'bg-amber-400' },
		GOOD: { text: 'Baik', badge: 'bg-green-100 text-green-800', scaleColor: 'bg-green-400' },
	};
	const status = statusStyles[code as keyof typeof statusStyles] || { text: code, badge: 'bg-slate-100 text-slate-700', scaleColor: 'bg-slate-400' };

	const scalePosition = code === 'GOOD' ? '16.6%' : code === 'FAIR' ? '50%' : '83.3%';

	return (
		<div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
			<div className="flex justify-between items-start mb-2">
				<h4 className="font-semibold text-base text-slate-800">{title}</h4>
				<Badge className={`text-sm font-bold ${status.badge}`}>{status.text}</Badge>
			</div>
			<div className="flex items-baseline gap-2 mb-2">
				<span className="text-3xl font-bold text-sky-600">{yourValue}</span>
				<span className="text-base text-slate-500">/ ideal: {idealRange}</span>
			</div>
			<div className="w-full h-2 bg-gradient-to-r from-green-300 via-amber-300 to-red-300 rounded-full mb-2 relative">
				<motion.div className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ring-2 ring-white ${status.scaleColor}`} initial={{ left: '50%' }} animate={{ left: scalePosition }} transition={{ duration: 0.8, ease: 'easeOut' }} />
			</div>
			<p className="text-sm text-slate-700 leading-relaxed flex-grow mt-2">{description}</p>
		</div>
	);
};

const DataPoint = ({ icon, label, value, estimationDetails }: { icon: React.ReactElement; label: string; value: string; estimationDetails?: any }) => {
	const [isOpen, setIsOpen] = useState(false);
	if (!estimationDetails) {
		return (
			<div className="p-3 bg-white rounded-lg border border-slate-200 h-fit">
				<div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
					{React.cloneElement(icon as React.ReactElement<any>, { className: 'w-4 h-4' })}
					<span>{label}</span>
				</div>
				<p className="font-bold text-base text-slate-800">{value}</p>
			</div>
		);
	}
	return (
		<Collapsible open={isOpen} onOpenChange={setIsOpen} className="p-3 bg-white rounded-lg border border-slate-200">
			<CollapsibleTrigger className="w-full text-left group">
				<div className="flex items-center justify-between">
					<div>
						<div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
							{React.cloneElement(icon as React.ReactElement<any>, { className: 'w-4 h-4' })}
							<span>{label}</span>
						</div>
						<p className="font-bold text-base text-slate-800">{value}</p>
					</div>
					<ChevronDown className="w-4 h-4 text-slate-400 group-data-[state=open]:rotate-180 transition-transform" />
				</div>
				<Badge className="mt-1 text-xs bg-amber-100 text-amber-800 font-semibold">Estimasi</Badge>
			</CollapsibleTrigger>
			<AnimatePresence initial={false}>
				{isOpen && (
					<CollapsibleContent asChild forceMount>
						<motion.div
							initial="collapsed"
							animate="open"
							exit="collapsed"
							variants={{ open: { opacity: 1, height: 'auto' }, collapsed: { opacity: 0, height: 0 } }}
							transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
							className="overflow-hidden"
						>
							<div className="pt-3 mt-3 border-t border-slate-200/80">
								<h5 className="text-sm font-semibold text-slate-600 mb-2">Jawaban yang Digunakan:</h5>
								<div className="space-y-2">
									{estimationDetails.proxyResponses.map((res: any, index: number) => (
										<div key={index} className="text-sm">
											<p className="text-slate-500">{res.question}</p>
											<p className="font-semibold text-slate-700">{res.answer}</p>
										</div>
									))}
								</div>
							</div>
						</motion.div>
					</CollapsibleContent>
				)}
			</AnimatePresence>
		</Collapsible>
	);
};

const ClosingStatementCard = ({ motivationalMessage, firstStepAction, localContextTip }: any) => (
	<div className="p-6 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-2xl text-white shadow-lg">
		<h3 className="text-2xl font-bold mb-4">Langkah Anda Selanjutnya</h3>
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
			<div className="flex items-start gap-3">
				<Award className="w-8 h-8 text-white/80 flex-shrink-0" />
				<div>
					<h4 className="font-semibold mb-1">Fokus Utama</h4>
					<p className="text-white/90 text-sm">{firstStepAction}</p>
				</div>
			</div>
			<div className="flex items-start gap-3">
				<MessageCircle className="w-8 h-8 text-white/80 flex-shrink-0" />
				<div>
					<h4 className="font-semibold mb-1">Pesan Semangat</h4>
					<p className="text-white/90 text-sm">{motivationalMessage}</p>
				</div>
			</div>
			<div className="flex items-start gap-3">
				<MapPin className="w-8 h-8 text-white/80 flex-shrink-0" />
				<div>
					<h4 className="font-semibold mb-1">Tips Kontekstual</h4>
					<p className="text-white/90 text-sm">{localContextTip}</p>
				</div>
			</div>
		</div>
	</div>
);

const ThematicSeparator = () => (
	<div className="flex items-center text-slate-300" aria-hidden="true">
		<div className="flex-grow border-t border-slate-200"></div>
		<span className="flex-shrink mx-4">
			<Activity className="w-5 h-5" />
		</span>
		<div className="flex-grow border-t border-slate-200"></div>
	</div>
);
