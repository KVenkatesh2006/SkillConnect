/**
 * Regex-based Skill Suggestion Engine
 * 
 * Contains a comprehensive master list of academic/professional skills
 * and a fuzzy-search function using RegExp for real-time suggestions.
 */

export const MASTER_SKILL_LIST: { name: string; icon: string; category: string }[] = [
  // Programming & Development
  { name: 'Python', icon: 'code', category: 'Programming' },
  { name: 'JavaScript', icon: 'code', category: 'Programming' },
  { name: 'TypeScript', icon: 'code', category: 'Programming' },
  { name: 'Java', icon: 'code', category: 'Programming' },
  { name: 'C Programming', icon: 'code', category: 'Programming' },
  { name: 'C++', icon: 'code', category: 'Programming' },
  { name: 'C#', icon: 'code', category: 'Programming' },
  { name: 'Rust', icon: 'code', category: 'Programming' },
  { name: 'Go (Golang)', icon: 'code', category: 'Programming' },
  { name: 'Swift', icon: 'code', category: 'Programming' },
  { name: 'Kotlin', icon: 'code', category: 'Programming' },
  { name: 'Ruby', icon: 'code', category: 'Programming' },
  { name: 'PHP', icon: 'code', category: 'Programming' },
  { name: 'R Programming', icon: 'code', category: 'Programming' },
  { name: 'MATLAB', icon: 'code', category: 'Programming' },
  { name: 'SQL & Databases', icon: 'storage', category: 'Programming' },
  { name: 'Shell Scripting (Bash)', icon: 'terminal', category: 'Programming' },

  // Web Development
  { name: 'React & Next.js', icon: 'web', category: 'Web Development' },
  { name: 'Angular', icon: 'web', category: 'Web Development' },
  { name: 'Vue.js', icon: 'web', category: 'Web Development' },
  { name: 'Svelte', icon: 'web', category: 'Web Development' },
  { name: 'Node.js & Express', icon: 'dns', category: 'Web Development' },
  { name: 'Django & Flask', icon: 'dns', category: 'Web Development' },
  { name: 'Spring Boot', icon: 'dns', category: 'Web Development' },
  { name: 'HTML & CSS', icon: 'web', category: 'Web Development' },
  { name: 'Tailwind CSS', icon: 'palette', category: 'Web Development' },
  { name: 'REST API Design', icon: 'api', category: 'Web Development' },
  { name: 'GraphQL', icon: 'api', category: 'Web Development' },
  { name: 'WordPress Development', icon: 'web', category: 'Web Development' },

  // Mobile Development  
  { name: 'React Native', icon: 'smartphone', category: 'Mobile Development' },
  { name: 'Flutter & Dart', icon: 'smartphone', category: 'Mobile Development' },
  { name: 'Android (Kotlin/Java)', icon: 'android', category: 'Mobile Development' },
  { name: 'iOS (Swift/SwiftUI)', icon: 'phone_iphone', category: 'Mobile Development' },

  // Data Science & AI/ML
  { name: 'Data Science', icon: 'analytics', category: 'Data & AI' },
  { name: 'Machine Learning', icon: 'psychology', category: 'Data & AI' },
  { name: 'Deep Learning & Neural Networks', icon: 'neurology', category: 'Data & AI' },
  { name: 'Natural Language Processing', icon: 'translate', category: 'Data & AI' },
  { name: 'Computer Vision', icon: 'visibility', category: 'Data & AI' },
  { name: 'Data Visualization (Tableau, D3)', icon: 'bar_chart', category: 'Data & AI' },
  { name: 'TensorFlow & PyTorch', icon: 'model_training', category: 'Data & AI' },
  { name: 'Statistics & Probability', icon: 'functions', category: 'Data & AI' },
  { name: 'Big Data (Hadoop, Spark)', icon: 'cloud', category: 'Data & AI' },
  { name: 'Generative AI & Prompt Engineering', icon: 'auto_awesome', category: 'Data & AI' },

  // Cloud & DevOps
  { name: 'AWS (Amazon Web Services)', icon: 'cloud', category: 'Cloud & DevOps' },
  { name: 'Google Cloud Platform', icon: 'cloud', category: 'Cloud & DevOps' },
  { name: 'Microsoft Azure', icon: 'cloud', category: 'Cloud & DevOps' },
  { name: 'Docker & Containerization', icon: 'deployed_code', category: 'Cloud & DevOps' },
  { name: 'Kubernetes', icon: 'deployed_code', category: 'Cloud & DevOps' },
  { name: 'CI/CD Pipelines', icon: 'sync', category: 'Cloud & DevOps' },
  { name: 'Linux System Admin', icon: 'terminal', category: 'Cloud & DevOps' },
  { name: 'Git & Version Control', icon: 'merge_type', category: 'Cloud & DevOps' },

  // Cybersecurity
  { name: 'Cybersecurity Fundamentals', icon: 'security', category: 'Security' },
  { name: 'Ethical Hacking & Pen Testing', icon: 'bug_report', category: 'Security' },
  { name: 'Network Security', icon: 'vpn_lock', category: 'Security' },
  { name: 'Cryptography', icon: 'lock', category: 'Security' },

  // Design & Creative
  { name: 'UI/UX Design', icon: 'palette', category: 'Design' },
  { name: 'Graphic Design (Photoshop, Illustrator)', icon: 'brush', category: 'Design' },
  { name: 'Figma & Prototyping', icon: 'draw', category: 'Design' },
  { name: 'Video Editing (Premiere, DaVinci)', icon: 'movie', category: 'Design' },
  { name: '3D Modeling & Animation (Blender)', icon: 'view_in_ar', category: 'Design' },
  { name: 'Motion Graphics (After Effects)', icon: 'animation', category: 'Design' },

  // Engineering
  { name: 'SolidWorks', icon: 'engineering', category: 'Engineering' },
  { name: 'AutoCAD', icon: 'architecture', category: 'Engineering' },
  { name: 'Circuit Design (PCB)', icon: 'memory', category: 'Engineering' },
  { name: 'Embedded Systems (ARM)', icon: 'developer_board', category: 'Engineering' },
  { name: 'VLSI Design', icon: 'memory', category: 'Engineering' },
  { name: 'Signal Processing', icon: 'graphic_eq', category: 'Engineering' },
  { name: 'Control Systems', icon: 'tune', category: 'Engineering' },
  { name: 'Thermodynamics', icon: 'thermostat', category: 'Engineering' },
  { name: 'Finite Element Analysis', icon: 'grid_on', category: 'Engineering' },
  { name: 'Robotics & ROS', icon: 'smart_toy', category: 'Engineering' },

  // Business & Marketing
  { name: 'Digital Marketing', icon: 'campaign', category: 'Business' },
  { name: 'SEO & Content Marketing', icon: 'search', category: 'Business' },
  { name: 'Social Media Management', icon: 'share', category: 'Business' },
  { name: 'Product Management', icon: 'inventory_2', category: 'Business' },
  { name: 'Business Analytics', icon: 'insights', category: 'Business' },
  { name: 'Financial Modeling & Excel', icon: 'table_chart', category: 'Business' },
  { name: 'Entrepreneurship', icon: 'rocket_launch', category: 'Business' },

  // Academics & Sciences
  { name: 'Linear Algebra', icon: 'functions', category: 'Academics' },
  { name: 'Calculus', icon: 'functions', category: 'Academics' },
  { name: 'Discrete Mathematics', icon: 'functions', category: 'Academics' },
  { name: 'Physics (Mechanics)', icon: 'science', category: 'Academics' },
  { name: 'Physics (Electromagnetism)', icon: 'bolt', category: 'Academics' },
  { name: 'Chemistry (Organic)', icon: 'science', category: 'Academics' },
  { name: 'Data Structures & Algorithms', icon: 'account_tree', category: 'Academics' },
  { name: 'Operating Systems', icon: 'computer', category: 'Academics' },
  { name: 'Computer Networks', icon: 'lan', category: 'Academics' },
  { name: 'Database Management Systems', icon: 'storage', category: 'Academics' },
  { name: 'Compiler Design', icon: 'build', category: 'Academics' },
  { name: 'Theory of Computation', icon: 'calculate', category: 'Academics' },

  // Soft Skills & Communication
  { name: 'Public Speaking', icon: 'mic', category: 'Soft Skills' },
  { name: 'Technical Writing', icon: 'edit_note', category: 'Soft Skills' },
  { name: 'Creative Writing', icon: 'edit_note', category: 'Soft Skills' },
  { name: 'Research Methodology', icon: 'biotech', category: 'Soft Skills' },
  { name: 'Competitive Programming', icon: 'emoji_events', category: 'Soft Skills' },
  { name: 'Interview Preparation', icon: 'work', category: 'Soft Skills' },

  // Blockchain & Emerging Tech
  { name: 'Blockchain & Web3', icon: 'token', category: 'Emerging Tech' },
  { name: 'Solidity & Smart Contracts', icon: 'code', category: 'Emerging Tech' },
  { name: 'IoT (Internet of Things)', icon: 'sensors', category: 'Emerging Tech' },
  { name: 'AR/VR Development', icon: 'view_in_ar', category: 'Emerging Tech' },
  { name: 'Quantum Computing Basics', icon: 'science', category: 'Emerging Tech' },
];

