
import React, { useState } from 'react';
import { Bookmark, ChevronDown, ChevronUp, ExternalLink, Library, PenSquare, Store } from 'lucide-react';
import type { BookRecommendationWithId, PurchaseLinks } from '../types';
import GeneratedBookCover from './GeneratedBookCover';

interface BookCardProps {
  book: BookRecommendationWithId;
  isDarkMode: boolean;
  isSaved: boolean;
  onToggleBookmark: (book: BookRecommendationWithId) => void;
  regionScope: string;
  selectedRegion: string;
  index?: number;
}

const BookCard: React.FC<BookCardProps> = ({ 
  book, 
  isDarkMode, 
  isSaved, 
  onToggleBookmark, 
  regionScope, 
  selectedRegion,
  index = 0
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const getLibraryTitle = () => {
    if (regionScope === 'current') return '내 주변';
    if (regionScope === 'national') return '전국';
    return selectedRegion;
  };

  const siteNames: { [key in keyof PurchaseLinks]: string } = {
      yes24: 'YES24',
      kyobo: '교보문고',
      aladin: '알라딘'
  };

  const bookstoreOrder: (keyof PurchaseLinks)[] = ['kyobo', 'aladin', 'yes24'];

  return (
    <div 
      onClick={toggleExpand}
      className={`rounded-2xl p-5 md:p-6 transition-all duration-300 border shadow-sm cursor-pointer group animate-fade-in-up
        ${isDarkMode 
          ? 'bg-white/5 border-white/10 hover:bg-white/10' 
          : 'bg-day-card border-day-text/5 hover:bg-day-card/80'
        }`}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Cover Image - Click to expand */}
        <div className="relative mx-auto sm:mx-0">
             <GeneratedBookCover
                title={book.title}
                author={book.author}
                isbn={book.isbn}
                coverImageUrl={book.coverImageUrl}
                size="large"
                className="shadow-lg transform transition-transform group-hover:scale-105"
             />
        </div>

        <div className="flex-1 min-w-0 text-center sm:text-left">
          {/* Header: Title & Bookmark */}
          <div className="flex items-start justify-center sm:justify-between gap-2 mb-1">
            <h3 className={`font-surround font-bold text-xl md:text-2xl leading-snug ${isDarkMode ? 'text-white' : 'text-day-text'}`}>
              {book.title}
            </h3>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(book);
              }}
              className={`p-1.5 rounded-full transition-all duration-300 flex-shrink-0 active:scale-75 ${isDarkMode ? 'hover:bg-white/20' : 'hover:bg-black/10'}`}
              aria-label={isSaved ? "북마크 해제" : "북마크 저장"}
            >
               <Bookmark className={`w-6 h-6 transition-colors duration-300 ${isSaved ? (isDarkMode ? 'fill-yellow-300 text-yellow-300' : 'fill-day-accent text-day-accent') : (isDarkMode ? 'text-white/50' : 'text-day-text/50')}`} />
            </button>
          </div>

          <p className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-night-sub' : 'text-day-sub'}`}>
            {book.author} · {book.publisher}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4 justify-center sm:justify-start">
              {book.vibe.map((tag, idx) => (
                  <span key={idx} className={`text-xs px-2.5 py-1 rounded-full font-bold 
                      ${isDarkMode ? 'bg-night-btn text-white border border-white/10' : 'bg-day-bg text-day-text'}`}>
                      #{tag}
                  </span>
              ))}
          </div>
          
          {/* Description (Truncated if not expanded) */}
          <p className={`text-base italic mb-4 leading-relaxed font-body ${isDarkMode ? 'text-white/90' : 'text-day-text/90'} ${!isExpanded && 'line-clamp-3'}`}>
            "{book.description}"
          </p>

          {/* Toggle Indicator */}
          <div className={`flex items-center justify-center sm:justify-start gap-1 text-xs font-bold opacity-60 mb-2 ${isDarkMode ? 'text-white' : 'text-day-text'}`}>
             {isExpanded ? (
               <><ChevronUp className="w-4 h-4" /> 간략히 보기</>
             ) : (
               <><ChevronDown className="w-4 h-4" /> 더 보기 (추천사유, 도서관, 구매처)</>
             )}
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <div 
                className="space-y-5 mt-4 pt-4 border-t border-dashed border-gray-500/30"
                onClick={(e) => e.stopPropagation()} /* Prevent collapse when clicking details */
            >
                {/* AI Reason */}
                <div className={`p-4 rounded-xl text-sm ${isDarkMode ? 'bg-white/10 border border-white/5' : 'bg-day-bg'}`}>
                    <p className={`font-semibold flex items-start gap-2 ${isDarkMode ? 'text-white' : 'text-day-text'}`}>
                        <PenSquare className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-night-accent' : 'text-day-accent'}`} />
                        <span><span className="font-bold">AI's Note:</span> {book.aiReason}</span>
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {/* Purchase Links */}
                    <div>
                         <p className={`text-sm font-bold mb-2 flex items-center justify-center sm:justify-start gap-1.5 ${isDarkMode ? 'text-night-sub' : 'text-day-sub'}`}>
                            <Store className="w-4 h-4" />온라인 서점
                        </p>
                        <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                            {bookstoreOrder.map((site) => (
                                <a 
                                    key={site} 
                                    href={book.purchaseLinks[site]} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className={`flex items-center text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors border
                                        ${isDarkMode 
                                            ? 'bg-night-btn border-transparent hover:bg-white/20 text-white' 
                                            : 'bg-day-bg border-transparent hover:bg-white text-day-text'
                                        }`}
                                >
                                    <ExternalLink className="w-3 h-3 mr-1.5 opacity-70" />
                                    {siteNames[site]}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Libraries */}
                    <div>
                        <p className={`text-sm font-bold mb-2 flex items-center justify-center sm:justify-start gap-1.5 ${isDarkMode ? 'text-night-sub' : 'text-day-sub'}`}>
                            <Library className="w-4 h-4" />{getLibraryTitle()} 도서관 현황
                        </p>
                        <div className="space-y-1.5 text-xs">
                          {book.libraries.map((lib, idx) => (
                          <div key={idx} className={`flex items-center justify-between p-2 rounded-lg 
                              ${isDarkMode ? 'bg-white/10 border border-white/5' : 'bg-day-bg/50'}`}>
                            {lib.url ? (
                              <a href={lib.url} target="_blank" rel="noopener noreferrer" className={`font-semibold truncate pr-2 flex items-center gap-1.5 hover:underline ${isDarkMode ? 'text-night-accent' : 'text-day-accent'}`}>
                                {lib.name}
                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                              </a>
                            ) : (
                              <span className={`font-semibold truncate pr-2 ${isDarkMode ? 'text-white' : 'text-day-text'}`}>{lib.name}</span>
                            )}
                            {lib.available ? (
                              <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-bold flex-shrink-0">
                                  ✓ 대여 가능 {lib.distance && `(${lib.distance})`}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-orange-500 dark:text-orange-300 font-bold flex-shrink-0">
                                  ◷ 대기 {lib.waitlist}명
                              </span>
                            )}
                          </div>))}
                        </div>
                    </div>
                    
                    {/* ISBN Info */}
                     <div className="md:col-span-2 text-center sm:text-left mt-2 opacity-50 text-[10px]">
                        ISBN: {book.isbn}
                    </div>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
