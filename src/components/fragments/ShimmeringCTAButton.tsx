import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// --- Props Interface (tidak ada perubahan) ---
interface ShimmeringCTAButtonProps {
	children: ReactNode;
	onClick?: () => void;
	href?: string;
	className?: string;
	type?: 'button' | 'submit' | 'reset';
	isLoading?: boolean;
	disabled?: boolean;
	shape?: 'pill' | 'rectangle';
	loadingText?: string;
}

// --- Komponen Tombol Final dengan "Aurora Background" ---
export const ShimmeringCTAButton = ({ children, href, className = '', type = 'button', isLoading = false, disabled = false, shape = 'pill', loadingText = 'Memproses...', onClick, ...rest }: ShimmeringCTAButtonProps) => {
	const Wrapper = href ? 'a' : 'button';
	const isDisabled = isLoading || disabled;
	const shapeClasses = shape === 'pill' ? 'rounded-full' : 'rounded-xl';

	return (
		<motion.div whileHover={!isDisabled ? { scale: 1.03 } : {}} whileTap={!isDisabled ? { scale: 0.98 } : {}} className="relative">
			<Wrapper
				href={href}
				type={!href ? type : undefined}
				disabled={isDisabled}
				onClick={onClick}
				{...rest}
				className={`
          group relative inline-flex items-center justify-center px-6 py-3
          text-white font-semibold
          overflow-hidden transition-all duration-300
          shadow-lg
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500
          ${shapeClasses}
          ${className}
          ${isDisabled ? 'opacity-60 cursor-not-allowed saturate-50' : 'hover:shadow-xl'}
        `}
			>
				{/* Lapisan Latar Belakang Gradien Statis */}
				<div className={`absolute inset-0 w-full h-full bg-gradient-to-br from-red-400 via-pink-500 to-red-600 ${shapeClasses}`} />

				{/* [BARU] Lapisan "Aurora Shimmer" yang Berputar */}
				{!isDisabled && (
					<motion.div
						className={`absolute inset-0 w-full h-full transition-opacity duration-500 opacity-50 group-hover:opacity-0 ${shapeClasses}`}
						style={{
							background: `conic-gradient(from 0deg, rgba(255,255,255,0), rgba(255,255,255,0.4), rgba(255,255,255,0) 30%)`,
						}}
						animate={{ rotate: 360 }}
						transition={{
							duration: 4,
							repeat: Infinity,
							ease: 'linear',
						}}
					/>
				)}

				{/* Lapisan Gradien Hover (Cross-fade) */}
				<div className={`absolute inset-0 w-full h-full bg-gradient-to-br from-red-500 via-pink-600 to-red-700 opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100 ${shapeClasses}`} />

				{/* Efek Visual Hover */}
				{!isDisabled && (
					<>
						<div className="absolute inset-0 transition-opacity duration-500 opacity-0 group-hover:opacity-30 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.8),_transparent_80%)]" />
						<div className="absolute top-0 -left-full h-full w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent transform -skew-x-45 transition-all duration-700 ease-in-out group-hover:left-full" />
					</>
				)}

				{/* Konten Tombol */}
				<span className="relative z-10 flex items-center">
					{isLoading ? (
						<>
							<Loader2 className="h-6 w-6 mr-3 animate-spin" />
							<span>{loadingText}</span>
						</>
					) : (
						children
					)}
				</span>
			</Wrapper>
		</motion.div>
	);
};
