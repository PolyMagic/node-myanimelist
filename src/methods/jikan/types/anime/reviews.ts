/** src: ? */
export interface Reviews {
  reviews: Review[];

  request_cache_expiry: number;
  request_cached: boolean;
  request_hash: string;
}

/** src: https://github.com/jikan-me/jikan/blob/master/src/Model/Anime/AnimeReview.php */
export interface Review {
  mal_id: number;
  url: string;

  /** Hymm what is this? Is this always a null???
   *
   *  Type definition in Jikan Models is wrong, so we look at parser anotations.
   *
   *  src: https://github.com/jikan-me/jikan/blob/80d4bb7994385d394e040ff6329a6c42fd34f679/src/Parser/Anime/AnimeReviewParser.php#L137
   */
  type: string | null;

  helpful_count: number;
  date: Date;
  reviewer: Reviewer;

  content: string;
}

/**
 * src: https://github.com/jikan-me/jikan/blob/master/src/Model/Anime/AnimeReviewer.php
 * src: https://github.com/jikan-me/jikan/blob/master/src/Model/Common/Reviewer.php */
export interface Reviewer {
  url: string;
  image_url: string;
  username: string;

  episodes_seen: number;
  scores: ReviewScores;
}

/** src: https://github.com/jikan-me/jikan/blob/master/src/Model/Anime/AnimeReviewScores.php */
export interface ReviewScores {
  overall: number;
  story: number;
  animation: number;
  sound: number;
  character: number;
  enjoyment: number;
}
