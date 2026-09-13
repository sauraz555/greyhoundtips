/*
# Seed: Mock Race Data for One Sample Day

## Overview
This migration inserts PLACEHOLDER/MOCK data for a single sample day so the
Greyhound Edge UI can be built and demoed against realistic-shaped data.
This data will be REPLACED by a real feed from the separate prediction
process — it is NOT real race data.

## What it creates
- 4 meetings (Wentworth Park NSW, Sandown Park VIC, Albion Park QLD,
  Angle Park SA) dated for the current day
- 8–10 races per meeting (35 total), with staggered start times spread
  from ~1 hour ago to ~3 hours from now so the dashboard can show all
  timer states (past/greyed, in-progress, starting-soon, upcoming)
- 8 runners per race (280 total) with realistic Australian greyhound
  names, trainers, prices, win probabilities, and top-4 probabilities
- Varied confidence levels (High/Medium/Low) across races
- 5 false-favourite flags spread across different meetings

## Idempotency
Only seeds if no meetings exist for CURRENT_DATE. Safe to re-run.

## IMPORTANT — Placeholder Data
All greyhound names, trainer names, prices, and probabilities are
FICTIONAL. This is placeholder data to be replaced by a real feed.
*/

DO $$
DECLARE
  m_id        uuid;
  r_id        uuid;
  i           int;
  j           int;
  k           int;
  race_start  timestamptz;
  base_time   timestamptz;
  winner_box  int;
  winner_name text;
  winner_pct  numeric;
  v_name      text;
  v_trainer   text;
  v_price     numeric;
  v_win       numeric;
  v_top4      numeric;
  is_ff       bool;
  ff_flag     bool;
  ff_reason   text;
  conf        text;
  grade       text;
  dist        int;
  name_idx    int := 1;
  dog_count   int;
  dog_names   text[] := ARRAY[
    'Aston Rupee','Feral Franky','Poke Dot','Zipping Maserati','Black Myth',
    'Canya Charm','Raging Bend','Nangar Groom','Silly Can','Tiggerlong Go',
    'Wow Sizzle','Dashing Dennis','Lumeah Remy','Federal Blue','Mister Mumbler',
    'Roscrow Boy','Springview Blake','Tarawi Lee','Out Of Scope','Paw Lilibet',
    'Misty Horizon','Slick Bowser','Canya Sting','Zipping Zeke','Aston Baron',
    'Kingsbrae Dixie','Tropical One','Skye Ring','Jungle Deuce','Lisarow Lotte',
    'Raging Mandy','Zipping Elly','Got A Pulse','Blue Chippy','Nangar Lucy',
    'Fifty Short','Aston Dollar','Canya Go','Slick Picker','Tiggerlong Tiff',
    'Molly Banned','Boracay Summer','Sketchy Demon','Canya Fly','Zipping Miley',
    'Aston Florist','Paw Quinny','Sona Queen','Tiki Magic','Misty Image',
    'Raging Fire','Lumeah Rylan','Federal Tiger','Canya Tilly','Zipping Cedar',
    'Black Tsunami','Paw Nando','Slick Salty','Aston Duke','Canya Whisper'
  ];
  venues      text[] := ARRAY['Wentworth Park','Sandown Park','Albion Park','Angle Park'];
  codes       text[] := ARRAY['WPK','SAN','ALB','ANG'];
  states      text[] := ARRAY['NSW','VIC','QLD','SA'];
  n_races     int[] := ARRAY[10,8,9,8];
  base_offsets int[] := ARRAY[-60, -45, 15, 60];
  trainers    text[] := ARRAY[
    'Mark Sultana','Jason Magri','David Ruggero','Angela Langton','Raymond Smith',
    'John Cauchi','Lorraine Brooks','Christina McInerney','Dean Pickering','Sally McHugh',
    'Paul Gordon','Tim Sams','Greg Sultana','Linda Gatt','Anthony Borg',
    'Marg Sultana','Jeff Sultana','Robert Smith','Kelvin Wright','Jack Smithline'
  ];
  grades      text[] := ARRAY['Grade 5','Grade 4','Grade 3','Maiden','Mixed 6/7','Best 8','Grade 6','Free For All'];
  distances   int[] := ARRAY[400,450,500,515,520,595,600,710];
  ff_reasons  text[] := ARRAY[
    'Market favourite has poor early speed from wide draws at this distance',
    'Short-priced fav stepping up in grade for the first time — form looks inflated',
    'Favourite drawn in the squeeze between two railers — box bias risk',
    'Top market dog has one win from six starts at this track and distance'
  ];
