export interface Episode {
  id: string;
  title: string;
  description: string;
  duration_ms: number;
  release_date: string;
  language: string;
  audio_url: string;
}

export interface Podcast {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  publisher: string;
  language: string;
  total_episodes: number;
  rating: number | null;
  popularity: number | null;
  episodes?: Episode[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}
