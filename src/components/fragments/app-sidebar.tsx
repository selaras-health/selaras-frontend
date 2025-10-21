import { Link, useLocation, BrowserRouter, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, HeartPulse, Sparkles, Settings, LogOut, Home, HistoryIcon, Brain } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sidebar as CustomSidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { ShimmeringCTAButton } from './ShimmeringCTAButton';

// --- Mock Components for Demonstration ---
// These are placeholders for your actual components.
const MockPlaceholder = ({ name }: { name: string }) => (
	<div className="p-8">
		<h1 className="text-4xl font-bold text-slate-800 capitalize">{name}</h1>
		<p className="text-slate-600 mt-2">This is a placeholder for the {name} page content.</p>
		<div className="mt-6 p-8 bg-white rounded-2xl shadow-sm border border-slate-200">Page content goes here...</div>
	</div>
);

// --- Main App Component (for demonstration) ---
// This component simulates a full application layout and routing.
export default function App() {
	// Mock user data and logout function
	const user = {
		first_name: 'Budi',
		last_name: 'Santoso',
		email: 'budi.santoso@example.com',
	};
	const handleLogout = () => {
		alert('Logout clicked!');
	};

	return (
		<BrowserRouter>
			<div className="flex h-screen bg-slate-100 font-sans">
				<AppSidebar user={user} handleLogout={handleLogout} />
				<main className="flex-1 flex flex-col overflow-y-auto">
					{/* Mobile Header (only shows hamburger menu) */}
					<div className="lg:hidden p-4 flex items-center justify-between bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-30">
						<div className="flex items-center gap-2">
							<img className="w-8 h-8 text-rose-500" src="" />
							<h1 className="text-xl font-bold text-slate-800">Selaras</h1>
						</div>
						{/* The hamburger button is managed by the custom sidebar component logic */}
					</div>

					{/* Page Content based on routing */}
					<Routes>
						<Route path="/dashboard" element={<MockPlaceholder name="Dashboard" />} />
						<Route path="/dashboard/analysis" element={<MockPlaceholder name="Lakukan Analisis" />} />
						<Route path="/dashboard/history" element={<MockPlaceholder name="Riwayat" />} />
						<Route path="/dashboard/ai-chat" element={<MockPlaceholder name="AI Chat" />} />
						<Route path="/dashboard/program" element={<MockPlaceholder name="Langkah Sehat" />} />
						<Route path="/dashboard/profile" element={<MockPlaceholder name="Profil Pengguna" />} />
						<Route path="/" element={<MockPlaceholder name="Halaman Utama" />} />
					</Routes>
				</main>
			</div>
		</BrowserRouter>
	);
}

// --- Original Navigation Data ---
const mainNavItems = [
	{ title: 'Kardia Sentra', url: '/dashboard', icon: LayoutDashboard },
	{ title: 'Lakukan Analisis', url: '/dashboard/analysis', icon: Sparkles },
	{ title: 'Langkah Sehat', url: '/dashboard/program', icon: HeartPulse },
	{ title: 'Analis Cerdas', url: '/dashboard/ai-chat', icon: Brain },
	{ title: 'Jurnal Progres', url: '/dashboard/history', icon: HistoryIcon },
];

const bottomNavItems = [
	{ title: 'Halaman Utama', url: '/', icon: Home },
	{ title: 'Profil Pengguna', url: '/dashboard/profile', icon: Settings },
];

