
export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type SessionStatus = 'REQUESTED' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface User {
  id: string;
  roll_no: string;
  name: string;
  branch: string;
  year?: number;
  semester?: number;
  subjects?: any;
  attendance_percentage?: number;
  bio?: string;
  exp: number;
  created_at: string;
  updated_at: string;
  avatar?: string;
  // Joined data (not in DB, populated on fetch)
  skills?: Skill[];
}

export interface Skill {
  id: string;
  user_id: string;
  skill_name: string;
  skill_level: SkillLevel;
  created_at: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  file_url: string;
  certificate_name: string;
  issuer: string;
  issue_year: number;
  verification_status: VerificationStatus;
  created_at: string;
}

export interface Session {
  id: string;
  requester_id: string;
  provider_id: string;
  topic: string;
  goal?: string;
  status: SessionStatus;
  scheduled_at: string;
  created_at: string;
  // Join fields
  requester?: Partial<User>;
  provider?: Partial<User>;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
}
