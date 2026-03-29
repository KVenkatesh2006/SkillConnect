
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User } from '../types';
import { supabase } from '../services/supabase';

const RequestSessionPage: React.FC<{ user: User }> = ({ user }) => {
  const { mentorId } = useParams(); // This is the UUID of the provider
  const navigate = useNavigate();
  const [provider, setProvider] = useState<User | null>(null);
  const [topic, setTopic] = useState('');
  const [goal, setGoal] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProvider = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', mentorId)
        .single();
      
      if (!error && data) setProvider({
        ...data,
        avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.roll_no}`
      });
    };
    fetchProvider();
  }, [mentorId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) return alert('Please select date and time');
    
    setLoading(true);
    const scheduled_at = new Date(`${date}T${time}`).toISOString();

    const { error } = await supabase
      .from('sessions')
      .insert({
        requester_id: user.id,
        provider_id: mentorId,
        topic,
        goal,
        status: 'REQUESTED',
        scheduled_at
      });

    if (error) {
      alert('Failed to request session: ' + error.message);
    } else {
      alert('Session requested successfully!');
      navigate('/');
    }
    setLoading(false);
  };

  if (!provider) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-outline-variant/10 px-6 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span className="text-sm font-medium">Back</span>
          </button>
          <span className="text-xl font-bold tracking-tighter text-indigo-700 font-headline">Skill-Share</span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-headline font-black tracking-tight mb-2">Request Session</h1>
        <p className="text-on-surface-variant text-lg mb-8">You're requesting a session with <strong>{provider.name}</strong> ({provider.branch}).</p>

        {/* Provider Card */}
        <div className="bg-surface-container-lowest rounded-lg p-6 border border-outline-variant/10 mb-8 flex items-center gap-4">
          <img src={provider.avatar} className="w-16 h-16 rounded-lg object-cover" alt={provider.name} />
          <div>
            <h3 className="font-headline font-bold text-lg">{provider.name}</h3>
            <p className="text-sm text-on-surface-variant">{provider.branch}{provider.year ? ` • Year ${provider.year}` : ''}</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-lg border border-outline-variant/10 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 space-y-8">
            <section className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-primary">menu_book</span>
                <h3 className="text-lg font-bold font-headline">Topic & Details</h3>
              </div>
              <input 
                className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant/30 focus:ring-2 focus:ring-primary/20 outline-none" 
                placeholder="e.g., Data Structures and Algorithms" 
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                required
              />
              <textarea 
                className="w-full p-4 rounded-lg bg-surface-container-low border border-outline-variant/30 focus:ring-2 focus:ring-primary/20 outline-none" 
                placeholder="What do you want to achieve in this session?" 
                rows={4}
                value={goal}
                onChange={e => setGoal(e.target.value)}
              ></textarea>
            </section>
            <hr className="border-outline-variant/10" />
            <section className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-primary">calendar_clock</span>
                <h3 className="text-lg font-bold font-headline">Schedule</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input type="date" className="h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant/30 focus:ring-2 focus:ring-primary/20 outline-none" value={date} onChange={e => setDate(e.target.value)} required />
                <input type="time" className="h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant/30 focus:ring-2 focus:ring-primary/20 outline-none" value={time} onChange={e => setTime(e.target.value)} required />
              </div>
            </section>
          </div>
          <div className="px-6 py-4 md:px-8 bg-surface-container-low border-t border-outline-variant/10 flex items-center justify-end gap-4">
            <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 rounded-full text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-br from-primary to-primary-container shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50">
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default RequestSessionPage;
