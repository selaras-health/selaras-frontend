/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useMemo, useCallback, type ForwardRefExoticComponent, type RefAttributes } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { ChevronLeft, Heart, CheckCircle, Sparkles, ArrowRight, Loader, User, MapPin, Info, ClipboardCheck, BrainCircuit, ShieldCheck, FileClock, PersonStanding, type LucideProps } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/provider/AuthProvider';
import { regionMap } from '@/lib/data';
import { newAnalysis, personalizeAnalysis } from '@/hooks/api/analysis';
import WarningCard from '@/components/fragments/warning-card';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ShimmeringCTAButton } from '@/components/fragments/ShimmeringCTAButton';

// --- TYPE DEFINITIONS ---
type AnalysisFormData = any;
type HealthParameter = any;

// --- ANIMATION VARIANTS ---
const slideVariants = {
	enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
	center: { zIndex: 1, x: 0, opacity: 1 },
	exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? '100%' : '-100%', opacity: 0 }),
};

// --- MAIN ANALYSIS PAGE COMPONENT ---
export default function AnalisisPageRevamped() {
	const auth = useAuth();
	const navigate = useNavigate();
	const { token, user } = auth || {};

	// --- STATE MANAGEMENT ---
	const [formData, setFormData] = useState<AnalysisFormData>({});
	const [isProfileChecked, setIsProfileChecked] = useState(false);
	const [isProfileComplete, setIsProfileComplete] = useState(false);
	const [questionIndex, setQuestionIndex] = useState(0);
	const [direction, setDirection] = useState(1);
	const [isLoading, setIsLoading] = useState(false);
	const [loadingProgress, setLoadingProgress] = useState(0);
	const [loadingMessage, setLoadingMessage] = useState('');
	const [backgroundStyle, setBackgroundStyle] = useState({ background: 'linear-gradient(to top, #f1f5f9, #f8fafc)' });
	console.log(setBackgroundStyle);

	// --- DATA INITIALIZATION & PROFILE CHECK ---
	useEffect(() => {
		if (user) {
			const { date_of_birth, sex, country_of_residence } = user;
			const profileComplete = !!(date_of_birth && sex && country_of_residence);
			setIsProfileComplete(profileComplete);

			if (profileComplete) {
				const [day, month, year] = date_of_birth.split('/');
				const birthDate = new Date(`${year}-${month}-${day}`);
				const today = new Date();
				let age = today.getFullYear() - birthDate.getFullYear();
				const m = today.getMonth() - birthDate.getMonth();
				if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

				const regionKey = Object.keys(regionMap).find((key) => regionMap[key as keyof typeof regionMap].includes(country_of_residence.toLowerCase()));
				const riskRegionMap: Record<string, string> = { very_high: 'Risiko Sangat Tinggi', high: 'Risiko Tinggi', moderate: 'Risiko Sedang', low: 'Risiko Rendah' };
				const riskRegion = riskRegionMap[regionKey || 'low'];

				setFormData({
					age: age.toString(),
					gender: sex,
					region: country_of_residence.toLowerCase(),
					riskRegion: riskRegion,
					smokingStatus: '',
					diabetesHistory: '',
					diabetesAge: '',
					healthProfile: {
						sbp: { inputType: '', manualValue: '', proxyAnswers: {}, completed: false },
						totalCholesterol: { inputType: '', manualValue: '', proxyAnswers: {}, completed: false },
						hdlCholesterol: { inputType: '', manualValue: '', proxyAnswers: {}, completed: false },
					},
				});
			}
			setIsProfileChecked(true);
		}
	}, [user]);

	// --- DYNAMIC QUESTION FLOW ---
	const questions = useMemo(() => {
		type Question = {
			type: string;
			field?: string;
			title?: string;
			icon?: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
			options?: string[];
			info?: string;
			inputType?: string; // Add inputType to the type definition
			unit?: string; // Added unit to the type definition
		};

		const baseQuestions: Question[] = [
			{ type: 'welcome' },
			{ type: 'info', field: 'age', title: 'Usia Anda', icon: User },
			{ type: 'info', field: 'gender', title: 'Jenis Kelamin', icon: User },
			{ type: 'info', field: 'region', title: 'Tempat Tinggal', icon: MapPin },
			{ type: 'info', field: 'riskRegion', title: 'Wilayah Risiko Geografis', icon: MapPin },
			{
				type: 'choice',
				field: 'smokingStatus',
				title: 'Apakah Anda seorang perokok?',
				icon: PersonStanding,
				options: ['Perokok aktif', 'Bukan perokok saat ini'],
				info: 'Status merokok adalah salah satu prediktor risiko kardiovaskular yang paling kuat.',
			},
			{
				type: 'choice',
				field: 'diabetesHistory',
				title: 'Apakah Anda memiliki riwayat diabetes?',
				icon: Heart,
				options: ['Ya', 'Tidak'],
				info: 'Diabetes secara signifikan memengaruhi perhitungan risiko kesehatan jantung dan ginjal Anda.',
			},
		];

		if (formData.diabetesHistory === 'Ya') {
			baseQuestions.push({
				type: 'input',
				field: 'diabetesAge',
				title: 'Pada usia berapa Anda didiagnosis diabetes?',
				inputType: 'number',
				unit: 'tahun',
				info: 'Usia saat diagnosis membantu kami memahami durasi dan dampak diabetes pada tubuh Anda.',
			});
		}

		const healthParams = [
			{ key: 'sbp', title: 'Tekanan Darah Sistolik (SBP)', unit: 'mmHg', proxyQuestions: sbpProxyQuestions, info: 'Tekanan darah sistolik adalah angka "atas" pada pengukuran tekanan darah dan merupakan indikator kunci kesehatan jantung.' },
			{ key: 'totalCholesterol', title: 'Kolesterol Total', unit: 'mmol/L', proxyQuestions: tcholProxyQuestions, info: 'Kolesterol total mengukur semua jenis kolesterol dalam darah Anda.' },
			{ key: 'hdlCholesterol', title: 'Kolesterol HDL', unit: 'mmol/L', proxyQuestions: hdlProxyQuestions, info: 'HDL sering disebut "kolesterol baik" karena membantu menghilangkan jenis kolesterol lain dari aliran darah.' },
		];

		if (formData.diabetesHistory === 'Ya') {
			healthParams.push(
				{ key: 'hba1c', title: 'HbA1c', unit: '%', proxyQuestions: hba1cProxyQuestions, info: 'HbA1c mencerminkan rata-rata kadar gula darah Anda selama 2-3 bulan terakhir, memberikan gambaran kontrol diabetes jangka panjang.' },
				{
					key: 'serumCreatinine',
					title: 'Serum Creatinine',
					unit: 'μmol/L',
					proxyQuestions: scrProxyQuestions,
					info: 'Kreatinin adalah produk limbah yang disaring oleh ginjal. Tingkatnya dapat menunjukkan seberapa baik ginjal Anda berfungsi.',
				}
			);
		}

		const healthQuestions = healthParams.map((param) => ({ type: 'healthMetric', ...param }));
		return [...baseQuestions, ...healthQuestions, { type: 'summary' }];
	}, [formData.diabetesHistory]);

	// --- CALLBACKS & HANDLERS ---
	const updateFormDataState = useCallback((field: string, value: any) => {
		setFormData((prev: any) => ({ ...prev, [field]: value }));
		// **Improvement 3: Personalisasi Visual**
		// if (field === 'diabetesHistory' && value === 'Tidak') {
		// 	setBackgroundStyle({ background: 'linear-gradient(to top, #f8fafc, #e0f2fe)' });
		// } else {
		// 	setBackgroundStyle({ background: 'linear-gradient(to top, #f8fafc, #fce8e8)' });
		// }
	}, []);

	const updateHealthParameter = useCallback((paramKey: string, updates: Partial<HealthParameter>) => {
		setFormData((prev: any) => {
			const newHealthProfile = { ...prev.healthProfile };
			newHealthProfile[paramKey] = { ...newHealthProfile[paramKey], ...updates };

			// **Improvement 1: Kecerdasan Proaktif (Sinkronisasi Jawaban)**
			const sharedKeys = ['exerciseType', 'fishConsumption'];
			const changedProxyKey = Object.keys(updates.proxyAnswers || {}).find((k) => sharedKeys.includes(k));

			if ((paramKey === 'totalCholesterol' || paramKey === 'hdlCholesterol') && changedProxyKey) {
				const targetParamKey = paramKey === 'totalCholesterol' ? 'hdlCholesterol' : 'totalCholesterol';
				if (newHealthProfile[targetParamKey]?.inputType === 'proxy') {
					const syncedAnswer = { [changedProxyKey]: updates.proxyAnswers[changedProxyKey] };
					newHealthProfile[targetParamKey].proxyAnswers = { ...newHealthProfile[targetParamKey].proxyAnswers, ...syncedAnswer };
				}
			}
			return { ...prev, healthProfile: newHealthProfile };
		});
	}, []);

	const paginate = (newDirection: number) => {
		setDirection(newDirection);
		setQuestionIndex((prev) => prev + newDirection);
	};

	const handleNext = () => paginate(1);
	const handleBack = () => paginate(-1);

	const isCurrentQuestionComplete = useMemo(() => {
		if (!questions[questionIndex]) return false;
		const currentQuestion = questions[questionIndex];
		const { type, field, key } = currentQuestion as { type: string; field: string; key?: string };

		switch (type) {
			case 'welcome':
			case 'summary':
				return true;
			case 'info':
			case 'choice':
				return !!formData[field as keyof AnalysisFormData];
			case 'input':
				const value = formData[field as keyof AnalysisFormData];
				if (field === 'diabetesAge') {
					return value && parseInt(value) > 0 && parseInt(value) <= parseInt(formData.age);
				}
				return !!value;
			case 'healthMetric':
				return key ? formData.healthProfile[key]?.completed || false : false;
			default:
				return false;
		}
	}, [questionIndex, questions, formData]);

	const handleSubmit = async () => {
		setQuestionIndex(questions.length);
		setIsLoading(true);

		const runWithProgress = async (fn: () => Promise<any>, message: string, start: number, end: number) => {
			setLoadingMessage(message);
			let p = start;
			const interval = setInterval(() => {
				p = Math.min(p + 1, end - 1);
				setLoadingProgress(p);
			}, 50);
			try {
				const result = await fn();
				setLoadingProgress(end);
				clearInterval(interval);
				return result;
			} catch (error) {
				clearInterval(interval);
				throw error;
			}
		};

		try {
			if (!token) throw new Error('Authentication token is missing.');
			const payload = buildPayload(formData);
			const analysisResponse = await runWithProgress(() => newAnalysis(token, payload), 'Menganalisis data kesehatan Anda...', 0, 50);
			if (!analysisResponse?.assessment_slug) throw new Error('Failed to get assessment slug.');
			await runWithProgress(() => personalizeAnalysis(token, analysisResponse.assessment_slug), 'Mempersonalisasi rencana aksi Anda...', 50, 95);

			setLoadingMessage('Selesai! Mengarahkan Anda ke hasil...');
			setLoadingProgress(100);
			toast.success('Analisis Anda berhasil dibuat!');
			setTimeout(() => navigate('/dashboard'), 2000);
		} catch (error) {
			console.error('Analysis submission failed:', error);
			toast.error('Oops! Terjadi kesalahan saat memproses analisis Anda. Silakan coba lagi.');
			setIsLoading(false);
			setQuestionIndex(questions.length - 1);
		}
	};

	// --- RENDER LOGIC ---
	if (!isProfileChecked)
		return (
			<div className="flex items-center justify-center h-screen bg-slate-50">
				<Loader className="animate-spin text-rose-500" size={48} />
			</div>
		);
	if (!isProfileComplete)
		return <WarningCard title="Lengkapi Profil Anda" description="Untuk memulai analisis, kami memerlukan beberapa informasi dasar. Mohon lengkapi profil Anda terlebih dahulu." btnText="Lengkapi Profil" btnHref="/dashboard/profile" />;

	const currentQuestion = questions[questionIndex];

	return (
		<motion.div style={backgroundStyle} transition={{ duration: 1, ease: 'easeInOut' }} className="min-h-screen font-sans flex flex-col overflow-hidden">
			<div className="w-full bg-slate-200 h-2">
				<motion.div className="h-2 bg-gradient-to-r from-rose-400 to-fuchsia-500" animate={{ width: `${(questionIndex / (questions.length - 1)) * 100}%` }} transition={{ ease: 'easeInOut', duration: 0.5 }} />
			</div>
			<div className="relative flex-1 flex flex-col items-center justify-center p-4">
				<AnimatePresence initial={false} custom={direction}>
					<motion.div
						key={questionIndex}
						custom={direction}
						variants={slideVariants}
						initial="enter"
						animate="center"
						exit="exit"
						transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
						className="absolute w-full max-w-2xl mx-auto"
					>
						{isLoading ? (
							<LoadingAnalysisView progress={loadingProgress} message={loadingMessage} />
						) : (
							renderQuestion(currentQuestion, formData, { updateFormDataState, updateHealthParameter, handleSubmit, handleBack, handleNext, isComplete: isCurrentQuestionComplete, user })
						)}
					</motion.div>
				</AnimatePresence>
			</div>
		</motion.div>
	);
}

