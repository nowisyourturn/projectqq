export type Grade = '9' | '12';

export type Subject = 'romana' | 'istorie' | 'matematica';

export type InterestCategory = 'Filme' | 'Gaming' | 'Sport' | 'Muzică' | 'Tehnologie';

export interface UserProfile {
  uid?: string;
  name?: string;
  email?: string;
  grade: Grade;
  subject?: Subject;
  interestCategory?: InterestCategory;
  interestDetail?: string;
  progress?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Lesson {
  id: string;
  title: string;
  subject: Subject;
  videoUrl: string;
  description: string;
}

export const SUBJECTS = [
  { id: 'romana', name: 'Limba și literatura română', icon: 'BookOpen', status: 'soon' },
  { id: 'istorie', name: 'Istoria românilor și universală', icon: 'History', status: 'soon' },
  { id: 'matematica', name: 'Matematica', icon: 'Calculator', status: 'active' },
] as const;

export const INTEREST_CATEGORIES: InterestCategory[] = ['Filme', 'Gaming', 'Sport', 'Muzică', 'Tehnologie'];

export type Step = 'landing' | 'subjects' | 'profiling' | 'profiling-detail' | 'lesson' | 'test' | 'progress';

export interface TestQuestion {
  id?: number;
  question: string;
  hint?: string;
}

export interface TestFeedback {
  isCorrect: boolean;
  explanation: string;
}
