import React, { useState, useEffect } from 'react';

const stringToHash = (str: string): number => {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

const colorPalettes = [
  { from: '#ff9a9e', to: '#fecfef', text: '#5e3449' },
  { from: '#a1c4fd', to: '#c2e9fb', text: '#2c3e50' },
  { from: '#84fab0', to: '#8fd3f4', text: '#13547a' },
  { from: '#f6d365', to: '#fda085', text: '#8c520a' },
  { from: '#d4fc79', to: '#96e6a1', text: '#2c522c' },
  { from: '#c3a3f4', to: '#fbc2eb', text: '#4a2c52' },
  { from: '#fccb90', to: '#d57eeb', text: '#522c4a' },
  { from: '#48c6ef', to: '#6f86d6', text: '#073352' },
  { from: '#ff758c', to: '#ff7eb3', text: '#6d1839' },
  { from: '#56ab2f', to: '#a8e063', text: '#193a0d' },
];

const patterns = [
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cpath fill='%23FFFFFF' fill-opacity='0.3' d='M2 9h6V3h2v6h6v2H10v6H8V11H2V9z'/%3E%3C/svg%3E")`,
  `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23FFFFFF' fill-opacity='0.3' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cpath fill='%23FFFFFF' fill-opacity='0.3' d='M0 0h20L0 20zM20 20H0L20 0z'/%3E%3C/svg%3E")`,
];

interface GeneratedBookCoverProps {
  title: string;
  author: string;
  isbn: string;
  coverImageUrl?: string;
  size?: 'small' | 'large';
  className?: string;
}

// 안전한 환경변수 접근 함수
const getEnvVar = (key: string): string | undefined => {
  try {
    // Vite 환경변수 접근
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[key];
    }
    // 대체: process.env (일부 환경)
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key];
    }
    return undefined;
  } catch (e) {
    console.warn(`환경변수 ${key} 접근 실패:`, e);
    return undefined;
  }
};