// --- QUESTION RENDERER ---
function renderQuestion(question: any, formData: any, actions: any) {
	if (!question) return null;
	switch (question.type) {
		case 'welcome':
			return <WelcomeSlide onNext={actions.handleNext} />;
		case 'info':
			return <InfoSlide question={question} value={formData[question.field]} onNext={actions.handleNext} onBack={actions.handleBack} />;
		case 'choice':
			return <ChoiceSlide question={question} value={formData[question.field]} onUpdate={actions.updateFormDataState} onNext={actions.handleNext} onBack={actions.handleBack} isComplete={actions.isComplete} />;
		case 'input':
			return <InputSlide question={question} value={formData[question.field]} onUpdate={actions.updateFormDataState} onNext={actions.handleNext} onBack={actions.handleBack} isComplete={actions.isComplete} formData={formData} />;
		case 'healthMetric':
			return <HealthMetricSlide parameter={question} data={formData.healthProfile[question.key]} onUpdate={actions.updateHealthParameter} onNext={actions.handleNext} onBack={actions.handleBack} formData={formData} />;
		case 'summary':
			return <SummarySlide formData={formData} user={actions.user} onSubmit={actions.handleSubmit} onBack={actions.handleBack} />;
		default:
			return <div>Unknown question type</div>;
	}
}

