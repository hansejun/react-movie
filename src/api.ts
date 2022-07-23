const API_KEY = "c95db9f573e7cd21500f6d51e10a748a";
const BASE_URL = "https://api.themoviedb.org/3";

export interface IMoive {
  backdrop_path: string;
  title: string;
  overview: string;
  poster_path: string;
  id: number;
}

export interface IMovieResult {
  dates: { maximum: number; minimum: number };
  page: number;
  results: IMoive[];
  total_pages: number;
  total_results: number;
}

export function getMovies() {
  return fetch(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
}