const GeneratedBookCover: React.FC<GeneratedBookCoverProps> = ({ 
  title, 
  author, 
  isbn, 
  coverImageUrl, 
  size = 'large', 
  className 
}) => {
  const [realImageUrl, setRealImageUrl] = useState<string | null>(null);
  const [showRealImage, setShowRealImage] = useState(false);

  const safeTitle = title || "제목 미정";
  const safeAuthor = author || "작자 미상";
  const hash = stringToHash(safeTitle + safeAuthor);
  const palette = colorPalettes[hash % colorPalettes.length];
  const pattern = patterns[hash % patterns.length];

  useEffect(() => {
    let active = true;

    const findImage = async () => {
      const cleanIsbn = isbn?.replace(/[^0-9]/g, '') || '';
      
      console.log(`🔍 [${safeTitle}] 썸네일 검색 시작`, { isbn: cleanIsbn });

      if (!cleanIsbn) {
        console.warn(`⚠️ [${safeTitle}] ISBN 없음 - 썸네일 검색 불가`);
        return;
      }

      // 이미지 체크 함수
      const tryImage = (url: string, timeout = 4000): Promise<string | null> => {
        return new Promise((resolve) => {
          const timer = setTimeout(() => {
            console.log(`⏱️ [${safeTitle}] 타임아웃: ${url.substring(0, 50)}...`);
            resolve(null);
          }, timeout);
          
          const img = new Image();
          img.onload = () => {
            clearTimeout(timer);
            if (img.naturalWidth > 5) {
              console.log(`✅ [${safeTitle}] 이미지 발견: ${img.naturalWidth}x${img.naturalHeight}`);
              resolve(url);
            } else {
              console.log(`❌ [${safeTitle}] 이미지 너무 작음`);
              resolve(null);
            }
          };
          img.onerror = () => {
            clearTimeout(timer);
            resolve(null);
          };
          img.src = url;
        });
      };

      // 우선순위별 시도
      const attempts: Array<{ name: string; fn: () => Promise<string | null> }> = [];

      // 1. Google Books Direct (가장 빠르고 안정적, API 키 불필요)
      attempts.push({
        name: 'Google Books',
        fn: async () => {
          const urls = [
            `https://books.google.com/books/content?vid=ISBN${cleanIsbn}&printsec=frontcover&img=1&zoom=1`,
            `https://books.google.com/books/publisher/content?id=ISBN${cleanIsbn}&printsec=frontcover&img=1&zoom=1`,
          ];
          for (const url of urls) {
            const result = await tryImage(url, 4000);
            if (result) return result;
          }
          return null;
        }
      });

      // 2. Kakao API (선택적)
      const kakaoKey = getEnvVar('VITE_KAKAO_API_KEY');
      if (kakaoKey) {
        attempts.push({
          name: 'Kakao',
          fn: async () => {
            try {
              console.log(`🔑 [${safeTitle}] 카카오 API 호출`);
              const res = await fetch(
                `https://dapi.kakao.com/v3/search/book?query=${cleanIsbn}&size=1`,
                { 
                  headers: { 'Authorization': `KakaoAK ${kakaoKey}` },
                  signal: AbortSignal.timeout(4000)
                }
              );
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
              const data = await res.json();
              const url = data.documents?.[0]?.thumbnail?.replace('http:', 'https:');
              return url ? tryImage(url, 2000) : null;
            } catch (e) {
              console.log(`❌ [${safeTitle}] 카카오 실패:`, e);
              return null;
            }
          }
        });
      } else {
        console.log(`ℹ️ [${safeTitle}] 카카오 API 키 없음 (선택사항)`);
      }

      // 3. Naver API (선택적)
      const naverId = getEnvVar('VITE_NAVER_CLIENT_ID');
      const naverSecret = getEnvVar('VITE_NAVER_CLIENT_SECRET');
      if (naverId && naverSecret) {
        attempts.push({
          name: 'Naver',
          fn: async () => {
            try {
              console.log(`🔑 [${safeTitle}] 네이버 API 호출`);
              const res = await fetch(
                `https://openapi.naver.com/v1/search/book.json?query=${cleanIsbn}&display=1`,
                { 
                  headers: { 
                    'X-Naver-Client-Id': naverId,
                    'X-Naver-Client-Secret': naverSecret
                  },
                  signal: AbortSignal.timeout(4000)
                }
              );
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
              const data = await res.json();
              const url = data.items?.[0]?.image?.replace('http:', 'https:');
              return url ? tryImage(url, 2000) : null;
            } catch (e) {
              console.log(`❌ [${safeTitle}] 네이버 실패:`, e);
              return null;
            }
          }
        });
      } else {
        console.log(`ℹ️ [${safeTitle}] 네이버 API 키 없음 (선택사항)`);
      }

      // 4. Google Books API (API 키 불필요)
      attempts.push({
        name: 'Google Books API',
        fn: async () => {
          try {
            console.log(`🔑 [${safeTitle}] Google Books API 호출`);
            const res = await fetch(
              `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}`,
              { signal: AbortSignal.timeout(5000) }
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const thumb = data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
            if (thumb) {
              const url = thumb.replace('http:', 'https:').replace(/&edge=curl/, '').replace(/zoom=\d/, 'zoom=1');
              return tryImage(url, 3000);
            }
            return null;
          } catch (e) {
            console.log(`❌ [${safeTitle}] Google Books API 실패:`, e);
            return null;
          }
        }
      });

      // 5. Aladin (API 키 불필요)
      attempts.push({
        name: 'Aladin',
        fn: async () => {
          const urls = [
            `https://image.aladin.co.kr/product/${cleanIsbn.slice(0, 5)}/${cleanIsbn.slice(5)}_1.jpg`,
            `https://cover.aladin.co.kr/getbook.aspx?isbn=${cleanIsbn}&Cover=Big`,
          ];
          for (const url of urls) {
            const result = await tryImage(url, 4000);
            if (result) return result;
          }
          return null;
        }
      });

      // 순차 시도
      for (const attempt of attempts) {
        if (!active) break;
        
        console.log(`🔄 [${safeTitle}] ${attempt.name} 시도 중...`);
        const result = await attempt.fn();
        
        if (result && active) {
          console.log(`🎉 [${safeTitle}] 썸네일 찾음! (${attempt.name})`);
          setRealImageUrl(result);
          setTimeout(() => {
            if (active) setShowRealImage(true);
          }, 100);
          return;
        }
      }

      console.log(`❌ [${safeTitle}] 모든 소스 실패 - CSS 표지 유지`);
    };

    findImage();

    return () => {
      active = false;
    };
  }, [isbn, title, author]);

  const containerClasses = size === 'large' 
    ? "w-32 h-48 md:w-40 md:h-60 lg:w-48 lg:h-72 rounded-r-xl rounded-l-md shadow-xl border-l-4 border-white/20" 
    : "w-14 h-20 rounded-r-md rounded-l-sm shadow-md border-l-2 border-white/20 flex-shrink-0";

  const titleClass = size === 'large' ? 'text-lg font-bold leading-tight mb-2' : 'text-[10px] font-bold leading-none mb-1';
  const authorClass = size === 'large' ? 'text-sm' : 'text-[8px]';
  const paddingClass = size === 'large' ? 'p-4' : 'p-1.5';

  return (
    <div className={`relative ${containerClasses} ${className} overflow-hidden transition-transform hover:scale-105 group`}>
      {/* CSS Fallback */}
      <div 
        className={`absolute inset-0 flex flex-col justify-center items-center text-center ${paddingClass} transition-opacity duration-500 ${showRealImage ? 'opacity-0' : 'opacity-100'}`}
        style={{
          background: `linear-gradient(135deg, ${palette.from} 0%, ${palette.to} 100%)`,
          color: palette.text,
        }}
      >
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: pattern,
            backgroundSize: size === 'large' ? '20px 20px' : '10px 10px',
          }}
        />
        <div className="absolute left-0 top-0 bottom-0 w-[4%] bg-black/10" />
        
        <div className="relative z-10 drop-shadow-md">
          <h3 className={titleClass}>{safeTitle}</h3>
          {size === 'large' && <div className="w-1/2 h-px bg-current opacity-50 mx-auto my-1" />}
          <p className={`opacity-90 ${authorClass}`}>{safeAuthor}</p>
        </div>
      </div>

      {/* Real Image */}
      {realImageUrl && (
        <img
          src={realImageUrl}
          alt={`${title} 표지`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${showRealImage ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  );
};

export default GeneratedBookCover;