// --- SLIDE & UI COMPONENTS ---
const InfoTooltip = ({ text }: { text: string }) => (
	<Popover>
		<PopoverTrigger asChild>
			<button className="ml-2 text-slate-400 hover:text-rose-500 transition-colors" aria-label="Informasi tambahan">
				<Info className="h-4 w-4" />
			</button>
		</PopoverTrigger>
		<PopoverContent className="w-64 text-sm" align="start">
			{text}
		</PopoverContent>
	</Popover>
);

const SlideWrapper = ({ children, onBack, onNext, isNextDisabled, nextText = 'Lanjut' }: any) => (
	<div className="flex flex-col items-center text-center p-4 space-y-8 md:space-y-12">
		{children}
		<div className="flex items-center justify-between w-full max-w-sm pt-8">
			<Button variant="ghost" onClick={onBack} className="text-slate-500 hover:text-slate-800" aria-label="Kembali ke pertanyaan sebelumnya">
				<ChevronLeft className="mr-2 h-4 w-4" /> Kembali
			</Button>
			<Button onClick={onNext} disabled={isNextDisabled} size="lg" className="rounded-full px-8 shadow-lg bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30" aria-label="Lanjut ke pertanyaan berikutnya">
				{nextText} <ArrowRight className="ml-2 h-4 w-4" />
			</Button>
		</div>
	</div>
);

