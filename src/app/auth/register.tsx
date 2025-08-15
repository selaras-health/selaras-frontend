/* eslint-disable no-useless-escape */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Loader2, ArrowRight, CheckCircle, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { register } from '@/hooks/api/auth';
import { useAuth } from '@/provider/AuthProvider';

// Validation schema
const registerSchema = z
	.object({
		email: z.string().email({ message: 'Please enter a valid email address' }),
		password: z
			.string()
			.min(8, { message: 'Password harus minimal 8 karakter' })
			.regex(/[A-Z]/, {
				message: 'Password harus memiliki setidaknya satu huruf kapital',
			})
			.regex(/[a-z]/, {
				message: 'Password harus memiliki setidaknya satu huruf kecil',
			})
			.regex(/[0-9]/, {
				message: 'Password harus memiliki setidaknya satu angka',
			})
			.regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, {
				message: 'Password harus memiliki setidaknya satu simbol',
			}),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword'],
	});

type RegisterFormData = z.infer<typeof registerSchema>;

const pageVariants = {
	initial: { opacity: 0, y: 20 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: -20 },
};

const cardVariants = {
	initial: { opacity: 0, scale: 0.95 },
	animate: { opacity: 1, scale: 1 },
	transition: { duration: 0.3 },
};

// Password strength checker
const getPasswordStrength = (password: string) => {
	const checks = [
		{ label: 'Minimal 8 karakter', test: password.length >= 8 },
		{ label: 'Satu huruf kapital', test: /[A-Z]/.test(password) },
		{ label: 'Satu huruf kecil', test: /[a-z]/.test(password) },
		{ label: 'Satu angka', test: /[0-9]/.test(password) },
		{ label: 'Satu simbol', test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
	];

	const passedChecks = checks.filter((check) => check.test).length;
	return { checks, strength: passedChecks };
};

const Register = () => {
	const auth = useAuth();
	const setToken = auth?.setToken;
	const navigate = useNavigate();
	const [formData, setFormData] = useState<RegisterFormData>({
		email: '',
		password: '',
		confirmPassword: '',
	});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
	const [showPasswordStrength, setShowPasswordStrength] = useState(false);

	const passwordStrength = getPasswordStrength(formData.password);

	const handleInputChange = (field: keyof RegisterFormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: undefined }));
		}
	};

	const validateForm = () => {
		try {
			registerSchema.parse(formData);
			setErrors({});
			return true;
		} catch (error) {
			if (error instanceof z.ZodError) {
				const fieldErrors: Partial<RegisterFormData> = {};
				error.errors.forEach((err) => {
					if (err.path[0]) {
						fieldErrors[err.path[0] as keyof RegisterFormData] = err.message;
					}
				});
				setErrors(fieldErrors);
			}
			return false;
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		setIsLoading(true);

		if (formData.password !== formData.confirmPassword) {
			setErrors({
				password: 'Passwords do not match',
				confirmPassword: 'Passwords do not match',
			});
			setIsLoading(false);
			return;
		}

		try {
			const response = await register(formData.email, formData.password, formData.confirmPassword);

			if (response.success !== true) {
				setErrors({
					email: response.message || 'Register failed. Please try again.',
					password: response.message || 'Register failed. Please try again.',
					confirmPassword: response.message || 'Register failed. Please try again.',
				});
			} else {
				setToken?.(response.data.access_token);
				navigate('/dashboard');
			}
		} catch (error) {
			console.error('Registration failed:', error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center p-4">
			{/* Background decoration */}
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(244,63,94,0.1),transparent_50%)]" />
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(244,63,94,0.05),transparent_50%)]" />

			<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.5 }} className="w-full max-w-md relative z-10">
				<motion.div variants={cardVariants} initial="initial" animate="animate" className="mb-8 text-center">
					<h2 className="text-3xl font-bold text-gray-900 mb-2">Buat Akunmu!</h2>
					<p className="text-gray-600">Mulai perjalanan Kamu dengan membuat akun baru.</p>
				</motion.div>

				<motion.div variants={cardVariants} initial="initial" animate="animate" transition={{ delay: 0.1 }}>
					<Card className="rounded-2xl shadow-xl border border-gray-200 bg-white/80 backdrop-blur-sm">
						<CardHeader className="pb-4">
							<CardTitle className="text-xl font-bold text-gray-900 text-center">Buat Akun Sekarang</CardTitle>
						</CardHeader>
						<CardContent className="p-6 pt-0">
							<form onSubmit={handleSubmit} className="space-y-6">
								{/* Email Field */}
								<div className="space-y-2">
									<Label htmlFor="email" className="text-sm font-medium text-gray-700">
										Alamat Email
									</Label>
									<div className="relative">
										<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
										<Input
											id="email"
											type="email"
											value={formData.email}
											onChange={(e) => handleInputChange('email', e.target.value)}
											className={`pl-10 h-12 rounded-xl border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-300 ${errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
											placeholder="Enter your email"
											disabled={isLoading}
										/>
									</div>
									{errors.email && (
										<motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-600">
											{errors.email}
										</motion.p>
									)}
								</div>

								{/* Password Field */}
								<div className="space-y-2">
									<Label htmlFor="password" className="text-sm font-medium text-gray-700">
										Password
									</Label>
									<div className="relative">
										<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
										<Input
											id="password"
											type={showPassword ? 'text' : 'password'}
											value={formData.password}
											onChange={(e) => handleInputChange('password', e.target.value)}
											onFocus={() => setShowPasswordStrength(true)}
											className={`pl-10 pr-10 h-12 rounded-xl border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-300 ${
												errors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
											}`}
											placeholder="Create a strong password"
											disabled={isLoading}
										/>
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
											disabled={isLoading}
										>
											{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
										</button>
									</div>

									{/* Password Strength Indicator */}
									{showPasswordStrength && formData.password && (
										<motion.div
											initial={{
												opacity: 0,
												height: 0,
											}}
											animate={{
												opacity: 1,
												height: 'auto',
											}}
											className="p-3 bg-gray-50 rounded-lg border border-gray-200"
										>
											<div className="space-y-2">
												<div className="flex items-center justify-between">
													<span className="text-xs font-medium text-gray-700">Password Strength</span>
													<span className="text-xs text-gray-600">
														{passwordStrength.strength}
														/5
													</span>
												</div>
												<div className="w-full bg-gray-200 rounded-full h-2">
													<div
														className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.strength <= 2 ? 'bg-red-500' : passwordStrength.strength <= 3 ? 'bg-yellow-500' : 'bg-green-500'}`}
														style={{
															width: `${(passwordStrength.strength / 5) * 100}%`,
														}}
													/>
												</div>
												<div className="space-y-1">
													{passwordStrength.checks.map((check, index) => (
														<div key={index} className="flex items-center gap-2">
															{check.test ? <CheckCircle className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-gray-400" />}
															<span className={`text-xs ${check.test ? 'text-green-700' : 'text-gray-600'}`}>{check.label}</span>
														</div>
													))}
												</div>
											</div>
										</motion.div>
									)}

									{errors.password && (
										<motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-600">
											{errors.password}
										</motion.p>
									)}
								</div>

								{/* Confirm Password Field */}
								<div className="space-y-2">
									<Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
										Konfirmasi Password
									</Label>
									<div className="relative">
										<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
										<Input
											id="confirmPassword"
											type={showConfirmPassword ? 'text' : 'password'}
											value={formData.confirmPassword}
											onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
											className={`pl-10 pr-10 h-12 rounded-xl border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-300 ${
												errors.confirmPassword ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
											}`}
											placeholder="Confirm your password"
											disabled={isLoading}
										/>
										<button
											type="button"
											onClick={() => setShowConfirmPassword(!showConfirmPassword)}
											className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
											disabled={isLoading}
										>
											{showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
										</button>
									</div>
									{errors.confirmPassword && (
										<motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-600">
											{errors.confirmPassword}
										</motion.p>
									)}
								</div>

								{/* Submit Button */}
								<Button
									type="submit"
									disabled={isLoading || passwordStrength.strength < 5}
									className="w-full h-12 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
								>
									{isLoading ? (
										<>
											<Loader2 className="h-5 w-5 mr-2 animate-spin" />
											Membuat Akun...
										</>
									) : (
										<>
											Buat Akun Sekarang
											<ArrowRight className="h-5 w-5 ml-2" />
										</>
									)}
								</Button>

								{/* Divider */}
								<div className="relative">
									<div className="absolute inset-0 flex items-center">
										<div className="w-full border-t border-gray-300" />
									</div>
									<div className="relative flex justify-center text-sm">
										<span className="px-2 bg-white text-gray-500">Sudah punya akun?</span>
									</div>
								</div>

								{/* Login Link */}
								<div className="text-center">
									<Link to="/auth/login" className="text-rose-600 hover:text-rose-700 font-semibold transition-colors">
										Masuk Sekarang
									</Link>
								</div>
							</form>
						</CardContent>
					</Card>
				</motion.div>

				{/* Footer */}
				<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-8 text-center text-sm text-gray-600">
					<p>
						Dengan mendaftar, Kamu setuju dengan{' '}
						<Link to="/terms" className="text-rose-600 hover:text-rose-700 font-medium">
							Syarat dan Ketentuan
						</Link>{' '}
						dan{' '}
						<Link to="/privacy" className="text-rose-600 hover:text-rose-700 font-medium">
							Kebijakan Privasi
						</Link>
					</p>
				</motion.div>
			</motion.div>
		</div>
	);
};

export default Register;
