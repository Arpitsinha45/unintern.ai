export interface RoadmapSection {
  title: string;
  description: string;
  howTo: string;
  whyItMatters: string;
}

export interface StartupRoadmap {
  overview: string;
  sections: {
    problemValidation: RoadmapSection;
    targetUserClarity: RoadmapSection;
    solutionBreakdown: RoadmapSection;
    mvpScope: RoadmapSection;
    goToMarket: RoadmapSection;
    monetization: RoadmapSection;
    toolsAndPlatforms: RoadmapSection;
    beginnerMistakes: RoadmapSection;
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface ChatSession {
  id: string;
  timestamp: number;
  title: string;
  messages: ChatMessage[];
}

export enum AppState {
  HOME = 'HOME',
  MITRA = 'MITRA'
}

export type Tab = 'home' | 'network' | 'challenges' | 'mentor' | 'profile' | 'history';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Mentor {
  id: string;
  name: string;
  role: string;
  company: string;
  badge: string;
  skills: string[];
  available: boolean;
  avatarSeed: string;
  rate: string;
  synergy?: number;
  reviews?: Review[];
}

export type AccentColor = 'cyan-purple' | 'emerald-teal' | 'rose-pink' | 'amber-orange' | 'indigo-violet';
export type BgPattern = 'noise' | 'grid' | 'dots' | 'none';

export interface AppTheme {
  accent: AccentColor;
  pattern: BgPattern;
  glowIntensity: number;
}
