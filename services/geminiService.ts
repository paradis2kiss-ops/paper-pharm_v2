import { GoogleGenAI, Type } from "@google/genai";
import type { BookRecommendation, UserInput } from '../types';

const getBookRecommendations = async (
  userInput: UserInput, 
  region: string, 
  excludeTitles: string[] = [],
  location: { latitude: number, longitude: number } | null = null
): Promise<BookRecommendation[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "The book title in Korean." },
        author: { type: Type.STRING, description: "The author's name in Korean." },
        publisher: { type: Type.STRING, description: "The publisher's name in Korean." },
        isbn: { type: Type.STRING, description: "The book's 13-digit ISBN, numbers only." },
        description: { type: Type.STRING, description: "A short, insightful one-sentence description." },
        aiReason: { type: Type.STRING, description: "An empathetic recommendation reason." },
        vibe: {
          type: Type.ARRAY,
          description: "3 relevant Korean keywords/themes.",
          items: { type: Type.STRING }
        },
        libraries: {
          type: Type.ARRAY,
          description: "3 realistic public libraries near the location.",
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Specific library name like '강남구립도서관', '서초도서관', '마포중앙도서관'. Use real district names." },
              available: { type: Type.BOOLEAN, description: "Book availability (true 60% of time)." },
              distance: { type: Type.STRING, description: "Distance like '1.2km' if available." },
              waitlist: { type: Type.INTEGER, description: "Waitlist count (1-15) if unavailable." }
            },
            required: ['name', 'available']
          }
        },
      },
      required: ['title', 'author', 'publisher', 'isbn', 'description', 'aiReason', 'vibe', 'libraries']
    }
  };

  const genrePreference = userInput.genre
    ? `Genre preference: ${userInput.genre}`
    : "No genre preference - diverse recommendations.";

  const locationInfo = location
    ? `GPS: Lat ${location.latitude}, Lon ${location.longitude}. Suggest realistic nearby library names with district info.`
    : `Region: ${region}. Suggest realistic library names in ${region}.`;

  let prompt = `You are a book curator for "종이약국".
  
  Mood: ${userInput.mood}
  Situation: ${userInput.situation || "N/A"}
  ${genrePreference}
  Goal: ${userInput.purpose || "N/A"}
  ${locationInfo}

  Recommend 3 books with accurate ISBN and realistic library names.`;

  if (excludeTitles.length > 0) {
    prompt += `\n\nDo NOT include: ${excludeTitles.join(', ')}.`;
  }

  prompt += `\n\nOutput: JSON array only.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    
    const jsonString = response.text.trim();
    const booksFromAI: Omit<BookRecommendation, 'purchaseLinks' | 'coverImageUrl'>[] = JSON.parse(jsonString);

    const resultsWithLinks: BookRecommendation[] = booksFromAI.map((book) => {
        const encodedTitle = encodeURIComponent(book.title);
        const cleanIsbn = book.isbn.replace(/[^0-9]/g, '');
        
        // 정확한 네이버 지도 검색 URL 생성
        const librariesWithUrls = book.libraries.map(lib => {
          const searchTerm = encodeURIComponent(lib.name);
          
          // 올바른 네이버 지도 검색 URL
          let mapUrl = `https://map.naver.com/v5/search/${searchTerm}`;
          
          // GPS 좌표가 있으면 추가 (중심점 설정)
          if (location) {
            mapUrl += `?c=${location.longitude},${location.latitude},15,0,0,0,dh`;
          }
          
          return {
            ...lib,
            url: mapUrl
          };
        });
        
        return {
          ...book,
          isbn: cleanIsbn,
          coverImageUrl: '', // GeneratedBookCover가 자체 로드
          libraries: librariesWithUrls,
          purchaseLinks: {
            yes24: `https://www.yes24.com/Product/Search?query=${encodedTitle}`,
            kyobo: `https://search.kyobobook.co.kr/search?keyword=${encodedTitle}`,
            aladin: `https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=${encodedTitle}`
          }
        };
      });

    return resultsWithLinks;

  } catch (error) {
    console.error("Error fetching book recommendations:", error);
    throw new Error("AI 추천을 받아오는 데 실패했어요. 잠시 후 다시 시도해주세요.");
  }
};

export default getBookRecommendations;
