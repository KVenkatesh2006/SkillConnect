import React, { useState, useEffect, useRef } from 'react';
import { User, Session, Skill, Certificate, SkillLevel } from '../types';
import { dbService } from '../services/mockDatabase';
import { getSkillSuggestions } from '../services/skillSuggestions';
import { Link } from 'react-router-dom';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

type Tab = 'overview' | 'skills' | 'certificates';

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [peers, setPeers] = useState<User[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Add Skill state
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [skillQuery, setSkillQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{ name: string; icon: string; category: string }[]>([]);
  const [selectedSkillName, setSelectedSkillName] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel>('BEGINNER');
  const [isAdding, setIsAdding] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Certificate upload state
  const [showAddCert, setShowAddCert] = useState(false);
  const [certName, setCertName] = useState('');
  const [certIssuer, setCertIssuer] = useState('');
  const [certYear, setCertYear] = useState(new Date().getFullYear());
  const [certFile, setCertFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchData = async () => {
    const [p, s, sk, c] = await Promise.all([
      dbService.getPeers(user.id),
      dbService.getSessions(user.id),
      dbService.getSkills(user.id),
      dbService.getCertificates(user.id)
    ]);
    setPeers(p);
    setSessions(s);
    setSkills(sk);
    setCertificates(c);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const subscription = dbService.subscribeToSessions(() => fetchData());
    return () => { subscription.unsubscribe(); };
  }, [user.id]);

  // Regex-based skill suggestions
  useEffect(() => {
    const results = getSkillSuggestions(skillQuery);
    setSuggestions(results);
  }, [skillQuery]);

  const handleAddSkill = async () => {
    if (!selectedSkillName) {
      setFormError('Please search and select a skill.');
      return;
    }
    setIsAdding(true);
    setFormError(null);
    const success = await dbService.addSkill(user.id, selectedSkillName, selectedLevel);
    if (success) {
      await fetchData();
      setShowAddSkill(false);
      setSkillQuery('');
      setSelectedSkillName('');
      setSelectedLevel('BEGINNER');
    } else {
      setFormError('Failed to add skill.');
    }
    setIsAdding(false);
  };

  const handleAddCertificate = async () => {
    if (!certName || !certIssuer) {
      setFormError('Please fill in all certificate details.');
      return;
    }
    setIsUploading(true);
    setFormError(null);

    let fileUrl = 'https://example.com/placeholder-cert.pdf';
    if (certFile) {
      const uploaded = await dbService.uploadCertificateFile(user.id, certFile);
      if (uploaded) fileUrl = uploaded;
    }

    const success = await dbService.addCertificate(user.id, {
      name: certName,
      issuer: certIssuer,
      year: certYear,
      fileUrl
    });

    if (success) {
      await fetchData();
      setShowAddCert(false);
      setCertName('');
      setCertIssuer('');
      setCertFile(null);
    } else {
      setFormError('Failed to upload certificate.');
    }
    setIsUploading(false);
  };

  const handleUpdateStatus = async (sessionId: string, status: 'ACCEPTED' | 'CANCELLED' | 'COMPLETED') => {
    const success = await dbService.updateSessionStatus(sessionId, status);
    if (success) {
      if (status === 'COMPLETED') {
        await dbService.awardExp(user.id, 100);
      }
      await fetchData();
    }
  };

  const handleMarkCompleted = async (sessionId: string) => {
    await handleUpdateStatus(sessionId, 'COMPLETED');
  };

  const incomingRequests = sessions.filter(s => s.provider_id === user.id && s.status === 'REQUESTED');
  const myRequests = sessions.filter(s => s.requester_id === user.id && s.status === 'REQUESTED');
  const activeSessions = sessions.filter(s => s.status === 'ACCEPTED');
  const completedSessions = sessions.filter(s => s.status === 'COMPLETED');

  const verificationBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED': return <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase">✓ Verified</span>;
      case 'REJECTED': return <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase">✗ Rejected</span>;
      default: return <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase">⏳ Pending</span>;
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full flex justify-between items-center px-8 h-16 bg-white/80 backdrop-blur-xl z-50 shadow-[0_20px_40px_-12px_rgba(25,28,30,0.08)]">
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold tracking-tighter text-indigo-700 font-headline">Campus SkillSwap</span>
          <div className="hidden md:flex items-center bg-surface-container-low rounded-full px-4 py-1.5 w-80 group transition-all focus-within:ring-2 focus-within:ring-primary/20">
            <span className="material-symbols-outlined text-outline text-sm">search</span>
            <input className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-outline-variant font-medium outline-none ml-2" placeholder="Search peers, skills..." type="text" />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-6">
            {(['overview', 'skills', 'certificates'] as Tab[]).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`font-headline font-semibold tracking-tight text-sm pb-1 transition-colors capitalize ${activeTab === tab ? 'text-indigo-700 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-indigo-500'}`}>
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button className="material-symbols-outlined text-outline hover:text-primary transition-colors">notifications</button>
            <Link to={`/profile/${user.roll_no}`}>
              <img alt="avatar" className="w-8 h-8 rounded-full border-2 border-primary-container/20 object-cover" src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.roll_no}`} />
            </Link>
          </div>
        </div>
      </nav>

      {/* SideNavBar */}
      <aside className="fixed left-0 top-0 h-full p-4 flex-col space-y-2 w-64 hidden lg:flex bg-slate-50 pt-20 overflow-y-auto">
        <div className="px-4 py-2">
          <h2 className="text-lg font-bold text-indigo-600 mb-2 font-headline">The Atelier</h2>
          <p className="text-xs text-slate-500 font-medium">Knowledge Exchange</p>
        </div>
        <nav className="flex-1 space-y-1 mt-4">
          {[
            { tab: 'overview' as Tab, icon: 'dashboard', label: 'Overview' },
            { tab: 'skills' as Tab, icon: 'psychology', label: 'My Skills' },
            { tab: 'certificates' as Tab, icon: 'verified', label: 'Certificates' },
          ].map(item => (
            <button key={item.tab} onClick={() => setActiveTab(item.tab)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${activeTab === item.tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:translate-x-1'}`}>
              <span className="material-symbols-outlined" style={activeTab === item.tab ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
          <Link to={`/profile/${user.roll_no}`} className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl hover:translate-x-1 transition-transform font-medium text-sm">
            <span className="material-symbols-outlined">person</span>
            <span>My Profile</span>
          </Link>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-error hover:bg-red-50 rounded-xl hover:translate-x-1 transition-transform font-medium text-sm">
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-24 px-4 md:px-8 pb-20 lg:pb-12 min-h-screen max-w-7xl mx-auto">

        {/* ==================== OVERVIEW TAB ==================== */}
        {activeTab === 'overview' && (
          <>
            {/* Hero */}
            <section className="mb-12">
              <div className="relative overflow-hidden rounded-lg bg-primary-container p-8 md:p-12 text-on-primary-container">
                <div className="relative z-10 max-w-2xl">
                  <h1 className="text-3xl md:text-5xl font-headline font-bold tracking-tight mb-4">Welcome back, {user.name.split(' ')[0]}!</h1>
                  <p className="text-lg opacity-90 mb-8 font-body">Teach what you know. Learn what you don't. Your campus network is ready.</p>
                  <div className="flex flex-wrap gap-4">
                    <button onClick={() => setActiveTab('skills')} className="bg-surface-container-lowest text-primary px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform">Manage My Skills</button>
                    <button onClick={() => setActiveTab('certificates')} className="border border-white/30 text-white px-8 py-3 rounded-full font-bold backdrop-blur-sm hover:bg-white/10 transition-colors">Upload Certificate</button>
                  </div>
                </div>
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 translate-y-1/4 translate-x-1/4 w-64 h-64 bg-primary/30 rounded-full blur-3xl"></div>
              </div>
            </section>

            {/* Stats */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <StatCard icon="swap_horiz" label="Sessions" value={`${completedSessions.length}`} color="primary" />
              <StatCard icon="psychology" label="Skills" value={`${skills.length}`} color="secondary" />
              <StatCard icon="verified" label="Certificates" value={`${certificates.filter(c => c.verification_status === 'VERIFIED').length}`} color="tertiary" />
              <StatCard icon="auto_awesome" label="EXP Points" value={`${user.exp}`} color="primary" />
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 space-y-12">
                {/* Discover Peers */}
                <section>
                  <div className="flex justify-between items-end mb-6">
                    <h2 className="text-2xl font-headline font-semibold">Discover Peers</h2>
                    <span className="text-sm text-on-surface-variant">{peers.length} students with skills</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {loading ? (
                      <p className="text-on-surface-variant col-span-2">Loading peers...</p>
                    ) : peers.length > 0 ? peers.map(peer => (
                      <div key={peer.id} className="group bg-surface-container-lowest p-6 rounded-md hover:scale-[1.02] transition-all duration-300 hover:shadow-[0_20px_40px_-12px_rgba(25,28,30,0.08)]">
                        <div className="flex items-start gap-4 mb-4">
                          <img className="w-16 h-16 rounded-lg object-cover" src={peer.avatar} alt={peer.name} />
                          <div className="flex-1">
                            <Link to={`/profile/${peer.roll_no}`}>
                              <h3 className="font-headline font-bold text-lg hover:text-primary transition-colors">{peer.name}</h3>
                            </Link>
                            <p className="text-on-surface-variant text-sm">{peer.branch}{peer.year ? ` • Year ${peer.year}` : ''}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {(peer.skills || []).slice(0, 3).map((s: any, i: number) => (
                            <span key={i} className="bg-secondary-fixed/50 text-on-secondary-fixed text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                              {s.skill_name}
                            </span>
                          ))}
                        </div>
                        <Link to={`/request-session/${peer.id}`} className="block text-center w-full py-3 rounded-full bg-surface-container-high text-on-surface font-bold text-sm group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-primary-container group-hover:text-white transition-all">
                          Request Session
                        </Link>
                      </div>
                    )) : (
                      <p className="text-on-surface-variant col-span-2">No peers with skills found yet.</p>
                    )}
                  </div>
                </section>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-8">
                {/* Incoming Requests */}
                {incomingRequests.length > 0 && (
                  <section className="bg-surface-container-low rounded-lg p-6">
                    <h2 className="text-lg font-headline font-bold mb-4 flex items-center gap-2">
                      Incoming Requests
                      <span className="bg-secondary-fixed text-on-secondary-fixed px-2 py-0.5 rounded-full text-[10px] font-bold">{incomingRequests.length}</span>
                    </h2>
                    <div className="space-y-3">
                      {incomingRequests.map(req => (
                        <div key={req.id} className="bg-surface-container-lowest p-4 rounded-md space-y-3">
                          <div>
                            <h4 className="font-bold text-sm">{req.topic}</h4>
                            <p className="text-xs text-on-surface-variant">From {req.requester?.name} • {new Date(req.scheduled_at).toLocaleDateString()}</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleUpdateStatus(req.id, 'ACCEPTED')} className="flex-1 py-2 bg-primary text-white rounded-full text-xs font-bold hover:scale-[1.02] active:scale-95 transition-all">Accept</button>
                            <button onClick={() => handleUpdateStatus(req.id, 'CANCELLED')} className="flex-1 py-2 bg-surface-container-high text-on-surface rounded-full text-xs font-bold hover:scale-[1.02] transition-all border border-outline-variant/20">Decline</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Active Sessions */}
                <section className="bg-surface-container-low rounded-lg p-6">
                  <h2 className="text-lg font-headline font-bold mb-4">Active Sessions</h2>
                  <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
                    {activeSessions.length > 0 ? activeSessions.map(session => (
                      <div key={session.id} className="flex items-center gap-3 bg-surface-container-lowest p-4 rounded-md">
                        <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm truncate">{session.topic}</h4>
                          <p className="text-xs text-on-surface-variant truncate">
                            With {session.provider_id === user.id ? session.requester?.name : session.provider?.name}
                          </p>
                          <button onClick={() => handleMarkCompleted(session.id)} className="mt-1 text-[10px] font-bold text-primary hover:underline">Mark Completed</button>
                        </div>
                      </div>
                    )) : <p className="text-sm text-on-surface-variant">No active sessions.</p>}
                  </div>
                </section>

                {/* Journey Stats */}
                <section className="bg-gradient-to-br from-secondary to-secondary-container rounded-lg p-6 text-white overflow-hidden relative">
                  <div className="relative z-10">
                    <h2 className="text-lg font-headline font-bold mb-4">Exchange Stats</h2>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/10 backdrop-blur-md p-3 rounded-md border border-white/20">
                        <span className="text-2xl font-bold">{completedSessions.length}</span>
                        <p className="text-[10px] uppercase font-bold tracking-widest opacity-80">Completed</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md p-3 rounded-md border border-white/20">
                        <span className="text-2xl font-bold">{user.exp}</span>
                        <p className="text-[10px] uppercase font-bold tracking-widest opacity-80">Points</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                </section>
              </div>
            </div>
          </>
        )}

        {/* ==================== SKILLS TAB ==================== */}
        {activeTab === 'skills' && (
          <div className="space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-headline font-bold tracking-tight">My Skills</h1>
                <p className="text-on-surface-variant mt-1">Skills you can teach or share with your peers.</p>
              </div>
              <button onClick={() => { setShowAddSkill(true); setFormError(null); setSkillQuery(''); setSelectedSkillName(''); }} className="px-6 py-3 bg-gradient-to-br from-primary to-primary-container text-white rounded-full font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">add</span>
                Add Skill
              </button>
            </div>

            {skills.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {skills.map(skill => (
                  <div key={skill.id} className="bg-surface-container-lowest p-6 rounded-md hover:shadow-[0_20px_40px_-12px_rgba(25,28,30,0.08)] transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-primary-fixed text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined">code</span>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${skill.skill_level === 'ADVANCED' ? 'bg-green-100 text-green-700' : skill.skill_level === 'INTERMEDIATE' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {skill.skill_level}
                      </span>
                    </div>
                    <h3 className="font-headline font-bold text-lg mb-1">{skill.skill_name}</h3>
                    <p className="text-xs text-on-surface-variant">Added {new Date(skill.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-surface-container-lowest p-16 rounded-md text-center">
                <span className="material-symbols-outlined text-[64px] text-outline/30 mb-4 block">psychology</span>
                <h3 className="font-headline font-bold text-xl mb-2">No skills yet</h3>
                <p className="text-on-surface-variant mb-6">Add your expertise so peers can find and learn from you.</p>
                <button onClick={() => setShowAddSkill(true)} className="px-6 py-3 bg-primary text-white rounded-full font-bold text-sm">Add Your First Skill</button>
              </div>
            )}
          </div>
        )}

        {/* ==================== CERTIFICATES TAB ==================== */}
        {activeTab === 'certificates' && (
          <div className="space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-headline font-bold tracking-tight">Certificates</h1>
                <p className="text-on-surface-variant mt-1">Upload certificates to verify your expertise. Verified certificates boost your credibility.</p>
              </div>
              <button onClick={() => { setShowAddCert(true); setFormError(null); }} className="px-6 py-3 bg-gradient-to-br from-primary to-primary-container text-white rounded-full font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">upload_file</span>
                Upload Certificate
              </button>
            </div>

            {certificates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificates.map(cert => (
                  <div key={cert.id} className="bg-surface-container-lowest p-6 rounded-md hover:shadow-[0_20px_40px_-12px_rgba(25,28,30,0.08)] transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-tertiary-fixed text-tertiary flex items-center justify-center">
                        <span className="material-symbols-outlined">workspace_premium</span>
                      </div>
                      {verificationBadge(cert.verification_status)}
                    </div>
                    <h3 className="font-headline font-bold text-base mb-1">{cert.certificate_name}</h3>
                    <p className="text-sm text-on-surface-variant">{cert.issuer}</p>
                    <p className="text-xs text-outline mt-2">Issued {cert.issue_year}</p>
                    <a href={cert.file_url} target="_blank" rel="noreferrer" className="text-xs text-primary font-bold hover:underline mt-2 block">View Certificate →</a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-surface-container-lowest p-16 rounded-md text-center">
                <span className="material-symbols-outlined text-[64px] text-outline/30 mb-4 block">verified</span>
                <h3 className="font-headline font-bold text-xl mb-2">No certificates yet</h3>
                <p className="text-on-surface-variant mb-6">Upload your course completions, certifications, and awards.</p>
                <button onClick={() => setShowAddCert(true)} className="px-6 py-3 bg-primary text-white rounded-full font-bold text-sm">Upload Your First Certificate</button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile BottomNav */}
      <div className="lg:hidden fixed bottom-0 w-full h-16 bg-white/80 backdrop-blur-xl flex justify-around items-center px-4 z-50 border-t border-outline-variant/20">
        {([
          { tab: 'overview' as Tab, icon: 'dashboard', label: 'Home' },
          { tab: 'skills' as Tab, icon: 'psychology', label: 'Skills' },
          { tab: 'certificates' as Tab, icon: 'verified', label: 'Certs' },
        ]).map(item => (
          <button key={item.tab} onClick={() => setActiveTab(item.tab)} className={`flex flex-col items-center gap-1 ${activeTab === item.tab ? 'text-primary' : 'text-outline'}`}>
            <span className="material-symbols-outlined" style={activeTab === item.tab ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
            <span className="text-[10px] font-bold">{item.label}</span>
          </button>
        ))}
        <button className="flex flex-col items-center gap-1 text-outline" onClick={onLogout}>
          <span className="material-symbols-outlined">logout</span>
          <span className="text-[10px] font-bold">Exit</span>
        </button>
      </div>

      {/* ==================== ADD SKILL MODAL ==================== */}
      {showAddSkill && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-lg rounded-2xl shadow-2xl p-8 border border-outline-variant/20">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-fixed text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined">add_task</span>
                </div>
                <h3 className="text-xl font-bold font-headline">Add Expertise</h3>
              </div>
              <button onClick={() => setShowAddSkill(false)} className="material-symbols-outlined text-outline hover:text-error transition-colors">close</button>
            </div>

            <div className="flex flex-col gap-6">
              {/* Regex Search Input */}
              <div className="relative">
                <label className="text-sm font-bold text-on-surface font-label block mb-2">Search Skill</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
                  <input
                    className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low border border-outline-variant/30 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-on-surface"
                    placeholder="Type to search (e.g. Python, React, Design...)"
                    value={skillQuery}
                    onChange={e => { setSkillQuery(e.target.value); setSelectedSkillName(''); }}
                    autoFocus
                  />
                </div>
                {/* Suggestions Dropdown */}
                {suggestions.length > 0 && !selectedSkillName && (
                  <div ref={suggestionsRef} className="absolute top-full left-0 right-0 mt-1 bg-surface-container-lowest rounded-lg shadow-xl border border-outline-variant/20 max-h-64 overflow-y-auto z-20">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => { setSelectedSkillName(s.name); setSkillQuery(s.name); setSuggestions([]); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors text-left"
                      >
                        <span className="material-symbols-outlined text-primary text-sm">{s.icon}</span>
                        <div>
                          <p className="text-sm font-medium">{s.name}</p>
                          <p className="text-[10px] text-outline">{s.category}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {selectedSkillName && (
                  <div className="mt-2 flex items-center gap-2 bg-primary-fixed px-3 py-2 rounded-lg">
                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                    <span className="text-sm font-bold text-primary">{selectedSkillName}</span>
                    <button onClick={() => { setSelectedSkillName(''); setSkillQuery(''); }} className="ml-auto material-symbols-outlined text-xs text-outline hover:text-error">close</button>
                  </div>
                )}
              </div>

              {/* Proficiency Level */}
              <div>
                <label className="text-sm font-bold text-on-surface font-label block mb-2">Proficiency Level</label>
                <div className="flex bg-surface-container-low rounded-lg p-1 border border-outline-variant/30">
                  {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as SkillLevel[]).map(level => (
                    <button key={level} onClick={() => setSelectedLevel(level)} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${selectedLevel === level ? 'bg-white shadow text-primary border border-outline-variant/20' : 'text-outline hover:text-on-surface'}`}>
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {formError && (
                <div className="p-3 rounded-lg bg-error-container text-on-error-container text-xs font-medium border border-error/20 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">error</span>{formError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddSkill(false)} className="flex-1 py-3 bg-surface-container-high rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container-highest transition-colors">Cancel</button>
                <button disabled={isAdding} onClick={handleAddSkill} className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/30 hover:scale-[1.02] transition-all disabled:opacity-70">
                  {isAdding ? 'Adding...' : 'Save Skill'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== ADD CERTIFICATE MODAL ==================== */}
      {showAddCert && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-lg rounded-2xl shadow-2xl p-8 border border-outline-variant/20">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-tertiary-fixed text-tertiary flex items-center justify-center">
                  <span className="material-symbols-outlined">workspace_premium</span>
                </div>
                <h3 className="text-xl font-bold font-headline">Upload Certificate</h3>
              </div>
              <button onClick={() => setShowAddCert(false)} className="material-symbols-outlined text-outline hover:text-error transition-colors">close</button>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <label className="text-sm font-bold text-on-surface font-label block mb-2">Certificate Name</label>
                <input className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" placeholder="e.g. AWS Solutions Architect" value={certName} onChange={e => setCertName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-on-surface font-label block mb-2">Issuing Organization</label>
                  <input className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" placeholder="e.g. Amazon" value={certIssuer} onChange={e => setCertIssuer(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-bold text-on-surface font-label block mb-2">Year Issued</label>
                  <input type="number" className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" value={certYear} onChange={e => setCertYear(parseInt(e.target.value))} min={2000} max={2030} />
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-on-surface font-label block mb-2">Upload File (PDF/Image)</label>
                <div className="relative border-2 border-dashed border-outline-variant/30 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <input type="file" accept=".pdf,.png,.jpg,.jpeg" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={e => setCertFile(e.target.files?.[0] || null)} />
                  {certFile ? (
                    <div className="flex items-center justify-center gap-2 text-primary">
                      <span className="material-symbols-outlined">description</span>
                      <span className="text-sm font-bold">{certFile.name}</span>
                    </div>
                  ) : (
                    <div>
                      <span className="material-symbols-outlined text-outline text-3xl mb-2 block">cloud_upload</span>
                      <p className="text-sm text-on-surface-variant">Drag & drop or click to upload</p>
                      <p className="text-xs text-outline mt-1">PDF, PNG, JPG (max 5MB)</p>
                    </div>
                  )}
                </div>
              </div>

              {formError && (
                <div className="p-3 rounded-lg bg-error-container text-on-error-container text-xs font-medium border border-error/20 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">error</span>{formError}
                </div>
              )}

              <div className="bg-surface-container-low rounded-lg p-4 border border-outline-variant/10">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-yellow-600 text-sm mt-0.5">info</span>
                  <p className="text-xs text-on-surface-variant">After upload, your certificate will be marked as <strong>⏳ Pending</strong> until it's reviewed and verified by the platform.</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddCert(false)} className="flex-1 py-3 bg-surface-container-high rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container-highest transition-colors">Cancel</button>
                <button disabled={isUploading} onClick={handleAddCertificate} className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/30 hover:scale-[1.02] transition-all disabled:opacity-70">
                  {isUploading ? 'Uploading...' : 'Submit Certificate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAB for quick add */}
      <button
        onClick={() => { setShowAddSkill(true); setFormError(null); setSkillQuery(''); setSelectedSkillName(''); }}
        className="fixed bottom-24 lg:bottom-8 right-6 w-14 h-14 bg-gradient-to-br from-primary to-primary-container text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-90 transition-all z-40"
      >
        <span className="material-symbols-outlined">add</span>
      </button>
    </div>
  );
};

const StatCard: React.FC<{ icon: string; label: string; value: string; color: string }> = ({ icon, label, value, color }) => (
  <div className="bg-surface-container-lowest p-6 rounded-md hover:scale-[1.01] hover:shadow-[0_20px_40px_-12px_rgba(25,28,30,0.08)] transition-all">
    <div className="flex items-center gap-2 mb-3">
      <span className={`material-symbols-outlined text-${color}`}>{icon}</span>
      <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-2xl font-bold tracking-tight">{value}</p>
  </div>
);

export default Dashboard;
