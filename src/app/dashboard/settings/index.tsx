/* eslint-disable no-useless-escape */
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Palette, Globe, Save, Edit3, KeyRound, Loader2, AlertTriangle, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/provider/AuthProvider';
import { regionMap } from '@/lib/data';
import { formatCountryName } from '@/lib/utils';
import { deleteAccount, resetPassword, updateProfile } from '@/hooks/api/auth';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ShimmeringCTAButton } from '@/components/fragments/ShimmeringCTAButton';

// --- ANIMATION VARIANTS ---
const pageVariants = {
	initial: { opacity: 0, y: 20 },
	animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
	exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

// --- ZOD SCHEMA FOR PASSWORD VALIDATION ---
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

const changePasswordSchema = z
	.object({
		password: z
			.string()
			.min(8, { message: 'Password harus minimal 8 karakter' })
			.regex(/[A-Z]/, { message: 'Password harus memiliki setidaknya satu huruf kapital' })
			.regex(/[a-z]/, { message: 'Password harus memiliki setidaknya satu huruf kecil' })
			.regex(/[0-9]/, { message: 'Password harus memiliki setidaknya satu angka' })
			.regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, {
				message: 'Password harus memiliki setidaknya satu simbol',
			}),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Konfirmasi password tidak cocok',
		path: ['confirmPassword'],
	});

type PasswordFormValues = z.infer<typeof changePasswordSchema>;

// --- MAIN SETTINGS PAGE COMPONENT ---
export default function SettingsPage() {
	return (
		<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="max-w-4xl mx-auto px-4 py-10 space-y-10">
			{/* --- HEADER --- */}
			<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
				<h1 className="text-3xl font-bold text-slate-800">Pengaturan Akun</h1>
				<p className="text-lg text-slate-500 mt-1">Kelola profil, preferensi, dan keamanan akun Anda dalam satu halaman.</p>
			</motion.div>

			{/* --- SETTINGS CONTENT (ALL SECTIONS) --- */}
			<div className="space-y-8">
				<ProfileSection />
				<PreferencesSection />
				<SecuritySection />
			</div>
		</motion.div>
	);
}

// --- SUB-COMPONENTS FOR EACH SETTINGS SECTION ---

const formatDate = (dateString: string | null): string => {
	if (!dateString) return '-';
	try {
		const normalizedDateString = dateString.includes('/') ? dateString.split('/').reverse().join('-') : dateString;
		const date = new Date(normalizedDateString);
		if (isNaN(date.getTime())) {
			return dateString;
		}
		const day = String(date.getDate()).padStart(2, '0');
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const year = date.getFullYear();
		return `${day}/${month}/${year}`;
	} catch (error) {
		return dateString;
	}
};

