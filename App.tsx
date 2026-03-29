
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { User } from './types';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import RequestSessionPage from './pages/RequestSessionPage';
import OnboardingPage from './pages/OnboardingPage';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('skillswap_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (loggedUser: User) => {
    setUser(loggedUser);
    localStorage.setItem('skillswap_user', JSON.stringify(loggedUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('skillswap_user');
  };

  if (isLoading) return <div className="flex items-center justify-center h-screen bg-surface">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>;

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" /> : <LoginPage onLogin={handleLogin} />} 
        />
        <Route 
          path="/onboarding" 
          element={<OnboardingPage />} 
        />
        <Route 
          path="/" 
          element={
            user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />
          } 
        />
        <Route 
          path="/profile/:id" 
          element={user ? <ProfilePage currentUser={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/request-session/:mentorId" 
          element={user ? <RequestSessionPage user={user} /> : <Navigate to="/login" />} 
        />
      </Routes>
      
      {user && <AIChatWidget />}
    </Router>
  );
};

const AIChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);

  const askGemini = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = query;
    setQuery('');
    setHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const { geminiService } = await import('./services/geminiService');
    const res = await geminiService.askAI(userMsg);
    
    setHistory(prev => [...prev, { role: 'ai', text: res || 'No response.' }]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] lg:hidden">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full bg-primary text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all"
        >
          <span className="material-symbols-outlined text-3xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
        </button>
      ) : (
        <div className="w-[calc(100vw-3rem)] md:w-96 h-[500px] bg-surface rounded-2xl shadow-2xl border border-outline-variant/20 flex flex-col overflow-hidden">
          <div className="p-4 bg-primary text-white flex justify-between items-center shadow-sm">
            <h3 className="font-bold flex items-center gap-2 font-headline">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              SkillSwap AI
            </h3>
            <button onClick={() => setIsOpen(false)} className="material-symbols-outlined hover:bg-white/20 p-1 rounded-full transition-colors">close</button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-surface-container-lowest">
            {history.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 space-y-3">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                   <span className="material-symbols-outlined text-[24px]">school</span>
                </div>
                <p className="text-sm font-medium text-on-surface-variant">Your personal academic assistant. Ask me anything!</p>
              </div>
            )}
            {history.map((h, i) => (
              <div key={i} className={`flex ${h.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13px] font-medium leading-relaxed shadow-sm ${h.role === 'user' ? 'bg-primary text-white rounded-br-sm' : 'bg-surface-container text-on-surface rounded-bl-sm border border-outline-variant/10'}`}>
                  {h.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-surface-container text-on-surface rounded-2xl rounded-bl-sm px-4 py-3 text-xs italic opacity-60 flex gap-1 items-center">
                   <div className="w-1.5 h-1.5 bg-on-surface rounded-full animate-bounce"></div>
                   <div className="w-1.5 h-1.5 bg-on-surface rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                   <div className="w-1.5 h-1.5 bg-on-surface rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}
          </div>
          <form onSubmit={askGemini} className="p-4 bg-surface border-t border-outline-variant/20 flex gap-3">
            <input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 bg-surface-container-low border border-transparent rounded-full text-sm px-5 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all placeholder:text-outline/70"
            />
            <button type="submit" className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-md hover:scale-[1.05] active:scale-95 transition-transform disabled:opacity-50" disabled={!query.trim() || loading}>
              <span className="material-symbols-outlined text-[20px]">send</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default App;