const WelcomeSlide = ({ onNext }: any) => (
	<div className="flex flex-col items-center text-center p-4 space-y-8">
		<motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
			<Sparkles className="h-24 w-24 text-rose-500" />
		</motion.div>
		<motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
			<h1 className="text-3xl md:text-4xl font-bold text-slate-800">Mari Mulai Analisis Kesehatan Anda</h1>
			<p className="text-slate-600 mt-4 max-w-md mx-auto">Proses ini cepat, mudah, dan sepenuhnya rahasia. Kami akan memandu Anda langkah demi langkah.</p>
		</motion.div>
		<motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
			<ShimmeringCTAButton onClick={onNext} shape="pill" className="px-10 py-3 text-lg shadow-rose-500/30">
				Mulai Sekarang
			</ShimmeringCTAButton>
		</motion.div>
	</div>
);

const RiskRegionInfoPopover = () => (
	<Popover>
		<PopoverTrigger asChild>
			<button className="ml-2 text-slate-400 hover:text-rose-500 transition-colors" aria-label="Informasi tambahan">
				<Info className="h-4 w-4" />
			</button>
		</PopoverTrigger>
		<PopoverContent className="w-80 space-y-3" align="start">
			<div className="text-sm text-slate-700 space-y-2">
				<p>
					Peta risiko di samping menunjukkan pembagian wilayah Asia berdasarkan metode <strong>SCORE2</strong> untuk memprediksi risiko kardiovaskular.
				</p>
				<ul className="list-none space-y-1">
					<li className="flex items-center">
						<span className="w-4 h-4 rounded-full bg-red-500 mr-2 border border-slate-400"></span> <strong className="me-1">Merah: </strong> Risiko sangat tinggi
					</li>
					<li className="flex items-center">
						<span className="w-4 h-4 rounded-full bg-orange-500 mr-2 border border-slate-400"></span> <strong className="me-1">Oranye: </strong> Risiko tinggi
					</li>
					<li className="flex items-center">
						<span className="w-4 h-4 rounded-full bg-yellow-400 mr-2 border border-slate-400"></span> <strong className="me-1">Kuning: </strong> Risiko sedang
					</li>
					<li className="flex items-center">
						<span className="w-4 h-4 rounded-full bg-green-500 mr-2 border border-slate-400"></span> <strong className="me-1">Hijau:</strong> Risiko rendah
					</li>
				</ul>
			</div>
		</PopoverContent>
	</Popover>
);

const InfoSlide = ({ question, value, onNext, onBack }: any) => {
	// Definisikan fungsi helper di sini
	const capitalizeWords = (str: string) => {
		if (!str) return ''; // Menangani jika value kosong atau null
		return str
			.split(' ')
			.map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join(' ');
	};

	if (question.field === 'riskRegion') {
		return (
			<SlideWrapper onBack={onBack} onNext={onNext}>
				<div className="flex items-center gap-2 text-slate-800">
					<div className="flex items-center gap-4">
						<question.icon className="h-10 w-10" />
						<h2 className="text-2xl md:text-3xl font-bold">{question.title}</h2>
					</div>
					{/* Popup dengan info teks */}
					<RiskRegionInfoPopover />
				</div>
				<div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-3xl font-bold text-rose-500">{capitalizeWords(value)}</div>

				{/* Gambar peta ditampilkan langsung di halaman */}
				<div className="w-full max-w-lg">
					<img src="/images/risk_map.jpeg" alt="Peta pembagian wilayah Asia berdasarkan metode SCORE2 Asia" className="rounded-lg shadow-md" />
				</div>

				<p className="text-sm text-slate-500">Informasi ini ditentukan berdasarkan negara yang terdaftar di profil Anda.</p>
			</SlideWrapper>
		);
	}

	// Tampilan DEFAULT untuk semua slide info lainnya
	return (
		<SlideWrapper onBack={onBack} onNext={onNext}>
			<div className="flex items-center gap-4 text-slate-800">
				<question.icon className="h-10 w-10" />
				<h2 className="text-2xl md:text-3xl font-bold">{question.title}</h2>
			</div>
			<div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-3xl font-bold text-rose-500">{question.field === 'gender' ? (value === 'male' ? 'Laki-laki' : 'Perempuan') : capitalizeWords(value)}</div>
			<p className="text-sm text-slate-500">Informasi ini diambil dari profil Anda.</p>
		</SlideWrapper>
	);
};

const ChoiceSlide = ({ question, value, onUpdate, onNext, onBack, isComplete }: any) => {
	const heartAnimation = useAnimation();
	const handleChoice = (val: string) => {
		onUpdate(question.field, val);
		if (question.field === 'diabetesHistory') {
			heartAnimation.start({ scale: [1, 1.3, 1], transition: { duration: 0.5 } });
		}
		setTimeout(() => onNext(), 300);
	};

	return (
		<SlideWrapper onBack={onBack} onNext={onNext} isNextDisabled={!isComplete}>
			<div className="flex items-center gap-2 text-slate-800">
				<motion.div animate={heartAnimation}>
					<question.icon className="h-10 w-10" />
				</motion.div>
				<h2 className="text-2xl md:text-3xl font-bold">{question.title}</h2>
				{question.info && <InfoTooltip text={question.info} />}
			</div>
			<RadioGroup value={value} onValueChange={handleChoice} className="flex flex-row gap-4 w-full max-w-[15rem] lg:max-w-lg">
				{question.options.map((option: string) => (
					<motion.div key={option} whileTap={{ scale: 0.95 }} className="lg:flex-1 flex">
						<RadioGroupItem value={option} id={option} className="sr-only" />
						<Label
							htmlFor={option}
							className={`lg:w-[15rem] w-[7rem] flex items-center justify-center p-6 rounded-2xl border-2 text-lg font-semibold cursor-pointer transition-all duration-200 ${
								value === option ? 'bg-rose-500 border-rose-600 text-white shadow-lg' : 'bg-white border-slate-200 hover:border-rose-300'
							}`}
						>
							{option}
						</Label>
					</motion.div>
				))}
			</RadioGroup>
		</SlideWrapper>
	);
};

