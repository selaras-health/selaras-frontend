import { motion } from 'framer-motion';
import { Heart, Shield, Zap, Users, BarChart3, MessageSquare, History, ChevronDown, ChevronRight, ArrowRight, Brain } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MainNavbar from '@/components/fragments/main-navbar';
import logo from '@/assets/logo.png';

const fadeInUp = {
	initial: { opacity: 0, y: 60 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.6 },
};

const staggerContainer = {
	animate: {
		transition: {
			staggerChildren: 0.1,
		},
	},
};

const scaleIn = {
	initial: { opacity: 0, scale: 0.8 },
	animate: { opacity: 1, scale: 1 },
	transition: { duration: 0.5 },
};

const Homepage = () => {
	// const [openFaq, setOpenFaq] = useState<number | null>(null)

	const scrollToSection = (id: string) => {
		document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-white via-sky-50/30 to-red-50/20">
			{/* Navbar */}
			<MainNavbar />

			{/* Hero Section */}
			<section id="get-started" className="relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-white via-sky-50/50 to-red-50/30" />
				<div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-32">
					<div className="grid lg:grid-cols-2 gap-12 items-center">
						<motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="space-y-8">
							<div className="space-y-6">
								<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
									<Badge className="bg-red-100 text-red-700 hover:bg-red-200 mb-4">❤️ AI-Powered Heart Health</Badge>
								</motion.div>

								<motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-4xl lg:text-6xl font-bold text-slate-900 leading-tight">
									Selaras – Deteksi Cepat, <span className="bg-gradient-to-r from-red-500 to-pink-600 bg-clip-text text-transparent">Cegah Sebelum Terlambat</span>
								</motion.h1>

								<motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-xl text-slate-600 leading-relaxed">
									Dengan Selaras, kamu bisa pantau kesehatan jantung tanpa ribet lewat analisis AI pintar dan panduan langkah demi langkah yang mudah diikuti.
								</motion.p>
							</div>

							<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-col sm:flex-row gap-4">
								<a href="/dashboard/analysis">
									<Button size="lg" className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
										<Heart className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
										Mulai Analisis Sekarang
										<ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
									</Button>
								</a>

								<Button variant="outline" size="lg" onClick={() => scrollToSection('cara')} className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-4 rounded-xl group cursor-pointer">
									Cara Kerjanya
									<ChevronDown className="h-4 w-4 ml-2 group-hover:translate-y-1 transition-transform" />
								</Button>
							</motion.div>
						</motion.div>

						<motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, duration: 0.8 }} className="relative">
							<div className="relative w-full h-96 lg:h-[500px] flex items-center justify-center">
								<motion.div
									animate={{
										scale: [1, 1.05, 1],
										rotate: [0, 2, -2, 0],
									}}
									transition={{
										duration: 6,
										repeat: Number.POSITIVE_INFINITY,
										ease: 'easeInOut',
									}}
									className="w-64 h-64 lg:w-80 lg:h-80 bg-gradient-to-br from-red-400 via-pink-500 to-red-600 rounded-full flex items-center justify-center shadow-2xl"
								>
									<Heart className="h-32 w-32 lg:h-40 lg:w-40 text-white" fill="currentColor" />
								</motion.div>

								{/* Floating elements */}
								<motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }} className="absolute top-10 right-10 bg-white rounded-xl p-3 shadow-lg">
									<BarChart3 className="h-6 w-6 text-sky-500" />
								</motion.div>

								<motion.div animate={{ y: [10, -10, 10] }} transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }} className="absolute bottom-10 left-10 bg-white rounded-xl p-3 shadow-lg">
									<Shield className="h-6 w-6 text-emerald-500" />
								</motion.div>
							</div>
						</motion.div>
					</div>
				</div>
			</section>

			{/* Why Choose Selaras */}
			<section id="alasan" className="py-20 bg-white">
				<div className="max-w-7xl mx-auto px-6">
					<motion.div variants={fadeInUp} initial="initial" whileInView="animate" viewport={{ once: true }} className="text-center mb-16">
						<h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Kenapa Harus Selaras?</h2>
						<p className="text-xl text-slate-600 max-w-2xl mx-auto">Teknologi AI canggih bertemu perawatan yang penuh kepedulian demi melindungi hal yang paling penting dalam hidupmu.</p>
					</motion.div>

					<motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
						{[
							{
								icon: Zap,
								title: 'Analisis AI Cepat & Akurat',
								description: 'Selaras memanfaatkan machine learning untuk memprediksi risiko jantung dari jawabanmu hanya dalam hitungan detik.',
								color: 'from-yellow-400 to-orange-500',
							},
							{
								icon: Shield,
								title: 'Privasi & Keamanan Terjamin',
								description: 'Data kamu terenkripsi dan disimpan dengan aman. Hanya kamu yang bisa mengakses hasil analisis kesehatan jantungmu.',
								color: 'from-emerald-400 to-teal-500',
							},
							{
								icon: Heart,
								title: 'Gratis & Mudah Digunakan',
								description: 'Tanpa alat medis, cukup jawab beberapa pertanyaan teknis atau non-teknis.',
								color: 'from-red-400 to-pink-500',
							},
							{
								icon: Users,
								title: 'Dikembangkan bersama Profesional Medis',
								description: 'Selaras dibuat bersama dokter spesialis jantung dan insinyur AI untuk menjamin keandalan hasilnya.',
								color: 'from-blue-400 to-indigo-500',
							},
						].map((feature, index) => (
							<motion.div key={index} variants={fadeInUp}>
								<Card className="h-full hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-slate-50/50">
									<CardContent className="p-6 text-center space-y-4">
										<div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-lg`}>
											<feature.icon className="h-8 w-8 text-white" />
										</div>
										<h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
										<p className="text-slate-600 leading-relaxed">{feature.description}</p>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</motion.div>
				</div>
			</section>

			{/* Core Features */}
			<section id="fitur" className="py-20 bg-gradient-to-br from-slate-50 to-sky-50/30">
				<div className="max-w-7xl mx-auto px-6">
					<motion.div variants={fadeInUp} initial="initial" whileInView="animate" viewport={{ once: true }} className="text-center mb-16">
						<h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Fitur Utama</h2>
						<p className="text-xl text-slate-600 max-w-2xl mx-auto">Semua yang kamu butuhkan untuk memantau dan menjaga kesehatan jantung, ada dalam satu tempat.</p>
					</motion.div>

					<motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }} className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
						{[
							{
								icon: History,
								title: 'Riwayat Analisis Lengkap',
								description: 'Pantau hasil evaluasi kesehatan jantungmu dari waktu ke waktu.',
							},
							{
								icon: BarChart3,
								title: 'Grafik Risiko Interaktif (30 Hari)',
								description: 'Lihat tren risiko jantung dalam bentuk visual yang mudah dipahami.',
							},
							{
								icon: Brain,
								title: 'Asisten Chat AI Seputar Jantung',
								description: 'Dapatkan jawaban instan untuk pertanyaan seputar kesehatan jantungmu.',
							},
							// {
							//   icon: Stethoscope,
							//   title: "Live Consultation with Doctors",
							//   description: "Connect with certified cardiologists when needed",
							// },
							{
								icon: Heart,
								title: 'Rekomendasi Pribadi.',
								description: 'Terima saran gaya hidup yang disesuaikan dengan profil kesehatanmu.',
							},
							// {
							//   icon: Bell,
							//   title: "Smart Reminders to Re-analyze",
							//   description: "Never miss important health check-ups",
							// },
						].map((feature, index) => (
							<motion.div key={index} variants={scaleIn}>
								<Card className="h-full hover:shadow-lg transition-all duration-300 group border-0 bg-white">
									<CardContent className="p-6 space-y-4">
										<div className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-100 to-pink-100 flex items-center justify-center group-hover:scale-110 transition-transform">
											<feature.icon className="h-6 w-6 text-red-600" />
										</div>
										<h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
										<p className="text-slate-600">{feature.description}</p>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</motion.div>
				</div>
			</section>

			{/* How Selaras Works */}
			<section id="cara" className="py-20 bg-white">
				<div className="max-w-7xl mx-auto px-6">
					<motion.div variants={fadeInUp} initial="initial" whileInView="animate" viewport={{ once: true }} className="text-center mb-16">
						<h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Cara Kerja Selaras</h2>
						<p className="text-xl text-slate-600 max-w-2xl mx-auto">Langkah sederhana untuk memantau kesehatan jantung dengan lebih baik.</p>
					</motion.div>

					<motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }} className="grid lg:grid-cols-3 gap-12">
						{[
							{
								step: '1',
								title: 'Jawab Pertanyaan Teknis atau Non-Teknis',
								description: 'Kamu dapat memilih tipe pertanyaan sesuai dengan informasi yang kamu miliki.',
								icon: MessageSquare,
								color: 'from-blue-500 to-indigo-600',
							},
							{
								step: '2',
								title: 'Analisis Instan oleh AI',
								description: 'Hasil wawasan risiko jantung langsung muncul berdasarkan model medis terkini.',
								icon: Zap,
								color: 'from-yellow-500 to-orange-600',
							},
							{
								step: '3',
								title: 'Pantau Perkembangan & Dapatkan Rekomendasi',
								description: 'Lanjutkan jika perlu, dan konsultasikan langsung dengan tenaga medis.',
								icon: BarChart3,
								color: 'from-emerald-500 to-teal-600',
							},
						].map((step, index) => (
							<motion.div key={index} variants={fadeInUp} className="text-center">
								<div className="relative mb-8">
									<div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg mb-4`}>
										<step.icon className="h-10 w-10 text-white" />
									</div>
									<div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-slate-200">
										<span className="text-sm font-bold text-slate-700">{step.step}</span>
									</div>
									{index < 2 && (
										<div className="hidden lg:block absolute top-10 left-full w-full">
											<ChevronRight className="h-6 w-6 text-slate-300 mx-auto" />
										</div>
									)}
								</div>
								<h3 className="text-xl font-semibold text-slate-900 mb-3">{step.title}</h3>
								<p className="text-slate-600 leading-relaxed">{step.description}</p>
							</motion.div>
						))}
					</motion.div>
				</div>
			</section>

			{/* Designed for Everyone */}
			<section id="untukmu" className="py-20 bg-gradient-to-br from-slate-50 to-sky-50/30">
				<div className="max-w-7xl mx-auto px-6">
					<motion.div variants={fadeInUp} initial="initial" whileInView="animate" viewport={{ once: true }} className="text-center mb-16">
						<h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Untuk Siapa Saja yang Peduli dengan Kesehatan Jantung</h2>
						<p className="text-xl text-slate-600 max-w-3xl mx-auto">Aktif, sibuk, atau waspada — Selaras menyatu dengan gaya hidupmu.</p>
					</motion.div>

					<motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
						{[
							{
								emoji: '👨‍💼',
								title: 'Profesional Sibuk',
								description: 'Cek harian yang cepat tanpa ganggu jam kerja.',
							},
							{
								emoji: '👵',
								title: 'Orang Tua',
								description: 'Simpel dan mudah digunakan, bikin tenang seluruh keluarga.',
							},
							{
								emoji: '💪',
								title: 'Pecinta Olahraga',
								description: 'Lihat dampak latihanmu terhadap kesehatan jantung.',
							},
							{
								emoji: '❤️',
								title: 'Orang dengan Risiko',
								description: 'Peringatan dini membantu kamu tetap selangkah lebih maju.',
							},
						].map((persona, index) => (
							<motion.div key={index} variants={fadeInUp}>
								<Card className="h-full hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
									<CardContent className="p-6 text-center space-y-4">
										<div className="text-4xl mb-4">{persona.emoji}</div>
										<h3 className="text-lg font-semibold text-slate-900">{persona.title}</h3>
										<p className="text-slate-600 leading-relaxed text-sm">{persona.description}</p>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</motion.div>
				</div>
			</section>

			{/* Best When Combined */}
			<section id="sinergi" className="py-20 bg-white">
				<div className="max-w-6xl mx-auto px-6">
					<motion.div variants={fadeInUp} initial="initial" whileInView="animate" viewport={{ once: true }} className="text-center mb-16">
						<h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Lebih Kuat Saat Dipadukan, Bukan Untuk Bersaing</h2>
						<p className="text-xl text-slate-600 max-w-3xl mx-auto">Selaras bukan pengganti check-up dokter, tapi pelengkap harian yang memberi konteks lebih dalam.</p>
					</motion.div>

					<motion.div variants={fadeInUp} initial="initial" whileInView="animate" viewport={{ once: true }} className="overflow-x-auto">
						<div className="min-w-full bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
							<table className="w-full">
								<thead>
									<tr className="bg-gradient-to-r from-slate-50 to-blue-50">
										<th className="px-6 py-4 text-lg font-semibold text-slate-800 text-center">x</th>
										<th className="px-6 py-4 text-left text-lg font-semibold text-slate-800">🩺 Cek Tahunan</th>
										<th className="px-6 py-4 text-left text-lg font-semibold text-slate-800">💡 Selaras (Pencegahan Harian)</th>
										<th className="px-6 py-4 text-left text-lg font-semibold text-slate-800">🤝 Gabungan Keduanya</th>
									</tr>
								</thead>
								<tbody>
									{[
										{
											label: 'Tujuan Utama',
											medical: 'Diagnostik lengkap & lab',
											Selaras: 'Screening cepat & pengingat kebiasaan',
											combo: 'Data harian + analisis dokter',
										},
										{
											label: 'Frekuensi',
											medical: '1–2×/tahun',
											Selaras: 'Harian / mingguan',
											combo: 'Insight berkelanjutan',
										},
										{
											label: 'Biaya',
											medical: 'Variatif, cenderung tinggi',
											Selaras: 'Gratis / hemat',
											combo: 'Maksimalkan value check-up',
										},
										{
											label: 'Akses Data',
											medical: 'Hasil PDF / kertas',
											Selaras: 'Riwayat real-time di app',
											combo: 'Diskusi dokter lebih kaya data',
										},
										{
											label: 'Tindakan Lanjutan',
											medical: 'Rekomendasi dokter',
											Selaras: 'Tips gaya hidup & alert risiko',
											combo: 'Keputusan berbasis data lengkap',
										},
									].map((row, index) => (
										<tr key={index} className={index % 2 === 0 ? 'bg-slate-50/30' : 'bg-white'}>
											<td className="px-6 py-4 font-medium text-slate-800 border-r border-slate-200">{row.label}</td>
											<td className="px-6 py-4 text-slate-600 border-r border-slate-200">{row.medical}</td>
											<td className="px-6 py-4 text-slate-600 border-r border-slate-200">{row.Selaras}</td>
											<td className="px-6 py-4 text-slate-600">{row.combo}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
							<div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
								<span className="text-xs text-blue-600">🛈</span>
							</div>
							<p>Selaras bukan alat diagnosis. Selalu konsultasikan hasilmu ke tenaga medis profesional.</p>
						</motion.div>
					</motion.div>
				</div>
			</section>

			{/* Created by Professionals */}
			{/* <section id="team" className="py-20 bg-gradient-to-br from-blue-50/30 to-emerald-50/30">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Created by Heart Health Professionals and AI Engineers
            </h2>
            <p className="text-xl text-slate-600 max-w-4xl mx-auto">
              Selaras is the result of collaborative work between cardiologists, data scientists, and UX designers — so
              you can trust every click.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              {
                name: "Dr. Irwan Santosa",
                role: "Cardiologist",
                description: "15+ yrs experience",
                avatar: "/placeholder.svg?height=80&width=80",
              },
              {
                name: "Nabila F.",
                role: "AI Engineer",
                description: "Health Modeling",
                avatar: "/placeholder.svg?height=80&width=80",
              },
              {
                name: "Bima R.",
                role: "Lead Product Designer",
                description: "UX/UI Specialist",
                avatar: "/placeholder.svg?height=80&width=80",
              },
              {
                name: "Dr. Lisa Ardi",
                role: "Clinical Research Advisor",
                description: "Research & Validation",
                avatar: "/placeholder.svg?height=80&width=80",
              },
            ].map((member, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden shadow-lg">
                      <img
                        src={member.avatar || "/placeholder.svg"}
                        alt={`${member.name}'s profile`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = "none"
                          target.nextElementSibling!.classList.remove("hidden")
                        }}
                      />
                      <div className="hidden w-full h-full bg-gradient-to-br from-blue-400 to-emerald-500 flex items-center justify-center text-white font-bold text-xl">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{member.name}</h3>
                      <p className="text-blue-600 font-medium text-sm">{member.role}</p>
                      <p className="text-slate-600 text-sm">{member.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section> */}

			{/* Emotional CTA */}
			<section className="py-20 bg-gradient-to-br from-red-500 via-pink-500 to-red-600 text-white relative overflow-hidden">
				<div className="absolute inset-0 bg-black/10" />
				<div className="relative max-w-4xl mx-auto px-6 text-center">
					<motion.div variants={fadeInUp} initial="initial" whileInView="animate" viewport={{ once: true }} className="space-y-8">
						<div className="space-y-6">
							<motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }} className="w-24 h-24 mx-auto bg-white/20 rounded-full flex items-center justify-center">
								<Heart className="h-12 w-12 text-white" fill="currentColor" />
							</motion.div>

							<h2 className="text-3xl lg:text-5xl font-bold leading-tight">Jantungmu Layak Diperhatikan.</h2>

							<p className="text-xl lg:text-2xl text-red-100 max-w-3xl mx-auto leading-relaxed">Kesehatan jantung itu penting. Jangan tunggu gejala muncul. Lindungi jantungmu sejak dini dengan Selaras.</p>
						</div>

						<a href="/dashboard/analysis">
							<Button size="lg" className="bg-white text-red-600 hover:bg-red-50 px-12 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 text-lg font-semibold group cursor-pointer">
								<Heart className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform" />
								Mulai Analisis Gratis Sekarang
								<ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
							</Button>
						</a>
					</motion.div>
				</div>
			</section>

			{/* FAQ */}
			{/* <section id="faq" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-slate-600">Everything you need to know about Selaras</p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="space-y-4"
          >
            {[
              {
                question: "Is Selaras free?",
                answer:
                  "Yes! Selaras offers a free tier that includes basic heart health analysis, limited AI chat, and access to your analysis history. Premium features like unlimited consultations and advanced reports are available with our paid plans.",
              },
              {
                question: "How accurate is the analysis?",
                answer:
                  "Selaras's AI model has been trained on thousands of medical cases and validated by cardiologists. While highly accurate for risk assessment, it's designed to complement, not replace, professional medical advice.",
              },
              {
                question: "Can I share the results with my doctor?",
                answer:
                  "Selaras generates detailed reports that you can easily share with your healthcare provider. Many doctors appreciate the comprehensive data to better understand your heart health trends.",
              },
              {
                question: "How often should I analyze my heart?",
                answer:
                  "We recommend monthly analysis for general monitoring, or more frequently if you have risk factors. Selaras will send smart reminders based on your health profile and previous results.",
              },
              {
                question: "What data does Selaras store?",
                answer:
                  "Selaras only stores the health information you provide and your analysis results. All data is encrypted and stored securely. You have full control over your data and can delete it anytime.",
              },
            ].map((faq, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300">
                  <CardContent className="p-0">
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <h3 className="text-lg font-semibold text-slate-900">{faq.question}</h3>
                      <motion.div animate={{ rotate: openFaq === index ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown className="h-5 w-5 text-slate-500" />
                      </motion.div>
                    </button>
                    {openFaq === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-6 pb-6"
                      >
                        <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section> */}

			{/* Footer */}
			<footer className="bg-slate-900 text-white py-16">
				<div className="max-w-7xl mx-auto px-6">
					<div className="grid md:grid-cols-4 gap-8 mb-12">
						<div className="space-y-4">
							<div className="flex items-center gap-3">
								{/* Ikon Hati diganti dengan tag img untuk logo */}
								<img src={logo} alt="Selaras Logo" className="w-10 h-10" />
								<div>
									<h3 className="text-xl font-bold">Selaras</h3>
									<p className="text-sm text-slate-400">Deteksi Cepat, Cegah Sebelum Terlambat</p>
								</div>
							</div>
							<p className="text-slate-400 leading-relaxed">Melindungi jantung dengan pemantauan cerdas dan deteksi dini.</p>
						</div>

						<div>
							<h4 className="font-semibold mb-4">Produk</h4>
							<ul className="space-y-2 text-slate-400">
								<li>
									<a href="#" className="hover:text-white transition-colors">
										Fitur
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-white transition-colors">
										Cara Kerja
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-white transition-colors">
										Harga
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-white transition-colors">
										API
									</a>
								</li>
							</ul>
						</div>

						<div>
							<h4 className="font-semibold mb-4">Dukungan</h4>
							<ul className="space-y-2 text-slate-400">
								<li>
									<a href="#" className="hover:text-white transition-colors">
										Pusat Bantuan
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-white transition-colors">
										Kontak
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-white transition-colors">
										Kebijakan Privasi
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-white transition-colors">
										Syarat & Ketentuan
									</a>
								</li>
							</ul>
						</div>

						<div>
							<h4 className="font-semibold mb-4">Perusahaan</h4>
							<ul className="space-y-2 text-slate-400">
								<li>
									<a href="#" className="hover:text-white transition-colors">
										Tentang Kami
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-white transition-colors">
										Blog
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-white transition-colors">
										Karier
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-white transition-colors">
										Media
									</a>
								</li>
							</ul>
						</div>
					</div>

					<div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
						<p className="text-slate-400 text-sm">© 2025 Selaras. All rights reserved.</p>
						<div className="flex items-center gap-4 mt-4 md:mt-0">
							<p className="text-slate-400 text-sm">Dibuat dengan ❤️ untuk kesehatan jantung yang lebih baik.</p>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
};

export default Homepage;
