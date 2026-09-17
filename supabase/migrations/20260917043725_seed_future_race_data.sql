-- Seed race data for Sept 18, 19, 20 2026
DO $$
DECLARE
  d DATE;
  meeting_id UUID;
  race_id UUID;
  race_num INT;
  start_ts TIMESTAMPTZ;
  base_hour INT;
  box INT;
  win_pct_val NUMERIC;
  top4_pct_val NUMERIC;
  price_val NUMERIC;
  conf TEXT;
  ff_flag BOOLEAN;
  ff_reason TEXT;
  winner_box INT;
  winner_name TEXT;
  winner_pct NUMERIC;
  venue_name TEXT;
  venue_code TEXT;
  state TEXT;
  dog_names TEXT[] := ARRAY[
    'Zipping Kyrgios','Magic Sprinter','Flying Thunder','Royal Impact',
    'Cyclone Nick','Aston Felix','Tornado Tilly','Blazing Arrow',
    'Midnight Runner','Gold Rush Belle','Iron Barque','Velvet Viper',
    'Lucky Seven','Outlaw Senator','Wicked Whisper','Jagged Edge',
    'Dashing Dynamo','Cosmic Charlie','Electric Storm','Furious George',
    'Raging Rocket','Silent Assassin','Turbo Tori','Wildfire Wendy',
    'Rapid Rusty','Neon Ninja','Flash Phantom','Stellar Swift',
    'Power Pup','Mystic Blaze','Jumping Jack','Crimson Comet'
  ];
  trainers TEXT[] := ARRAY[
    'J. Thompson','M. Smith','R. Brown','K. Wilson','D. Taylor',
    'S. Johnson','P. Anderson','L. Martin','C. White','B. Garcia',
    'T. Lee','N. Walker','G. Hall','E. Young','A. King'
  ];
  venues TEXT[][] := ARRAY[
    ARRAY['Wentworth Park','WPK','NSW'],
    ARRAY['Sandown Park','SAN','VIC'],
    ARRAY['Angle Park','ANG','SA'],
    ARRAY['Casino','CAS','NSW'],
    ARRAY['Shepparton','SHP','VIC'],
    ARRAY['The Meadows','MEA','VIC'],
    ARRAY['Hobart','HOB','TAS'],
    ARRAY['Mandurah','MAN','WA'],
    ARRAY['Warrnambool','WRB','VIC'],
    ARRAY['Richmond','RIC','NSW'],
    ARRAY['Gosford','GOS','NSW'],
    ARRAY['Bendigo','BEN','VIC']
  ]::TEXT[][];
  v_idx INT;
  dates DATE[] := ARRAY['2026-09-18','2026-09-19','2026-09-20']::DATE[];
  di INT;
BEGIN
  FOR di IN 1..array_length(dates, 1) LOOP
    d := dates[di];
    FOR v_idx IN 1..array_length(venues, 1) LOOP
      venue_name := venues[v_idx][1];
      venue_code := venues[v_idx][2];
      state := venues[v_idx][3];

      INSERT INTO meetings (date, venue_name, venue_code, state)
      VALUES (d, venue_name, venue_code, state)
      RETURNING id INTO meeting_id;

      base_hour := 8 + floor(random() * 4)::INT;
      FOR race_num IN 1..(3 + floor(random() * 3)::INT) LOOP
        start_ts := d::TIMESTAMPTZ + (base_hour + race_num * 0.5) * INTERVAL '1 hour';

        conf := CASE WHEN random() < 0.3 THEN 'High' WHEN random() < 0.6 THEN 'Medium' ELSE 'Low' END;
        ff_flag := random() < 0.25;
        ff_reason := CASE WHEN ff_flag THEN 'Market favourite has poor early speed from wide draw. Historical box 1-4 win rate at this track significantly higher.' ELSE NULL END;
        winner_box := 1 + floor(random() * 8)::INT;
        winner_name := dog_names[1 + floor(random() * 32)::INT];
        winner_pct := 25 + floor(random() * 36)::INT;

        INSERT INTO races (
          meeting_id, race_number, name, distance_m, grade, start_time,
          n_runners, confidence, false_fav_flag, false_fav_reason,
          probable_winner_box, probable_winner_name, probable_winner_win_pct
        ) VALUES (
          meeting_id, race_num, 'Race ' || race_num,
          400 + floor(random() * 20)::INT * 10,
          CASE WHEN race_num <= 3 THEN 'Grade 5' WHEN race_num <= 6 THEN 'Maiden' ELSE 'Mixed 4/5' END,
          start_ts,
          8, conf, ff_flag, ff_reason,
          winner_box, winner_name, winner_pct
        ) RETURNING id INTO race_id;

        FOR box IN 1..8 LOOP
          IF box = winner_box THEN
            win_pct_val := winner_pct;
          ELSE
            win_pct_val := (100 - winner_pct) * (random() * 0.8 + 0.1);
          END IF;
          win_pct_val := ROUND(win_pct_val, 1);

          top4_pct_val := LEAST(win_pct_val + 20 + floor(random() * 30)::INT, 95);
          top4_pct_val := ROUND(top4_pct_val, 1);

          IF box = winner_box THEN
            price_val := 1 + random() * 3;
          ELSE
            price_val := 3 + random() * 30;
          END IF;
          price_val := ROUND(price_val, 2);

          INSERT INTO runners (
            race_id, box, name, trainer, price, win_pct, top4_pct, is_false_fav
          ) VALUES (
            race_id, box,
            dog_names[1 + floor(random() * 32)::INT],
            trainers[1 + floor(random() * 15)::INT],
            price_val, win_pct_val, top4_pct_val,
            ff_flag AND box = 1
          );
        END LOOP;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;