const InputSlide = ({ question, value, onUpdate, onNext, onBack, isComplete, formData }: any) => {
	const isInvalid = question.field === 'diabetesAge' && value && (parseInt(value) <= 0 || parseInt(value) > parseInt(formData.age));
	return (
		<SlideWrapper onBack={onBack} onNext={onNext} isNextDisabled={!isComplete}>
			<div className="flex items-center gap-2 text-slate-800">
				<h2 className="text-2xl md:text-3xl font-bold">{question.title}</h2>
				{question.info && <InfoTooltip text={question.info} />}
			</div>
			<div className="relative w-full max-w-xs">
				<Input
					type={question.inputType}
					value={value}
					onChange={(e) => onUpdate(question.field, e.target.value)}
					className={`h-16 text-center text-3xl font-bold rounded-2xl border-2 ${isInvalid ? 'border-red-500' : 'border-slate-300 focus:border-rose-500'} focus:ring-rose-500`}
					placeholder="0"
				/>
				{question.unit && <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500">{question.unit}</span>}
			</div>
			<AnimatePresence>
				{isInvalid && (
					<motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-600 text-sm">
						Usia diagnosis harus di antara 1 dan usia Anda saat ini ({formData.age} tahun).
					</motion.p>
				)}
			</AnimatePresence>
		</SlideWrapper>
	);
};

// GANTI KOMPONEN HealthMetricSlide LAMA ANDA DENGAN YANG INI

const HealthMetricSlide = ({ parameter, data, onUpdate, onNext, onBack, formData }: any) => {
	const { key, title, unit, proxyQuestions, info } = parameter;
	// --- FIX APPLIED HERE ---
	// Default values are provided to prevent errors when `data` is undefined.
	const { inputType, manualValue = '', proxyAnswers = {}, completed = false } = data || {};

	const validationRules: { [key: string]: { min: number; max: number; message: string } } = {
		sbp: { min: 50, max: 300, message: 'Nilai harus antara 50 dan 300 mmHg.' },
		totalCholesterol: { min: 1, max: 20, message: 'Nilai harus antara 1 dan 20 mmol/L.' },
		hdlCholesterol: { min: 0.1, max: 5, message: 'Nilai harus antara 0.1 dan 5 mmol/L.' },
		hba1c: { min: 20, max: 200, message: 'Nilai harus antara 20 dan 200 mmol/mol.' },
		serumCreatinine: { min: 0.1, max: 15, message: 'Nilai harus antara 0.1 dan 15 mg/dL.' },
	};

	const rules = validationRules[key];
	const numericValue = parseFloat(manualValue);
	const isInvalid = rules && manualValue.trim() !== '' && (numericValue < rules.min || numericValue > rules.max);

	const handleMethodChange = (type: 'manual' | 'proxy') => onUpdate(key, { inputType: type, completed: false, manualValue: '', proxyAnswers: {} });

	const handleManualChange = (val: string) => {
		const isNowValid = val.trim() !== '' && !isInvalid;
		onUpdate(key, { manualValue: val, completed: isNowValid });
	};

	const handleProxyChange = (qKey: string, qValue: any) => {
		const newAnswers = { ...proxyAnswers, [qKey]: qValue };
		const allAnswered = proxyQuestions.every((q: any) => newAnswers[q.key] !== undefined && newAnswers[q.key] !== '' && (Array.isArray(newAnswers[q.key]) ? newAnswers[q.key].length > 0 : true));
		onUpdate(key, { proxyAnswers: newAnswers, completed: allAnswered });
	};

	useEffect(() => {
		if (inputType === 'manual') {
			const numericVal = parseFloat(manualValue);
			const currentRules = validationRules[key];
			const isValid = manualValue.trim() !== '' && currentRules && numericVal >= currentRules.min && numericVal <= currentRules.max;
			if (completed !== isValid) {
				onUpdate(key, { completed: isValid });
			}
		}
	}, [manualValue, inputType, key, completed, onUpdate, validationRules]);

	return (
		<div className="flex flex-col items-center text-center p-2 md:p-4 space-y-6">
			<div className="flex items-center gap-2 text-slate-800">
				<h2 className="text-2xl md:text-3xl font-bold">{title}</h2> {info && <InfoTooltip text={info} />}
			</div>

			{!inputType ? (
				<div className="w-full max-w-md space-y-4">
					<p className="text-slate-600">Apakah Anda mengetahui nilai {title.split('(')[0].trim()} Anda?</p>
					<Button onClick={() => handleMethodChange('manual')} className="w-full h-14 text-lg bg-white text-slate-800 border-2 hover:bg-white border-slate-200 hover:border-rose-300 active:bg-rose-500 active:border-rose-600 active:text-white">
						Saya Tahu Angkanya
					</Button>

					<Button onClick={() => handleMethodChange('proxy')} className="w-full h-14 text-lg bg-white text-slate-800 border-2 hover:bg-white border-slate-200 hover:border-rose-300 active:bg-rose-500 active:border-rose-600 active:text-white">
						Tidak, Bantu Estimasi
					</Button>
				</div>
			) : (
				<AnimatePresence mode="wait">
					<motion.div key={inputType} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-2xl space-y-6">
						{inputType === 'manual' && (
							<div className="space-y-2">
								<Label className="text-lg justify-center w-full">Masukkan nilai Anda</Label>
								{rules && (
									<p className="text-sm text-slate-500 -mt-1">
										(Rentang: {rules.min} - {rules.max} {unit})
									</p>
								)}
								<div className="relative w-full max-w-xs mx-auto">
									<Input
										type="number"
										value={manualValue}
										onChange={(e) => handleManualChange(e.target.value)}
										className={`h-16 text-center text-3xl font-bold rounded-2xl border-2 ${isInvalid ? 'border-red-500' : 'border-slate-300 focus:border-rose-500'} focus:ring-rose-500`}
										placeholder="0.0"
									/>
									<span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500">{unit}</span>
								</div>

								<AnimatePresence>
									{isInvalid && (
										<motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-600 text-sm h-5">
											{rules.message}
										</motion.p>
									)}
								</AnimatePresence>
							</div>
						)}
						{inputType === 'proxy' && (
							<Card className="bg-white/80 backdrop-blur-sm p-4 md:p-6 rounded-2xl w-full">
								<CardContent className="space-y-6 text-left">
									<h3 className="text-center font-semibold text-slate-700">Jawab pertanyaan berikut untuk estimasi terbaik.</h3>
									{proxyQuestions.map((q: any) => (
										<div key={q.key} className="space-y-2">
											<div className="flex items-center">
												<Label className="font-medium text-slate-800">{q.label}</Label>
												{formData.healthProfile[key]?.proxyAnswers[q.key] &&
													formData.healthProfile[key === 'totalCholesterol' ? 'hdlCholesterol' : 'totalCholesterol']?.proxyAnswers[q.key] === formData.healthProfile[key]?.proxyAnswers[q.key] &&
													['exerciseType', 'fishConsumption'].includes(q.key) && <span className="ml-2 text-xs text-rose-500">(terisi otomatis)</span>}
											</div>

											{q.type === 'radio' && (
												<RadioGroup value={proxyAnswers[q.key] || ''} onValueChange={(v) => handleProxyChange(q.key, v)} className="flex flex-wrap gap-2">
													{q.options.map((opt: string) => (
														<div key={opt}>
															<RadioGroupItem value={opt} id={`${key}-${q.key}-${opt}`} className="sr-only" />
															<Label
																htmlFor={`${key}-${q.key}-${opt}`}
																className={`px-4 py-2 rounded-full border cursor-pointer transition-colors ${proxyAnswers[q.key] === opt ? 'bg-rose-500 text-white border-rose-500' : 'bg-white hover:bg-slate-100'}`}
															>
																{opt}
															</Label>
														</div>
													))}
												</RadioGroup>
											)}

											{q.type === 'checkbox' && (
												<div className="flex flex-wrap gap-2">
													{q.options.map((opt: string) => (
														<div key={opt} className="flex items-center">
															<Checkbox
																id={`${key}-${q.key}-${opt}`}
																checked={(proxyAnswers[q.key] || []).includes(opt)}
																onCheckedChange={(checked) => {
																	const current = proxyAnswers[q.key] || [];
																	const newValues = checked ? [...current, opt] : current.filter((v: string) => v !== opt);
																	handleProxyChange(q.key, newValues);
																}}
															/>

															<Label htmlFor={`${key}-${q.key}-${opt}`} className="ml-2 cursor-pointer">
																{opt}
															</Label>
														</div>
													))}
												</div>
											)}
										</div>
									))}
								</CardContent>
							</Card>
						)}
					</motion.div>
				</AnimatePresence>
			)}

			<div className="flex items-center justify-between w-full max-w-sm pt-6">
				<Button variant="ghost" onClick={onBack} className="text-slate-500 hover:text-slate-800" aria-label="Kembali ke pertanyaan sebelumnya">
					<ChevronLeft className="mr-2 h-4 w-4" /> Kembali
				</Button>

				<Button onClick={onNext} disabled={!completed} size="lg" className="rounded-full px-8 shadow-lg bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30" aria-label="Lanjut ke pertanyaan berikutnya">
					Lanjut <ArrowRight className="ml-2 h-4 w-4" />
				</Button>
			</div>

			{inputType && (
				<Button variant="link" onClick={() => handleMethodChange(inputType === 'manual' ? 'proxy' : 'manual')} className="text-rose-500 mt-2">
					{inputType === 'manual' ? 'Bantu saya estimasi' : 'Saya tahu angkanya'}
				</Button>
			)}
		</div>
	);
};

const SummarySlide = ({ formData, user, onSubmit, onBack }: any) => {
	const healthParamsFilled = Object.values(formData.healthProfile).filter((p: any) => p.completed).length;
	const totalHealthParams = Object.keys(formData.healthProfile).length;

	return (
		<div className="flex flex-col items-center text-center p-4 space-y-6 w-full">
			<div className="flex items-center gap-4 text-slate-800">
				<ClipboardCheck className="h-12 w-12 text-rose-500" />
				<h2 className="text-3xl md:text-4xl font-bold">Satu Langkah Terakhir</h2>
			</div>
			<p className="text-slate-600 max-w-lg">
				Baik, <strong>{user?.first_name || 'Pengguna'}</strong>, mohon periksa kembali ringkasan informasi Anda sebelum kami proses.
			</p>

			{/* --- KARTU VISUAL --- */}
			<div className="w-full max-w-xl space-y-4 text-left">
				<Card className="bg-white/70">
					<CardContent className="p-4 flex items-start gap-4">
						<div className="p-2 bg-blue-100 rounded-lg">
							<User className="h-6 w-6 text-blue-600" />
						</div>
						<div>
							<h3 className="font-semibold text-slate-800">Profil Dasar</h3>
							<p className="text-sm text-slate-600">
								{formData.age} Tahun, {formData.gender === 'male' ? 'Pria' : 'Wanita'}
							</p>
						</div>
					</CardContent>
				</Card>
				<Card className="bg-white/70">
					<CardContent className="p-4 flex items-start gap-4">
						<div className="p-2 bg-green-100 rounded-lg">
							<Heart className="h-6 w-6 text-green-600" />
						</div>
						<div>
							<h3 className="font-semibold text-slate-800">Gaya Hidup & Riwayat</h3>
							<p className="text-sm text-slate-600">
								{formData.smokingStatus}, {formData.diabetesHistory === 'Ya' ? `dengan riwayat diabetes` : 'tanpa riwayat diabetes'}.
							</p>
						</div>
					</CardContent>
				</Card>
				<Card className="bg-white/70">
					<CardContent className="p-4 flex items-start gap-4">
						<div className="p-2 bg-purple-100 rounded-lg">
							<CheckCircle className="h-6 w-6 text-purple-600" />
						</div>
						<div>
							<h3 className="font-semibold text-slate-800">Data Kesehatan</h3>
							<p className="text-sm text-slate-600">
								{healthParamsFilled} dari {totalHealthParams} parameter kesehatan telah diisi.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* --- APA SELANJUTNYA & PRIVASI --- */}
			<div className="w-full max-w-xl space-y-4 text-left pt-4">
				<div className="flex items-start gap-3 text-sm text-slate-600 p-4 bg-slate-100 rounded-lg">
					<FileClock className="h-5 w-5 mt-0.5 flex-shrink-0 text-slate-500" />
					<span>Saat Anda menekan 'Proses Hasil Saya', sistem kami akan menganalisis data ini untuk memberikan prediksi risiko dan rekomendasi personal.</span>
				</div>
				<div className="flex items-center justify-center gap-2 text-xs text-slate-500 p-2">
					<ShieldCheck className="h-4 w-4" />
					<span>Data Anda dienkripsi dan sepenuhnya rahasia.</span>
				</div>
			</div>

			<div className="flex items-center justify-between w-full max-w-sm pt-6">
				<Button variant="ghost" onClick={onBack} className="text-slate-500 hover:text-slate-800" aria-label="Kembali untuk memeriksa jawaban">
					<ChevronLeft className="mr-2 h-4 w-4" /> Periksa Kembali
				</Button>
				<Button onClick={onSubmit} size="lg" className="bg-rose-500 hover:bg-rose-600 text-white rounded-full px-8 shadow-lg shadow-rose-500/30" aria-label="Kirim dan lihat hasil analisis">
					<BrainCircuit className="mr-2 h-5 w-5" /> Proses Hasil Saya
				</Button>
			</div>
		</div>
	);
};

