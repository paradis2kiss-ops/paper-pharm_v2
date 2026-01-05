
import React from 'react';
import { X, BookHeart, Trash2 } from 'lucide-react';
import type { BookRecommendationWithId } from '../types';
import GeneratedBookCover from './GeneratedBookCover';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: BookRecommendationWithId[];
  isDarkMode: boolean;
  onRemove: (book: BookRecommendationWithId) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history, isDarkMode, onRemove }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-subtle-fade-in-up" 
      onClick={onClose}
      style={{ animationDuration: '0.3s' }}
    >
      <div 
        className={`relative w-full max-w-2xl max-h-[90vh] rounded-2xl p-6 md:p-8 flex flex-col shadow-2xl ${
            isDarkMode 
                ? 'bg-night-card border border-white/20 backdrop-blur-lg text-white' 
                : 'bg-day-bg border border-day-text/10 text-day-text'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'}`} aria-label="Close history modal">
            <X className="w-6 h-6 opacity-70" />
        </button>
        <h2 className={`text-2xl font-title font-bold mb-6 flex items-center gap-3`}>
            <BookHeart className={isDarkMode ? 'text-night-accent' : 'text-day-accent'} />
            나의 책 처방 기록
        </h2>
        {history.length === 0 ? (
            <div className="text-center py-16 opacity-70 flex flex-col items-center justify-center h-full">
                <BookHeart className="w-12 h-12 mb-4 opacity-50" />
                <p className="font-bold text-lg mb-2">아직 추천받은 책이 없어요.</p>
                <p className="text-sm opacity-80">나만의 책 처방전을 받아보세요!</p>
            </div>
        ) : (
            <div className="overflow-y-auto custom-scrollbar pr-2 -mr-4 flex-1">
                <div className="space-y-3">
                    {history.map(book => (
                        <div key={book.id} className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${isDarkMode ? 'bg-white/10 hover:bg-white/15' : 'bg-white/60 hover:bg-white/80 shadow-sm'}`}>
                            <GeneratedBookCover 
                              title={book.title} 
                              author={book.author} 
                              isbn={book.isbn} 
                              coverImageUrl={book.coverImageUrl}
                              size="small" 
                            />
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold truncate text-lg font-surround">{book.title}</h3>
                                <p className="text-sm truncate opacity-80 mb-1">{book.author}</p>
                                <div className="flex flex-wrap gap-1">
                                  {book.vibe.slice(0, 2).map((tag, i) => (
                                    <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded-full opacity-70 border ${isDarkMode ? 'border-white/30' : 'border-black/20'}`}>#{tag}</span>
                                  ))}
                                </div>
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemove(book);
                              }}
                              className={`p-2 rounded-full transition-colors flex-shrink-0 group ${isDarkMode ? 'text-white/50 hover:bg-white/10' : 'text-black/40 hover:bg-black/5'}`}
                              aria-label="삭제"
                            >
                              <Trash2 className={`w-5 h-5 transition-colors ${isDarkMode ? 'group-hover:text-red-400' : 'group-hover:text-red-500'}`} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default HistoryModal;
