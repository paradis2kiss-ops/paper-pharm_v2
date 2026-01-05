
export interface UserInput {
  mood: string;
  situation: string;
  genre: string;
  purpose: string;
}

export interface LibraryInfo {
  name: string;
  available: boolean;
  distance?: string;
  waitlist?: number;
  url?: string;
}

export interface PurchaseLinks {
  yes24: string;
  kyobo: string;
  aladin: string;
}

export interface BookRecommendation {
  title: string;
  author: string;
  publisher: string;
  isbn: string;
  coverImageUrl: string;
  description: string;
  aiReason: string;
  vibe: string[];
  libraries: LibraryInfo[];
  purchaseLinks: PurchaseLinks;
}

export interface BookRecommendationWithId extends BookRecommendation {
  id: string;
}