const LoadingAnalysisView = ({ progress, message }: { progress: number; message: string }) => (
	<div className="flex flex-col items-center justify-center text-center space-y-6 p-4">
		<motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}>
			<Heart className="h-24 w-24 text-rose-500" fill="currentColor" />
		</motion.div>
		<h2 className="text-2xl font-bold text-slate-800">Memproses Analisis Anda...</h2>
		<AnimatePresence mode="wait">
			<motion.p key={message} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-slate-600 h-10">
				{message}
			</motion.p>
		</AnimatePresence>
		<div className="w-full max-w-sm bg-slate-200 rounded-full h-2.5 overflow-hidden">
			<motion.div className="bg-gradient-to-r from-rose-400 to-fuchsia-500 h-2.5 rounded-full" initial={{ width: '0%' }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5, ease: 'linear' }} />
		</div>
	</div>
);

// --- HELPER FUNCTIONS & DATA ---
const buildPayload = (formData: AnalysisFormData) => {
	const payload: any = { has_diabetes: formData.diabetesHistory === 'Ya', smoking_status: formData.smokingStatus };
	if (formData.diabetesHistory === 'Ya') payload.age_at_diabetes_diagnosis = parseInt(formData.diabetesAge || '0');
	const proxyKeyMap: Record<string, string> = {
		familyHistory: 'q_fam_htn',
		sleepPattern: 'q_sleep_pattern',
		foodConsumption: 'q_salt_diet',
		stressResponse: 'q_stress_response',
		bodyShape: 'q_body_shape',
		exerciseFreq: 'q_exercise',
		cookingOil: 'q_cooking_oil',
		exerciseType: 'q_exercise_type',
		fishConsumption: 'q_fish_intake',
		xanthelasma: 'q_xanthoma',
		healthyFatIntake: 'q_healthy_fat_intake',
		alcohol: 'q_alcohol',
		bloodSugarCheck: 'q_smbg_monitoring',
		medicationCompliance: 'q_adherence',
		bodyType: 'q_body_type_for_scr',
		diabetesComplications: 'q_retinopathy_neuropathy',
		foamyUrine: 'q_foamy_urine',
		swelling: 'q_swelling',
		painMedication: 'q_nsaid_use',
	};
	const transformProxyAnswers = (answers: Record<string, any>) => {
		const mapped: Record<string, any> = {};
		for (const key in answers) {
			if (proxyKeyMap[key]) mapped[proxyKeyMap[key]] = answers[key];
		}
		return mapped;
	};
	const mapParam = (key: string, apiKey: string) => {
		const param = formData.healthProfile[key as keyof typeof formData.healthProfile];
		if (!param || !param.completed) return;
		payload[`${apiKey}_input_type`] = param.inputType;
		if (param.inputType === 'manual') payload[`${apiKey}_value`] = parseFloat(param.manualValue || '0');
		else if (param.inputType === 'proxy') payload[`${apiKey}_proxy_answers`] = transformProxyAnswers(param.proxyAnswers || {});
	};
	mapParam('sbp', 'sbp');
	mapParam('totalCholesterol', 'tchol');
	mapParam('hdlCholesterol', 'hdl');
	if (formData.diabetesHistory === 'Ya') {
		mapParam('hba1c', 'hba1c');
		mapParam('serumCreatinine', 'scr');
	}
	return payload;
};

