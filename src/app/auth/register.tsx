/* eslint-disable no-useless-escape */
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '@/hooks/api/auth';
import { useAuth } from '@/provider/AuthProvider';
import { ShimmeringCTAButton } from '@/components/fragments/ShimmeringCTAButton';

// --- SKEMA VALIDASI ZOD ---
const emailSchema = z.string().email({ message: 'Alamat email tidak valid' });
const passwordSchema = z
	.string()
	.min(8, { message: 'Password harus minimal 8 karakter' })
	.regex(/[A-Z]/, { message: 'Harus memiliki setidaknya satu huruf kapital' })
	.regex(/[a-z]/, { message: 'Harus memiliki setidaknya satu huruf kecil' })
	.regex(/[0-9]/, { message: 'Harus memiliki setidaknya satu angka' })
	.regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, { message: 'Harus memiliki setidaknya satu simbol' });

const registerSchema = z
	.object({
		email: emailSchema,
		password: passwordSchema,
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Konfirmasi password tidak cocok',
		path: ['confirmPassword'],
	});

type RegisterFormData = z.infer<typeof registerSchema>;

// --- VARIAN ANIMASI ---
const containerVariants: Variants = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};
const itemVariants: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
};
const imageVariants: Variants = {
	hidden: { opacity: 0, scale: 0.8 },
	visible: { opacity: 1, scale: 1, transition: { type: 'spring', damping: 15, stiffness: 50, delay: 0.3 } },
};

// --- HELPER: PESAN MOTIVASI DINAMIS ---
const getMotivationalMessage = () => {
	const hour = new Date().getHours();
	let greeting = 'Selamat Datang';
	if (hour < 11) greeting = 'Selamat Pagi';
	else if (hour < 15) greeting = 'Selamat Siang';
	else if (hour < 19) greeting = 'Selamat Sore';
	else greeting = 'Selamat Malam';

	const quotes = [
		'Perjalanan seribu mil dimulai dengan satu langkah.',
		'Kesehatan adalah kekayaan yang sejati.',
		'Jaga tubuhmu. Itu satu-satunya tempat tinggalmu.',
		'Hari ini adalah kesempatan untuk membangun hari esok yang Anda inginkan.',
	];
	const quote = quotes[Math.floor(Math.random() * quotes.length)];

	return { greeting, quote };
};

