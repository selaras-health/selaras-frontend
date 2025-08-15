import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

const navItems = [
	{ name: 'Alasan', href: '#alasan' },
	{ name: 'Fitur', href: '#fitur' },
	{ name: 'Cara', href: '#cara' },
	{ name: 'Untukmu', href: '#untukmu' },
	{ name: 'Sinergi', href: '#sinergi' },
];

const MainNavbar = () => {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [activeSection, setActiveSection] = useState('');

	// Handle scroll effects
	useEffect(() => {
		const handleScroll = () => {
			const scrollY = window.scrollY;
			setIsScrolled(scrollY > 100);

			// Scroll spy functionality
			const sections = navItems.map((item) => item.href.substring(1));
			const currentSection = sections.find((section) => {
				const element = document.getElementById(section);
				if (element) {
					const rect = element.getBoundingClientRect();
					return rect.top <= 100 && rect.bottom >= 100;
				}
				return false;
			});

			if (currentSection) {
				setActiveSection(currentSection);
			}
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	// Smooth scroll to section
	const scrollToSection = (href: string) => {
		const element = document.getElementById(href.substring(1));
		if (element) {
			element.scrollIntoView({ behavior: 'smooth' });
		}
		setIsMobileMenuOpen(false);
	};

	return (
		<>
			<motion.nav
				initial={{ y: -100 }}
				animate={{ y: 0 }}
				transition={{ duration: 0.6, ease: 'easeOut' }}
				className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20' : 'bg-white/60 backdrop-blur-sm'}`}
				style={{
					fontFamily: 'Inter, system-ui, sans-serif',
				}}
			>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'h-16' : 'h-20'}`}>
						{/* Logo */}
						<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
							<img src={logo} alt="Selaras Logo" className={`transition-all duration-300 ${isScrolled ? 'h-7' : 'h-8'}`} />
							<span className={`font-bold text-slate-900 transition-all duration-300 ${isScrolled ? 'text-xl' : 'text-2xl'}`}>Selaras</span>
						</motion.div>

						{/* Desktop Navigation */}
						<div className="hidden md:flex items-center space-x-8">
							{navItems.map((item) => (
								<motion.button
									key={item.name}
									onClick={() => scrollToSection(item.href)}
									className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer ${activeSection === item.href.substring(1) ? 'text-rose-600' : 'text-slate-700 hover:text-rose-600'}`}
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
								>
									{item.name}
									{activeSection === item.href.substring(1) && (
										<motion.div layoutId="activeIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-600 rounded-full" initial={false} transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
									)}
								</motion.button>
							))}
						</div>

						{/* CTA Button */}
						<div className="hidden md:block">
							<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
								<a href="/dashboard/analysis">
									<Button
										className={`bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
											isScrolled ? 'px-4 py-2 text-sm' : 'px-6 py-3'
										}`}
									>
										🚀 Coba Gratis Sekarang
									</Button>
								</a>
							</motion.div>
						</div>

						{/* Mobile Menu Button */}
						<div className="md:hidden">
							<motion.button whileTap={{ scale: 0.95 }} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-lg text-slate-700 hover:text-rose-600 hover:bg-rose-50 transition-colors duration-200 cursor-pointer">
								{isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
							</motion.button>
						</div>
					</div>
				</div>

				{/* Mobile Menu */}
				<AnimatePresence>
					{isMobileMenuOpen && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: 'auto' }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.3, ease: 'easeInOut' }}
							className="md:hidden bg-white/95 backdrop-blur-md border-t border-white/20 shadow-lg"
						>
							<div className="px-4 py-6 space-y-4">
								{navItems.map((item, index) => (
									<motion.button
										key={item.name}
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: index * 0.1 }}
										onClick={() => scrollToSection(item.href)}
										className={`block w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 cursor-pointer ${
											activeSection === item.href.substring(1) ? 'text-rose-600 bg-rose-50' : 'text-slate-700 hover:text-rose-600 hover:bg-rose-50'
										}`}
									>
										{item.name}
									</motion.button>
								))}

								<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: navItems.length * 0.1 }} className="pt-4 border-t border-slate-200">
									<a href="/dashboard/analysis">
										<Button
											className={`bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
												isScrolled ? 'px-4 py-2 text-sm' : 'px-6 py-3'
											}`}
										>
											🚀 Coba Gratis Sekarang
										</Button>
									</a>
								</motion.div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</motion.nav>

			{/* Spacer to prevent content from hiding behind fixed navbar */}
			<div className={`transition-all duration-300 ${isScrolled ? 'h-16' : 'h-20'}`} />
		</>
	);
};

export default MainNavbar;
