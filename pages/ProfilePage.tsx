
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { User, Skill, Certificate } from '../types';
import { dbService } from '../services/mockDatabase';

interface ProfilePageProps {
  currentUser: User;
  onLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ currentUser, onLogout }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!id) return;
      const u = await dbService.getUserByRollNo(id);
      
      if (u) {
        const [sk, c] = await Promise.all([
          dbService.getSkills(u.id),
          dbService.getCertificates(u.id)
        ]);
        setUser(u);
        setSkills(sk);
        setCerts(c);
      }
      setLoading(false);
    };
    loadProfile();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-surface">
      <span className="material-symbols-outlined text-[64px] text-outline/30 mb-4">person_off</span>
      <h1 className="text-2xl font-bold mb-2 font-headline">Student Not Found</h1>
      <p className="text-on-surface-variant mb-6">The roll number <strong>{id}</strong> does not exist in our system.</p>
      <button onClick={() => navigate('/')} className="px-6 py-2.5 bg-primary text-white rounded-full font-bold text-sm">Back to Dashboard</button>
    </div>
  );

  const isOwnProfile = currentUser.roll_no === user.roll_no;

  const verificationBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED': return <span className="ml-2 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase">✓ Verified</span>;
      case 'REJECTED': return <span className="ml-2 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase">✗ Rejected</span>;
      default: return <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase">⏳ Pending</span>;
    }
  };

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-outline-variant/10 px-6 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">verified</span>
            <span className="text-sm font-bold tracking-tight font-headline">Academic Profile</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Profile Card */}
        <div className="bg-surface-container-lowest rounded-lg overflow-hidden mb-8 shadow-sm border border-outline-variant/10">
          <div className="h-32 bg-gradient-to-r from-primary-container to-secondary-container"></div>
          <div className="px-8 pb-8 -mt-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="flex flex-col md:flex-row md:items-end gap-6">
                <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.roll_no}`} className="w-28 h-28 rounded-2xl border-4 border-white shadow-lg object-cover bg-white" alt={user.name} />
                <div className="flex flex-col gap-1 pb-2">
                  <h1 className="text-3xl font-headline font-black tracking-tight">{user.name}</h1>
                  <p className="text-on-surface-variant font-medium">{user.branch}{user.year ? ` • Year ${user.year}` : ''}</p>
                  <p className="text-xs text-outline">Roll No: {user.roll_no}</p>
                  {user.bio && <p className="text-sm text-on-surface-variant mt-1 italic">"{user.bio}"</p>}
                </div>
              </div>
              {!isOwnProfile && skills.length > 0 && (
                <Link to={`/request-session/${user.id}`} className="px-6 py-2.5 bg-gradient-to-br from-primary to-primary-container text-white rounded-full text-sm font-bold shadow-lg hover:scale-[1.02] transition-all">
                  Request Session
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Skills */}
            <section className="bg-surface-container-lowest rounded-lg p-6 border border-outline-variant/10 shadow-sm">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 font-headline">
                <span className="material-symbols-outlined text-primary">psychology</span>
                Skills & Expertise
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skills.length > 0 ? skills.map(skill => (
                  <div key={skill.id} className="flex items-center justify-between p-4 rounded-lg border border-outline-variant/10 bg-surface">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-sm">code</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold">{skill.skill_name}</p>
                        <p className="text-xs text-on-surface-variant">{skill.skill_level}</p>
                      </div>
                    </div>
                  </div>
                )) : <p className="text-sm text-on-surface-variant col-span-2">No skills listed yet.</p>}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            {/* Certificates */}
            <section className="bg-surface-container-lowest rounded-lg p-6 border border-outline-variant/10 shadow-sm">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 font-headline">
                <span className="material-symbols-outlined text-primary">workspace_premium</span>
                Certifications
              </h3>
              <div className="flex flex-col gap-4">
                {certs.length > 0 ? certs.map(cert => (
                  <div key={cert.id} className="p-4 rounded-lg border border-outline-variant/10 bg-surface">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-bold">{cert.certificate_name}</p>
                      {verificationBadge(cert.verification_status)}
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1">{cert.issuer} • {cert.issue_year}</p>
                  </div>
                )) : <p className="text-sm text-on-surface-variant">No certifications found.</p>}
              </div>
            </section>

            {/* EXP */}
            <section className="bg-gradient-to-br from-primary/10 to-primary-container/10 rounded-lg p-6 border border-primary/10">
              <div className="flex flex-col items-center text-center gap-2">
                <span className="material-symbols-outlined text-primary text-3xl">auto_awesome</span>
                <span className="text-3xl font-black text-primary">{user.exp}</span>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total EXP Earned</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
