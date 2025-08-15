import { motion, AnimatePresence } from 'framer-motion';
import {
	X,
	Calendar,
	AlertTriangle,
	CheckCircle,
	TrendingUp,
	Activity,
	Heart,
	Target,
	Zap,
	BookOpen,
	MapPin,
	MessageCircle,
	ArrowRight,
	Stethoscope,
	TestTube,
	Award,
	Info,
	ChevronDown,
	ChevronUp,
	Brain,
	FileText,
	User,
	LocateIcon as LocationIcon,
	Cigarette,
	Droplets,
	TestTube2,
	Calculator,
	HelpCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import type { AnalysisRecord, RiwayatDetailModalProps } from '@/types';

const modalVariants = {
	hidden: { opacity: 0, scale: 0.95, y: 20 },
	visible: { opacity: 1, scale: 1, y: 0 },
	exit: { opacity: 0, scale: 0.95, y: 20 },
};

const overlayVariants = {
	hidden: { opacity: 0 },
	visible: { opacity: 1 },
	exit: { opacity: 0 },
};

const tabContentVariants = {
	hidden: { opacity: 0, x: 20 },
	visible: { opacity: 1, x: 0 },
	exit: { opacity: 0, x: -20 },
};

export function RiwayatDetailModal({ record, isOpen, onClose }: RiwayatDetailModalProps) {
	const [expandedMyths, setExpandedMyths] = useState<number[]>([]);
	const [expandedEstimations, setExpandedEstimations] = useState<number[]>([]);
	const [activeTab, setActiveTab] = useState('analysis');

	if (!record) return null;

	const getUserInputData = (record: AnalysisRecord) => {
		const coreData = {
			age: record.generated_value.age,
			gender: record.generated_value.sex_label,
			smokingStatus: record.input.smoking_status === 'Bukan perokok saat ini' ? 'never' : 'current',
			region: 'Indonesia', // fallback default karena tidak disediakan API
			diabetesStatus: record.input.has_diabetes ? 'yes' : 'no',
			diabetesAge: record.input.has_diabetes ? record.input.age_at_diabetes_diagnosis : undefined,
		};

		const healthMetrics = {
			sbp: record.generated_value.sbp,
			totalCholesterol: record.generated_value.tchol,
			hdl: record.generated_value.hdl,
			hba1c: record.generated_value.hba1c !== undefined ? record.generated_value.hba1c : null,
			scr: record.generated_value.scr !== undefined ? record.generated_value.scr : null,
		};

		const estimatedValues: string[] = [];
		const estimatedParameters = [];

		// Estimasi SBP
		if (record.input.sbp_input_type === 'proxy' && record.input.sbp_proxy_answers) {
			estimatedValues.push('sbp');
			estimatedParameters.push({
				name: 'Tekanan Darah (SBP)',
				value: `${record.generated_value.sbp}`,
				unit: 'mmHg',
				estimationMethod: 'Berdasarkan jawaban proxy terkait tekanan darah',
				proxyResponses: Object.entries(record.input.sbp_proxy_answers)?.map(([qKey, answer]) => ({
					question: qKey.replace('q_', '').replace(/_/g, ' ').toUpperCase(),
					// question: qKey.replace('q_', '').replace(/_/g, ' ').toUpperCase(),
					answer: answer,
				})),
			});
		}

		// Estimasi TCHOL
		if (record.input.tchol_input_type === 'proxy' && record.input.tchol_proxy_answers) {
			estimatedValues.push('totalCholesterol');
			estimatedParameters.push({
				name: 'Kolesterol Total',
				value: `${record.generated_value.tchol}`,
				unit: 'mmol/L',
				estimationMethod: 'Berdasarkan jawaban proxy terkait kolesterol',
				proxyResponses: Object.entries(record.input.tchol_proxy_answers)?.map(([qKey, answer]) => ({
					question: qKey.replace('q_', '').replace(/_/g, ' ').toUpperCase(),
					answer: answer,
				})),
			});
		}

		// Estimasi HDL
		if (record.input.hdl_input_type === 'proxy' && record.input.hdl_proxy_answers) {
			estimatedValues.push('hdl');
			estimatedParameters.push({
				name: 'Kolesterol HDL',
				value: `${record.generated_value.hdl}`,
				unit: 'mmol/L',
				estimationMethod: 'Berdasarkan jawaban proxy terkait HDL',
				proxyResponses: Object.entries(record.input.hdl_proxy_answers)?.map(([qKey, answer]) => ({
					question: qKey.replace('q_', '').replace(/_/g, ' ').toUpperCase(),
					answer: answer,
				})),
			});
		}

		// Estimasi HBA1C
		if (record.generated_value.hba1c !== undefined) {
			estimatedValues.push('hba1c');
			estimatedParameters.push({
				name: 'HBA1C',
				value: `${record.generated_value.hba1c}`,
				unit: '%',
				estimationMethod: 'Dihitung berdasarkan data diabetes dan usia diagnosis',
				proxyResponses: [],
			});
		}

		// Estimasi Serum Creatinine
		if (record.generated_value.scr !== undefined) {
			estimatedValues.push('serumCreatinine');
			estimatedParameters.push({
				name: 'Serum Creatinine',
				value: `${record.generated_value.scr}`,
				unit: 'mg/dL',
				estimationMethod: 'Dihitung berdasarkan data diabetes dan usia diagnosis',
				proxyResponses: [],
			});
		}

		return {
			coreData,
			healthMetrics,
			estimatedValues,
			estimatedParameters,
		};
	};

	const getDetailedAnalysis = (record: AnalysisRecord) => {
		const riskSummary = record.result_details.riskSummary;

		console.log('Risk Summary:', riskSummary);
		console.log(record.result_details);

		return {
			riskSummary: {
				riskPercentage: riskSummary.riskPercentage,
				riskCategory: {
					level: riskSummary.riskCategory.code,
					label: riskSummary.riskCategory.title,
				},
				executiveSummary: riskSummary.executiveSummary,
				primaryContributors: riskSummary.primaryContributors?.map((c) => ({
					title: c.title,
					severity: c.severity,
					explanation: c.description,
				})),
				contextualRiskExplanation: riskSummary.contextualRiskExplanation,
				positiveFactors: riskSummary.positiveFactors,
			},
			actionPlan: {
				medicalConsultation: {
					recommendationLevel: record.result_details.actionPlan.medicalConsultation.recommendationLevel.code,
					explanation: record.result_details.actionPlan.medicalConsultation.recommendationLevel.description,
					suggestedTests: record.result_details.actionPlan.medicalConsultation.suggestedTests,
				},
				lifestyleActions: record.result_details.actionPlan.priorityLifestyleActions?.map((action) => ({
					title: action.title,
					description: action.description,
					targetGoal: action.target,
					estimatedImpact: action.estimatedImpact,
					priority: action.rank,
				})),
				impactSimulation: {
					message: record.result_details.actionPlan.impactSimulation.message,
					predictedRiskReduction: record.result_details.actionPlan.impactSimulation.riskAfterChange,
				},
			},
			personalizedEducation: {
				keyHealthMetrics: record.result_details.personalizedEducation.keyHealthMetrics?.map((item) => ({
					name: item.title,
					userValue: item.yourValue,
					idealRange: item.idealRange,
					status: item.code,
				})),
				mythsVsFacts: record.result_details.personalizedEducation.mythVsFact,
			},
			closingStatement: {
				motivationalMessage: record.result_details.closingStatement.motivationalMessage,
				firstStepToTake: record.result_details.closingStatement.firstStepAction,
				localContextTip: record.result_details.closingStatement.localContextTip,
			},
		};
	};

	const detailedAnalysis = getDetailedAnalysis(record);
	const userInputData = getUserInputData(record);

	const getRiskColor = (level: string) => {
		switch (level.toLowerCase()) {
			case 'low_moderate':
				return 'text-green-600 bg-green-50 border-green-200';
			case 'high':
				return 'text-yellow-600 bg-yellow-50 border-yellow-200';
			case 'very_high':
				return 'text-red-600 bg-red-50 border-red-200';
			default:
				return 'text-gray-600 bg-gray-50 border-gray-200';
		}
	};

	const severityTextMap = {
		LOW: 'Rendah',
		MEDIUM: 'Sedang',
		HIGH: 'Tinggi',
	};

	const getSeverityBadge = (severity: string) => {
		const colors = {
			HIGH: 'bg-red-100 text-red-700 border-red-200',
			MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
			LOW: 'bg-green-100 text-green-700 border-green-200',
		};
		return colors[severity as keyof typeof colors] || colors.LOW;
	};

	const metricStatusMap = {
		POOR: 'Buruk',
		FAIR: 'Cukup',
		GOOD: 'Baik',
	};

	const getMetricStatusColor = (status: string) => {
		switch (status) {
			case 'GOOD':
				return 'text-green-600 bg-green-50';
			case 'FAIR':
				return 'text-yellow-600 bg-yellow-50';
			case 'POOR':
				return 'text-red-600 bg-red-50';
			default:
				return 'text-gray-600 bg-gray-50';
		}
	};

	const getRecommendationBadge = (level: string) => {
		const colors = {
			GENERAL_ADVICE: 'bg-green-100 text-green-700 border-green-200',
			CONSIDER_INTERVENTION: 'bg-yellow-100 text-yellow-700 border-yellow-200',
			URGENT_INTERVENTION: 'bg-red-100 text-red-700 border-red-200',
			ROUTINE: 'bg-green-100 text-green-700 border-green-200',
			RECOMMENDED: 'bg-yellow-100 text-yellow-700 border-yellow-200',
			URGENT: 'bg-red-100 text-red-700 border-red-200',
		};
		return colors[level as keyof typeof colors] || colors.CONSIDER_INTERVENTION;
	};

	const recommendationTextMap = {
		GENERAL_ADVICE: 'Saran Umum',
		CONSIDER_INTERVENTION: 'Pertimbangkan Intervensi',
		URGENT_INTERVENTION: 'Intervensi Segera',
		ROUTINE: 'Saran Umum',
		RECOMMENDED: 'Pertimbangkan Intervensi',
		URGENT: 'Intervensi Segera',
		
	};

	const toggleMyth = (index: number) => {
		setExpandedMyths((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
	};

	const toggleEstimation = (index: number) => {
		setExpandedEstimations((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
	};

	const formatGender = (gender: string) => {
		return gender === 'male' ? 'Laki-laki' : 'Perempuan';
	};

	const formatSmokingStatus = (status: string) => {
		switch (status) {
			case 'never':
				return 'Tidak Pernah';
			case 'former':
				return 'Mantan Perokok';
			case 'current':
				return 'Perokok Aktif';
			default:
				return status;
		}
	};

	const formatDiabetesStatus = (status: string, age?: number) => {
		if (status === 'no') return 'Tidak';
		return age ? `Ya (sejak usia ${age} tahun)` : 'Ya';
	};

	const isEstimated = (fieldName: string) => {
		return userInputData.estimatedValues.includes(fieldName);
	};

	// 1. Konversi string ke angka secara eksplisit menggunakan parseFloat()
	const percentage = parseFloat(detailedAnalysis.riskSummary.riskPercentage.toString());
	const reduction = parseFloat(detailedAnalysis.actionPlan.impactSimulation.predictedRiskReduction.toString());

	// 2. Lakukan perhitungan. Jika salah satu konversi gagal, hasilnya akan NaN.
	const riskValue = percentage - reduction;

	console.log('Detailed Analysis:', detailedAnalysis);

	return (
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
					{/* Overlay */}
					<motion.div variants={overlayVariants} initial="hidden" animate="visible" exit="exit" className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

					{/* Modal */}
					<motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="relative w-full max-w-4xl md:max-w-6xl my-8">
						<Card className="rounded-2xl shadow-xl border border-gray-200 bg-white pt-0">
							{/* Header */}
							<CardHeader className="relative p-6 md:p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
								<Button variant="ghost" size="icon" onClick={onClose} className="absolute top-4 right-4 h-8 w-8 rounded-full hover:bg-white/80 transition-all duration-300 cursor-pointer">
									<X className="h-4 w-4" />
								</Button>

								<div className="flex items-start gap-4 pr-12">
									<div className="p-3 rounded-xl bg-blue-100 hidden md:block">
										<Heart className="h-6 w-6 text-blue-600" />
									</div>
									<div className="flex-1">
										<h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Laporan Analisis Kesehatan</h2>
										<div className="flex items-center gap-4 text-gray-600 mb-3">
											<div className="flex items-center gap-2">
												<Calendar className="h-4 w-4" />
												<span className="text-sm md:text-base">{record.date}</span>
											</div>
										</div>
									</div>
								</div>
							</CardHeader>

							{/* Tabs */}
							<div className="p-4 md:p-6 lg:p-8">
								<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
									<TabsList className="grid w-full grid-cols-2 mb-6 md:mb-8 bg-gray-100 rounded-xl p-1 pb-[40px]">
										<TabsTrigger value="analysis" className="flex items-center gap-2 rounded-lg text-sm md:text-base font-medium transition-all duration-300 data-[state=active]:bg-white data-[state=active]:shadow-sm cursor-pointer">
											<Brain className="h-4 w-4" />
											Analisis AI
										</TabsTrigger>
										<TabsTrigger value="input" className="flex items-center gap-2 rounded-lg text-sm md:text-base font-medium transition-all duration-300 data-[state=active]:bg-white data-[state=active]:shadow-sm cursor-pointer">
											<FileText className="h-4 w-4" />
											Input Pengguna
										</TabsTrigger>
									</TabsList>

									{/* AI Analysis Result Tab */}
									<TabsContent value="analysis" className="mt-0">
										<motion.div variants={tabContentVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.3 }} className="max-h-[60vh] overflow-y-auto space-y-6 md:space-y-8">
											{/* Risk Summary */}
											<motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
												<div className="flex items-center gap-3">
													<div className="p-2 rounded-lg bg-red-100">
														<TrendingUp className="h-5 w-5 text-red-600" />
													</div>
													<h3 className="text-xl md:text-2xl font-bold text-gray-900">Ringkasan Risiko</h3>
												</div>

												<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
													<Card className="rounded-2xl shadow-sm hover:shadow-md border border-gray-200 bg-white">
														<CardContent className="p-4 md:p-6 space-y-4">
															<div className="text-center space-y-3">
																<Badge className={`${getRiskColor(detailedAnalysis.riskSummary.riskCategory.level)} text-sm font-medium uppercase tracking-wide`}>{detailedAnalysis.riskSummary.riskCategory.label}</Badge>
																<div className="text-4xl md:text-5xl font-bold text-gray-900">{detailedAnalysis.riskSummary.riskPercentage}%</div>
																<Progress value={detailedAnalysis.riskSummary.riskPercentage} className="h-3 bg-gray-200" />
															</div>
															<p className="text-sm md:text-base text-gray-600 leading-relaxed text-center">{detailedAnalysis.riskSummary.executiveSummary}</p>
														</CardContent>
													</Card>

													<Card className="rounded-2xl shadow-sm hover:shadow-md border border-gray-200 bg-white">
														<CardContent className="p-4 md:p-6 space-y-4">
															<h4 className="font-bold text-gray-900 text-base md:text-lg">Faktor Kontributor Utama</h4>
															<div className="space-y-3">
																{detailedAnalysis.riskSummary.primaryContributors?.map((contributor, index) => (
																	<div key={index} className="p-3 rounded-lg bg-gray-50 border border-gray-200">
																		<div className="flex items-start justify-between gap-3 mb-2">
																			<h5 className="font-medium text-gray-900 text-sm md:text-base">{contributor.title}</h5>
																			<Badge className={`${getSeverityBadge(contributor.severity)} text-xs font-medium`}>{severityTextMap[contributor.severity] || contributor.severity}</Badge>
																		</div>
																		<p className="text-xs md:text-sm text-gray-600 leading-relaxed">{contributor.explanation}</p>
																	</div>
																))}
															</div>
														</CardContent>
													</Card>
												</div>

												<Card className="rounded-2xl shadow-sm hover:shadow-md border border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
													<CardContent className="p-4 md:p-6 space-y-4">
														<h4 className="font-bold text-gray-900 text-base md:text-lg flex items-center gap-2">
															<Info className="h-5 w-5 text-blue-600" />
															Mengapa Tingkat Risiko Ini?
														</h4>
														<p className="text-sm md:text-base text-gray-700 leading-relaxed">{detailedAnalysis.riskSummary.contextualRiskExplanation}</p>
													</CardContent>
												</Card>

												<Card className="rounded-2xl shadow-sm hover:shadow-md border border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
													<CardContent className="p-4 md:p-6 space-y-4">
														<h4 className="font-bold text-gray-900 text-base md:text-lg flex items-center gap-2">
															<CheckCircle className="h-5 w-5 text-green-600" />
															Faktor Positif
														</h4>
														<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
															{(detailedAnalysis.riskSummary.positiveFactors ?? [])?.map((factor, index) => (
																<div key={index} className="flex items-start gap-2">
																	<CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
																	<p className="text-sm md:text-base text-gray-700">{factor}</p>
																</div>
															))}
														</div>
													</CardContent>
												</Card>
											</motion.section>

											<Separator className="bg-gray-200" />

											{/* Action Plan */}
											<motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
												<div className="flex items-center gap-3">
													<div className="p-2 rounded-lg bg-blue-100">
														<Target className="h-5 w-5 text-blue-600" />
													</div>
													<h3 className="text-xl md:text-2xl font-bold text-gray-900">Rencana Aksi</h3>
												</div>

												{/* Medical Consultation */}
												<Card className="rounded-2xl shadow-sm hover:shadow-md border border-gray-200 bg-white">
													<CardContent className="p-4 md:p-6 space-y-4">
														<div className="flex items-center gap-3">
															<Stethoscope className="h-5 w-5 text-blue-600" />
															<div className="w-full flex justify-between">
																<h4 className="font-bold text-gray-900 text-base md:text-lg">Konsultasi Medis</h4>
																<Badge className={`${getRecommendationBadge(detailedAnalysis.actionPlan.medicalConsultation.recommendationLevel)} text-xs font-medium uppercase tracking-wide`}>
																	{recommendationTextMap[detailedAnalysis.actionPlan.medicalConsultation.recommendationLevel as keyof typeof recommendationTextMap]}
																</Badge>
															</div>
														</div>
														<p className="text-sm md:text-base text-gray-600 leading-relaxed">{detailedAnalysis.actionPlan.medicalConsultation.explanation}</p>

														<div className="space-y-3">
															<h5 className="font-medium text-gray-900 text-sm md:text-base">Tes yang Disarankan:</h5>
															<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
																{detailedAnalysis.actionPlan.medicalConsultation.suggestedTests?.map((test, index) => (
																	<div key={index} className="p-3 rounded-lg bg-blue-50 border border-blue-200">
																		<div className="flex items-start gap-2 mb-2">
																			<TestTube className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
																			<h6 className="font-medium text-blue-900 text-sm">{test.title}</h6>
																		</div>
																		<p className="text-xs text-blue-700 leading-relaxed">{test.description}</p>
																	</div>
																))}
															</div>
														</div>
													</CardContent>
												</Card>

												{/* Lifestyle Actions */}
												<Card className="rounded-2xl shadow-sm hover:shadow-md border border-gray-200 bg-white">
													<CardContent className="p-4 md:p-6 space-y-4">
														<div className="flex items-center gap-3">
															<Activity className="h-5 w-5 text-green-600" />
															<h4 className="font-bold text-gray-900 text-base md:text-lg">Aksi Gaya Hidup</h4>
														</div>

														<div className="space-y-4">
															{detailedAnalysis.actionPlan.lifestyleActions
																.sort((a, b) => a.priority - b.priority)
																?.map((action, index) => (
																	<div key={index} className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
																		<div className="flex items-start justify-between gap-3 mb-3">
																			<div className="flex items-center gap-2">
																				<div className="w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center">{action.priority}</div>
																				<h5 className="font-bold text-gray-900 text-sm md:text-base">{action.title}</h5>
																			</div>
																			<Badge className="bg-green-100 text-green-700 border-green-200 text-xs font-medium">Prioritas {action.priority}</Badge>
																		</div>
																		<p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">{action.description}</p>
																		<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
																			<div className="p-2 rounded bg-white/60 border border-green-200">
																				<p className="text-xs text-green-700 font-medium mb-1">Target:</p>
																				<p className="text-sm text-gray-900">{action.targetGoal}</p>
																			</div>
																			<div className="p-2 rounded bg-white/60 border border-green-200">
																				<p className="text-xs text-green-700 font-medium mb-1">Estimasi Dampak:</p>
																				<p className="text-sm text-gray-900">{action.estimatedImpact}</p>
																			</div>
																		</div>
																	</div>
																))}
														</div>
													</CardContent>
												</Card>

												{/* Impact Simulation */}
												<Card className="rounded-2xl shadow-sm hover:shadow-md border border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
													<CardContent className="p-4 md:p-6 space-y-4">
														<div className="flex items-center gap-3">
															<Zap className="h-5 w-5 text-purple-600" />
															<h4 className="font-bold text-gray-900 text-base md:text-lg">Simulasi Dampak</h4>
														</div>
														<p className="text-sm md:text-base text-gray-700 leading-relaxed">{detailedAnalysis.actionPlan.impactSimulation.message}</p>
														<div className="flex items-center gap-4 p-4 rounded-lg bg-white/60 border border-purple-200">
															<div className="text-center">
																<p className="text-2xl font-bold text-red-600">{detailedAnalysis.riskSummary.riskPercentage}%</p>
																<p className="text-xs text-gray-600">Sekarang</p>
															</div>
															<ArrowRight className="h-5 w-5 text-purple-600" />
															<div className="text-center">
																<p className="text-2xl font-bold text-green-600">{isNaN(riskValue) ? '0.00' : riskValue.toFixed(2)}%</p>
																<p className="text-xs text-gray-600">Setelah 6 bulan</p>
															</div>
														</div>
													</CardContent>
												</Card>
											</motion.section>

											<Separator className="bg-gray-200" />

											{/* Personalized Education */}
											<motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-6">
												<div className="flex items-center gap-3">
													<div className="p-2 rounded-lg bg-indigo-100">
														<BookOpen className="h-5 w-5 text-indigo-600" />
													</div>
													<h3 className="text-xl md:text-2xl font-bold text-gray-900">Edukasi Personal</h3>
												</div>

												{/* Key Health Metrics */}
												<Card className="rounded-2xl shadow-sm hover:shadow-md border border-gray-200 bg-white">
													<CardContent className="p-4 md:p-6 space-y-4">
														<h4 className="font-bold text-gray-900 text-base md:text-lg">Metrik Kesehatan Utama</h4>
														<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
															{detailedAnalysis.personalizedEducation.keyHealthMetrics?.map((metric, index) => (
																<div key={index} className="p-4 rounded-lg bg-gray-50 border border-gray-200">
																	<div className="flex items-center justify-between mb-2">
																		<h5 className="font-medium text-gray-900 text-sm md:text-base">{metric.name}</h5>
																		<Badge className={`${getMetricStatusColor(metric.status)} text-xs font-medium`}>{metricStatusMap[metric.status] || metric.status}</Badge>
																	</div>
																	<div className="space-y-1">
																		<p className="text-sm text-gray-600">
																			<span className="font-medium">Nilai Anda:</span> {metric.userValue}
																		</p>
																		<p className="text-sm text-gray-600">
																			<span className="font-medium">Rentang Ideal:</span> {metric.idealRange}
																		</p>
																	</div>
																</div>
															))}
														</div>
													</CardContent>
												</Card>

												{/* Myths vs Facts */}
												<Card className="rounded-2xl shadow-sm hover:shadow-md border border-gray-200 bg-white">
													<CardContent className="p-4 md:p-6 space-y-4">
														<h4 className="font-bold text-gray-900 text-base md:text-lg">Mitos vs Fakta</h4>
														<div className="space-y-3">
															{detailedAnalysis.personalizedEducation.mythsVsFacts?.map((item, index) => (
																<Collapsible key={index}>
																	<CollapsibleTrigger onClick={() => toggleMyth(index)} className="w-full p-3 rounded-lg bg-red-50 border border-red-200 hover:bg-red-100 transition-all duration-300 text-left cursor-pointer">
																		<div className="flex items-center justify-between">
																			<div className="flex items-start gap-2">
																				<AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
																				<div>
																					<p className="text-sm font-medium text-red-800">MITOS</p>
																					<p className="text-sm text-red-700">{item.myth}</p>
																				</div>
																			</div>
																			{expandedMyths.includes(index) ? <ChevronUp className="h-4 w-4 text-red-600" /> : <ChevronDown className="h-4 w-4 text-red-600" />}
																		</div>
																	</CollapsibleTrigger>
																	<CollapsibleContent>
																		<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-2 p-3 rounded-lg bg-green-50 border border-green-200">
																			<div className="flex items-start gap-2">
																				<CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
																				<div>
																					<p className="text-sm font-medium text-green-800 mb-1">FAKTA</p>
																					<p className="text-sm text-green-700 leading-relaxed">{item.fact}</p>
																				</div>
																			</div>
																		</motion.div>
																	</CollapsibleContent>
																</Collapsible>
															))}
														</div>
													</CardContent>
												</Card>
											</motion.section>

											<Separator className="bg-gray-200" />

											{/* Closing Statement */}
											<motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-6">
												<div className="flex items-center gap-3">
													<div className="p-2 rounded-lg bg-green-100">
														<MessageCircle className="h-5 w-5 text-green-600" />
													</div>
													<h3 className="text-xl md:text-2xl font-bold text-gray-900">Pesan Penutup</h3>
												</div>

												<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
													<Card className="rounded-2xl shadow-sm hover:shadow-md border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50">
														<CardContent className="p-4 md:p-6 space-y-3">
															<div className="flex items-center gap-2">
																<MessageCircle className="h-5 w-5 text-blue-600" />
																<h4 className="font-bold text-blue-900 text-sm md:text-base">Motivasi</h4>
															</div>
															<p className="text-sm md:text-base text-blue-800 leading-relaxed">{detailedAnalysis.closingStatement.motivationalMessage}</p>
														</CardContent>
													</Card>

													<Card className="rounded-2xl shadow-sm hover:shadow-md border border-gray-200 bg-gradient-to-br from-green-50 to-emerald-50">
														<CardContent className="p-4 md:p-6 space-y-3">
															<div className="flex items-center gap-2">
																<Award className="h-5 w-5 text-green-600" />
																<h4 className="font-bold text-green-900 text-sm md:text-base">Langkah Pertama</h4>
															</div>
															<p className="text-sm md:text-base text-green-800 leading-relaxed">{detailedAnalysis.closingStatement.firstStepToTake}</p>
														</CardContent>
													</Card>

													<Card className="rounded-2xl shadow-sm hover:shadow-md border border-gray-200 bg-gradient-to-br from-purple-50 to-pink-50">
														<CardContent className="p-4 md:p-6 space-y-3">
															<div className="flex items-center gap-2">
																<MapPin className="h-5 w-5 text-purple-600" />
																<h4 className="font-bold text-purple-900 text-sm md:text-base">Tips Lokal</h4>
															</div>
															<p className="text-sm md:text-base text-purple-800 leading-relaxed">{detailedAnalysis.closingStatement.localContextTip}</p>
														</CardContent>
													</Card>
												</div>
											</motion.section>
										</motion.div>
									</TabsContent>

									{/* User Input History Tab */}
									<TabsContent value="input" className="mt-0">
										<motion.div variants={tabContentVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.3 }} className="max-h-[60vh] overflow-y-auto space-y-6 md:space-y-8">
											{/* Core Data Section */}
											<motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
												<div className="flex items-center gap-3">
													<div className="p-2 rounded-lg bg-blue-100">
														<User className="h-5 w-5 text-blue-600" />
													</div>
													<h3 className="text-xl md:text-2xl font-bold text-gray-900">Data Dasar</h3>
												</div>

												<Card className="rounded-2xl shadow-sm hover:shadow-md border border-gray-200 bg-white">
													<CardContent className="p-4 md:p-6">
														<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
															<div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
																<div className="flex items-center gap-2 mb-2">
																	<User className="h-4 w-4 text-gray-600" />
																	<h4 className="font-medium text-gray-900 text-sm md:text-base">Usia</h4>
																</div>
																<p className="text-lg font-bold text-gray-900">{userInputData.coreData.age} tahun</p>
															</div>

															<div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
																<div className="flex items-center gap-2 mb-2">
																	<User className="h-4 w-4 text-gray-600" />
																	<h4 className="font-medium text-gray-900 text-sm md:text-base">Jenis Kelamin</h4>
																</div>
																<p className="text-lg font-bold text-gray-900">{formatGender(userInputData.coreData.gender)}</p>
															</div>

															<div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
																<div className="flex items-center gap-2 mb-2">
																	<Cigarette className="h-4 w-4 text-gray-600" />
																	<h4 className="font-medium text-gray-900 text-sm md:text-base">Status Merokok</h4>
																</div>
																<p className="text-lg font-bold text-gray-900">{formatSmokingStatus(userInputData.coreData.smokingStatus)}</p>
															</div>

															<div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
																<div className="flex items-center gap-2 mb-2">
																	<LocationIcon className="h-4 w-4 text-gray-600" />
																	<h4 className="font-medium text-gray-900 text-sm md:text-base">Wilayah</h4>
																</div>
																<p className="text-lg font-bold text-gray-900">{userInputData.coreData.region}</p>
															</div>

															<div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
																<div className="flex items-center gap-2 mb-2">
																	<Droplets className="h-4 w-4 text-gray-600" />
																	<h4 className="font-medium text-gray-900 text-sm md:text-base">Status Diabetes</h4>
																</div>
																<p className="text-lg font-bold text-gray-900">{formatDiabetesStatus(userInputData.coreData.diabetesStatus, userInputData.coreData.diabetesAge)}</p>
															</div>
														</div>
													</CardContent>
												</Card>
											</motion.section>

											<Separator className="bg-gray-200" />

											{/* Health Metrics Section */}
											<motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
												<div className="flex items-center gap-3">
													<div className="p-2 rounded-lg bg-green-100">
														<TestTube2 className="h-5 w-5 text-green-600" />
													</div>
													<h3 className="text-xl md:text-2xl font-bold text-gray-900">Metrik Kesehatan</h3>
												</div>

												<Card className="rounded-2xl shadow-sm hover:shadow-md border border-gray-200 bg-white">
													<CardContent className="p-4 md:p-6">
														<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
															<div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
																<div className="flex items-center gap-2 mb-2">
																	<Activity className="h-4 w-4 text-gray-600" />
																	<h4 className="font-medium text-gray-900 text-sm md:text-base">Tekanan Darah Sistolik (SBP)</h4>
																</div>
																<p className="text-lg font-bold text-gray-900">{userInputData.healthMetrics.sbp} mmHg</p>
															</div>

															<div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
																<div className="flex items-center gap-2 mb-2">
																	<TestTube2 className="h-4 w-4 text-gray-600" />
																	<h4 className="font-medium text-gray-900 text-sm md:text-base flex items-center gap-1">
																		Kolesterol Total
																		{isEstimated('totalCholesterol') && <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs font-medium">Estimasi</Badge>}
																	</h4>
																</div>
																<p className="text-lg font-bold text-gray-900">{userInputData.healthMetrics.totalCholesterol} mg/dL</p>
															</div>

															<div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
																<div className="flex items-center gap-2 mb-2">
																	<Heart className="h-4 w-4 text-gray-600" />
																	<h4 className="font-medium text-gray-900 text-sm md:text-base flex items-center gap-1">
																		HDL Cholesterol
																		{isEstimated('hdl') && <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs font-medium">Estimasi</Badge>}
																	</h4>
																</div>
																<p className="text-lg font-bold text-gray-900">{userInputData.healthMetrics.hdl} mg/dL</p>
															</div>

															{userInputData.healthMetrics.hba1c && (
																<div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
																	<div className="flex items-center gap-2 mb-2">
																		<Droplets className="h-4 w-4 text-gray-600" />
																		<h4 className="font-medium text-gray-900 text-sm md:text-base">HbA1c</h4>
																	</div>
																	<p className="text-lg font-bold text-gray-900">{userInputData.healthMetrics.hba1c}%</p>
																</div>
															)}

															{userInputData.healthMetrics.scr && (
																<div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
																	<div className="flex items-center gap-2 mb-2">
																		<TestTube className="h-4 w-4 text-gray-600" />
																		<h4 className="font-medium text-gray-900 text-sm md:text-base">Serum Kreatinin</h4>
																	</div>
																	<p className="text-lg font-bold text-gray-900">{userInputData.healthMetrics.scr} mg/dL</p>
																</div>
															)}
														</div>
													</CardContent>
												</Card>
											</motion.section>

											<Separator className="bg-gray-200" />

											{/* Estimated Parameters Breakdown */}
											{userInputData.estimatedParameters.length > 0 && (
												<motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-6">
													<div className="flex items-center gap-3">
														<div className="p-2 rounded-lg bg-orange-100">
															<Calculator className="h-5 w-5 text-orange-600" />
														</div>
														<h3 className="text-xl md:text-2xl font-bold text-gray-900">Detail Estimasi Parameter</h3>
													</div>

													<div className="space-y-4">
														{userInputData.estimatedParameters?.map((param, index) => (
															<Card key={index} className="rounded-2xl shadow-sm hover:shadow-md border border-orange-200 bg-white">
																<Collapsible>
																	<CollapsibleTrigger onClick={() => toggleEstimation(index)} className="w-full p-4 md:p-6 text-left hover:bg-orange-50/50 transition-all duration-300 rounded-2xl cursor-pointer">
																		<div className="flex items-center justify-between">
																			<div className="flex items-center gap-3">
																				<div className="p-2 rounded-lg bg-orange-100">
																					<Calculator className="h-5 w-5 text-orange-600" />
																				</div>
																				<div>
																					<h4 className="font-bold text-gray-900 text-base md:text-lg flex items-center gap-2">
																						{param.name}
																						<Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs font-medium">Estimasi</Badge>
																					</h4>
																					<div className="flex items-center gap-4 mt-1">
																						<p className="text-2xl font-bold text-orange-600">
																							{param.value} {param.unit}
																						</p>
																						<p className="text-sm text-gray-600">{param.estimationMethod}</p>
																					</div>
																				</div>
																			</div>
																			{expandedEstimations.includes(index) ? <ChevronUp className="h-5 w-5 text-orange-600" /> : <ChevronDown className="h-5 w-5 text-orange-600" />}
																		</div>
																	</CollapsibleTrigger>
																	<CollapsibleContent>
																		<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="px-4 md:px-6 pb-4 md:pb-6">
																			<Separator className="mb-4 bg-orange-200" />
																			<div className="space-y-4">
																				<div className="flex items-center gap-2 mb-3">
																					<HelpCircle className="h-4 w-4 text-orange-600" />
																					<h5 className="font-bold text-gray-900 text-sm md:text-base">Proxy Question Responses</h5>
																				</div>
																				<div className="space-y-3">
																					{param.proxyResponses?.map((response, responseIndex) => (
																						<div key={responseIndex} className="p-3 rounded-lg bg-orange-50 border border-orange-200">
																							<div className="space-y-2">
																								<div>
																									<p className="text-sm font-medium text-orange-800 mb-1">Pertanyaan:</p>
																									<p className="text-sm text-gray-700 leading-relaxed">{response.question}</p>
																								</div>
																								<div>
																									<p className="text-sm font-medium text-orange-800 mb-1">Jawaban Anda:</p>
																									<p className="text-sm font-bold text-gray-900">{response.answer}</p>
																								</div>
																							</div>
																						</div>
																					))}
																				</div>
																			</div>
																		</motion.div>
																	</CollapsibleContent>
																</Collapsible>
															</Card>
														))}
													</div>
												</motion.section>
											)}

											{/* General Estimation Note */}
											{userInputData.estimatedValues.length > 0 && (
												<motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
													<Card className="rounded-2xl shadow-sm hover:shadow-md border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
														<CardContent className="p-4 md:p-6">
															<div className="flex items-start gap-3">
																<Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
																<div>
																	<h4 className="font-bold text-blue-900 text-sm md:text-base mb-2">Tentang Estimasi Parameter</h4>
																	<p className="text-sm md:text-base text-blue-800 leading-relaxed">
																		Parameter yang ditandai dengan badge "Estimasi" dihitung menggunakan algoritma AI berdasarkan jawaban proxy questions yang Anda berikan. Sistem menganalisis pola respons Anda untuk memberikan perkiraan
																		nilai yang akurat secara klinis. Estimasi ini telah divalidasi dengan data medis dan memberikan tingkat akurasi yang tinggi untuk analisis risiko kardiovaskular.
																	</p>
																</div>
															</div>
														</CardContent>
													</Card>
												</motion.section>
											)}
										</motion.div>
									</TabsContent>
								</Tabs>
							</div>
						</Card>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}
