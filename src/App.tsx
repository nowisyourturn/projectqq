import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, CreditCard, Home as HomeIcon, Layout, LogOut, Menu, User, X, CheckCircle, Lock, MessageSquare, Send, Sparkles } from "lucide-react";
import { cn } from "./lib/utils";
import { lessons, Lesson } from "./data/lessons";
import { simulateAIResponse } from "./services/aiSimulation";

// --- Components ---

const Navbar = ({ isSubscribed, onLogout }: { isSubscribed: boolean; onLogout: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: "Acasă", path: "/", icon: HomeIcon },
    { name: "Lecții", path: "/lessons", icon: BookOpen },
    { name: "Abonament", path: "/subscription", icon: CreditCard },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">EverestStudy</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-indigo-600 flex items-center gap-2",
                  location.pathname === item.path ? "text-indigo-600" : "text-gray-600"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            ))}
            <button
              onClick={onLogout}
              className="text-sm font-medium text-gray-600 hover:text-red-600 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Ieșire
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white border-b border-gray-100 px-4 pt-2 pb-6 space-y-1"
          >
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium flex items-center gap-3",
                  location.pathname === item.path ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}
            <button
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 flex items-center gap-3"
            >
              <LogOut className="w-5 h-5" />
              Ieșire
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// --- Pages ---

