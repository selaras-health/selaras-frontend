/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue } from 'framer-motion';
import { Heart, ArrowRight, Brain, CheckCircle, Quote, Activity } from 'lucide-react';

// Import komponen UI Anda
import { CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MainNavbar from '@/components/fragments/main-navbar';

// --- ASSETS (TODO: Ganti dengan path aset final Anda) ---
import logo from '@/assets/logo.png';
import dashboardMockup from '@/assets/mockup/getstart-mockup.png';
import { ShimmeringCTAButton } from '@/components/fragments/ShimmeringCTAButton';
const featureImages = {
	sentra: '/src/assets/mockup/sentra-mockup.png',
	sehat: '/src/assets/mockup/sehat-mockup.png',
	cerdas: '/src/assets/mockup/cerdas-mockup.png',
	jurnal: '/src/assets/mockup/jurnal-mockup.png',
	analisis: '/src/assets/mockup/analisis-mockup.png',
};
const testimonialAvatars = {
	budi: 'https://randomuser.me/api/portraits/men/32.jpg',
	rina: 'https://randomuser.me/api/portraits/women/44.jpg',
	agus: 'https://randomuser.me/api/portraits/men/46.jpg',
};

// --- ANIMATION VARIANTS (Dengan Easing Profesional) ---
const professionalEase = [0.25, 1, 0.5, 1] as const; // <-- Tambahkan 'as const' di sini
const transition = { duration: 0.8, ease: professionalEase };

const fadeInUp = {
	initial: { opacity: 0, y: 40, scale: 0.98 },
	whileInView: { opacity: 1, y: 0, scale: 1, transition },
	viewport: { once: true, amount: 0.2 },
};
const staggerContainer = {
	whileInView: { transition: { staggerChildren: 0.1 } },
	viewport: { once: true, amount: 0.2 },
};

// --- REUSABLE & ENHANCED COMPONENTS ---
const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
	<motion.div initial="initial" whileInView="whileInView" variants={fadeInUp} className="text-center mb-20 max-w-3xl mx-auto">
		<h2 className={`text-4xl lg:text-5xl font-extrabold mb-5 tracking-tight ${title === 'Didukung oleh Sains Teruji & AI Terkini' ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
		<p className="text-lg lg:text-xl text-slate-600">{subtitle}</p>
	</motion.div>
);

const ShineCard = ({ children, className }: { children: React.ReactNode; className?: string }) => {
	const cardRef = useRef<HTMLDivElement>(null);
	const mouseX = useMotionValue(0);
	const mouseY = useMotionValue(0);

	const handleMouseMove = ({ clientX, clientY }: React.MouseEvent) => {
		if (!cardRef.current) return;
		const { left, top } = cardRef.current.getBoundingClientRect();
		mouseX.set(clientX - left);
		mouseY.set(clientY - top);
	};

	return (
		<motion.div ref={cardRef} onMouseMove={handleMouseMove} className={`relative overflow-hidden ${className}`} variants={fadeInUp}>
			{children}
			<motion.div
				className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
				style={{
					background: useTransform([mouseX, mouseY], ([newX, newY]) => `radial-gradient(500px circle at ${newX}px ${newY}px, rgba(255,255,255,0.5), transparent 80%)`),
				}}
			/>
		</motion.div>
	);
};

// --- SECTIONS ---

const HeroSection = () => {
	const { scrollYProgress } = useScroll();
	const y = useTransform(scrollYProgress, [0, 0.2], ['0%', '25%']); // Efek parallax halus

	return (
		<motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} id="get-started" className="relative h-[90vh] lg:h-screen flex items-center bg-white overflow-hidden">
			<div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white via-red-50/50 to-sky-50/50" />
			<div className="relative max-w-7xl mx-auto px-6 z-10">
				<div className="grid lg:grid-cols-2 gap-12 items-center">
					<motion.div initial="initial" animate="whileInView" variants={staggerContainer} className="space-y-8 text-center lg:text-left">
						<motion.div variants={fadeInUp}>
							<Badge className="bg-red-100 text-red-700 hover:bg-red-200 py-1.5 px-4 text-sm font-medium">❤️ Dikombinasikan Analisis AI Cerdas</Badge>
						</motion.div>
						<motion.h1 variants={fadeInUp} className="text-5xl lg:text-7xl font-bold text-slate-900 leading-tight tracking-tighter">
							Deteksi Cepat, <span className="bg-gradient-to-r from-red-500 to-pink-600 bg-clip-text text-transparent">Cegah Sebelum Terlambat.</span>
						</motion.h1>
						<motion.p variants={fadeInUp} className="text-xl text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
							Selaras memberikan gambaran risiko jantung Anda melalui analisis AI dan menyajikan langkah preventif yang dipersonalisasi.
						</motion.p>
						<motion.div variants={fadeInUp}>
							<ShimmeringCTAButton href="/dashboard/analysis">
								Mulai Analisis Gratis <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
							</ShimmeringCTAButton>
						</motion.div>
					</motion.div>
					<motion.div style={{ y }} className="relative hidden lg:block">
						<div className="bg-slate-100/70 rounded-3xl p-4 shadow-2xl shadow-slate-200/50 border border-slate-200/50">
							<img src={dashboardMockup} alt="Selaras Dashboard Mockup" className="rounded-2xl shadow-lg" />
						</div>
					</motion.div>
				</div>
			</div>
		</motion.section>
	);
};

const SocialProofSection = () => {
	const testimonials = [
		{
			quote: 'Aplikasi ini benar-benar membuka mata saya. Saya jadi lebih sadar akan kebiasaan kecil yang ternyata berpengaruh besar. Skor risiko saya turun 10% dalam 6 bulan!',
			name: 'Budi Santoso',
			role: '45, Manajer Proyek',
			avatarUrl: testimonialAvatars.budi,
		},
		{
			quote: 'Sebagai orang yang awam istilah medis, fitur Analis Cerdas sangat membantu. Saya jadi bisa mengerti laporan kesehatan saya sendiri tanpa merasa kebingungan.',
			name: 'Rina Wijaya',
			role: '32, Desainer Grafis',
			avatarUrl: testimonialAvatars.rina,
		},
		{
			quote: 'Sangat mudah digunakan. Saya bisa memantau progres kesehatan saya kapan saja. Sangat merekomendasikan Selaras untuk siapa saja yang peduli kesehatan.',
			name: 'Agus Setiawan',
			role: '52, Wiraswasta',
			avatarUrl: testimonialAvatars.agus,
		},
	];
	return (
		<section id="testimoni" className="py-24 lg:py-32 bg-slate-50/70">
			<div className="max-w-7xl mx-auto px-6">
				<SectionHeader title="Dipercaya oleh Pengguna Seperti Anda" subtitle="Kami bangga telah membantu banyak individu mengambil langkah proaktif untuk kesehatan jantung mereka." />
				<motion.div initial="initial" whileInView="whileInView" variants={staggerContainer} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
					{testimonials.map((testimonial, index) => (
						<ShineCard key={index} className="h-full bg-white shadow-lg rounded-2xl flex flex-col group">
							<CardContent className="p-8 flex-grow flex flex-col z-10">
								<Quote className="w-8 h-8 text-red-200 mb-4" />
								<p className="text-slate-700 leading-relaxed mb-6 flex-grow">"{testimonial.quote}"</p>
								<div className="flex items-center">
									<img src={testimonial.avatarUrl} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4 bg-slate-200" />
									<div>
										<p className="font-bold text-slate-900">{testimonial.name}</p>
										<p className="text-slate-500">{testimonial.role}</p>
									</div>
								</div>
							</CardContent>
						</ShineCard>
					))}
				</motion.div>
			</div>
		</section>
	);
};

// [Diperbarui] - FeatureScrollSection dengan 5 Fitur dan Alur Cerita yang Disempurnakan

const FeatureScrollSection = () => {
	// [DIUBAH] Menambahkan 'Lakukan Analisis' dan menyusun ulang urutan fitur
	const features = [
		{
			id: 'analisis',
			tagline: 'Penilaian Risiko Cerdas dalam 5 Menit.',
			description: 'Jawab serangkaian pertanyaan dinamis yang dirancang oleh ahli medis. AI kami akan menganalisis jawaban Anda untuk memberikan skor risiko dan wawasan mendalam.',
			benefits: ['Proses cepat dan mudah', 'Pertanyaan dinamis & relevan', 'Dapatkan hasil instan setelah selesai'],
			imageUrl: featureImages.analisis,
			bgColor: '#fffbeb', // Amber 50
		},
		{
			id: 'sentra',
			tagline: 'Dasbor Kesehatan Jantung Anda.',
			description: 'Semua data penting—tren risiko, ringkasan analisis, hingga progres program—tersaji dalam satu tampilan yang intuitif.',
			benefits: ['Pantau tren kesehatan secara visual', 'Akses cepat ke laporan terakhir', 'Lihat semua progres dalam satu tempat'],
			imageUrl: featureImages.sentra,
			bgColor: '#FFE4E6', // Rose 50
		},
		{
			id: 'jurnal',
			tagline: 'Catat dan Lihat Perjalanan Anda.',
			description: 'Setiap analisis tersimpan rapi. Bandingkan hasil dari waktu ke waktu untuk melihat dampak positif dari perubahan gaya hidup Anda.',
			benefits: ['Visualisasi progres yang memotivasi', 'Perbandingan hasil berdampingan', 'Riwayat lengkap untuk diskusi dokter'],
			imageUrl: featureImages.jurnal,
			bgColor: '#e0f2fe', // Sky 100
		},
		{
			id: 'sehat',
			tagline: 'Rencana Aksi yang Dipersonalisasi.',
			description: 'Selaras tidak hanya memberitahu risiko Anda, tapi juga memberikan rekomendasi program gaya hidup yang konkret dan dapat ditindaklanjuti.',
			benefits: ['Rekomendasi berbasis data pribadi', 'Target mingguan yang terukur', 'Panduan langkah demi langkah'],
			imageUrl: featureImages.sehat,
			bgColor: '#f0fdf4', // Green 50
		},
		{
			id: 'cerdas',
			tagline: 'Tanya Apapun tentang Laporan Anda.',
			description: 'Didukung Google Gemini, tanya dalam bahasa natural dan dapatkan penjelasan istilah medis yang mudah dimengerti.',
			benefits: ['Penjelasan instan dan akurat', 'Ubah data kompleks jadi sederhana', 'Lebih percaya diri saat diskusi dengan dokter'],
			imageUrl: featureImages.cerdas,
			bgColor: '#f5f3ff', // Violet 50
		},
	];
	const [activeFeature, setActiveFeature] = useState(features[0]);

	// Custom hook untuk Intersection Observer yang stabil
	const useFeatureInView = (callback: () => void) => {
		const ref = useRef<HTMLDivElement>(null);
		useEffect(() => {
			const observer = new IntersectionObserver(
				([entry]) => {
					if (entry.isIntersecting) callback();
				},
				{ root: null, rootMargin: '-50% 0px -50% 0px', threshold: 0 }
			);
			const currentRef = ref.current;
			if (currentRef) observer.observe(currentRef);
			return () => {
				if (currentRef) observer.unobserve(currentRef);
			};
		}, [callback, ref]);
		return ref;
	};

	return (
		<motion.section id="fitur" className="relative transition-colors duration-700 ease-in-out" style={{ backgroundColor: activeFeature.bgColor }}>
			<div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
				<SectionHeader title="Semua yang Anda Butuhkan dalam Satu Aplikasi" subtitle="Fitur-fitur kami dirancang untuk memberdayakan Anda di setiap langkah perjalanan kesehatan jantung Anda." />
				<div className="hidden lg:grid grid-cols-2 gap-24 items-start">
					<div className="w-full">
						{features.map((feature) => (
							<div key={feature.id} ref={useFeatureInView(() => setActiveFeature(feature))} className="h-[85vh] flex items-center">
								<motion.div className="space-y-6" animate={{ opacity: activeFeature.id === feature.id ? 1 : 0.3 }} transition={{ duration: 0.3 }}>
									<h3 className="text-4xl font-bold text-slate-900">{feature.tagline}</h3>
									<p className="text-lg text-slate-600 leading-relaxed">{feature.description}</p>
									<ul className="space-y-3">
										{feature.benefits.map((benefit, i) => (
											<li key={i} className="flex items-center gap-3">
												<CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
												<span>{benefit}</span>
											</li>
										))}
									</ul>
								</motion.div>
							</div>
						))}
					</div>
					<div className="w-full h-screen sticky top-0 flex items-center justify-center">
						{/* 1. Ubah div menjadi motion.div dan hapus `aspect-[4/3]`.
    2. Tambahkan prop `layout` untuk animasi ukuran yang mulus.
  */}
						<motion.div layout="position" transition={{ duration: 0.5, ease: 'easeInOut' }} className="relative w-full max-w-lg bg-white/60 backdrop-blur-md rounded-3xl p-2 shadow-2xl shadow-slate-300/50 border">
							<AnimatePresence mode="wait">
								<motion.img
									key={activeFeature.id}
									src={activeFeature.imageUrl}
									alt={`${activeFeature.tagline} mockup`}
									// 3. Kelas CSS diubah agar ukuran gambar menjadi otomatis & responsif
									className="relative max-w-full h-auto rounded-xl"
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.95 }}
									transition={{ duration: 0.5, ease: 'easeInOut' }}
								/>
							</AnimatePresence>
						</motion.div>
					</div>
				</div>
				<div className="lg:hidden space-y-16">
					{features.map((feature) => (
						<motion.div key={feature.id} {...fadeInUp} className="space-y-6">
							<div className="bg-slate-100 rounded-2xl shadow-lg aspect-video p-2">
								<img src={feature.imageUrl} alt={`${feature.tagline} mockup`} className="w-full h-full object-cover rounded-xl" />
							</div>
							<div className="space-y-4 pt-4">
								<h3 className="text-2xl font-bold text-slate-900">{feature.tagline}</h3>
								<p className="text-slate-600 leading-relaxed">{feature.description}</p>
								<ul className="space-y-3 pt-2">
									{feature.benefits.map((benefit, i) => (
										<li key={i} className="flex items-center gap-3">
											<CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
											<span className="text-slate-700">{benefit}</span>
										</li>
									))}
								</ul>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</motion.section>
	);
};

const BreatherSection = () => (
	<section className="py-28 lg:py-40 bg-gradient-to-br from-red-500 to-pink-600 text-white">
		<div className="max-w-4xl mx-auto px-6">
			<motion.blockquote initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={transition} className="text-center text-3xl lg:text-4xl font-semibold leading-snug">
				"Langkah kecil setiap hari adalah investasi terbesar untuk masa depan jantung Anda."
			</motion.blockquote>
		</div>
	</section>
);

const TechBehindSection = () => (
	<motion.section id="teknologi" className="relative py-24 lg:py-32 bg-slate-900 text-white overflow-hidden" viewport={{ once: true, amount: 0.4 }} transition={{ duration: 1, ease: professionalEase }}>
		<div className="relative max-w-5xl mx-auto px-6 z-10">
			<SectionHeader title="Didukung oleh Sains Teruji & AI Terkini" subtitle="Kami menggabungkan validasi klinis dengan kecerdasan buatan terdepan untuk hasil yang akurat dan personal." />
			<motion.div initial="initial" whileInView="whileInView" variants={staggerContainer} className="grid md:grid-cols-2 gap-8">
				<motion.div variants={fadeInUp}>
					<div className="bg-slate-800/50 p-8 rounded-2xl h-full border border-slate-700 hover:bg-slate-800 transition-colors">
						<div className="w-12 h-12 flex items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 mb-4">
							<Activity />
						</div>
						<h3 className="text-xl font-bold text-white mb-2">Validasi Klinis dengan SCORE2</h3>
						<p className="text-slate-400">Menggunakan metode kalkulasi SCORE2 dari *European Society of Cardiology* untuk akurasi penilaian risiko sesuai standar medis global.</p>
					</div>
				</motion.div>
				<motion.div variants={fadeInUp}>
					<div className="bg-slate-800/50 p-8 rounded-2xl h-full border border-slate-700 hover:bg-slate-800 transition-colors">
						<div className="w-12 h-12 flex items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 mb-4">
							<Brain />
						</div>
						<h3 className="text-xl font-bold text-white mb-2">Wawasan Lebih Dalam dengan Google Gemini</h3>
						<p className="text-slate-400">Terintegrasi dengan Gemini untuk menerjemahkan data kesehatan kompleks menjadi penjelasan yang mudah dipahami dan rekomendasi yang lebih cerdas.</p>
					</div>
				</motion.div>
			</motion.div>
		</div>
	</motion.section>
);

const FinalCTASection = () => (
	<section className="relative py-24 lg:py-32 bg-red-600/85 text-white overflow-hidden">
		<div className="relative max-w-4xl mx-auto px-6 text-center z-10">
			<motion.div initial="initial" whileInView="whileInView" variants={staggerContainer} className="space-y-8">
				<motion.div variants={fadeInUp} className="flex justify-center">
					<motion.div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
						<Heart className="w-10 h-10 text-white" />
					</motion.div>
				</motion.div>
				<motion.h2 variants={fadeInUp} className="text-4xl lg:text-6xl font-bold leading-tight tracking-tighter">
					Masa Depan Kesehatan Anda Ada di Tangan Anda.
				</motion.h2>
				<motion.p variants={fadeInUp} className="text-xl lg:text-2xl text-red-100 max-w-3xl mx-auto leading-relaxed">
					Jangan menunggu hingga terlambat. Ambil langkah pertama untuk melindungi aset paling berharga Anda hari ini.
				</motion.p>
				<motion.div variants={fadeInUp}>
					<ShimmeringCTAButton href="/dashboard/analysis">
						Mulai Analisis Gratis <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
					</ShimmeringCTAButton>
				</motion.div>
			</motion.div>
		</div>
	</section>
);

const Footer = () => (
	<footer className="bg-slate-900 text-slate-300 py-16">
		<div className="max-w-7xl mx-auto px-6">
			<div className="grid md:grid-cols-5 gap-8 mb-12">
				<div className="md:col-span-2 space-y-4">
					<div className="flex items-center gap-3">
						<img src={logo} alt="Selaras Logo" className="w-10 h-10" />
						<div>
							<h3 className="text-xl font-bold text-white">Selaras</h3>
							<p className="text-sm text-slate-400">Deteksi Cepat, Cegah Sebelum Terlambat.</p>
						</div>
					</div>
					<p className="text-slate-400 leading-relaxed max-w-sm">Memberdayakan individu untuk mengambil alih kesehatan jantung mereka melalui deteksi dini dan wawasan berbasis data.</p>
				</div>
				{[
					{ title: 'Produk', links: ['Fitur', 'Teknologi', 'Testimoni'] },
					{ title: 'Dukungan', links: ['Pusat Bantuan', 'Kontak', 'Kebijakan Privasi'] },
					{ title: 'Perusahaan', links: ['Tentang Kami', 'Blog', 'Karier'] },
				].map((column) => (
					<div key={column.title}>
						<h4 className="font-semibold text-white mb-4">{column.title}</h4>
						<ul className="space-y-3 text-slate-400">
							{column.links.map((link) => (
								<li key={link}>
									<a href="#" className="hover:text-red-400 transition-colors">
										{link}
									</a>
								</li>
							))}
						</ul>
					</div>
				))}
			</div>
			<div className="border-t border-slate-800 pt-8 text-center md:text-left">
				<p className="text-slate-500 text-sm">© {new Date().getFullYear()} Selaras. Dibuat dengan ❤️ di Indonesia untuk kesehatan yang lebih baik.</p>
			</div>
		</div>
	</footer>
);

const ScrollProgressIndicator = () => {
	const { scrollYProgress } = useScroll();
	return <motion.div className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-500 to-red-500 z-50" style={{ scaleX: scrollYProgress, transformOrigin: '0%' }} />;
};

// --- MAIN HOMEPAGE COMPONENT ---
export default function Homepage() {
	return (
		<div className="min-h-screen bg-white font-sans antialiased">
			<ScrollProgressIndicator />
			<MainNavbar />
			<main>
				<HeroSection />
				<SocialProofSection />
				<FeatureScrollSection />
				<BreatherSection />
				<TechBehindSection />
				<FinalCTASection />
			</main>
			<Footer />
		</div>
	);
}
