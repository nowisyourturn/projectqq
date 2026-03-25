/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, Component } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  History, 
  Calculator, 
  ChevronRight, 
  Gamepad2, 
  Film, 
  Trophy, 
  Music, 
  Cpu,
  ArrowLeft,
  Send,
  Sparkles,
  PlayCircle,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  X,
  Menu,
  Home,
  Mountain,
  Flag,
  Tent,
  Flame,
  Compass,
  Lightbulb,
  Timer,
  User as UserIcon,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { UserProfile, SUBJECTS, INTEREST_CATEGORIES, Subject, InterestCategory, Lesson, Step, TestQuestion } from './types';
import { getTutorResponse, generateTest, evaluateAnswer } from './services/geminiService';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';
import { signInWithPopup, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';

class ErrorBoundary extends Component<any, any> {
  constructor(props: any) {
    super(props);
    (this as any).state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if ((this as any).state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
          <div className="glass p-8 rounded-3xl max-w-md w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <X size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-4">Ups! Ceva n-a mers bine.</h2>
            <p className="text-slate-600 mb-6">
              Aplicația a întâmpinat o eroare neașteptată. Te rugăm să reîncarci pagina.
            </p>
            <div className="p-4 bg-red-50 rounded-xl text-left mb-6 overflow-auto max-h-40">
              <code className="text-xs text-red-800">{(this as any).state.error?.message}</code>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
              Reîncarcă Pagina
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

const MOCK_LESSONS: Record<Subject, Lesson[]> = {
  romana: [
    { id: 'r1', title: 'Lecția 1: Genul Epic – Structură și Particularități', subject: 'romana', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: 'Analiza elementelor constitutive ale operei epice: acțiune, personaje, timp și spațiu.' },
    { id: 'r2', title: 'Lecția 2: Arta Caracterizării Personajelor', subject: 'romana', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: 'Metode de caracterizare directă și indirectă în textele literare studiate.' },
  ],
  istorie: [
    { id: 'i1', title: 'Lecția 1: Marile Civilizații ale Antichității', subject: 'istorie', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: 'O incursiune în istoria Egiptului, Mesopotamiei și Greciei Antice.' },
    { id: 'i2', title: 'Lecția 2: Formarea Statelor Medievale Românești', subject: 'istorie', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: 'Contextul istoric și etapele constituirii Țării Românești și Moldovei.' },
  ],
  matematica: [
    { id: 'm1', title: 'Lecția 1: Universul Numerelor și Expresii Algebrice', subject: 'matematica', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: 'Recapitulare rapidă a mulțimilor de numere (N, Z, Q, R). Identități fundamentale de calcul prescurtat.' },
    { id: 'm2', title: 'Lecția 2: Lumea Ecuațiilor și Inecuațiilor (Partea I)', subject: 'matematica', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: 'Ecuații de gradul I și II (metoda discriminantului Δ). Inecuații simple de gradul I.' },
    { id: 'm3', title: 'Lecția 3: Sisteme de Ecuații și Inecuații', subject: 'matematica', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: 'Metode de rezolvare a sistemelor de două ecuații cu două necunoscute (substituție, reducere).' },
    { id: 'm4', title: 'Lecția 4: Triunghiul – Regele Geometriei Plane', subject: 'matematica', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: 'Teorema lui Pitagora. Teorema lui Thales. Asemănarea triunghiurilor. Formule de arie.' },
    { id: 'm5', title: 'Lecția 5: Patrulaterul și Cercul', subject: 'matematica', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: 'Proprietățile paralelogramului, dreptunghiului, rombului, pătratului, trapezului. Elementele cercului.' },
    { id: 'm6', title: 'Lecția 6: Introducere în Funcții', subject: 'matematica', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: 'Noțiunea de funcție, domeniu de definiție, codomeniu. Funcția de gradul I.' },
    { id: 'm7', title: 'Lecția 7: Șiruri Numerice și Progresii', subject: 'matematica', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: 'Noțiunea de șir. Progresii aritmetice și geometrice: formula termenului general, formula sumei.' },
    { id: 'm8', title: 'Lecția 8: Elemente de Combinatorică, Statistică și Probabilități', subject: 'matematica', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: 'Regula sumei și produsului. Noțiuni de bază despre evenimente și probabilitate.' },
    { id: 'm9', title: 'Lecția 9: Geometrie în Spațiu (Stereometrie)', subject: 'matematica', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: 'Identificarea corpurilor geometrice (prismă, piramidă, cilindru, con, sferă). Arii și volume.' },
    { id: 'm10', title: 'Lecția 10: Marea Simulare – Strategia de Examen', subject: 'matematica', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: 'Trecerea în revistă a tipurilor de itemi din testele de examen. Sfaturi despre gestionarea timpului.' },
  ]
};

// Local Step type removed, using imported one

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [step, setStep] = useState<Step>('landing');
  const [profile, setProfile] = useState<UserProfile>({ grade: '9' });
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatFullscreen, setIsChatFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    initial: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3 }
  };

  // Test states
  const [testQuestions, setTestQuestions] = useState<TestQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [testFeedback, setTestFeedback] = useState<string | null>(null);
  const [isGeneratingTest, setIsGeneratingTest] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile({ grade: '9' });
      setProgress(0);
      return;
    }

    setIsLoadingProfile(true);
    const userDocRef = doc(db, 'users', user.uid);
    
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        setProfile(data);
        setProgress(data.progress || 0);
        
        // Auto-redirect if profile is complete and we are at a starting step
        if (data.interestDetail && (step === 'landing' || step === 'profiling' || step === 'profiling-detail')) {
          setStep('progress');
        }
      } else {
        // New user, need profiling
        if (step !== 'landing' && !isLoadingProfile) {
          setStep('landing');
        }
      }
      setIsLoadingProfile(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
      setIsLoadingProfile(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Login Error:", err);
      setError("Eroare la autentificare. Te rugăm să încerci din nou.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setStep('landing');
      setIsMenuOpen(false);
    } catch (err) {
      console.error("Logout Error:", err);
    }
  };

  const handleGradeSelect = (grade: '9' | '12') => {
    if (grade === '9') {
      const updatedProfile = { ...profile, grade };
      setProfile(updatedProfile);
      
      // If user already has a subject and interests, skip to progress
      if (profile.subject && profile.interestDetail) {
        setStep('progress');
      } else {
        setStep('subjects');
      }
    }
  };

  const handleSubjectSelect = (subject: Subject) => {
    const updatedProfile = { ...profile, subject };
    setProfile(updatedProfile);
    
    // If user already has interests for this subject or in general, skip profiling
    if (profile.interestDetail) {
      setStep('progress');
    } else {
      setStep('profiling');
    }
  };

  const handleInterestSelect = (category: InterestCategory) => {
    setProfile({ ...profile, interestCategory: category });
    setStep('profiling-detail');
  };

  const handleDetailSubmit = async (detail: string) => {
    const updatedProfile: UserProfile = { 
      ...profile, 
      interestDetail: detail,
      uid: user?.uid,
      name: user?.displayName || 'Elev',
      email: user?.email || '',
      progress: progress,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setProfile(updatedProfile);

    // Save to Firestore
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), updatedProfile);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`);
      }
    }

    if (profile.subject && MOCK_LESSONS[profile.subject] && MOCK_LESSONS[profile.subject].length > 0) {
      const lesson = MOCK_LESSONS[profile.subject][0];
      setCurrentLesson(lesson);
      setStep('lesson');
      sendInitialMessage(updatedProfile, lesson);
    } else {
      setStep('progress');
    }
  };

  const sendInitialMessage = async (p: UserProfile, l: Lesson) => {
    setIsTyping(true);
    try {
      const response = await getTutorResponse(p, l.title, "Salut! Sunt gata să începem lecția. Cum mă poți ajuta să înțeleg mai bine folosind pasiunea mea?");
      setChatMessages([{ role: 'model', text: response || '' }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMsg = inputMessage;
    setInputMessage('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const history = chatMessages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      const response = await getTutorResponse(profile, currentLesson!.title, userMsg, history);
      setChatMessages(prev => [...prev, { role: 'model', text: response || '' }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const startTest = async () => {
    setIsGeneratingTest(true);
    try {
      const questions = await generateTest(profile, currentLesson!.title);
      setTestQuestions(questions);
      setCurrentQuestionIndex(0);
      setTestFeedback(null);
      setStep('test');
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingTest(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitAnswer = async () => {
    if (!inputMessage.trim() && !selectedImage) return;

    setIsTyping(true);
    const currentQuestion = testQuestions[currentQuestionIndex];
    
    try {
      const feedback = await evaluateAnswer(profile, currentQuestion.question, inputMessage, selectedImage || undefined);
      setTestFeedback(feedback || "Eroare la evaluare.");
      setInputMessage('');
      setSelectedImage(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const nextQuestion = async () => {
    if (currentQuestionIndex < testQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTestFeedback(null);
    } else {
      const newProgress = Math.min(progress + 10, 100);
      setProgress(newProgress);
      
      // Update progress in Firestore
      if (user) {
        try {
          await updateDoc(doc(db, 'users', user.uid), { 
            progress: newProgress,
            updatedAt: new Date().toISOString()
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
        }
      }

      setStep('progress'); // Show progress after test
      alert("Felicitări! Ai terminat testul. 🎉");
    }
  };

  const renderTest = () => {
    const currentQuestion = testQuestions[currentQuestionIndex];
    if (!currentQuestion) return null;

    return (
      <motion.div 
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="max-w-3xl mx-auto py-12 px-4"
      >
        <motion.div 
          variants={itemVariants}
          className="mb-8 flex justify-between items-center"
        >
          <h2 className="text-2xl font-bold">Test de verificare: {currentLesson?.title}</h2>
          <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full font-bold">
            Exercițiul {currentQuestionIndex + 1} / {testQuestions.length}
          </span>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="glass p-8 rounded-3xl mb-8 shadow-xl"
        >
          <p className="text-xl font-medium mb-6">{currentQuestion.question}</p>
          {currentQuestion.hint && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-amber-800 text-sm flex gap-3"
            >
              <Sparkles className="shrink-0" size={18} />
              <p><strong>Indiciu:</strong> {currentQuestion.hint}</p>
            </motion.div>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {!testFeedback ? (
            <motion.div 
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="relative">
                <textarea 
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Introdu rezolvarea ta aici..."
                  className="w-full p-6 rounded-3xl glass border-2 border-transparent focus:border-blue-500 outline-none min-h-[150px] text-lg transition-all shadow-md"
                />
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageSelect} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  <motion.button 
                    whileHover={{ scale: 1.1, backgroundColor: "#f8fafc" }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 bg-white text-slate-600 rounded-xl shadow-sm border border-slate-100"
                    title="Încarcă poză cu rezolvarea"
                  >
                    <ImageIcon size={20} />
                  </motion.button>
                </div>
              </div>

              {selectedImage && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="relative inline-block"
                >
                  <img src={selectedImage} alt="Preview" className="h-32 rounded-xl border-2 border-blue-200 shadow-lg" />
                  <button 
                    onClick={() => setSelectedImage(null)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              )}

              <motion.button 
                whileHover={{ scale: 1.02, backgroundColor: "#1d4ed8" }}
                whileTap={{ scale: 0.98 }}
                onClick={submitAnswer}
                disabled={isTyping || (!inputMessage.trim() && !selectedImage)}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
              >
                {isTyping ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                Trimite răspunsul
              </motion.button>
            </motion.div>
          ) : (
            <motion.div 
              key="feedback"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-6"
            >
              <div className="glass p-8 rounded-3xl border-2 border-green-100 shadow-xl">
                <h3 className="text-lg font-bold text-green-700 mb-2 flex items-center gap-2">
                  <Sparkles size={20} /> Feedback de la Tutorele AI
                </h3>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{testFeedback}</p>
              </div>
              <motion.button 
                whileHover={{ scale: 1.02, backgroundColor: "#15803d" }}
                whileTap={{ scale: 0.98 }}
                onClick={nextQuestion}
                className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold text-lg transition-colors shadow-lg shadow-green-200"
              >
                {currentQuestionIndex < testQuestions.length - 1 ? "Următorul exercițiu" : "Finalizează testul"}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const handleContinueExpedition = () => {
    if (!profile.subject) {
      setStep('subjects');
      return;
    }

    const lessons = MOCK_LESSONS[profile.subject];
    
    // If progress is 100, user has finished all lessons. 
    // We can either show the last lesson for review or a completion message.
    // For now, let's allow review of the last lesson if they are at 100%.
    const lessonIndex = Math.min(Math.floor(progress / 10), lessons.length - 1);
    
    // If they just finished a lesson (e.g. progress is 10), 
    // they should move to the next one (index 1).
    // The current logic already does this because progress is updated in nextQuestion.
    
    const nextLesson = lessons[lessonIndex];
    
    if (nextLesson) {
      setCurrentLesson(nextLesson);
      setChatMessages([
        { role: 'model', text: `Salutare, exploratorule! 🧗‍♂️ Suntem la ${nextLesson.title}. Ești gata să continuăm ascensiunea? Urmărește video-ul de mai jos și întreabă-mă orice dacă ai nelămuriri!` }
      ]);
      setStep('lesson');
    } else {
      setStep('subjects');
    }
  };

  const renderProgress = () => {
    // Path for the winding road
    // This is a simplified version of the winding path from the image
    const pathData = "M 200 380 Q 350 340 200 300 Q 50 260 200 220 Q 350 180 200 140 Q 100 110 200 40";
    
    const getClimberPos = (p: number) => {
      // p is 0 to 100
      // We have 4 segments, each roughly 25%
      const segment = Math.min(Math.floor(p / 25), 3);
      const t = segment === 3 && p === 100 ? 1 : (p % 25) / 25;
      
      let x, y;
      if (segment === 0) { // M 200 380 Q 350 340 200 300
        x = (1-t)**2 * 200 + 2*t*(1-t)*350 + t**2 * 200;
        y = (1-t)**2 * 380 + 2*t*(1-t)*340 + t**2 * 300;
      } else if (segment === 1) { // Q 50 260 200 220
        x = (1-t)**2 * 200 + 2*t*(1-t)*50 + t**2 * 200;
        y = (1-t)**2 * 300 + 2*t*(1-t)*260 + t**2 * 220;
      } else if (segment === 2) { // Q 350 180 200 140
        x = (1-t)**2 * 200 + 2*t*(1-t)*350 + t**2 * 200;
        y = (1-t)**2 * 220 + 2*t*(1-t)*180 + t**2 * 140;
      } else { // Q 100 110 200 40
        x = (1-t)**2 * 200 + 2*t*(1-t)*100 + t**2 * 200;
        y = (1-t)**2 * 140 + 2*t*(1-t)*110 + t**2 * 40;
      }
      
      return {
        left: `${(x / 400) * 100}%`,
        bottom: `${((400 - y) / 400) * 100}%`
      };
    };

    const milestones = [
      { p: 10, icon: <span className="text-[10px] font-black">1</span>, label: "Lecția 1" },
      { p: 20, icon: <span className="text-[10px] font-black">2</span>, label: "Lecția 2" },
      { p: 30, icon: <span className="text-[10px] font-black">3</span>, label: "Lecția 3" },
      { p: 40, icon: <span className="text-[10px] font-black">4</span>, label: "Lecția 4" },
      { p: 50, icon: <span className="text-[10px] font-black">5</span>, label: "Lecția 5" },
      { p: 60, icon: <span className="text-[10px] font-black">6</span>, label: "Lecția 6" },
      { p: 70, icon: <span className="text-[10px] font-black">7</span>, label: "Lecția 7" },
      { p: 80, icon: <span className="text-[10px] font-black">8</span>, label: "Lecția 8" },
      { p: 90, icon: <span className="text-[10px] font-black">9</span>, label: "Lecția 9" },
      { p: 100, icon: <Trophy size={16} />, label: "Examen" },
    ];

    return (
      <motion.div 
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="max-w-5xl mx-auto py-12 px-4 text-center"
      >
        <motion.div variants={itemVariants} className="mt-4 mb-12 grid grid-cols-2 gap-6 max-w-md mx-auto">
          <div className="glass p-6 rounded-[2rem] shadow-sm border border-white/50">
            <div className="text-3xl font-black text-blue-600 mb-1">{Math.floor(progress / 10)}</div>
            <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Lecții</div>
          </div>
          <div className="glass p-6 rounded-[2rem] shadow-sm border border-white/50">
            <div className="text-3xl font-black text-green-600 mb-1">{progress}%</div>
            <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Progres</div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-10">
          <h2 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            Misiunea Everest 🏔️
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Fiecare pas te aduce mai aproape de succes. Vizualizează-ți progresul și cucerește vârful!
          </p>
        </motion.div>

        <div className="relative h-[700px] w-full max-w-4xl mx-auto bg-gradient-to-b from-blue-50 to-white rounded-[4rem] overflow-hidden border-[14px] border-white shadow-2xl group/mountain">
          {/* Sky background */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-100/50 to-transparent" />
          
          {/* Clouds */}
          <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-white via-white/80 to-transparent z-10" />
          
          <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full">
            <defs>
              <linearGradient id="mountainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#dbeafe', stopOpacity: 1 }} />
              </linearGradient>
              <filter id="softShadow">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1" />
              </filter>
            </defs>

            {/* Mountain Shape */}
            <path 
              d="M 200 20 L 380 380 L 20 380 Z" 
              fill="url(#mountainGrad)" 
              stroke="#bfdbfe" 
              strokeWidth="1"
            />
            
            {/* Mountain Details/Shading */}
            <path d="M 200 20 L 250 150 L 200 180 L 150 150 Z" fill="#eff6ff" opacity="0.5" />
            <path d="M 200 20 L 220 80 L 180 80 Z" fill="white" />

            {/* The Winding Path - Background (Incomplete) */}
            <path 
              id="mountainPath"
              d={pathData}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="24"
              strokeLinecap="round"
            />

            {/* The Winding Path - Progress (Orange) */}
            <motion.path 
              d={pathData}
              fill="none"
              stroke="#f97316"
              strokeWidth="24"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: progress / 100 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />

            {/* Path Outline */}
            <path 
              d={pathData}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="26"
              strokeLinecap="round"
              opacity="0.1"
              style={{ pointerEvents: 'none' }}
            />
          </svg>

          {/* Milestones / Icons */}
          {milestones.map((m, i) => {
            // Precise positions along the path
            const positions = [
              { bottom: '13%', left: '68%' },   // 10%
              { bottom: '21%', left: '62%' },   // 20%
              { bottom: '29%', left: '38%' },   // 30%
              { bottom: '37%', left: '32%' },   // 40%
              { bottom: '45%', left: '50%' },   // 50%
              { bottom: '53%', left: '68%' },   // 60%
              { bottom: '61%', left: '62%' },   // 70%
              { bottom: '68%', left: '42%' },   // 80%
              { bottom: '78%', left: '38%' },   // 90%
              { bottom: '90%', left: '50%' },   // 100%
            ];
            const pos = positions[i];

            return (
              <div 
                key={m.p}
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                style={{ 
                  bottom: pos.bottom, 
                  left: pos.left
                }}
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shadow-lg transition-colors ${
                    progress >= m.p ? 'bg-white border-blue-400 text-blue-600' : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  {m.icon}
                </motion.div>
                <div className="mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                  {m.label}
                </div>
              </div>
            );
          })}

          {/* The Climber */}
          <motion.div 
            initial={false}
            animate={getClimberPos(progress)}
            transition={{ type: "spring", stiffness: 30, damping: 15 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
          >
            <div className="relative">
              <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="bg-orange-500 p-2 rounded-full shadow-xl border-2 border-white text-white"
              >
                <UserIcon size={20} />
              </motion.div>
              {/* Progress Tooltip */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap">
                {progress}%
              </div>
            </div>
          </motion.div>

          {/* Summit Flag */}
          <div className="absolute top-[5%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-40">
            <motion.div
              animate={{ rotate: [-5, 5, -5] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Flag size={32} className="text-blue-500 fill-blue-100" />
            </motion.div>
          </div>
        </div>

        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleContinueExpedition}
          className="mt-12 px-12 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-xl shadow-xl shadow-blue-200 transition-all mb-20"
        >
          CONTINUĂ EXPEDIȚIA 🧗‍♂️
        </motion.button>
      </motion.div>
    );
  };

  const renderAuth = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-md mx-auto text-center py-20 px-4"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-200">
          <Trophy size={48} className="text-white" />
        </div>
        <h1 className="text-4xl font-black mb-4">Bine ai venit la Everest!</h1>
        <p className="text-slate-600">Autentifică-te pentru a-ți salva progresul și a continua expediția cunoașterii.</p>
      </motion.div>

      <motion.button
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleLogin}
        className="w-full py-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-lg shadow-sm flex items-center justify-center gap-3 hover:border-blue-500 transition-all"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
        Continuă cu Google
      </motion.button>
      
      {error && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-red-500 text-sm font-medium"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );

  const renderLanding = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="max-w-4xl mx-auto text-center py-12 px-4"
    >
      <motion.h1 
        variants={itemVariants}
        className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
      >
        Salut, viitorule campion! 🚀
      </motion.h1>
      <motion.p 
        variants={itemVariants}
        className="text-xl text-slate-600 mb-12 leading-relaxed"
      >
        Ești gata să cucerești examenele? Aici, învățarea nu e plictisitoare. 
        Folosim AI pentru a-ți explica totul prin prisma pasiunilor tale. 
        E ca și cum ai învăța istoria prin strategii de gaming sau româna prin scenarii de film.
      </motion.p>

      <motion.div 
        variants={containerVariants}
        className="grid md:grid-cols-2 gap-8"
      >
        <motion.button 
          variants={itemVariants}
          whileHover={{ scale: 1.02, translateY: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleGradeSelect('9')}
          className="group relative p-8 rounded-3xl glass hover:border-blue-500 transition-all duration-300 text-left overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BookOpen size={120} />
          </div>
          <h3 className="text-2xl font-bold mb-2">Clasa a 9-a</h3>
          <p className="text-slate-500">Pregătire intensă pentru examenele de absolvire a gimnaziului.</p>
          <div className="mt-6 flex items-center text-blue-600 font-semibold">
            Începe acum <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.button>

        <motion.div 
          variants={itemVariants}
          className="relative p-8 rounded-3xl glass opacity-60 cursor-not-allowed text-left overflow-hidden"
        >
          <div className="absolute top-4 right-4 bg-slate-200 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">
            ÎN CURÂND
          </div>
          <h3 className="text-2xl font-bold mb-2">Clasa a 12-a</h3>
          <p className="text-slate-500">Pregătire pentru Bacalaureat. Revenim în curând cu materiale noi.</p>
        </motion.div>
      </motion.div>
    </motion.div>
  );

  const renderSubjects = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="max-w-4xl mx-auto py-12 px-4"
    >
      <motion.button 
        variants={itemVariants}
        whileHover={{ x: -5 }}
        onClick={() => setStep('landing')} 
        className="mb-8 flex items-center text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft size={20} className="mr-2" /> Înapoi
      </motion.button>
      <motion.h2 variants={itemVariants} className="text-3xl font-bold mb-8 text-center">Alege disciplina pe care vrei să o stăpânești:</motion.h2>
      <motion.div variants={containerVariants} className="grid md:grid-cols-3 gap-6">
        {SUBJECTS.map((s) => (
          <motion.button
            key={s.id}
            variants={itemVariants}
            whileHover={(s.status as string) === 'active' ? { scale: 1.05, rotateZ: 1 } : {}}
            whileTap={(s.status as string) === 'active' ? { scale: 0.95 } : {}}
            onClick={() => (s.status as string) === 'active' && handleSubjectSelect(s.id as Subject)}
            className={`p-8 rounded-3xl glass transition-all text-center group relative ${
              (s.status as string) === 'active' 
                ? 'hover:border-blue-500 hover:shadow-2xl cursor-pointer' 
                : 'opacity-60 cursor-not-allowed'
            }`}
          >
            {(s.status as string) === 'soon' && (
              <div className="absolute top-4 right-4 bg-slate-200 text-slate-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                În curând
              </div>
            )}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform ${
              (s.status as string) === 'active' ? 'bg-blue-50 group-hover:scale-110' : 'bg-slate-100'
            }`}>
              {s.id === 'romana' && <BookOpen className={(s.status as string) === 'active' ? 'text-blue-600' : 'text-slate-400'} size={32} />}
              {s.id === 'istorie' && <History className={(s.status as string) === 'active' ? 'text-blue-600' : 'text-slate-400'} size={32} />}
              {s.id === 'matematica' && <Calculator className={(s.status as string) === 'active' ? 'text-blue-600' : 'text-slate-400'} size={32} />}
            </div>
            <span className={`font-bold text-lg block ${(s.status as string) === 'active' ? 'text-slate-900' : 'text-slate-500'}`}>
              {s.name}
            </span>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );

  const renderProfiling = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="max-w-2xl mx-auto py-12 px-4 text-center"
    >
      <motion.h2 variants={itemVariants} className="text-3xl font-bold mb-4">E timpul să personalizăm experiența! ✨</motion.h2>
      <motion.p variants={itemVariants} className="text-slate-600 mb-10 text-lg">Ce te pasionează cel mai mult în timpul liber?</motion.p>
      <motion.div variants={containerVariants} className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {INTEREST_CATEGORIES.map((cat) => (
          <motion.button
            key={cat}
            variants={itemVariants}
            whileHover={{ scale: 1.05, backgroundColor: "var(--color-primary)", color: "white" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleInterestSelect(cat)}
            className="p-6 rounded-2xl glass transition-all flex flex-col items-center gap-3"
          >
            {cat === 'Gaming' && <Gamepad2 size={32} />}
            {cat === 'Filme' && <Film size={32} />}
            {cat === 'Sport' && <Trophy size={32} />}
            {cat === 'Muzică' && <Music size={32} />}
            {cat === 'Tehnologie' && <Cpu size={32} />}
            <span className="font-semibold">{cat}</span>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );

  const renderProfilingDetail = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="max-w-xl mx-auto py-12 px-4 text-center"
    >
      <motion.h2 variants={itemVariants} className="text-3xl font-bold mb-6">Cool! {profile.interestCategory} e super. 🤩</motion.h2>
      <motion.p variants={itemVariants} className="text-slate-600 mb-8 text-lg">
        {profile.interestCategory === 'Filme' && "Care este filmul tău preferat sau ce gen de filme preferi?"}
        {profile.interestCategory === 'Gaming' && "Ce jocuri te joci cel mai des?"}
        {profile.interestCategory === 'Sport' && "Ce sport practici sau urmărești cu pasiune?"}
        {profile.interestCategory === 'Muzică' && "Ce gen de muzică asculți sau la ce instrument cânți?"}
        {profile.interestCategory === 'Tehnologie' && "Ce te atrage în tehnologie? (Gadget-uri, programare, AI?)"}
      </motion.p>
      <motion.form 
        variants={itemVariants}
        onSubmit={(e) => {
          e.preventDefault();
          const val = (e.target as any).detail.value;
          if (val) handleDetailSubmit(val);
        }}
      >
        <input 
          name="detail"
          autoFocus
          placeholder="Scrie aici..."
          className="w-full p-4 rounded-2xl border-2 border-slate-200 focus:border-blue-500 outline-none text-lg mb-6 transition-colors"
        />
        <motion.button 
          whileHover={{ scale: 1.02, backgroundColor: "#1d4ed8" }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg transition-colors shadow-lg shadow-blue-200"
        >
          Să începem lecția!
        </motion.button>
      </motion.form>
    </motion.div>
  );

  const renderLesson = () => {
    if (!currentLesson) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <Loader2 className="animate-spin text-blue-600" size={48} />
          <p className="text-slate-600">Se încarcă lecția...</p>
          <button onClick={() => setStep('progress')} className="text-blue-600 underline">Înapoi la progres</button>
        </div>
      );
    }

    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={`max-w-7xl mx-auto py-8 px-4 grid ${isChatFullscreen ? 'grid-cols-1' : 'lg:grid-cols-3'} gap-8 min-h-[calc(100vh-120px)] relative`}
      >
        {!isChatFullscreen && (
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-2 flex flex-col gap-6"
          >
            <motion.div variants={itemVariants} className="flex justify-between items-center mb-2">
              <button 
                onClick={() => setStep('progress')}
                className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors font-medium"
              >
                <ChevronRight className="rotate-180" size={20} /> Înapoi la expediție
              </button>
              <div className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
                {profile.subject} • Lecția {Math.floor(progress / 10) + 1}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="glass rounded-3xl overflow-hidden aspect-video relative shadow-2xl bg-black">
              <iframe 
                key={currentLesson.id}
                src={currentLesson.videoUrl}
                className="absolute inset-0 w-full h-full"
                title="Lesson Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
            <motion.div variants={itemVariants} className="glass p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg">
              <div>
                <h2 className="text-2xl font-bold mb-2">{currentLesson.title}</h2>
                <p className="text-slate-600">{currentLesson.description}</p>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05, backgroundColor: "#15803d" }}
                whileTap={{ scale: 0.95 }}
                onClick={startTest}
                disabled={isGeneratingTest}
                className="bg-green-600 text-white px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-green-100 disabled:opacity-50 whitespace-nowrap"
              >
                {isGeneratingTest ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
                Am înțeles lecția
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        <motion.div 
          variants={itemVariants}
          className={`flex flex-col glass rounded-3xl overflow-hidden border-blue-100 border-2 shadow-xl transition-all duration-500 ${
            isChatFullscreen 
              ? 'fixed inset-4 z-[100] bg-white/95 backdrop-blur-xl' 
              : 'h-full'
          }`}
        >
          <div className="p-4 bg-blue-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-bold">Tutore AI Personalizat</h3>
                <p className="text-xs opacity-80">Expert în {profile.subject} & {profile.interestCategory}</p>
              </div>
            </div>
            <button 
              onClick={() => setIsChatFullscreen(!isChatFullscreen)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title={isChatFullscreen ? "Minimizează" : "Full Screen"}
            >
              {isChatFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
            {chatMessages.map((msg, i) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] p-4 rounded-2xl text-base leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 flex gap-1.5">
                  <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-blue-400 rounded-full" />
                  <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-blue-400 rounded-full" />
                  <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-blue-400 rounded-full" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-6 bg-white border-t border-slate-100">
            <div className="relative max-w-4xl mx-auto">
              <input 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Întreabă orice despre lecție..."
                className="w-full p-4 pr-14 rounded-2xl bg-slate-100 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none text-base transition-all shadow-inner"
              />
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSendMessage}
                disabled={isTyping}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors disabled:opacity-50"
              >
                <Send size={22} />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-600" size={48} />
          <p className="text-slate-600 font-medium">Se încarcă expediția...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full relative z-50">
        <div 
          onClick={() => setStep('landing')}
          className="flex items-center gap-2 font-bold text-xl text-blue-600 cursor-pointer"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            E
          </div>
          <span>EverestStudy</span>
        </div>
        
        <div className="flex items-center gap-4">
          {step !== 'landing' && (
            <div className="hidden md:flex items-center gap-4 text-sm text-slate-500 mr-4">
              <span className={step === 'subjects' ? 'text-blue-600 font-bold' : ''}>Discipline</span>
              <ChevronRight size={14} />
              <span className={step.includes('profiling') ? 'text-blue-600 font-bold' : ''}>Profil</span>
              <ChevronRight size={14} />
              <span className={step === 'lesson' ? 'text-blue-600 font-bold' : ''}>Lecție</span>
            </div>
          )}
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Navigation Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full right-6 mt-2 w-64 glass rounded-3xl shadow-2xl border border-white/50 p-4 flex flex-col gap-2 z-50"
            >
              <button 
                onClick={() => { setStep('landing'); setIsMenuOpen(false); }}
                className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-xl transition-colors text-slate-700 font-medium"
              >
                <Home size={20} className="text-blue-600" /> Acasă
              </button>
              <button 
                onClick={() => { setStep('progress'); setIsMenuOpen(false); }}
                className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-xl transition-colors text-slate-700 font-medium"
              >
                <Mountain size={20} className="text-blue-600" /> Progresul Meu (Everest)
              </button>
              <button 
                onClick={() => { setStep('subjects'); setIsMenuOpen(false); }}
                className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-xl transition-colors text-slate-700 font-medium"
              >
                <BookOpen size={20} className="text-blue-600" /> Discipline
              </button>
              <div className="h-px bg-slate-100 my-2" />
              <div className="p-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Progres Curent</div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-blue-600"
                  />
                </div>
                <div className="text-right text-[10px] font-bold text-blue-600 mt-1">{progress}%</div>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 p-3 hover:bg-red-50 rounded-xl transition-colors text-red-600 font-medium mt-2"
              >
                <X size={20} /> Deconectare
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">
        {!user ? renderAuth() : (
          <AnimatePresence mode="wait">
            {step === 'landing' && renderLanding()}
            {step === 'subjects' && renderSubjects()}
            {step === 'profiling' && renderProfiling()}
            {step === 'profiling-detail' && renderProfilingDetail()}
            {step === 'lesson' && renderLesson()}
            {step === 'test' && renderTest()}
            {step === 'progress' && renderProgress()}
          </AnimatePresence>
        )}
      </main>

      <footer className="p-8 text-center text-slate-400 text-sm">
        &copy; 2026 EverestStudy. Creat cu ❤️ pentru elevii din Moldova.
      </footer>
    </div>
    </ErrorBoundary>
  );
}