const Home = () => {
  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Învață Engleză cu <span className="text-indigo-600">EverestStudy</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Platforma ta de studiu asistată de AI, creată special pentru elevii din Moldova. 
            Prima lecție este <span className="font-bold text-indigo-600 underline decoration-2 underline-offset-4">GRATUITĂ</span>. 
            Continuă călătoria ta pentru doar 199 MDL/lună.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/lessons"
              className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
            >
              Începe Acum <Sparkles className="w-5 h-5" />
            </Link>
            <Link
              to="/subscription"
              className="px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              Vezi Abonamentele <CreditCard className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative"
        >
          <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="https://picsum.photos/seed/education/800/800"
              alt="Learning"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 hidden sm:block">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="text-green-600 w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Prima Lecție Gratis</p>
                <p className="text-xs text-gray-500">Disponibilă acum</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-24 grid md:grid-cols-3 gap-8">
        {[
          { title: "Personalizat", desc: "AI-ul se adaptează nivelului tău de cunoștințe.", icon: Sparkles },
          { title: "Accesibil", desc: "Doar 199 MDL pe lună pentru acces nelimitat.", icon: CreditCard },
          { title: "Eficient", desc: "Lecții scurte și interactive pentru rezultate rapide.", icon: Layout },
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6">
              <feature.icon className="text-indigo-600 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const Lessons = ({ isSubscribed }: { isSubscribed: boolean }) => {
  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Lecțiile Tale</h2>
        <p className="text-gray-600">Alege o lecție pentru a începe studiul.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {lessons.map((lesson, i) => (
          <motion.div
            key={lesson.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all"
          >
            <div className="relative aspect-video">
              <img
                src={lesson.thumbnail}
                alt={lesson.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              {!lesson.isFree && !isSubscribed && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                  <div className="bg-white/90 p-3 rounded-full shadow-lg">
                    <Lock className="w-6 h-6 text-gray-900" />
                  </div>
                </div>
              )}
              {lesson.isFree && (
                <div className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  GRATIS
                </div>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{lesson.title}</h3>
              <p className="text-gray-600 text-sm mb-6 line-clamp-2">{lesson.description}</p>
              {lesson.isFree || isSubscribed ? (
                <Link
                  to={`/lesson/${lesson.id}`}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                  Începe Lecția <BookOpen className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  to="/subscription"
                  className="w-full py-3 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  Deblochează cu Abonament <CreditCard className="w-4 h-4" />
                </Link>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const LessonDetail = ({ isSubscribed }: { isSubscribed: boolean }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lesson = lessons.find((l) => l.id === id);
  const [messages, setMessages] = useState<{ text: string; isAI: boolean }[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!lesson) {
      navigate("/lessons");
      return;
    }

    if (!lesson.isFree && !isSubscribed) {
      navigate("/subscription");
      return;
    }

    // Initial AI message
    setMessages([{ text: `Salut! Sunt gata să te ajut cu lecția: "${lesson.title}". Ai vreo întrebare despre conținutul de mai jos?`, isAI: true }]);
  }, [lesson, isSubscribed, navigate]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput("");
    setMessages((prev) => [...prev, { text: userMsg, isAI: false }]);
    setIsTyping(true);

    const aiMsg = await simulateAIResponse(userMsg);
    setMessages((prev) => [...prev, { text: aiMsg, isAI: true }]);
    setIsTyping(false);
  };

  if (!lesson) return null;

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-3 gap-8 h-[calc(100vh-12rem)]">
        {/* Lesson Content */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-y-auto p-8">
          <Link to="/lessons" className="text-indigo-600 text-sm font-medium hover:underline mb-6 inline-block">
            ← Înapoi la lecții
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{lesson.title}</h1>
          <div className="aspect-video rounded-2xl overflow-hidden mb-8 shadow-inner bg-gray-100">
             <img src={lesson.thumbnail} alt={lesson.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="prose prose-indigo max-w-none">
            <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
              {lesson.content}
            </p>
            <div className="mt-12 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
              <h3 className="text-indigo-900 font-bold mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5" /> Sfat de la AI
              </h3>
              <p className="text-indigo-800 text-sm">
                Încearcă să repeți cu voce tare fiecare cuvânt nou învățat. Pronunția este cheia succesului în limba engleză!
              </p>
            </div>
          </div>
        </div>

        {/* AI Chat */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shadow-md">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Asistent AI Everest</p>
              <p className="text-[10px] text-green-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Online
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex", msg.isAI ? "justify-start" : "justify-end")}>
                <div
                  className={cn(
                    "max-w-[85%] p-3 rounded-2xl text-sm shadow-sm",
                    msg.isAI ? "bg-gray-100 text-gray-800 rounded-tl-none" : "bg-indigo-600 text-white rounded-tr-none"
                  )}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Întreabă ceva..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <button
                onClick={handleSend}
                className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-colors shadow-md"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Subscription = ({ onSubscribe }: { onSubscribe: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePayment = () => {
    setLoading(true);
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      onSubscribe();
    }, 2000);
  };

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-6">Alege Planul EverestStudy</h2>
        <p className="text-xl text-gray-600">
          Investește în viitorul tău. Prima lecție este gratuită, dar pentru a debloca întregul potențial al AI-ului, alege abonamentul lunar.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Plan Gratuit</h3>
            <p className="text-gray-500 text-sm">Pentru a testa platforma</p>
          </div>
          <div className="text-4xl font-extrabold text-gray-900 mb-8">
            0 MDL <span className="text-lg font-normal text-gray-500">/ lună</span>
          </div>
          <ul className="space-y-4 mb-12 flex-1">
            <li className="flex items-center gap-3 text-gray-600">
              <CheckCircle className="text-green-500 w-5 h-5" /> Prima lecție inclusă
            </li>
            <li className="flex items-center gap-3 text-gray-400">
              <X className="w-5 h-5" /> Acces la toate lecțiile
            </li>
            <li className="flex items-center gap-3 text-gray-400">
              <X className="w-5 h-5" /> Suport AI nelimitat
            </li>
          </ul>
          <Link
            to="/lessons"
            className="w-full py-4 border border-gray-200 text-gray-900 rounded-2xl font-bold hover:bg-gray-50 transition-colors text-center"
          >
            Încearcă Acum
          </Link>
        </div>

        {/* Paid Plan */}
        <div className="bg-indigo-600 p-8 rounded-3xl shadow-2xl shadow-indigo-200 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-indigo-500 p-3 rounded-bl-3xl">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">Plan Premium</h3>
            <p className="text-indigo-100 text-sm">Acces complet la cunoaștere</p>
          </div>
          <div className="text-4xl font-extrabold text-white mb-8">
            199 MDL <span className="text-lg font-normal text-indigo-200">/ lună</span>
          </div>
          <ul className="space-y-4 mb-12 flex-1">
            <li className="flex items-center gap-3 text-white">
              <CheckCircle className="text-indigo-300 w-5 h-5" /> Acces la TOATE lecțiile
            </li>
            <li className="flex items-center gap-3 text-white">
              <CheckCircle className="text-indigo-300 w-5 h-5" /> Asistent AI personalizat 24/7
            </li>
            <li className="flex items-center gap-3 text-white">
              <CheckCircle className="text-indigo-300 w-5 h-5" /> Exerciții interactive nelimitate
            </li>
            <li className="flex items-center gap-3 text-white">
              <CheckCircle className="text-indigo-300 w-5 h-5" /> Certificat de finalizare
            </li>
          </ul>
          {success ? (
            <div className="w-full py-4 bg-green-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2">
              Abonat cu Succes! <CheckCircle className="w-5 h-5" />
            </div>
          ) : (
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-bold hover:bg-indigo-50 transition-colors shadow-lg disabled:opacity-50"
            >
              {loading ? "Se procesează..." : "Abonează-te Acum"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

const App = () => {
  const [isSubscribed, setIsSubscribed] = useState(() => {
    return localStorage.getItem("everest_subscribed") === "true";
  });

  const handleSubscribe = () => {
    setIsSubscribed(true);
    localStorage.setItem("everest_subscribed", "true");
  };

  const handleLogout = () => {
    setIsSubscribed(false);
    localStorage.removeItem("everest_subscribed");
    window.location.href = "/";
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-indigo-100 selection:text-indigo-900">
        <Navbar isSubscribed={isSubscribed} onLogout={handleLogout} />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/lessons" element={<Lessons isSubscribed={isSubscribed} />} />
            <Route path="/lesson/:id" element={<LessonDetail isSubscribed={isSubscribed} />} />
            <Route path="/subscription" element={<Subscription onSubscribe={handleSubscribe} />} />
          </Routes>
        </main>
        
        <footer className="bg-white border-t border-gray-100 py-12 mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center items-center gap-2 mb-6">
              <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
                <Sparkles className="text-white w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-gray-900">EverestStudy</span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2026 EverestStudy. Creat cu ❤️ pentru elevii din Moldova.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

// --- Helper for useParams ---
import { useParams } from "react-router-dom";

export default App;
