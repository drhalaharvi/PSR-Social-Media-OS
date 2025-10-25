import React, { useState, useMemo, useEffect } from 'react';
import { Sparkles, Loader2, CheckCircle, File, Clock, Send, XCircle } from 'lucide-react';
import { api, PlannedPost, PostStatus } from '../../services/api';

const PlannerPage: React.FC = () => {
    const [plan, setPlan] = useState<PlannedPost[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const [updatingPosts, setUpdatingPosts] = useState<Set<string>>(new Set());
    
    const [inputs, setInputs] = useState({
        cadence: '3 posts per week',
        pillars: 'Education, Clinic Culture, Service Promotion, Patient Testimonials',
        blackout_dates: 'None',
        events: 'Flu shot campaign starts October 1st'
    });
    
    const [currentDate, setCurrentDate] = useState(new Date());

    const statusConfig: { [key in PostStatus]: { icon: React.ElementType; borderColor: string; textColor: string; label: string } } = {
        draft: { icon: File, borderColor: 'border-blue-500', textColor: 'text-blue-500', label: 'Draft' },
        approved: { icon: CheckCircle, borderColor: 'border-green-500', textColor: 'text-green-500', label: 'Approved' },
        scheduled: { icon: Clock, borderColor: 'border-purple-500', textColor: 'text-purple-500', label: 'Scheduled' },
        published: { icon: Send, borderColor: 'border-gray-400', textColor: 'text-gray-500 dark:text-gray-400', label: 'Published' },
        failed: { icon: XCircle, borderColor: 'border-red-500', textColor: 'text-red-500', label: 'Failed' }
    };

    useEffect(() => {
        // Poll for plan updates every 5 seconds to reflect worker changes
        const intervalId = setInterval(async () => {
            if (plan.length > 0) {
                 const updatedPlan = await api.getPlan();
                 setPlan(updatedPlan);
            }
        }, 5000);
        return () => clearInterval(intervalId);
    }, [plan.length]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setInputs(prev => ({ ...prev, [name]: value }));
    };

    const handleGeneratePlan = async () => {
        setIsGenerating(true);
        setError('');
        try {
            const generatedPlan = await api.generatePlan(inputs);
            setPlan(generatedPlan);
        } catch (err) {
            setError('Failed to generate plan. Please check your API key and try again.');
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };
    
    const updatePostState = async (postId: string, updates: Partial<PlannedPost>) => {
        const originalPlan = [...plan];
        const postToUpdate = plan.find(p => p.id === postId);
        if (!postToUpdate) return;
        
        // Optimistic UI update
        const updatedPost = { ...postToUpdate, ...updates };
        setPlan(prevPlan => prevPlan.map(p => p.id === postId ? updatedPost : p));

        setUpdatingPosts(prev => new Set(prev).add(postId));
        try {
            await api.updatePost(updatedPost);
        } catch (error) {
            console.error("Failed to update post:", error);
            alert(`Error: Could not update post "${postToUpdate.idea}". Please try again.`);
            // Revert on failure
            setPlan(originalPlan);
        } finally {
            setUpdatingPosts(prev => {
                const newSet = new Set(prev);
                newSet.delete(postId);
                return newSet;
            });
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, date: string) => {
        e.preventDefault();
        const postId = e.dataTransfer.getData("postId");
        updatePostState(postId, { date });
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, post: PlannedPost) => {
        e.dataTransfer.setData("postId", post.id);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
    const handleApprove = (postId: string) => updatePostState(postId, { status: 'approved' });

    // --- Calendar Rendering Logic ---
    const daysInMonth = useMemo(() => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const days = [];
        while (date.getMonth() === currentDate.getMonth()) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    }, [currentDate]);

    const startDayOfMonth = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(), [currentDate]);


    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Content Planner</h1>
            </div>

            {plan.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Generate Your 30-Day Content Plan</h2>
                    <p className="text-sm text-gray-500 mt-1">Provide some strategic direction, and let AI build your calendar.</p>
                    <div className="mt-4 space-y-4">
                        <textarea name="pillars" rows={3} value={inputs.pillars} onChange={handleInputChange} className="mt-1 block w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
                        <textarea name="events" rows={3} value={inputs.events} onChange={handleInputChange} className="mt-1 block w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
                    </div>
                    <button onClick={handleGeneratePlan} disabled={isGenerating} className="mt-6 flex items-center justify-center bg-brand-primary text-white font-bold py-2.5 px-4 rounded-lg hover:bg-brand-secondary transition-colors disabled:opacity-50">
                        {isGenerating ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
                        {isGenerating ? 'Generating...' : 'Generate Plan'}
                    </button>
                    {error && <p className="mt-4 text-red-500">{error}</p>}
                </div>
            ) : (
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center">
                         <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                         <button onClick={() => setPlan([])} className="text-sm font-semibold text-brand-secondary hover:underline">Generate New Plan</button>
                    </div>
                    <div className="mt-6 grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800">{day}</div>
                        ))}
                        {Array.from({ length: startDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="bg-gray-50 dark:bg-gray-800/50"></div>)}
                        {daysInMonth.map(day => {
                            const dateStr = day.toISOString().split('T')[0];
                            const postsForDay = plan.filter(p => p.date === dateStr);
                            return (
                                <div key={dateStr} className="p-2 min-h-[120px] bg-white dark:bg-gray-800" onDrop={(e) => handleDrop(e, dateStr)} onDragOver={handleDragOver}>
                                    <span className="text-sm font-semibold">{day.getDate()}</span>
                                    <div className="space-y-2 mt-1">
                                        {postsForDay.map(post => {
                                            const { icon: Icon, borderColor, textColor, label } = statusConfig[post.status];
                                            return (
                                                <div
                                                    key={post.id}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, post)}
                                                    className={`relative p-2 rounded-r-md text-xs cursor-grab bg-gray-50 dark:bg-gray-900/40 border-l-4 ${borderColor}`}
                                                >
                                                    <div className={`flex items-center font-bold ${textColor}`}>
                                                        <Icon size={14} className="mr-1.5 flex-shrink-0" />
                                                        <span>{label}</span>
                                                    </div>

                                                    <div className="mt-1 pl-1">
                                                        <p className="font-bold text-gray-800 dark:text-gray-200">{post.pillar}</p>
                                                        <p className="mt-0.5 text-gray-600 dark:text-gray-300 line-clamp-2">{post.idea}</p>
                                                    </div>

                                                    {post.status === 'draft' &&
                                                        <button onClick={() => handleApprove(post.id)} className="mt-2 text-green-600 dark:text-green-400 hover:underline font-bold flex items-center text-xs">
                                                            <CheckCircle size={14} className="mr-1" /> Approve
                                                        </button>
                                                    }

                                                    {updatingPosts.has(post.id) && (
                                                        <div className="absolute inset-0 bg-white/70 dark:bg-gray-800/70 flex items-center justify-center rounded-md">
                                                            <Loader2 className="w-5 h-5 animate-spin text-brand-primary" />
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                 </div>
            )}
        </div>
    );
};

export default PlannerPage;
