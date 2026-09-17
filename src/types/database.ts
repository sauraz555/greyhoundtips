export interface Meeting {
  id: string;
  date: string;
  venue_name: string;
  venue_code: string;
  state: string;
  created_at: string;
}

export interface Race {
  id: string;
  meeting_id: string;
  race_number: number;
  name: string;
  distance_m: number;
  grade: string;
  start_time: string;
  n_runners: number;
  confidence: string | null;
  false_fav_flag: boolean;
  false_fav_reason: string | null;
  probable_winner_box: number | null;
  probable_winner_name: string | null;
  probable_winner_win_pct: number | string | null;
  created_at: string;
}

export interface Runner {
  id: string;
  race_id: string;
  box: number;
  name: string;
  trainer: string | null;
  price: number | string | null;
  win_pct: number | string | null;
  top4_pct: number | string | null;
  is_false_fav: boolean;
}

export interface Profile {
  id: string;
  email: string;
  age_confirmed: boolean;
  email_picks_opt_in: boolean;
  created_at: string;
}

export interface Subscription {
  customer_id: string;
  subscription_id: string | null;
  status: string;
  trial_end: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  price_id: string | null;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export interface MeetingWithRaces extends Meeting {
  races: Race[];
}

export interface RaceWithRunners extends Race {
  runners: Runner[];
  meeting?: Meeting;
}
