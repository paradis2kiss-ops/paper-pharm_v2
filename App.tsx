
import React, { useState, useEffect } from 'react';
import { LibraryBig, MapPin, Moon, Sun, RotateCcw, AlertTriangle, PenLine, Sparkles, Bookmark } from 'lucide-react';
import getBookRecommendations from './services/geminiService';
import type { UserInput, BookRecommendationWithId } from './types';
import CherryBlossom from './components/CherryBlossom';
import RecommendationPopup from './components/RecommendationPopup';
import HistoryModal from './components/HistoryModal';

const App: React.FC = () => {
  const [userInput, setUserInput] = useState<UserInput>({
    mood: '',
    situation: '',
    genre: '',
    purpose: ''
  });
  
  const [selectedRegion, setSelectedRegion] = useState('서울');
  const [recommendations, setRecommendations] = useState<BookRecommendationWithId[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // Default is Day mode (false)
  const [isDarkMode, setIsDarkMode] = useState(false); 
  const [showWelcome, setShowWelcome] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  // Bookmark State
  const [savedBooks, setSavedBooks] = useState<BookRecommendationWithId[]>(() => {
    try {
      const saved = localStorage.getItem('savedBooks');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Save bookmarks to local storage
  useEffect(() => {
    localStorage.setItem('savedBooks', JSON.stringify(savedBooks));
  }, [savedBooks]);

  const handleToggleBookmark = (book: BookRecommendationWithId) => {
    setSavedBooks(prev => {
      const isSaved = prev.some(b => b.id === book.id);
      if (isSaved) {
        return prev.filter(b => b.id !== book.id);
      } else {
        return [book, ...prev];
      }
    });
  };

  const moodOptions = [
    { emoji: '😭', label: '마음이 무거워요', value: 'heavy', description: '슬픔이 가득해요', colorClass: 'text-blue-500' },
    { emoji: '✨', label: '반짝반짝 행복', value: 'sparkly', description: '기분 최고조!', colorClass: 'text-yellow-500' },
    { emoji: '😰', label: '불안불안', value: 'anxious', description: '마음이 복잡해요', colorClass: 'text-blue-400' },
    { emoji: '🌙', label: '고요한 밤', value: 'calm', description: '평온이 필요해요', colorClass: 'text-indigo-300' },
    { emoji: '🔥', label: '열받아요', value: 'angry', description: '화가 나네요', colorClass: 'text-red-500' },
    { emoji: '🤔', label: '생각 많은 중', value: 'thoughtful', description: '고민이 있어요', colorClass: 'text-amber-500' }
  ];
  
  const genreOptions = [
    { name: '눈물 콧물 멈춰! (로맨스/감동)', emoji: '😭' },
    { name: '자, 드가자! (판타지/SF)', emoji: '🚀' },
    { name: '내가 그걸 모를까...? (실용서/지식)', emoji: '🧠' },
    { name: '갓생은 바라지도 않아 (일상 에세이)', emoji: '🏡' },
    { name: '하룰라라 여행 (여행/자기계발)', emoji: '🧭' },
    { name: '범인 이즈 마이 베이비 (미스터리)', emoji: '⏳' },
    { name: '분할 브이로그 (예술/취미)', emoji: '🎨' },
    { name: '맛잘알? ㄴㄴ 역잘알! (역사)', emoji: '🍳' },
    { name: '하면 해 ㅋㅋ (베스트셀러)', emoji: '⚡' },
  ];

  const handleGetLocation = () => {
    if (location) {
      setLocation(null);
      setLocationError(null);
      return;
    }

    setLocationError(null);
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            () => {
                setLocationError('위치 정보를 가져올 수 없습니다. 브라우저 권한을 확인해주세요.');
            }
        );
    } else {
        setLocationError('이 브라우저에서는 위치 정보 기능을 지원하지 않습니다.');
    }
  };

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setActiveStep(1);
    setError(null);
    setIsPopupOpen(false);

    try {
      const results = await getBookRecommendations(userInput, selectedRegion, [], location);
      const resultsWithIds: BookRecommendationWithId[] = results.map(book => ({
        ...book,
        id: `${book.isbn || book.title}-${book.author}`
      }));
      setRecommendations(resultsWithIds);
      setActiveStep(2);
      setIsPopupOpen(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      setError(errorMessage);
      setActiveStep(0);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleInputChange = (field: keyof UserInput, value: string) => {
    setUserInput(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userInput.mood) { 
      alert('기분은 꼭 선택해주세요! 🙏');
      return;
    }
    fetchRecommendations();
  };
  
  const handleResetForm = () => {
    setUserInput({
      mood: '',
      situation: '',
      genre: '',
      purpose: '',
    });
    setError(null);
    setActiveStep(0);
    setRecommendations([]);
    setLocation(null);
    setLocationError(null);
    setSelectedRegion('서울');
  };

  return (
    <div className={`min-h-screen transition-colors duration-1000 font-body relative overflow-x-hidden
        ${isDarkMode ? 'bg-dawn-gradient text-night-text' : 'bg-day-bg text-day-text'}`}>
      
      {/* Background Texture for Parchment/Night */}
      <div className="noise-bg"></div>
      
      {/* Day mode specific brick pattern */}
      <div id="brick-bg" className={isDarkMode ? 'opacity-0' : 'opacity-10'}></div>
      
      <CherryBlossom />
      
      {/* Toggle Button - Fixed top right */}
      <div className="fixed top-4 right-4 z-50">
          <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`relative inline-flex items-center h-[28px] w-[48px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none 
            ${isDarkMode ? 'bg-night-card shadow-inner border border-white/20' : 'bg-day-card shadow-inner'}`}
        >
          <span className="sr-only">Use setting</span>
          <span
            aria-hidden="true"
            className={`${isDarkMode ? 'translate-x-5 bg-white' : 'translate-x-0 bg-day-accent'}
              pointer-events-none inline-block h-[20px] w-[20px] transform rounded-full shadow-sm ring-0 transition duration-300 ease-in-out flex items-center justify-center`}
          >
              {isDarkMode ? <Moon size={12} className="text-night-cta" /> : <Sun size={12} className="text-white" />}
          </span>
        </button>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-3 md:px-4 py-8 md:p-8 flex flex-col justify-center min-h-screen">
        
        <div className="flex justify-center w-full">
          {/* Main Container: Parchment Roll on Mobile, Open Book on Desktop */}
          <div className={`w-full max-w-md md:max-w-4xl lg:max-w-7xl transition-all duration-500 animate-fade-in-up relative overflow-hidden
              ${isDarkMode 
                ? 'lg:bg-night-card lg:backdrop-blur-md lg:border lg:border-white/20 bg-night-scroll backdrop-blur-sm border-x border-white/10' 
                : 'bg-day-card'
              }
              /* Mobile: Parchment Roll Styles */
              rounded-[2.5rem] shadow-parchment
              lg:rounded-3xl lg:shadow-2xl
              p-6 md:p-10
              `}
          >
            
            {/* Texture Overlay (Inner Paper Texture) */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0 mix-blend-overlay"
                style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    backgroundSize: '150px 150px'
                }}
            />

            {/* Mobile Scroll Roll Effect (Top/Bottom Gradients) */}
            <div className="lg:hidden absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/10 to-transparent pointer-events-none z-10" />
            <div className="lg:hidden absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/10 to-transparent pointer-events-none z-10" />
            
            <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row relative z-20">
              
              {/* --- Left Page (Desktop) / Top Scroll (Mobile) --- */}
              <div className={`w-full lg:w-1/2 flex flex-col lg:pr-12 transition-all duration-300 relative 
                  ${isDarkMode ? 'lg:border-r lg:border-white/10' : 'lg:border-r lg:border-black/5'}`}>
                
                {/* 1. Header Section */}
                <div className="flex flex-col items-center justify-center mb-6 lg:mb-10 text-center pt-4 lg:pt-0">
                  <div className={`p-3 rounded-full mb-4 shadow-sm ${isDarkMode ? 'bg-white/10 backdrop-blur-sm' : 'bg-white/60'}`}>
                      <LibraryBig className={`w-8 h-8 md:w-10 md:h-10 ${isDarkMode ? 'text-white' : 'text-day-accent'}`} />
                  </div>
                  
                  <div className="flex items-center gap-3 mb-3 relative">
                    <h1 className={`text-3xl md:text-5xl font-body font-bold tracking-tight ${isDarkMode ? 'text-white drop-shadow-md' : 'text-day-text'}`}>
                      종이약국
                    </h1>
                    <button 
                      type="button"
                      onClick={() => setIsHistoryOpen(true)}
                      className={`relative p-2 rounded-full transition-all hover:scale-110 active:scale-95
                        ${isDarkMode ? 'bg-white/10 text-yellow-300 hover:bg-white/20' : 'bg-white/50 text-day-accent hover:bg-white/80'}`}
                      aria-label="저장된 처방전 보기"
                    >
                      <Bookmark className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                      {savedBooks.length > 0 && (
                        <span className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full border border-white dark:border-night-card shadow-sm animate-bounce 
                            ${isDarkMode ? 'bg-red-500' : 'bg-red-500'}`}></span>
                      )}
                    </button>
                  </div>

                  <p className={`text-base md:text-lg font-surround opacity-90 ${isDarkMode ? 'text-night-sub' : 'text-day-sub'}`}>
                      당신의 감정을 위한 책 처방전
                  </p>
                </div>

                {/* 2. Mood Section */}
                <div className="mb-6 lg:mb-10">
                  <div className="flex justify-between items-center mb-4">
                     <label className={`block text-lg md:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-day-text'}`}>지금 기분은 어때요? (필수)</label>
                     <button onClick={handleResetForm} type="button" className={`p-1.5 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10 text-night-sub' : 'hover:bg-black/5 text-day-sub'}`} aria-label="Reset form">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 lg:gap-4">
                    {moodOptions.map(mood => (
                      <button 
                          key={mood.value} 
                          type="button" 
                          onClick={() => handleInputChange('mood', mood.label)} 
                          className={`group p-2 sm:p-3 flex flex-col items-center justify-center rounded-2xl border transition-all duration-300 hover:scale-105 hover:shadow-md min-h-[100px] lg:min-h-[130px]
                              ${userInput.mood === mood.label 
                                  ? (isDarkMode 
                                      ? 'bg-white/20 border-white text-white shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-105' 
                                      : 'bg-day-bg border-day-accent text-day-text shadow-day scale-105') 
                                  : (isDarkMode 
                                      ? 'bg-night-btn border-transparent hover:bg-white/10 text-night-text' 
                                      : 'bg-day-btn border-transparent hover:bg-day-btn/80 text-white shadow-day')
                              }`}
                      >
                        <div className={`text-3xl lg:text-4xl mb-2 transform group-hover:rotate-[-10deg] transition-transform ${mood.colorClass} drop-shadow-md`}>{mood.emoji}</div>
                        <div className="font-surround text-sm lg:text-base font-bold leading-tight mb-1 whitespace-normal break-keep w-full">{mood.label}</div>
                        <div className={`text-[10px] lg:text-xs font-normal opacity-80 whitespace-normal break-keep hidden sm:block ${userInput.mood === mood.label ? 'opacity-100' : ''}`}>{mood.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Purpose Section */}
                <div className="mb-6 lg:mb-0">
                  <label className={`block text-lg md:text-xl font-bold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-day-text'}`}>
                    <PenLine className="w-5 h-5 opacity-70"/>
                    이 책으로 뭘 얻고 싶어요?
                  </label>
                  <input 
                      type="text" 
                      value={userInput.purpose} 
                      onChange={(e) => handleInputChange('purpose', e.target.value)} 
                      placeholder="예: 위로, 성장, 도피, 지식..." 
                      className={`w-full p-4 rounded-xl border transition-all duration-300 focus:outline-none font-title font-bold text-xl
                          ${isDarkMode 
                              ? 'bg-night-btn border-transparent text-white placeholder-white/50 focus:border-white/50' 
                              : 'bg-white/60 border-transparent text-day-text placeholder-day-sub/70 focus:border-day-accent'
                          }`} 
                  />
                </div>
                
                {/* Spacer for desktop alignment */}
                <div className="hidden lg:block flex-grow"></div>
              </div>

              {/* --- Right Page (Desktop) / Bottom Scroll (Mobile) --- */}
              <div className="w-full lg:w-1/2 lg:pl-12 flex flex-col">
                
                {/* 4. Situation Section */}
                <div className="mb-6 lg:mb-10 lg:mt-0">
                  <label className={`block text-lg md:text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-day-text'}`}>지금 상황을 편하게 말해줘요</label>
                  <textarea 
                      value={userInput.situation} 
                      onChange={(e) => handleInputChange('situation', e.target.value)} 
                      placeholder="예: 요즘 취준 때문에 너무 힘들어요... 위로가 필요해요" 
                      className={`w-full p-5 rounded-xl border transition-all duration-300 focus:outline-none resize-none font-title font-bold text-xl min-h-[160px] leading-relaxed
                          ${isDarkMode 
                              ? 'bg-night-btn border-transparent text-white placeholder-white/50 focus:border-white/50' 
                              : 'bg-white/60 border-transparent text-day-text placeholder-day-sub/70 focus:border-day-accent'
                          }`} 
                      rows={4} 
                  />
                </div>

                {/* 5. Genre Section */}
                <div className="mb-10">
                  <label className={`block text-lg md:text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-day-text'}`}>선호하는 장르는? (선택)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {genreOptions.map(genre => (
                      <button 
                          key={genre.name} 
                          type="button" 
                          onClick={() => handleInputChange('genre', genre.name)} 
                          className={`px-2 py-3 rounded-xl text-sm font-surround font-bold transition-all duration-300 hover:scale-105 shadow-sm whitespace-normal break-keep flex flex-col items-center justify-center text-center h-[90px] border
                              ${userInput.genre === genre.name 
                                  ? (isDarkMode 
                                      ? 'bg-white/20 text-white border-white shadow-[0_0_10px_rgba(255,255,255,0.2)]' 
                                      : 'bg-day-card text-day-text border-day-accent') 
                                  : (isDarkMode 
                                      ? 'bg-night-btn text-night-sub border-transparent hover:bg-white/10 hover:text-white' 
                                      : 'bg-day-btn text-white border-transparent hover:text-day-accent hover:bg-day-card')
                              }`}
                      >
                          <span className="text-2xl mb-1">{genre.emoji}</span>
                          <span className="leading-tight text-xs">{genre.name.split('(')[0]}</span>
                          <span className="text-[10px] opacity-70 mt-0.5 font-body">{genre.name.match(/\((.*?)\)/)?.[1] || ''}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 6. Location & Submit Section */}
                <div className="mt-auto pb-4 lg:pb-0">
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <label className={`block text-lg font-bold opacity-90 ${isDarkMode ? 'text-white' : 'text-day-text'}`}>도서관 위치 설정</label>
                        </div>
                        <button 
                            type="button" 
                            onClick={handleGetLocation} 
                            className={`w-full flex items-center justify-center px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 border-2 border-dashed
                                ${location 
                                    ? (isDarkMode 
                                        ? 'bg-white/10 border-white text-white' 
                                        : 'bg-day-accent/20 border-day-accent text-day-text') 
                                    : (isDarkMode 
                                        ? 'bg-night-btn border-white/20 text-night-sub hover:border-white/50 hover:text-white' 
                                        : 'bg-day-btn border-day-sub/30 text-day-text hover:border-day-accent')
                                }`}
                        >
                            <MapPin className={`w-4 h-4 mr-2 ${location ? 'text-red-400' : 'opacity-50'}`} />
                            {location ? '현재 위치가 설정되었습니다 (클릭하여 해제)' : '내 주변 도서관 찾기 (현재 위치 권한 필요)'}
                        </button>
                        {locationError && <p className="text-red-400 text-xs mt-2 ml-1 text-center">{locationError}</p>}
                    </div>

                    {error && (
                        <div className="text-center p-4 rounded-xl bg-red-500/10 text-red-500 animate-pulse mb-4 border border-red-500/20">
                        <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                        <p className="font-bold mb-1 font-surround">오류가 발생했어요</p>
                        <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={isLoading} 
                        className={`w-full py-4 rounded-2xl font-surround font-bold text-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:opacity-60 disabled:hover:scale-100 flex items-center justify-center gap-3 shadow-lg
                            ${isDarkMode 
                                ? 'bg-night-cta text-white shadow-[0_0_20px_rgba(107,95,165,0.4)] hover:bg-[#7B6FB5]' 
                                : 'bg-day-accent text-white hover:bg-[#C69463]'}`} 
                    >
                        {isLoading ? (<><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>처방전 작성 중...</>) : (<>나만의 책 처방전 받기</>)}
                    </button>
                </div>

              </div>
            </form>
          </div>
        </div>
        
        <footer className="mt-12 text-center p-4">
          <p className={`text-sm font-bold opacity-60 ${isDarkMode ? 'text-night-sub' : 'text-day-sub'}`}>💫 Powered by Google Gemini API</p>
        </footer>
      </div>

      <RecommendationPopup 
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        recommendations={recommendations}
        isDarkMode={isDarkMode}
        regionScope={location ? 'current' : 'local'}
        selectedRegion={selectedRegion}
        onToggleBookmark={handleToggleBookmark}
        savedBooks={savedBooks}
      />
      
      <HistoryModal 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={savedBooks}
        isDarkMode={isDarkMode}
        onRemove={handleToggleBookmark}
      />
    </div>
  );
};

export default App;