// --- KOMPONEN UI KUSTOM ---
const FloatingLabelInput = ({ id, label, type, value, onChange, disabled, icon: Icon, error, isValid, ...props }: any) => {
	const isFilled = value && value.length > 0;
	const iconColor = isValid ? 'text-green-500' : error ? 'text-red-500' : 'text-slate-400 peer-focus:text-rose-500';

	return (
		<div className="relative">
			<Input
				id={id}
				type={type}
				value={value}
				onChange={onChange}
				disabled={disabled}
				placeholder=" "
				className={`h-14 pt-6 pl-12 rounded-xl border-2 bg-slate-50 peer transition-colors duration-300 ${error ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-rose-500'}`}
				{...props}
			/>
			<label
				htmlFor={id}
				className={`absolute left-12 top-1/2 -translate-y-1/2 text-slate-500 cursor-text transition-all duration-300 peer-focus:top-3.5 peer-focus:text-xs peer-focus:text-rose-600 ${isFilled ? 'top-3.5 text-xs text-rose-600' : ''}`}
			>
				{label}
			</label>
			<Icon className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${iconColor}`} />
		</div>
	);
};

const PasswordStrengthIndicator = ({ password }: { password: string }) => {
	const strengthChecks = useMemo(
		() => [
			{ label: 'Minimal 8 karakter', test: (p: string) => p.length >= 8 },
			{ label: 'Satu huruf kapital', test: (p: string) => /[A-Z]/.test(p) },
			{ label: 'Satu huruf kecil', test: (p: string) => /[a-z]/.test(p) },
			{ label: 'Satu angka', test: (p: string) => /[0-9]/.test(p) },
			{ label: 'Satu simbol', test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
		],
		[]
	);
	const strength = useMemo(() => strengthChecks.filter((check) => check.test(password)).length, [password, strengthChecks]);
	const strengthColors = ['bg-slate-200', 'bg-red-500', 'bg-red-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];
	if (!password) return null;
	return (
		<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 pt-2">
			<div className="flex items-center gap-2">
				{strengthChecks.map((_, index) => (
					<div key={index} className={`h-1.5 flex-1 rounded-full ${strength > index ? strengthColors[strength] : 'bg-slate-200'}`} />
				))}
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
				{strengthChecks.map((check, index) => (
					<div key={index} className="flex items-center text-xs">
						{check.test(password) ? <CheckCircle className="h-3.5 w-3.5 mr-2 text-green-500 flex-shrink-0" /> : <XCircle className="h-3.5 w-3.5 mr-2 text-slate-400 flex-shrink-0" />}
						<span className={check.test(password) ? 'text-slate-700' : 'text-slate-500'}>{check.label}</span>
					</div>
				))}
			</div>
		</motion.div>
	);
};

/**
 * @name RegisterPage
 * @version 3.0.0 "Wow"
 * @description Halaman registrasi yang disempurnakan dengan logo, sapaan dinamis,
 * umpan balik interaktif, dan tombol aksi yang "hidup".
 */
const RegisterPage = () => {
	const auth = useAuth();
	const setToken = auth?.setToken;
	const navigate = useNavigate();

	const [formData, setFormData] = useState<RegisterFormData>({ email: '', password: '', confirmPassword: '' });
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});
	const [isPasswordFocused, setIsPasswordFocused] = useState(false);

	const [isEmailValid, setIsEmailValid] = useState(false);
	const [isPasswordValid, setIsPasswordValid] = useState(false);
	const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(false);

	const motivationalMessage = useMemo(() => getMotivationalMessage(), []);

	const isFormReady = isEmailValid && isPasswordValid && isConfirmPasswordValid && !isLoading;

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { id, value } = e.target;
		const newFormData = { ...formData, [id]: value };
		setFormData(newFormData);

		if (id === 'email') setIsEmailValid(emailSchema.safeParse(value).success);
		if (id === 'password') setIsPasswordValid(passwordSchema.safeParse(value).success);
		if (id === 'confirmPassword') setIsConfirmPasswordValid(value === newFormData.password && value.length > 0);

		if (errors[id as keyof RegisterFormData]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[id as keyof RegisterFormData];
				return newErrors;
			});
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		const validationResult = registerSchema.safeParse(formData);
		if (!validationResult.success) {
			const fieldErrors: Partial<Record<keyof RegisterFormData, string>> = {};
			validationResult.error.errors.forEach((err) => {
				if (err.path[0]) fieldErrors[err.path[0] as keyof RegisterFormData] = err.message;
			});
			setErrors(fieldErrors);
			return;
		}

		setIsLoading(true);
		try {
			const response = await register(formData.email, formData.password, formData.confirmPassword);
			if (response.success) {
				setToken?.(response.data.access_token);
				navigate('/dashboard');
			} else {
				setErrors({ email: response.message || 'Gagal mendaftar. Email mungkin sudah digunakan.' });
			}
		} catch (error) {
			setErrors({ email: 'Terjadi kesalahan. Silakan coba lagi.' });
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<style>{`
        @keyframes subtle-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.4); }
          50% { box-shadow: 0 0 0 12px rgba(244, 63, 94, 0); }
        }
        .animate-subtle-pulse {
          animation: subtle-pulse 2s infinite;
        }
      `}</style>
			<div className="min-h-screen w-full lg:grid lg:grid-cols-2 font-sans">
				{/* Kolom Kiri: Branding & Motivasi */}
				<div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-rose-500 to-pink-600 p-12 text-white relative overflow-hidden">
					<motion.div variants={containerVariants} initial="hidden" animate="visible" className="z-10 text-center">
						<motion.div variants={itemVariants} className="mb-6">
							<img src="/logo.png" alt="Logo Aplikasi" className="w-20 h-20 mx-auto rounded-2xl shadow-lg bg-white" onError={(e) => (e.currentTarget.style.display = 'none')} />
						</motion.div>
						<motion.h1 variants={itemVariants} className="text-4xl font-bold tracking-tight leading-snug">
							{motivationalMessage.greeting}, Pejuang Sehat!
						</motion.h1>
						<motion.p variants={itemVariants} className="mt-4 text-lg max-w-md text-rose-100 italic">
							"{motivationalMessage.quote}"
						</motion.p>
					</motion.div>
					<motion.div variants={imageVariants} className="absolute -bottom-24 -right-24 w-72 h-72 bg-white/10 rounded-full" />
					<motion.div variants={imageVariants} className="absolute -top-16 -left-16 w-48 h-48 bg-white/10 rounded-full" />
				</div>

				{/* Kolom Kanan: Form Registrasi */}
				<div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
					<div className="w-full max-w-md space-y-8">
						<motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full">
							<motion.div variants={itemVariants} className="text-center">
								<img src="/logo.png" alt="Logo Aplikasi" className="w-16 h-16 mx-auto mb-4 rounded-xl shadow-sm lg:hidden" onError={(e) => (e.currentTarget.style.display = 'none')} />
								<h2 className="text-3xl font-bold text-slate-900">Buat Akun Baru</h2>
								<p className="mt-2 text-slate-600">
									Sudah punya akun?{' '}
									<Link to="/auth/login" className="font-semibold text-rose-600 hover:text-rose-700 transition-colors">
										Masuk di sini
									</Link>
								</p>
							</motion.div>

							<motion.form variants={itemVariants} onSubmit={handleSubmit} className="mt-8 space-y-4">
								<div className="space-y-4 rounded-md">
									<FloatingLabelInput id="email" label="Alamat Email" type="email" value={formData.email} onChange={handleInputChange} disabled={isLoading} icon={Mail} error={!!errors.email} isValid={isEmailValid} autoComplete="email" />
									{errors.email && (
										<motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-600 -mt-2 pl-2">
											{errors.email}
										</motion.p>
									)}

									<div className="relative">
										<FloatingLabelInput
											id="password"
											label="Buat Password"
											type={showPassword ? 'text' : 'password'}
											value={formData.password}
											onChange={handleInputChange}
											disabled={isLoading}
											icon={Lock}
											error={!!errors.password}
											isValid={isPasswordValid}
											onFocus={() => setIsPasswordFocused(true)}
											onBlur={() => setIsPasswordFocused(false)}
											autoComplete="new-password"
										/>
										<button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors" disabled={isLoading}>
											{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
										</button>
									</div>
									<AnimatePresence>{isPasswordFocused && formData.password && <PasswordStrengthIndicator password={formData.password} />}</AnimatePresence>
									{errors.password && (
										<motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-600 -mt-2 pl-2">
											{errors.password}
										</motion.p>
									)}

									<div className="relative">
										<FloatingLabelInput
											id="confirmPassword"
											label="Konfirmasi Password"
											type={showConfirmPassword ? 'text' : 'password'}
											value={formData.confirmPassword}
											onChange={handleInputChange}
											disabled={isLoading}
											icon={Lock}
											error={!!errors.confirmPassword}
											isValid={isConfirmPasswordValid}
											autoComplete="new-password"
										/>
										<button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors" disabled={isLoading}>
											{showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
										</button>
									</div>
									{errors.confirmPassword && (
										<motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-600 -mt-2 pl-2">
											{errors.confirmPassword}
										</motion.p>
									)}
								</div>

								<motion.div variants={itemVariants} className={`${isFormReady ? 'animate-subtle-pulse rounded-xl' : ''}`}>
									<ShimmeringCTAButton
										type="submit"
										disabled={!isFormReady}
										isLoading={isLoading}
										shape="rectangle"
										loadingText="Membuat Akun..." // <-- Mengustomisasi teks loading
										className="w-full h-14 text-lg"
									>
										Buat Akun
										<ArrowRight className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
									</ShimmeringCTAButton>
								</motion.div>
							</motion.form>

							<motion.div variants={itemVariants} className="mt-6 text-center text-xs text-slate-500">
								<p>
									Dengan mendaftar, Anda setuju dengan{' '}
									<Link to="/terms" className="font-medium text-slate-700 hover:text-rose-600">
										Syarat Layanan
									</Link>{' '}
									&{' '}
									<Link to="/privacy" className="font-medium text-slate-700 hover:text-rose-600">
										Kebijakan Privasi
									</Link>
									.
								</p>
							</motion.div>
						</motion.div>
					</div>
				</div>
			</div>
		</>
	);
};

export default RegisterPage;
