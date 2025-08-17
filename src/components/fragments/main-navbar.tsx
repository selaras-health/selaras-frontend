/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import logo from '@/assets/logo.png';
import { ShimmeringCTAButton } from './ShimmeringCTAButton';

// --- Data Navigasi ---
const navItems = [
	{ name: 'Keunggulan', href: '#testimoni' },
	{ name: 'Fitur', href: '#fitur' },
	{ name: 'Teknologi', href: '#teknologi' },
];

// --- Custom Hook untuk Scroll Spy (tetap performatif) ---
const useScrollSpy = (ids: string[]) => {
	const [activeId, setActiveId] = useState('');
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) setActiveId(entry.target.id);
				});
			},
			{ rootMargin: '-30% 0px -70% 0px', threshold: 0 }
		);
		ids.forEach((id) => {
			const element = document.getElementById(id);
			if (element) observer.observe(element);
		});
		return () =>
			ids.forEach((id) => {
				const element = document.getElementById(id);
				if (element) observer.unobserve(element);
			});
	}, [ids]);
	return activeId;
};

// --- Komponen Utama Navbar ---
export default function MainNavbar() {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const sectionIds = navItems.map((item) => item.href.substring(1));
	const activeSection = useScrollSpy(sectionIds);

	useEffect(() => {
		const handleScroll = () => setIsScrolled(window.scrollY > 50);
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const scrollToSection = (href: string) => {
		const id = href.substring(1);
		document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		setIsMenuOpen(false);
	};

	const professionalEase = [0.4, 0, 0.2, 1] as const;
	const transition = { duration: 0.6, ease: professionalEase };

	return (
		<>
			<div className="fixed top-0 left-0 right-0 z-50 h-24 px-6 max-w-7xl mx-auto">
				<AnimatePresence>
					{isScrolled ? (
						// --- KONDISI SAAT SCROLL ---
						<motion.nav
							key="scrolled-nav"
							layoutId="navbar-container"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={transition}
							className="absolute top-4 left-6 right-6 h-16 bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl shadow-lg flex items-center justify-between px-6"
						>
							<motion.a
								layoutId="logo"
								href="#"
								onClick={(e) => {
									e.preventDefault();
									window.scrollTo({ top: 0, behavior: 'smooth' });
								}}
								className="flex items-center justify-center gap-x-1"
							>
								<img src={logo} alt="Selaras Logo" className="h-8" />
								<h1 className="text-lg font-bold text-rose-500">Selaras</h1>
							</motion.a>

							<div className="hidden md:flex items-center gap-16">
								{navItems.map((item) => (
									<button
										key={item.name}
										onClick={() => scrollToSection(item.href)}
										className={`relative text-sm font-semibold transition-colors ${activeSection === item.href.substring(1) ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
									>
										{item.name}
										{activeSection === item.href.substring(1) && <motion.div layoutId="nav-underline" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-red-500" />}
									</button>
								))}
							</div>

							{/* [DIUBAH] Menggunakan ShimmeringCTAButton dengan ukuran lebih kecil */}
							<motion.div layoutId="cta-button">
								<ShimmeringCTAButton href="/dashboard" className="px-5 py-2.5 text-sm">
									Mulai Analisis
								</ShimmeringCTAButton>
							</motion.div>
						</motion.nav>
					) : (
						// --- KONDISI DI PUNCAK HALAMAN ---
						<div key="top-nav" className="absolute top-0 left-6 right-6 h-24 flex items-center justify-between">
							<motion.a
								layoutId="logo"
								href="#"
								onClick={(e) => {
									e.preventDefault();
									window.scrollTo({ top: 0, behavior: 'smooth' });
								}}
								className="flex items-center justify-center gap-x-1"
							>
								<img src={logo} alt="Selaras Logo" className="h-8" />
								<h1 className="text-lg font-bold text-rose-500">Selaras</h1>
							</motion.a>

							<motion.button
								layoutId="navbar-container"
								onClick={() => setIsMenuOpen(true)}
								className="hidden md:block bg-white/80 backdrop-blur-lg border border-white/50 rounded-full shadow-lg px-6 py-3 text-sm font-semibold text-slate-900"
							>
								Menu
							</motion.button>

							<button onClick={() => setIsMenuOpen(true)} className="md:hidden bg-white/80 backdrop-blur-lg border border-white/50 rounded-full shadow-lg px-6 py-3 text-sm font-semibold text-slate-900">
								Menu{' '}
							</button>

							{/* [DIUBAH] Menggunakan ShimmeringCTAButton dengan ukuran standar */}
							<motion.div layoutId="cta-button">
								<ShimmeringCTAButton href="/dashboard" className="px-6 py-3 text-sm">
									Mulai Analisis
								</ShimmeringCTAButton>
							</motion.div>
						</div>
					)}
				</AnimatePresence>
			</div>

			{/* --- BABAK III: Pusat Komando (Menu Layar Penuh) --- */}
			<AnimatePresence>
				{isMenuOpen && (
					<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: professionalEase }} className="fixed inset-0 bg-black/50 backdrop-blur-2xl z-50 flex flex-col p-8">
						<div className="flex items-center justify-between w-full max-w-7xl mx-auto">
							<a
								href="#"
								onClick={(e) => {
									e.preventDefault();
									window.scrollTo({ top: 0, behavior: 'smooth' });
									setIsMenuOpen(false);
								}}
								className="flex items-center justify-center gap-x-1"
							>
								<img src={logo} alt="Selaras Logo" className="h-9" />

								<h1 className="text-xl font-bold text-rose-500">Selaras</h1>
							</a>
							<motion.button whileTap={{ scale: 0.9 }} onClick={() => setIsMenuOpen(false)} className="p-2 rounded-full text-white">
								<X className="h-8 w-8" />
							</motion.button>
						</div>

						<motion.div className="flex-grow flex flex-col items-center justify-center gap-8" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} initial="hidden" animate="visible" exit="hidden">
							{navItems.map((item) => (
								<motion.button
									key={item.name}
									onClick={() => scrollToSection(item.href)}
									className="text-4xl lg:text-6xl font-bold text-slate-300 hover:text-white transition-colors"
									variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
									transition={{ duration: 0.7, ease: professionalEase }}
								>
									{item.name}
								</motion.button>
							))}
						</motion.div>

						<motion.div className="w-full max-w-7xl mx-auto flex justify-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.4, ease: [0.25, 1, 0.5, 1] } }} exit={{ opacity: 0, y: 20 }}>
							<ShimmeringCTAButton href="/dashboard" className="w-3xs md:w-lg  lg:w-3xl py-6 text-lg">
								Masuk ke Selaras! <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
							</ShimmeringCTAButton>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			<div className="h-24" />
		</>
	);
}
