/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useMemo } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '@/hooks/api/auth';
import { useAuth } from '@/provider/AuthProvider';
import { ShimmeringCTAButton } from '@/components/fragments/ShimmeringCTAButton';

// --- SKEMA VALIDASI ZOD ---
const emailSchema = z.string().email({ message: 'Alamat email tidak valid' });
const passwordSchema = z.string().min(6, { message: 'Password minimal 6 karakter' });
const loginSchema = z.object({
	email: emailSchema,
	password: passwordSchema,
});

type LoginFormData = z.infer<typeof loginSchema>;

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
	let greeting = 'Selamat Datang Kembali';
	if (hour < 11) greeting = 'Selamat Pagi';
	else if (hour < 15) greeting = 'Selamat Siang';
	else if (hour < 19) greeting = 'Selamat Sore';
	else greeting = 'Selamat Malam';

	const quotes = [
		'Setiap langkah adalah kemajuan. Lanjutkan perjalanan Anda.',
		'Konsistensi adalah kunci menuju versi terbaik dari diri Anda.',
		'Lihat kembali progres Anda dan berbanggalah.',
		'Kendalikan kesehatan Anda, satu hari setiap kalinya.',
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

/**
 * @name LoginPage
 * @version 3.0.0 "Wow"
 * @description Halaman login yang disempurnakan dengan logo, sapaan dinamis,
 * umpan balik interaktif, dan tombol aksi yang "hidup".
 */
const LoginPage = () => {
	const auth = useAuth();
	const setToken = auth?.setToken;
	const navigate = useNavigate();

	const [formData, setFormData] = useState<LoginFormData>({ email: '', password: '' });
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});

	// State untuk umpan balik interaktif
	const [isEmailValid, setIsEmailValid] = useState(false);
	const [isPasswordValid, setIsPasswordValid] = useState(false);

	const motivationalMessage = useMemo(() => getMotivationalMessage(), []);

	const isFormReady = isEmailValid && isPasswordValid && !isLoading;

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { id, value } = e.target;
		setFormData((prev) => ({ ...prev, [id]: value }));

		// Validasi real-time untuk umpan balik UI
		if (id === 'email') setIsEmailValid(emailSchema.safeParse(value).success);
		if (id === 'password') setIsPasswordValid(passwordSchema.safeParse(value).success);

		if (errors[id as keyof LoginFormData]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[id as keyof LoginFormData];
				return newErrors;
			});
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		const validationResult = loginSchema.safeParse(formData);
		if (!validationResult.success) {
			const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {};
			validationResult.error.errors.forEach((err) => {
				if (err.path[0]) fieldErrors[err.path[0] as keyof LoginFormData] = err.message;
			});
			setErrors(fieldErrors);
			return;
		}

		setIsLoading(true);
		try {
			const response = await login(formData.email, formData.password);
			if (response.success) {
				setToken?.(response.data.access_token);
				navigate('/dashboard');
			} else {
				setErrors({ email: response.message || 'Email atau password salah.' });
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
							{motivationalMessage.greeting}!
						</motion.h1>
						<motion.p variants={itemVariants} className="mt-4 text-lg max-w-md text-rose-100 italic">
							"{motivationalMessage.quote}"
						</motion.p>
					</motion.div>
					<motion.div variants={imageVariants} className="absolute -bottom-24 -right-24 w-72 h-72 bg-white/10 rounded-full" />
					<motion.div variants={imageVariants} className="absolute -top-16 -left-16 w-48 h-48 bg-white/10 rounded-full" />
				</div>

				{/* Kolom Kanan: Form Login */}
				<div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
					<div className="w-full max-w-md space-y-8">
						<motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full">
							<motion.div variants={itemVariants} className="text-center">
								<img src="/logo.png" alt="Logo Aplikasi" className="w-16 h-16 mx-auto mb-4 rounded-xl shadow-sm lg:hidden" onError={(e) => (e.currentTarget.style.display = 'none')} />
								<h2 className="text-3xl font-bold text-slate-900">Masuk ke Akun Anda</h2>
								<p className="mt-2 text-slate-600">
									Belum punya akun?{' '}
									<Link to="/auth/register" className="font-semibold text-rose-600 hover:text-rose-700 transition-colors">
										Daftar di sini
									</Link>
								</p>
							</motion.div>

							<motion.form variants={itemVariants} onSubmit={handleSubmit} className="mt-8 space-y-6">
								<div className="space-y-4 rounded-md">
									<FloatingLabelInput id="email" label="Alamat Email" type="email" value={formData.email} onChange={handleInputChange} disabled={isLoading} icon={Mail} error={!!errors.email} isValid={isEmailValid} autoComplete="email" />
									<div className="relative">
										<FloatingLabelInput
											id="password"
											label="Password"
											type={showPassword ? 'text' : 'password'}
											value={formData.password}
											onChange={handleInputChange}
											disabled={isLoading}
											icon={Lock}
											error={!!errors.password}
											isValid={isPasswordValid}
											autoComplete="current-password"
										/>
										<button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors" disabled={isLoading}>
											{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
										</button>
									</div>
								</div>

								{errors.email && (
									<motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-600 text-center">
										{errors.email}
									</motion.p>
								)}
								{errors.password && !errors.email && (
									<motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-600">
										{errors.password}
									</motion.p>
								)}

								<motion.div variants={itemVariants} className={isFormReady ? 'animate-subtle-pulse rounded-xl' : ''}>
									<ShimmeringCTAButton
										type="submit"
										disabled={!isFormReady}
										isLoading={isLoading}
										shape="rectangle" // <-- CUKUP TAMBAHKAN INI
										className="w-full h-14 text-lg" // <-- Anda masih bisa menambahkan kelas custom seperti ukuran
									>
										Masuk Sekarang
										<ArrowRight className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
									</ShimmeringCTAButton>
								</motion.div>
							</motion.form>

							<motion.div variants={itemVariants} className="mt-6 text-center text-xs text-slate-500">
								<p>
									Dengan masuk, Anda setuju dengan{' '}
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

export default LoginPage;
