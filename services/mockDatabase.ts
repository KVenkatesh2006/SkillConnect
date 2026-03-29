
import { supabase } from './supabase';
import { User, Skill, Session, Certificate, AuthResponse, SessionStatus, SkillLevel } from '../types';

export const authService = {
  login: async (rollNo: string, password: string): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.rpc('login_user', {
        p_roll_no: rollNo,
        p_password: password
      });

      if (error) throw error;
      
      if (data.success) {
        return { 
          success: true, 
          user: {
            ...data.user,
            avatar: data.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.roll_no}`
          } 
        };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err: any) {
      console.error('Auth Error:', err);
      return { success: false, message: 'Connection to Auth service failed.' };
    }
  }
};

export const dbService = {
  getUserByRollNo: async (rollNo: string): Promise<User | undefined> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('roll_no', rollNo)
      .single();
    
    if (error || !data) return undefined;
    return {
      ...data,
      avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.roll_no}`
    };
  },

  /**
   * Get all peers (other students) who have at least 1 skill listed.
   * Excludes the current user.
   */
  getPeers: async (currentUserId: string): Promise<User[]> => {
    // First get all users except current
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .neq('id', currentUserId);
    
    if (error || !users) return [];

    // Then get skills for those users to filter out skill-less users
    const userIds = users.map(u => u.id);
    const { data: skills } = await supabase
      .from('skills')
      .select('user_id, skill_name')
      .in('user_id', userIds);

    const usersWithSkills = new Set((skills || []).map(s => s.user_id));

    // Build a skill map for attaching to user objects
    const skillMap: Record<string, string[]> = {};
    (skills || []).forEach(s => {
      if (!skillMap[s.user_id]) skillMap[s.user_id] = [];
      skillMap[s.user_id].push(s.skill_name);
    });

    return users
      .filter(u => usersWithSkills.has(u.id))
      .map(u => ({
        ...u,
        avatar: u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.roll_no}`,
        skills: (skillMap[u.id] || []).map(name => ({ skill_name: name }))
      }));
  },

  getSkills: async (userId: string): Promise<Skill[]> => {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('user_id', userId);
    
    return error ? [] : data;
  },

  addSkill: async (userId: string, skillName: string, skillLevel: SkillLevel): Promise<boolean> => {
    const { error } = await supabase
      .from('skills')
      .insert({
        user_id: userId,
        skill_name: skillName,
        skill_level: skillLevel
      });
    return !error;
  },

  removeSkill: async (skillId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('id', skillId);
    return !error;
  },

  // Certificate management
  uploadCertificateFile: async (userId: string, file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('certificates')
        .upload(filePath, file);

      if (error) {
        console.warn("Storage bucket 'certificates' might not exist, using mock URL.");
        return `https://example.com/certificates/${filePath}`;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('certificates')
        .getPublicUrl(filePath);
        
      return publicUrl;
    } catch (err) {
      console.error("Storage Error:", err);
      return null;
    }
  },

  addCertificate: async (
    userId: string, 
    certData: { name: string; issuer: string; year: number; fileUrl: string }
  ): Promise<boolean> => {
    const { error } = await supabase
      .from('certificates')
      .insert({
        user_id: userId,
        certificate_name: certData.name,
        issuer: certData.issuer,
        issue_year: certData.year,
        file_url: certData.fileUrl,
        verification_status: 'PENDING'
      });
    return !error;
  },

  getCertificates: async (userId: string): Promise<Certificate[]> => {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', userId);
    
    return error ? [] : data;
  },

  getSessions: async (userId: string): Promise<Session[]> => {
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        *,
        provider:provider_id (id, name, roll_no, avatar),
        requester:requester_id (id, name, roll_no, avatar)
      `)
      .or(`requester_id.eq.${userId},provider_id.eq.${userId}`)
      .order('scheduled_at', { ascending: false });
    
    return error ? [] : data;
  },

  updateSessionStatus: async (sessionId: string, status: SessionStatus): Promise<boolean> => {
    const { error } = await supabase
      .from('sessions')
      .update({ status })
      .eq('id', sessionId);
    
    return !error;
  },

  awardExp: async (userId: string, amount: number): Promise<boolean> => {
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('exp')
      .eq('id', userId)
      .single();
    
    if (fetchError || !user) return false;

    const { error } = await supabase
      .from('users')
      .update({ exp: (user.exp || 0) + amount })
      .eq('id', userId);
    
    return !error;
  },

  requestSession: async (session: { requester_id: string, provider_id: string, topic: string, goal: string, scheduled_at: string }): Promise<boolean> => {
    const { error } = await supabase
      .from('sessions')
      .insert({
        ...session,
        status: 'REQUESTED'
      });
    
    return !error;
  },

  subscribeToSessions: (callback: () => void) => {
    return supabase.channel('public:sessions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, payload => {
        console.log('Real-time session update:', payload);
        callback();
      })
      .subscribe();
  }
};