const ProfileSection = () => {
	const auth = useAuth();
	const token = auth?.token;
	const user = auth?.user;

	const [isEditing, setIsEditing] = useState(false);
	const [profileData, setProfileData] = useState(
		user || {
			age: 0,
			country_of_residence: '',
			date_of_birth: '',
			email: '',
			first_name: '',
			language: '',
			last_name: '',
			risk_region: '',
			sex: '',
		}
	);
	const [isSavingProfile, setIsSavingProfile] = useState(false);

	useEffect(() => {
		if (user) setProfileData(user);
	}, [user]);

	const handleSaveProfile = async () => {
		if (!token) {
			toast.error('Sesi tidak valid.');
			return;
		}
		setIsSavingProfile(true);
		try {
			await updateProfile(token, profileData);
			setIsEditing(false);
			auth?.refreshUserProfile();
			toast.success('Profil berhasil diperbarui!');
		} catch (error) {
			toast.error('Gagal memperbarui profil.');
		} finally {
			setIsSavingProfile(false);
		}
	};

	const formatDateForInput = (dateString: string | null) => {
		if (!dateString) return '';
		try {
			const date = new Date(dateString.split('/').reverse().join('-'));
			if (isNaN(date.getTime())) return '';
			return date.toISOString().split('T')[0];
		} catch {
			return '';
		}
	};

	const allCountries = Object.values(regionMap)
		.flat()
		.sort((a, b) => formatCountryName(a).localeCompare(formatCountryName(b)));

	return (
		<Card className="rounded-2xl shadow-lg border-slate-200/80 overflow-hidden">
			<CardHeader className="bg-slate-50/70 border-b">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<User className="h-6 w-6 text-rose-500" />
						<div>
							<CardTitle className="text-lg font-bold text-slate-800">Profil Pengguna</CardTitle>
							<CardDescription>Informasi ini akan ditampilkan di profil Anda.</CardDescription>
						</div>
					</div>
					<Button onClick={() => setIsEditing(!isEditing)} variant="outline" className="font-semibold cursor-pointer">
						<Edit3 className="h-4 w-4 mr-2" /> {isEditing ? 'Batal' : 'Edit Profil'}
					</Button>
				</div>
			</CardHeader>
			<CardContent className="px-6 pt-6 space-y-6">
				<div className="flex flex-col sm:flex-row gap-6 items-center">
					<div className="relative">
						<Avatar className="w-24 h-24 border-4 border-white shadow-2xl">
							<AvatarImage src="/placeholder.svg?height=80&width=80" alt="Profile" />
							<AvatarFallback className="bg-gradient-to-br from-red-300 via-pink-400 to-red-500  text-white text-4xl font-bold">{user?.first_name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
						</Avatar>
					</div>
					<div className="flex-1 text-center sm:text-left">
						<h3 className="text-2xl font-bold text-slate-800">{`${profileData.first_name} ${profileData.last_name}`}</h3>
						<p className="text-slate-500">{profileData.email}</p>
					</div>
				</div>
				<Separator />
				<div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
					<ProfileField label="Nama Depan" value={profileData.first_name} isEditing={isEditing} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData((p) => ({ ...p, first_name: e.target.value }))} />
					<ProfileField label="Nama Belakang" value={profileData.last_name} isEditing={isEditing} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData((p) => ({ ...p, last_name: e.target.value }))} />
					<ProfileField
						label="Tanggal Lahir"
						value={profileData.date_of_birth ? formatDate(profileData.date_of_birth) : '-'}
						isEditing={isEditing}
						type="date"
						editValue={formatDateForInput(profileData.date_of_birth)}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData((p) => ({ ...p, date_of_birth: e.target.value }))}
					/>
					<div>
						<Label className="font-semibold text-slate-600">Jenis Kelamin</Label>
						{isEditing ? (
							<Select value={profileData.sex} onValueChange={(v) => setProfileData((p) => ({ ...p, sex: v }))}>
								<SelectTrigger className="w-full mt-1 h-12 rounded-xl">
									<SelectValue placeholder="Pilih jenis kelamin" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="male">Laki-laki</SelectItem>
									<SelectItem value="female">Perempuan</SelectItem>
								</SelectContent>
							</Select>
						) : (
							<p className="text-slate-800 mt-2 font-medium">{profileData.sex === 'male' ? 'Laki-laki' : profileData.sex === 'female' ? 'Perempuan' : '-'}</p>
						)}
					</div>
					<div className="md:col-span-2">
						<Label className="font-semibold text-slate-600">Negara Tempat Tinggal</Label>
						{isEditing ? (
							<Select value={profileData.country_of_residence} onValueChange={(v) => setProfileData((p) => ({ ...p, country_of_residence: v }))}>
								<SelectTrigger className="w-full mt-1 h-12 rounded-xl">
									<SelectValue placeholder="Pilih negara" />
								</SelectTrigger>
								<SelectContent>
									{allCountries.map((country) => (
										<SelectItem key={country} value={country}>
											{formatCountryName(country)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						) : (
							<p className="text-slate-800 mt-2 font-medium">{formatCountryName(profileData.country_of_residence) || '-'}</p>
						)}
					</div>
				</div>
				<AnimatePresence>
					{isEditing && (
						<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end pt-4 border-t border-slate-200">
							<ShimmeringCTAButton
								onClick={handleSaveProfile}
								isLoading={isSavingProfile}
								disabled={isSavingProfile}
								shape="rectangle"
								className="w-32 h-11 text-base"
								loadingText="" // Mengirim string kosong agar hanya menampilkan spinner
							>
								<Save className="h-4 w-4 mr-2" />
								Simpan
							</ShimmeringCTAButton>
						</motion.div>
					)}
				</AnimatePresence>
			</CardContent>
		</Card>
	);
};

const ProfileField = ({ label, value, isEditing, type = 'text', editValue, onChange }: any) => (
	<div>
		<Label className="font-semibold text-slate-600">{label}</Label>
		{isEditing ? <Input type={type} value={editValue || value} onChange={onChange} className="mt-1 h-12 rounded-xl" /> : <p className="text-slate-800 mt-2 font-medium">{value || '-'}</p>}
	</div>
);

const PreferencesSection = () => {
	const auth = useAuth();
	const user = auth?.user;
	const [preferences, setPreferences] = useState({
		language: user?.language || 'id',
		theme: 'system',
	});

	return (
		<Card className="rounded-2xl shadow-lg border-slate-200/80">
			<CardHeader className="bg-slate-50/70 border-b">
				<CardTitle className="flex items-center gap-3 text-slate-800">
					<Palette className="text-rose-500" /> Preferensi
				</CardTitle>
			</CardHeader>
			<CardContent className="p-2 divide-y divide-slate-200/80">
				<SettingsRow icon={Globe} title="Bahasa" description="Pilih bahasa tampilan aplikasi.">
					<Select value={preferences.language} onValueChange={(v) => setPreferences((p) => ({ ...p, language: v }))}>
						<SelectTrigger className="w-48 cursor-pointer">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="id">Bahasa Indonesia</SelectItem>
						</SelectContent>
					</Select>
				</SettingsRow>
				{/* <SettingsRow icon={Sun} title="Tema Tampilan" description="Sesuaikan tampilan terang atau gelap.">
					<Select value={preferences.theme} onValueChange={(v) => setPreferences((p) => ({ ...p, theme: v }))}>
						<SelectTrigger className="w-48 cursor-pointer">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="light">
								<div className="flex items-center gap-2">
									<Sun className="w-4 h-4" />
									Terang
								</div>
							</SelectItem>
						</SelectContent>
					</Select>
				</SettingsRow> */}
			</CardContent>
		</Card>
	);
};

const SettingsRow = ({ icon: Icon, title, description, children }: { icon: React.ElementType; title: string; description: string; children: React.ReactNode }) => (
	<div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors gap-4">
		<div className="flex items-start gap-4">
			<Icon className="h-6 w-6 text-slate-500 flex-shrink-0 mt-1" />
			<div>
				<h4 className="font-semibold text-slate-800">{title}</h4>
				<p className="text-sm text-slate-500">{description}</p>
			</div>
		</div>
		<div className="sm:ml-auto">{children}</div>
	</div>
);

const SecuritySection = () => {
	const auth = useAuth();
	const token = auth?.token;
	const user = auth?.user;
	const navigate = useNavigate();

	const [passwordForm, setPasswordForm] = useState<PasswordFormValues>({ password: '', confirmPassword: '' });
	const [passwordDelete, setPasswordDelete] = useState('');
	const [errors, setErrors] = useState<Partial<Record<keyof PasswordFormValues, string>>>({});
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const [isChangingPassword, setIsChangingPassword] = useState(false);
	const [isDeletingAccount, setIsDeletingAccount] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [showPasswordStrength, setShowPasswordStrength] = useState(false);

	const passwordStrength = getPasswordStrength(passwordForm.password);

	const handlePasswordChange = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});
		const validation = changePasswordSchema.safeParse(passwordForm);
		if (!validation.success) {
			const formattedErrors: Partial<Record<keyof PasswordFormValues, string>> = {};
			validation.error.errors.forEach((err) => {
				if (err.path[0]) formattedErrors[err.path[0] as keyof PasswordFormValues] = err.message;
			});
			setErrors(formattedErrors);
			return;
		}
		if (!token || !user?.email) {
			toast.error('Sesi tidak valid.');
			return;
		}
		setIsChangingPassword(true);
		try {
			await resetPassword(token, user.email, passwordForm.password, passwordForm.confirmPassword);
			toast.success('Password berhasil diperbarui!');
			(document.getElementById('close-password-dialog') as HTMLButtonElement)?.click();
			setPasswordForm({ password: '', confirmPassword: '' });
			setShowPasswordStrength(false);
		} catch (error) {
			toast.error('Gagal memperbarui password.');
			setErrors({ password: 'Gagal memperbarui password.' });
		} finally {
			setIsChangingPassword(false);
		}
	};

	const handleDeleteAccount = async (e: React.FormEvent) => {
		e.preventDefault();
		setDeleteError(null);
		if (!passwordDelete) {
			setDeleteError('Password diperlukan.');
			return;
		}
		if (!token) {
			toast.error('Sesi tidak valid.');
			return;
		}
		setIsDeletingAccount(true);
		try {
			await deleteAccount(token, passwordDelete);
			toast.success('Akun berhasil dihapus.');
			setTimeout(() => {
				auth?.resetContext();
				navigate('/login');
			}, 2000);
		} catch (error) {
			toast.error('Gagal menghapus akun. Password salah.');
			setDeleteError('Password yang Anda masukkan salah.');
		} finally {
			setIsDeletingAccount(false);
		}
	};

	return (
		<div className="space-y-8">
			<Card className="rounded-2xl shadow-lg border-slate-200/80">
				<CardHeader className="bg-slate-50/70 border-b">
					<CardTitle className="flex items-center gap-3 text-slate-800">
						<Shield className="text-rose-500" /> Keamanan
					</CardTitle>
				</CardHeader>
				<CardContent className="p-2 divide-y divide-slate-200/80">
					<Dialog onOpenChange={(open) => !open && setShowPasswordStrength(false)}>
						<SettingsRow icon={KeyRound} title="Ubah Password" description="Ganti password Anda secara berkala.">
							<DialogTrigger asChild>
								<Button variant="outline" className="cursor-pointer w-28">
									Ubah
								</Button>
							</DialogTrigger>
						</SettingsRow>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Ubah Password</DialogTitle>
								<DialogDescription>Pastikan untuk menggunakan password yang kuat dan unik.</DialogDescription>
							</DialogHeader>
							<form onSubmit={handlePasswordChange} className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="password">Password Baru</Label>
									<div className="relative">
										<Input
											id="password"
											type={showPassword ? 'text' : 'password'}
											value={passwordForm.password}
											onFocus={() => setShowPasswordStrength(true)}
											onChange={(e) => {
												setPasswordForm((p) => ({ ...p, password: e.target.value }));
												if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
											}}
											className={`pl-3 pr-10 h-12 rounded-xl ${errors.password ? 'border-red-500' : ''}`}
											placeholder="Masukkan password baru"
										/>
										<button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
											<EyeOff className="h-5 w-5" />
										</button>
									</div>
									{errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
								</div>
								{showPasswordStrength && passwordForm.password && (
									<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-3 bg-slate-50 rounded-lg border text-sm">
										<div className="grid grid-cols-2 gap-x-4 gap-y-1">
											{passwordStrength.checks.map((check, index) => (
												<div key={index} className="flex items-center gap-2">
													<div className={`w-1.5 h-1.5 rounded-full ${check.test ? 'bg-green-500' : 'bg-slate-300'}`}></div>
													<span className={`text-xs ${check.test ? 'text-slate-700' : 'text-slate-500'}`}>{check.label}</span>
												</div>
											))}
										</div>
									</motion.div>
								)}
								<div className="space-y-2">
									<Label htmlFor="confirmPassword">Konfirmasi Password</Label>
									<div className="relative">
										<Input
											id="confirmPassword"
											type={showConfirmPassword ? 'text' : 'password'}
											value={passwordForm.confirmPassword}
											onChange={(e) => {
												setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }));
												if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
											}}
											className={`pl-3 pr-10 h-12 rounded-xl ${errors.confirmPassword ? 'border-red-500' : ''}`}
											placeholder="Konfirmasi password"
										/>
										<button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
											<EyeOff className="h-5 w-5" />
										</button>
									</div>
									{errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
								</div>
								<DialogFooter className="pt-4">
									<DialogClose asChild>
										<Button id="close-password-dialog" type="button" variant="ghost">
											Batal
										</Button>
									</DialogClose>
									<Button type="submit" disabled={isChangingPassword || passwordStrength.strength < 5} className="bg-rose-600 hover:bg-rose-700 w-32">
										{isChangingPassword ? <Loader2 className="animate-spin" /> : 'Simpan'}
									</Button>
								</DialogFooter>
							</form>
						</DialogContent>
					</Dialog>
				</CardContent>
			</Card>
			<Card className="rounded-xl border-red-500 bg-red-50/50 shadow-md">
				<CardHeader>
					<div className="flex items-center gap-4">
						<AlertTriangle className="h-6 w-6 text-red-600" />
						<div>
							<CardTitle className="text-red-800 text-lg font-bold">Zona Berbahaya</CardTitle>
							<CardDescription className="text-red-700">Tindakan berikut tidak dapat dibatalkan.</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
						<div>
							<h4 className="font-bold text-gray-800">Hapus Akun Ini</h4>
							<p className="text-sm text-gray-600">Semua data Anda akan dihapus permanen.</p>
						</div>
						<Dialog>
							<DialogTrigger asChild>
								<Button variant="destructive" className="cursor-pointer bg-rose-600 hover:bg-rose-700">
									Hapus Akun
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Apakah Anda Benar-Benar Yakin?</DialogTitle>
									<DialogDescription>Tindakan ini akan menghapus akun dan semua data Anda. Untuk melanjutkan, ketik password Anda.</DialogDescription>
								</DialogHeader>
								<form onSubmit={handleDeleteAccount}>
									<div className="py-2">
										<Label htmlFor="delete-password">Password</Label>
										<Input id="delete-password" type="password" value={passwordDelete} onChange={(e) => setPasswordDelete(e.target.value)} className={`mt-1 ${deleteError ? 'border-red-500' : ''}`} />
										{deleteError && <p className="text-red-500 text-xs mt-1">{deleteError}</p>}
									</div>
									<DialogFooter className="pt-2">
										<DialogClose asChild>
											<Button type="button" variant="ghost">
												Batal
											</Button>
										</DialogClose>
										<Button type="submit" variant="destructive" disabled={isDeletingAccount} className="w-40 bg-rose-600 hover:bg-rose-700">
											{isDeletingAccount ? <Loader2 className="animate-spin" /> : 'Ya, Hapus Akun Saya'}
										</Button>
									</DialogFooter>
								</form>
							</DialogContent>
						</Dialog>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