// --- AppSidebar Component (Rebuilt with original functionality and new UI/UX) ---
export function AppSidebar({ user, handleLogout }: any) {
	const location = useLocation();
	let userPath = location.pathname;

	// This logic is preserved from your original code
	if (location.pathname.startsWith('/dashboard/program/')) {
		userPath = '/dashboard/program';
	}

	return (
		<CustomSidebar className="border-r border-slate-200/60" collapsible="offcanvas">
			<SidebarHeader className="p-6">
				<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-3">
					<div className="flex h-13 w-11 items-center justify-center rounded-lg bg-white text-white shadow-lg">
						<img className="h-10 w-10 text-rose-500" src="/logo.png" />
					</div>
					<div className="group-data-[collapsible=icon]:hidden">
						<h1 className="text-xl font-bold text-rose-500">Selaras</h1>
						<p className="text-xs text-slate-500">Deteksi Cepat, Cegah Sebelum Terlambat</p>
					</div>
				</motion.div>
			</SidebarHeader>

			<SidebarContent className="px-4">
				<div className="px-0 mb-4 shadow-xl rounded-xl">
					<Link to="/dashboard/analysis">
						<ShimmeringCTAButton shape="rectangle" className="w-full h-11 text-base group-data-[collapsible=icon]:hidden ">
							<Sparkles className="w-5 h-5 mr-2" />
							Lakukan Analisis
						</ShimmeringCTAButton>
					</Link>
				</div>

				<SidebarGroup>
					<SidebarGroupLabel className="text-slate-600 font-medium mb-2 group-data-[collapsible=icon]:hidden">Navigasi Utama</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{mainNavItems.map((item, index) => (
								<SidebarMenuItem key={item.title}>
									<motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
										<SidebarMenuButton
											asChild
											isActive={userPath === item.url}
											tooltip={item.title}
											className="group relative overflow-hidden data-[active=true]:border rounded-xl transition-all duration-200 hover:bg-rose-50 data-[active=true]:bg-gradient-to-br data-[active=true]:from-red-100 data-[active=true]:via-pink-100 data-[active=true]:to-red-200 data-[active=true]:border-red-300 data-[active=true]:text-red-800"
										>
											<Link to={item.url} className="flex items-center gap-3 w-full">
												<item.icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${userPath === item.url ? 'text-rose-500' : 'text-slate-500'}`} />
												<span className="font-semibold">{item.title}</span>
											</Link>
										</SidebarMenuButton>
									</motion.div>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<hr className="my-4 border-slate-200/80" />

				<SidebarGroup>
					<SidebarGroupLabel className="text-slate-600 font-medium mb-2 group-data-[collapsible=icon]:hidden">Akses Cepat</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{bottomNavItems.map((item, index) => (
								<SidebarMenuItem key={item.title}>
									<motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: (index + mainNavItems.length) * 0.1 }}>
										<SidebarMenuButton
											asChild
											isActive={userPath === item.url}
											tooltip={item.title}
											className="group rounded-xl transition-all duration-200 hover:bg-slate-100 text-slate-600 hover:text-slate-800 data-[active=true]:bg-rose-100 data-[active=true]:text-rose-600"
										>
											<Link to={item.url} className="flex items-center gap-3 w-full">
												<item.icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${userPath === item.url ? 'text-rose-500' : 'text-slate-500'}`} />
												<span>{item.title}</span>
											</Link>
										</SidebarMenuButton>
									</motion.div>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter className="p-4">
				<hr className="my-4 border-slate-200/80 group-data-[collapsible=icon]:hidden" />
				<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.8 }}>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-200/50 transition-colors cursor-pointer group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2">
								<Avatar className="w-12 h-12 border-2 border-white shadow-2xl">
									<AvatarImage src="/placeholder.svg?height=80&width=80" alt="Profile" />
									<AvatarFallback className="bg-gradient-to-br from-red-300 via-pink-400 to-red-500  text-white font-bold">{user.first_name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 group-data-[collapsible=icon]:hidden">
									<span className="truncate font-bold text-slate-800">
										{user.first_name} {user.last_name}
									</span>
									<span className="truncate text-xs text-slate-500">{user.email}</span>
								</div>
							</div>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg" side="right" align="end" sideOffset={12}>
							<DropdownMenuLabel className="font-bold">Akun Saya</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuItem asChild className="cursor-pointer font-medium">
									<Link to="/dashboard/profile" className="flex items-center gap-x-2">
										<Settings className="w-4 h-4" />
										<span>Profil & Pengaturan</span>
									</Link>
								</DropdownMenuItem>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuItem asChild className="cursor-pointer text-red-500 focus:bg-red-50 focus:text-red-600">
								<button onClick={handleLogout} className="w-full text-left flex items-center gap-x-2 font-medium">
									<LogOut className="w-4 h-4 text-red-500" />
									<span>Keluar</span>
								</button>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</motion.div>
			</SidebarFooter>
		</CustomSidebar>
	);
}
