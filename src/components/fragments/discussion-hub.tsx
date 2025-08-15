import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MessageCircle, MoreHorizontal, Edit3, Trash2, Edit, MessageCircleHeart } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { Label } from '../ui/label';

interface Discussion {
	slug: string;
	title: string;
	last_message_snippet: string;
	last_updated_human: string;
}

interface DiscussionHubProps {
	programSlug: string;
	discussions: Discussion[];
	onEditTitle: (id: string, newTitle: string) => void;
	onDeleteThread: (id: string) => void;
	isReadOnly?: boolean; // Optional prop to control read-only state
}

export function DiscussionHub({ programSlug, discussions, isReadOnly = false, onEditTitle, onDeleteThread }: DiscussionHubProps) {
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editTitle, setEditTitle] = useState('');

	console.log(programSlug);

	discussions = discussions.slice().reverse();

	const handleEditSubmit = (id: string) => {
		if (editTitle.trim()) {
			onEditTitle(id, editTitle.trim());
			setEditingId(null);
			setEditTitle('');
		}
	};

	return (
		<Card className="shadow-lg rounded-2xl bg-white/80 backdrop-blur-sm border-slate-200/80">
			<CardHeader>
				<CardTitle className="font-semibold text-slate-900 flex items-center gap-2">
					<MessageCircleHeart className="w-5 h-5 text-rose-500" />
					Konsultasi Dengan AI Coach
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{discussions.length === 0 ? (
					// Empty State
					<div className="text-center py-8">
						<MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
						<p className="text-slate-600 mb-4">Belum ada konsultasi yang dibuat. Mulai konsultasi baru untuk bertanya atau berbagi pengalaman.</p>
						<Link to={`/dashboard/program/chat/new?program=${programSlug}&readOnly=${isReadOnly}`} className={isReadOnly ? 'pointer-events-none' : ''}>
							<Button className={`bg-gradient-to-br from-red-400 via-pink-500 to-red-600 hover:from-red-500 hover:via-pink-600 hover:to-red-700 text-white cursor-pointer` + (isReadOnly ? 'cursor-not-allowed' : 'cursor-pointer')} disabled={isReadOnly}>
								<Plus className="w-4 h-4 mr-2" />
								Mulai Konsultasi Baru
							</Button>
						</Link>
					</div>
				) : (
					// Populated State
					<div className="space-y-3 ">
						{discussions.map((discussion) => (
							<div key={discussion.slug} className="flex items-center justify-between p-4 rounded-lg border border-slate-100 hover:bg-slate-50 transition-all shadow-lg  hover:shadow-xl backdrop-blur-sm">
								<Link to={`/dashboard/program/chat/${discussion.slug}?readOnly=${isReadOnly}`} className="flex-1">
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-1">
												<h4 className="font-medium text-slate-900">{discussion.title}</h4>
											</div>
											<p className="text-sm text-slate-600 line-clamp-1">{discussion.last_message_snippet}</p>
											<p className="text-xs text-slate-400 mt-1">{discussion.last_updated_human}</p>
										</div>
									</div>
								</Link>
								{!isReadOnly && (
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<Dialog
												open={editingId === discussion.slug}
												onOpenChange={(isOpen) => {
													if (!isOpen) {
														setEditingId(null);
													}
												}}
											>
												<DialogTrigger asChild>
													<DropdownMenuItem
														onSelect={(e) => {
															e.preventDefault();
															setEditingId(discussion.slug);
															setEditTitle(discussion.title);
														}}
														className="cursor-pointer font-medium"
													>
														<Edit3 className="w-4 h-4 mr-2" />
														Edit Judul
													</DropdownMenuItem>
												</DialogTrigger>
												<DialogContent className="sm:max-w-md">
													<DialogHeader>
														<DialogTitle className="flex items-center gap-2">
															<Edit className="h-5 w-5 text-rose-500" />
															Edit Judul Konsultasi
														</DialogTitle>
													</DialogHeader>
													<div className="space-y-4 py-4">
														<div className="space-y-2">
															<Label htmlFor="edit-title-diskusi">Judul Konsultasi</Label>
															<Input
																id="edit-title-diskusi"
																value={editTitle}
																onChange={(e) => setEditTitle(e.target.value)}
																placeholder="Masukkan judul baru..."
																className="w-full"
																autoFocus
																onKeyDown={(e) => {
																	if (e.key === 'Enter' && editTitle.trim()) {
																		handleEditSubmit(discussion.slug);
																	} else if (e.key === 'Escape') {
																		setEditingId(null);
																	}
																}}
															/>
														</div>
													</div>
													<DialogFooter className="flex gap-2">
														<Button variant="outline" onClick={() => setEditingId(null)} className='cursor-pointer'>
															Batal
														</Button>
														<Button onClick={() => handleEditSubmit(discussion.slug)} disabled={!editTitle.trim()} className="bg-rose-500 hover:bg-rose-600 cursor-pointer">
															Simpan
														</Button>
													</DialogFooter>
												</DialogContent>
											</Dialog>
											<DropdownMenuItem className="text-red-600 cursor-pointer font-medium" onSelect={() => onDeleteThread(discussion.slug)}>
												<Trash2 className="w-4 h-4 mr-2" />
												Hapus Konsultasi
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								)}
							</div>
						))}
						<Link to={`/dashboard/program/chat/new?program=${programSlug}&readOnly=${isReadOnly}`} className={isReadOnly ? 'pointer-events-none' : ''}>
							<Button variant="outline" className={`bg-gradient-to-br from-red-400 via-pink-500 to-red-600 hover:from-red-500 hover:via-pink-600 hover:to-red-700 w-full cursor-pointer text-white` + (isReadOnly ? 'cursor-not-allowed' : 'cursor-pointer')} disabled={isReadOnly}>
								<Plus className="w-4 h-4 mr-2 text-white" />
								<span className='text-white'>Mulai Konsultasi Baru</span>
							</Button>
						</Link>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