BEGIN
  dog_count := array_length(dog_names, 1);

  IF NOT EXISTS (SELECT 1 FROM meetings WHERE date = CURRENT_DATE) THEN

    FOR i IN 1..4 LOOP
      m_id := gen_random_uuid();
      INSERT INTO meetings (id, date, venue_name, venue_code, state)
      VALUES (m_id, CURRENT_DATE, venues[i], codes[i], states[i]);

      base_time := now() + make_interval(mins => base_offsets[i]);

      FOR j IN 1..n_races[i] LOOP
        r_id := gen_random_uuid();
        race_start := base_time + make_interval(mins => (j - 1) * 15);
        grade := grades[((i + j) % 8) + 1];
        dist := distances[((i + j) % 8) + 1];

        winner_box := ((i + j) % 8) + 1;
        winner_name := dog_names[((name_idx - 1) % dog_count) + 1];
        name_idx := name_idx + 1;

        winner_pct := round((28 + ((i * 7 + j * 13) % 35))::numeric, 1);
        conf := CASE WHEN winner_pct >= 48 THEN 'High' WHEN winner_pct >= 36 THEN 'Medium' ELSE 'Low' END;

        ff_flag := (i = 1 AND j IN (3, 7)) OR (i = 2 AND j = 5) OR (i = 3 AND j = 2) OR (i = 4 AND j = 6);
        ff_reason := CASE WHEN ff_flag THEN ff_reasons[((i + j) % 4) + 1] ELSE NULL END;

        INSERT INTO races (
          id, meeting_id, race_number, name, distance_m, grade,
          start_time, n_runners, confidence,
          false_fav_flag, false_fav_reason,
          probable_winner_box, probable_winner_name, probable_winner_win_pct
        )
        VALUES (
          r_id, m_id, j,
          grade || ' ' || dist || 'm',
          dist, grade,
          race_start, 8, conf,
          ff_flag, ff_reason,
          winner_box, winner_name, winner_pct
        );

        FOR k IN 1..8 LOOP
          IF k = winner_box THEN
            v_name := winner_name;
            v_win := winner_pct;
            v_top4 := LEAST(round((winner_pct + 15 + ((k * 3) % 12))::numeric, 1), 98);
            is_ff := ff_flag;
          ELSE
            v_name := dog_names[((name_idx - 1) % dog_count) + 1];
            name_idx := name_idx + 1;
            v_win := round((4 + ((i * 5 + j * 3 + k * 11) % 22))::numeric, 1);
            v_top4 := LEAST(round((v_win + 12 + ((k * 7) % 18))::numeric, 1), 95);
            is_ff := false;
          END IF;

          v_trainer := trainers[((i + j + k) % array_length(trainers,1)) + 1];
          v_price := round((2.5 + ((i * 3 + j * 5 + k * 7) % 25))::numeric, 2);

          INSERT INTO runners (id, race_id, box, name, trainer, price, win_pct, top4_pct, is_false_fav)
          VALUES (gen_random_uuid(), r_id, k, v_name, v_trainer, v_price, v_win, v_top4, is_ff);
        END LOOP;
      END LOOP;
    END LOOP;
  END IF;
END $$;
