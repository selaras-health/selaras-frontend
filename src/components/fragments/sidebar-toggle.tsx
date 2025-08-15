import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';

export function SidebarToggle() {
	const { toggleSidebar } = useSidebar();

	return (
		<motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-slate-200/60 p-4">
			<Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
				<Menu className="h-5 w-5 text-slate-600" />
				<span className="sr-only">Toggle Sidebar</span>
			</Button>
		</motion.div>
	);
}