const sbpProxyQuestions = [
	{ key: 'familyHistory', label: 'Riwayat hipertensi keluarga?', type: 'radio', options: ['Ya', 'Tidak', 'Tidak Tahu'] },
	{ key: 'sleepPattern', label: 'Pola tidur Anda?', type: 'radio', options: ['Nyenyak', 'Tidak Nyenyak', 'Insomnia'] },
	{ key: 'foodConsumption', label: 'Makanan yang sering dikonsumsi?', type: 'checkbox', options: ['Mie instan', 'Daging olahan', 'Camilan asin'] },
	{ key: 'stressResponse', label: 'Respons Anda saat stres?', type: 'radio', options: ['Jantung berdebar', 'Sakit kepala', 'Tidak ada gejala'] },
	{ key: 'bodyShape', label: 'Bentuk tubuh Anda?', type: 'radio', options: ['Perut buncit', 'Gemuk merata', 'Ideal'] },
	{ key: 'exerciseFreq', label: 'Frekuensi olahraga?', type: 'radio', options: ['Rutin & Intens', 'Rutin ringan', 'Jarang'] },
];
const tcholProxyQuestions = [
	{ key: 'familyHistory', label: 'Riwayat kolesterol/penyakit jantung keluarga?', type: 'radio', options: ['Ya', 'Tidak', 'Tidak Tahu'] },
	{ key: 'cookingOil', label: 'Minyak masak yang dominan digunakan?', type: 'radio', options: ['Sawit', 'Jagung/Kanola', 'Zaitun'] },
	{ key: 'exerciseType', label: 'Jenis olahraga dominan Anda?', type: 'radio', options: ['Angkat beban', 'Kardio (Lari/Sepeda)', 'Jalan kaki', 'Tidak pernah'] },
	{ key: 'fishConsumption', label: 'Konsumsi ikan laut (salmon/tuna)?', type: 'radio', options: ['Sering (>2x/minggu)', 'Kadang', 'Jarang'] },
	{ key: 'xanthelasma', label: 'Ada benjolan kuning di kelopak mata (Xanthelasma)?', type: 'radio', options: ['Ya', 'Tidak', 'Tidak yakin'] },
];
const hdlProxyQuestions = [
	{ key: 'healthyFatIntake', label: 'Konsumsi lemak sehat (alpukat, kacang)?', type: 'radio', options: ['Rutin', 'Kadang', 'Jarang'] },
	{ key: 'alcohol', label: 'Konsumsi alkohol?', type: 'radio', options: ['Rutin', 'Sosial', 'Tidak sama sekali'] },
	{ key: 'exerciseType', label: 'Jenis olahraga dominan Anda?', type: 'radio', options: ['Angkat beban', 'Kardio (Lari/Sepeda)', 'Jalan kaki', 'Tidak pernah'] },
	{ key: 'fishConsumption', label: 'Konsumsi ikan laut (salmon/tuna)?', type: 'radio', options: ['Sering (>2x/minggu)', 'Kadang', 'Jarang'] },
];
const hba1cProxyQuestions = [
	{ key: 'bloodSugarCheck', label: 'Bagaimana hasil cek gula darah mandiri Anda?', type: 'radio', options: ['Sering di atas target', 'Sering sesuai target', 'Jarang cek'] },
	{ key: 'medicationCompliance', label: 'Kepatuhan minum obat & diet diabetes?', type: 'radio', options: ['Sangat patuh', 'Kadang lupa', 'Sering tidak patuh'] },
];
const scrProxyQuestions = [
	{ key: 'bodyType', label: 'Tipe tubuh Anda?', type: 'radio', options: ['Sangat berotot', 'Atletis', 'Rata-rata', 'Kurus'] },
	{ key: 'diabetesComplications', label: 'Pernah didiagnosis komplikasi diabetes (mata/saraf)?', type: 'radio', options: ['Ya', 'Tidak', 'Tidak tahu'] },
	{ key: 'foamyUrine', label: 'Apakah urin Anda sering berbusa?', type: 'radio', options: ['Ya, sering', 'Kadang-kadang', 'Tidak pernah'] },
	{ key: 'swelling', label: 'Ada pembengkakan di area mata atau kaki?', type: 'radio', options: ['Ya, sering', 'Kadang-kadang', 'Tidak pernah'] },
	{ key: 'painMedication', label: 'Seberapa sering konsumsi obat nyeri (selain paracetamol)?', type: 'radio', options: ['Hampir setiap hari', 'Beberapa kali sebulan', 'Jarang/tidak pernah'] },
];
