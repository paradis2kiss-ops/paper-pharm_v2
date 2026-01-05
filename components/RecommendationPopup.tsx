
import React from 'react';
import { X, ScrollText } from 'lucide-react';
import type { BookRecommendationWithId } from '../types';
import BookCard from './BookCard';

interface RecommendationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  recommendations: BookRecommendationWithId[];
  isDarkMode: boolean;
  regionScope: string;
  selectedRegion: string;
  onToggleBookmark: (book: BookRecommendationWithId) => void;
  savedBooks: BookRecommendationWithId[];
}

const RecommendationPopup: React.FC<RecommendationPopupProps> = ({ 
  isOpen, 
  onClose, 
  recommendations, 
  isDarkMode,
  regionScope,
  selectedRegion,
  onToggleBookmark,
  savedBooks
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-subtle-fade-in-up" 
      onClick={onClose}
      style={{ animationDuration: '0.3s' }}
    >
      <div 
        className={`relative w-full max-w-4xl max-h-[90vh] rounded-3xl p-6 md:p-8 flex flex-col shadow-2xl overflow-hidden ${
            isDarkMode 
                ? 'bg-night-card border border-white/20 backdrop-blur-xl' 
                : 'bg-day-bg border border-day-text/10'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <button 
            onClick={onClose} 
            className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10 text-night-sub' : 'hover:bg-black/10 text-day-text'}`} 
            aria-label="Close recommendations"
        >
            <X className="w-6 h-6" />
        </button>
        
        <h2 className={`text-2xl md:text-3xl font-surround font-bold mb-8 flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-day-text'}`}>
            <ScrollText className={isDarkMode ? 'text-night-accent' : 'text-day-accent'} />
            당신을 위한 책 처방전
        </h2>
        
        <div className="overflow-y-auto custom-scrollbar pr-2 -mr-4 flex-1">
          <div className="space-y-6">
            {recommendations.map((book, index) => {
              const isSaved = savedBooks.some(saved => saved.id === book.id);
              
              return (
                <BookCard 
                    key={book.id}
                    book={book}
                    isDarkMode={isDarkMode}
                    isSaved={isSaved}
                    onToggleBookmark={onToggleBookmark}
                    regionScope={regionScope}
                    selectedRegion={selectedRegion}
                    index={index}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationPopup;
