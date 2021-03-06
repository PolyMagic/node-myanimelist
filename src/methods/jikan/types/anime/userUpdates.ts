/** src: ? */
export interface UserUpdates {
  users: RecentlyUpdatedByUser[];

  request_cache_expiry: number;
  request_cached: boolean;
  request_hash: string;
}

/** src: https://github.com/jikan-me/jikan/blob/master/src/Model/Anime/AnimeRecentlyUpdatedByUser.php */
export interface RecentlyUpdatedByUser {
  username: string;
  url: string;
  image_url: string;
  score: number | null;
  status: Status;
  episodes_seen: number | null;
  episodes_total: number | null;
  date: Date;
}

export enum Status {
  Completed = "Completed",
  Dropped = "Dropped",
  OnHold = "On-Hold",
  PlanToWatch = "Plan to Watch",
  Watching = "Watching",
}