/**
 * Regex-based fuzzy search against the master skill list.
 * Converts the user input into a case-insensitive regex pattern
 * and returns matching skills, ordered by relevance (starts-with first).
 * 
 * @param query - The user's partial text input
 * @param limit - Max number of suggestions to return (default 8)
 * @returns Array of matching skill objects
 */
export function getSkillSuggestions(
  query: string,
  limit: number = 8
): { name: string; icon: string; category: string }[] {
  if (!query || query.trim().length === 0) return [];

  try {
    // Escape special regex characters in user input, then build pattern
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(escaped, 'i');

    const matches = MASTER_SKILL_LIST.filter(skill =>
      pattern.test(skill.name) || pattern.test(skill.category)
    );

    // Sort: skills whose name STARTS with the query come first
    const startsWithPattern = new RegExp(`^${escaped}`, 'i');
    matches.sort((a, b) => {
      const aStarts = startsWithPattern.test(a.name) ? 0 : 1;
      const bStarts = startsWithPattern.test(b.name) ? 0 : 1;
      return aStarts - bStarts;
    });

    return matches.slice(0, limit);
  } catch {
    // If regex construction fails (shouldn't with escaping, but safety net)
    return [];
  }
}

/**
 * Get all unique category names from the master list.
 */
export function getCategories(): string[] {
  return [...new Set(MASTER_SKILL_LIST.map(s => s.category))];
}
