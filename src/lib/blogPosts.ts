export interface BlogSection {
  type: 'heading' | 'subheading' | 'paragraph' | 'list' | 'table' | 'code' | 'callout' | 'image';
  content?: string;
  items?: string[];
  headers?: string[];
  rows?: string[][];
  image?: string;
  alt?: string;
  caption?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  heroImage: string;
  heroAlt: string;
  author: string;
  sections: BlogSection[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'predictive-modelling-australian-greyhound-racing',
    title: 'Predictive Modelling in Australian Greyhound Racing: An Engineering Perspective',
    excerpt:
      'A technical breakdown of the data pipelines, feature engineering techniques, predictive model architectures, and validation metrics used to build machine learning systems for Australian greyhound racing.',
    date: 'September 17, 2026',
    readTime: '12 min read',
    category: 'Engineering',
    heroImage:
      'https://images.pexels.com/photos/36314925/pexels-photo-36314925.jpeg?auto=compress&cs=tinysrgb&w=1200',
    heroAlt: 'A graceful greyhound dog standing in a sunny park',
    author: 'Greyhound Edge Engineering Team',
    sections: [
      {
        type: 'paragraph',
        content:
          'Australian greyhound racing generates high-frequency, structured biometric and kinematic data. While the sport has historically relied on manual form analysis and trackside heuristics, quantitative researchers and software engineers increasingly utilize machine learning (ML) architectures to model canine race dynamics, calculate finishing margins, and forecast outcome probabilities.',
      },
      {
        type: 'paragraph',
        content:
          'This technical breakdown examines the data pipelines, feature engineering techniques, predictive model architectures, and validation metrics used to build machine learning systems for Australian greyhound racing.',
      },
      {
        type: 'image',
        image:
          'https://images.pexels.com/photos/19190279/pexels-photo-19190279.jpeg?auto=compress&cs=tinysrgb&w=1200',
        alt: 'Curved running track with dashed white lane markings',
        caption: 'Track geometry and lane positioning directly influence model feature weights',
      },
      {
        type: 'heading',
        content: '1. The Data Ingestion Layer',
      },
      {
        type: 'paragraph',
        content:
          'Greyhound racing in Australia features standardized tracking across governing bodies (such as Greyhound Racing NSW, Greyhound Racing Victoria, and Racing Queensland). Raw event streams and historical performance databases are generally acquired through formal endpoints, including the FastTrack API and tracking feeds like TripleSdata.',
      },
      {
        type: 'code',
        content:
          'Official Track Data  --->  Data Extraction Layer  --->  Feature Processing Pipe\n(FastTrack, TripleSdata)   (JSON / REST / DB Sync)      (Normalisation, Scaling)',
      },
      {
        type: 'paragraph',
        content: 'The core entities ingested into a greyhound prediction pipeline include:',
      },
      {
        type: 'list',
        items: [
          'Kinematic Trajectory & Sectionals: First-split timing (box exit to first bend), second-split, home-turn margins, and run-home velocities.',
          'Physical & Environmental Attributes: Body mass at weigh-in (recorded to 0.1 kg), track rating (Fast, Good, Slow), moisture index, and ambient temperature.',
          'Positional Indicators (PIR): Sequential positional strings (e.g., M/111 indicating a medium start followed by leading through each marker) and interference checks (e.g., checks received or severe collisions).',
        ],
      },
      {
        type: 'heading',
        content: '2. Feature Engineering and Normalization',
      },
      {
        type: 'paragraph',
        content:
          'Raw lap times cannot be compared directly across different venues. A 30.00-second run over 520m at Wentworth Park represents a fundamentally different kinetic output than a 30.00-second run over 515m at Sandown Park.',
      },
      {
        type: 'subheading',
        content: 'Track Normalization and Speed Indexing',
      },
      {
        type: 'paragraph',
        content:
          'To build track-agnostic velocity vectors, pipelines normalize times using a Track Speed Index (TSI). Individual dog velocities are computed as a relative performance ratio against the historical distribution.',
      },
      {
        type: 'code',
        content: 'TSI(t, d) = Median(WinningTime(t, d)) / D\n\nWhere D is distance in meters, t is track code, and d represents distance category.\n\nPerformance Ratio = RunnerTime(i) / TSI(t, d)',
      },
      {
        type: 'subheading',
        content: 'Box Bias and Spatial Geometry',
      },
      {
        type: 'paragraph',
        content:
          'Box draw influence varies depending on track geometry (turn radius, straight length before the first bend). Box 1 typically offers shorter transit distance along the rail, while middle boxes (4-6) frequently experience lateral collisions ("pinching") during initial acceleration.',
      },
      {
        type: 'paragraph',
        content:
          'Engineers encode this dynamic using interaction features: combining a runner\'s historical first-split velocity with their drawn box number and the specific distance to the first corner for that track configuration.',
      },
      {
        type: 'image',
        image:
          'https://images.pexels.com/photos/8533636/pexels-photo-8533636.jpeg?auto=compress&cs=tinysrgb&w=1200',
        alt: 'Numbered athletic track lanes from above',
        caption: 'Box draw position and track geometry create complex interaction features for models',
      },
      {
        type: 'heading',
        content: '3. Modeling Architectures',
      },
      {
        type: 'paragraph',
        content:
          'Modeling race outcomes differs from binary classification because runners compete against each other in a closed set of 8 runners rather than in isolation.',
      },
      {
        type: 'table',
        headers: ['Model Class', 'Example Architectures', 'Primary Use Case'],
        rows: [
          [
            'Gradient Boosting',
            'LightGBM, XGBoost, CatBoost',
            'Tabular feature handling, non-linear split metrics, rapid training on tabular form lines.',
          ],
          [
            'Pairwise / Ranking',
            'LambdaMART, RankNet',
            'Ordering the 8 competitors based on relative strength rather than raw absolute speed.',
          ],
          [
            'Discrete Choice Models',
            'Multinomial Logit, Plackett-Luce',
            'Modeling multi-candidate competition where probabilities must sum to 1.0.',
          ],
          [
            'Sequence Models',
            'LSTM, Transformers',
            "Modeling a greyhound's career progression, fitness decay, and trajectory across historical runs.",
          ],
        ],
      },
      {
        type: 'subheading',
        content: 'The Multinomial Logit Formulation',
      },
      {
        type: 'paragraph',
        content:
          'In a closed race of K runners (where K <= 8), the probability P(i) of runner i finishing first can be modeled using a softmax normalization over the latent score s(i) derived from the feature vector x(i):',
      },
      {
        type: 'code',
        content: 'P(Y(i) = 1 | X) = exp(w^T * x(i)) / sum(j=1..K) exp(w^T * x(j))',
      },
      {
        type: 'paragraph',
        content:
          'This structure ensures that probability outputs remain strictly bounded between 0 and 1, and that every race sums to an overall winning probability of 1.0 (100%).',
      },
      {
        type: 'image',
        image:
          'https://images.pexels.com/photos/1921326/pexels-photo-1921326.jpeg?auto=compress&cs=tinysrgb&w=1200',
        alt: 'Colorful programming code on a computer screen',
        caption: 'Softmax normalization ensures race probabilities always sum to exactly 1.0',
      },
      {
        type: 'heading',
        content: '4. Model Evaluation and Calibration',
      },
      {
        type: 'paragraph',
        content:
          'A model predicting sports outcomes cannot rely solely on standard accuracy or classification strike rate. A strike rate of 40% is trivial if the model only assigns top rank to short-priced favorites. Instead, models are assessed on probabilistic calibration and logarithmic scoring.',
      },
      {
        type: 'subheading',
        content: 'Brier Score',
      },
      {
        type: 'paragraph',
        content:
          'The Brier score measures the mean squared difference between predicted probabilities and the actual binary outcome. A lower Brier score denotes superior probability calibration.',
      },
      {
        type: 'code',
        content: 'BS = (1/N) * sum(n=1..N) sum(k=1..K) (f(nk) - o(nk))^2\n\nWhere f(nk) is the forecast probability and o(nk) in {0,1} is the actual outcome.',
      },
      {
        type: 'subheading',
        content: 'Calibration Curves (Reliability Diagrams)',
      },
      {
        type: 'paragraph',
        content:
          'Predictions are binned into deciles (e.g., all predictions between 0.10 and 0.20). A well-calibrated machine learning model requires that dogs predicted to have a 15% chance of winning actually win approximately 15 out of 100 times over a representative sample.',
      },
      {
        type: 'heading',
        content: 'Technical Challenges in Greyhound Modeling',
      },
      {
        type: 'list',
        items: [
          'Low Sample Sizes per Entity: Greyhounds typically compete between 20 to 60 times across a full racing career, limiting per-individual training sets and requiring hierarchical or pooled feature aggregation.',
          "Inter-Runner Interference: Unlike sprint athletics running in separated lanes, greyhounds share track turf. Physics-defying collisions or interference at the first turn introduce high stochastic variance that tabular models cannot fully anticipate from pre-race metrics alone.",
          'Non-Stationary Track Conditions: Rainfall, grass compaction, and surface harrow depth shift baseline track times significantly between race 1 and race 12 on the same card. Dynamic state estimation (e.g., running Kalman filters over the day\'s median times) is often required to adjust priors in real time.',
        ],
      },
      {
        type: 'callout',
        content:
          'Greyhound Edge implements these engineering principles in production. The dashboard you use every day is powered by these same pipelines — normalized speed indices, box bias interaction features, softmax probability normalization, and continuous calibration against market prices.',
      },
    ],
  },
  {
    slug: 'ai-machine-learning-australian-greyhound-racing',
    title:
      'AI and Machine Learning in Australian Greyhound Racing: The Quantitative Mechanics of Win Prediction',
    excerpt:
      'Quantitative sports analytics has shifted from subjective handicapping to rigorous predictive engineering. Here is how machine learning models analyze data streams to calculate win probabilities that bypass the biases of traditional market pricing.',
    date: 'September 17, 2026',
    readTime: '14 min read',
    category: 'Machine Learning',
    heroImage:
      'https://images.pexels.com/photos/28457519/pexels-photo-28457519.jpeg?auto=compress&cs=tinysrgb&w=1200',
    heroAlt: 'A brindle greyhound rolling on a field during sunset',
    author: 'Greyhound Edge Engineering Team',
    sections: [
      {
        type: 'paragraph',
        content:
          'Quantitative sports analytics has shifted from subjective handicapping to rigorous predictive engineering. In Australian greyhound racing, this evolution is particularly pronounced. High-frequency meeting schedules, rich sectional timing metrics, and standardized racing conditions create an ideal environment for algorithmic analysis. Machine learning models analyze these data streams to calculate win probabilities that bypass the biases of traditional market pricing.',
      },
      {
        type: 'image',
        image:
          'https://images.pexels.com/photos/29857098/pexels-photo-29857098.jpeg?auto=compress&cs=tinysrgb&w=1200',
        alt: 'A joyful greyhound with tongue out in a grassy field',
        caption: 'Greyhound racing generates structured biometric data ideal for ML analysis',
      },
      {
        type: 'heading',
        content: 'Core Data Ingestion and API Pipelines',
      },
      {
        type: 'paragraph',
        content:
          'Predictive modelling begins with programmatic data collection. In Australia, analysts source historical and real-time data from official governing bodies and specialized feeds.',
      },
      {
        type: 'list',
        items: [
          'FastTrack API / Topaz Feeds: Provide detailed event metadata, micro-level split times, box draws, body weights, trainer IDs, and position-in-running (PIR) records.',
          'Betfair Exchange API: Supplies real-time order books, back/lay volume distributions, and historical price matrices used to evaluate price discovery efficiency.',
        ],
      },
      {
        type: 'code',
        content: '[FastTrack / Topaz Data] ---+\n                        |\n                        +--> [Cleaning & Normalization] --> [Feature Engineering] --> [ML Architecture]\n                        |\n[Betfair Market Streams] ---+',
      },
      {
        type: 'heading',
        content: 'Feature Engineering: The Core Signal Drivers',
      },
      {
        type: 'paragraph',
        content:
          'Raw form metrics rarely yield predictive value without domain-specific normalization. Quantitative greyhound models build predictive signal through four key feature categories:',
      },
      {
        type: 'subheading',
        content: '1. Split Trajectories and Early Speed (PIR)',
      },
      {
        type: 'paragraph',
        content:
          'Sectional times — particularly first-bend splits — often dictate race outcomes. Models parse Position-in-Running codes (e.g., M/111 vs. S/888) alongside raw split margins to quantify a runner\'s likelihood of securing the lead before the first turn.',
      },
      {
        type: 'image',
        image:
          'https://images.pexels.com/photos/7947844/pexels-photo-7947844.jpeg?auto=compress&cs=tinysrgb&w=1200',
        alt: 'Top view of vibrant charts and colored pencils on a wooden surface',
        caption: 'Feature engineering transforms raw sectional times into normalized, comparable metrics',
      },
      {
        type: 'subheading',
        content: '2. Track and Distance Speed Indices',
      },
      {
        type: 'paragraph',
        content:
          'Track conditions fluctuate based on surface moisture, track wear, and geometry. Rather than using raw completion times, models compute normalized metrics.',
      },
      {
        type: 'paragraph',
        content:
          'Track Speed Index (TSI): Compares a runner\'s time against the rolling median winning time for that specific track and distance. Standardizing these times allows models to compare performances across disparate venues (e.g., Wentworth Park, Angle Park, Albion Park) on a unified scale.',
      },
      {
        type: 'code',
        content: 'TSI = Runner Split / Finish Time\n     -----------------------------------------\n     Rolling Track/Distance Median Time',
      },
      {
        type: 'subheading',
        content: '3. Box Draw Dynamics and Spatial Trajectory',
      },
      {
        type: 'paragraph',
        content:
          "Greyhounds exhibit distinct running traits (railer, mid-track, wide). Spatial collision algorithms model the interplay between a runner's box draw and neighboring dogs' tendencies. A wide-running dog drawn in Box 1 paired with an aggressive railing dog in Box 2 creates a high probability of initial checking.",
      },
      {
        type: 'paragraph',
        content:
          'Models quantify cross-trajectory clash probabilities using interaction terms based on historical rail bias and box split averages.',
      },
      {
        type: 'subheading',
        content: '4. Kinetic and Physical Profiles',
      },
      {
        type: 'list',
        items: [
          'Weight Fluctuation: Shifts from a runner\'s historical optimal racing weight directly affect acceleration and torque coming out of the traps.',
          'Rest Latency: Days between starts, tracking whether back-to-back runs show metabolic fatigue or peak fitness conditioning.',
        ],
      },
      {
        type: 'heading',
        content: 'Machine Learning Architectures',
      },
      {
        type: 'paragraph',
        content:
          'Predictive systems model races either as multi-class classification problems (predicting which dog finishes first among eight runners) or as conditional ranking tasks.',
      },
      {
        type: 'table',
        headers: ['Architecture', 'Implementation', 'Primary Strengths', 'Limitations'],
        rows: [
          [
            'Gradient Boosted Trees (XGBoost, LightGBM, CatBoost)',
            'Pointwise classification or ranking (LambdaMART)',
            'Native handling of non-linear interactions, robust to missing values, strong tabular performance.',
            'Susceptible to overfitting noisy, high-variance races without strict tree-depth pruning.',
          ],
          [
            'Multinomial Logistic Regression',
            'Conditional Softmax classification',
            'Fast convergence, direct probability calibration, low computational overhead.',
            'Struggles to capture complex feature interactions without manual polynomial expansion.',
          ],
          [
            'Neural Permutation Models / ListNet',
            'Pairwise/Listwise loss optimization',
            'Directly models the permutation of all 8 runners relative to the field dynamics.',
            'Requires massive training volumes and extensive regularisation to avoid mode collapse.',
          ],
        ],
      },
      {
        type: 'image',
        image:
          'https://images.pexels.com/photos/2061168/pexels-photo-2061168.jpeg?auto=compress&cs=tinysrgb&w=1200',
        alt: 'Detailed view of colorful programming code on a computer screen',
        caption: 'Model architecture selection depends on training data volume and feature complexity',
      },
      {
        type: 'heading',
        content: 'Probability Normalization and Metric Calibration',
      },
      {
        type: 'paragraph',
        content:
          'A race is a zero-sum, mutually exclusive event: exactly one greyhound wins, and the true probabilities of all runners in the field must sum to 1.0.',
      },
      {
        type: 'code',
        content: 'sum(i=1..n) P(Win(i)) = 1.0',
      },
      {
        type: 'paragraph',
        content:
          'Standard classification algorithms generate unconstrained raw sigmoid scores for each dog. Machine learning pipelines apply normalization functions — typically Softmax — across the runner array for each race ID:',
      },
      {
        type: 'code',
        content: 'P(Win(i)) = exp(y_hat(i)) / sum(j=1..n) exp(y_hat(j))',
      },
      {
        type: 'paragraph',
        content:
          'To ensure calculated probabilities match real-world outcomes (e.g., an assigned 0.20 probability actually wins 20% of the time across a large sample), engineers apply Platt Scaling or Isotonic Regression to calibrate predictions.',
      },
      {
        type: 'code',
        content: '[Raw Model Predictions] --> [Isotonic / Platt Calibration] --> [Softmax Field Normalization] --> [Fair Odds]',
      },
      {
        type: 'paragraph',
        content:
          'Model efficacy is evaluated using loss functions that penalize probabilistic variance:',
      },
      {
        type: 'list',
        items: [
          'Log Loss (Cross-Entropy Loss): Measures confidence penalties on actual outcomes.',
          'Brier Score: Quantifies the mean squared difference between predicted probabilities and actual categorical outcomes (1 for win, 0 for loss).',
        ],
      },
      {
        type: 'heading',
        content: 'Value Discovery vs. Market Odds',
      },
      {
        type: 'paragraph',
        content:
          'The primary analytical objective of sports modelling is identifying statistical divergence from prevailing exchange markets.',
      },
      {
        type: 'paragraph',
        content:
          'By taking reciprocal calibrated probabilities, models derive intrinsic "fair prices". When an exchange\'s implied market probability diverges significantly from a calibrated model\'s output, quantitative systems highlight that delta as expected value (EV).',
      },
      {
        type: 'code',
        content: 'Fair Price(i) = 1 / P(Win(i))\n\nEV = (P(Win) * (DecimalOdds - 1)) - (1 - P(Win))\n\n  Market Implied Prob: 15%  ($6.67)\n  Model Probability:   22%  ($4.55)\n  ------------------------------------\n  Positive Expected Value (EV > 0)',
      },
      {
        type: 'image',
        image:
          'https://images.pexels.com/photos/7947954/pexels-photo-7947954.jpeg?auto=compress&cs=tinysrgb&w=1200',
        alt: 'A screen displaying various data charts and graphs',
        caption: 'Model vs. market probability comparison reveals value opportunities at a glance',
      },
      {
        type: 'callout',
        content:
          'Through automated pipelines, quantitative researchers continuously refine these feature weights, deploying machine learning to systematically analyze the physics, biology, and probabilities of modern greyhound racing. Greyhound Edge brings this same analytical rigor to your dashboard — every probability, confidence rating, and false-favourite flag is the output of these calibrated pipelines.',
      },
    ],
  },
  {
    slug: 'evolution-australian-greyhound-racing',
    title: 'The Evolution of Australian Greyhound Racing: From Coursing to Modern Digital Tracks',
    excerpt:
      'From rural live-hare coursing in the 1860s to sub-second digital timing and nationwide broadcast — the complete history of how Australian greyhound racing became the data-rich industry it is today.',
    date: 'September 17, 2026',
    readTime: '8 min read',
    category: 'History',
    heroImage:
      'https://images.pexels.com/photos/15466766/pexels-photo-15466766.jpeg?auto=compress&cs=tinysrgb&w=1200',
    heroAlt: 'Exciting horse race capturing jockeys in action with a cheering crowd under sunny skies',
    author: 'Greyhound Edge Editorial Team',
    sections: [
      {
        type: 'paragraph',
        content:
          'Greyhound racing in Australia evolved from rural live-hare coursing in the mid-19th century into a highly regulated, data-rich racing industry. The journey from open paddocks to standardized circular tracks with sub-second digital timing is a story of technological adoption, regulatory reform, and the relentless pursuit of fairness and speed.',
      },
      {
        type: 'heading',
        content: '1860s–1920s: The Open Coursing Era',
      },
      {
        type: 'paragraph',
        content:
          'The earliest recorded events took place across open paddocks in Victoria and South Australia, operating under traditional National Coursing Club rules. Dogs were judged on agility, speed, and turns rather than outright track times. The sport was a rural pursuit, tied to the agricultural calendar and dependent on live game for the lure.',
      },
      {
        type: 'paragraph',
        content:
          'These early meetings were as much social gathering as sporting contest. Landowners, breeders, and local communities would gather for multi-day events, with dogs competing in knockout brackets until a single winner remained. The format was inherently subjective — judges scored dogs on their ability to follow, pressure, and turn the hare, not on raw velocity.',
      },
      {
        type: 'image',
        image:
          'https://images.pexels.com/photos/802861/pexels-photo-802861.jpeg?auto=compress&cs=tinysrgb&w=1200',
        alt: 'Dynamic shot of a harness horse race on a wet beach',
        caption: 'Early coursing events bore more resemblance to field trials than modern racing',
      },
      {
        type: 'heading',
        content: '1927: The Introduction of the Mechanical Lure',
      },
      {
        type: 'paragraph',
        content:
          'Harold Park in Sydney hosted Australia\'s first circular greyhound meeting using an artificial "tin hare" — a mechanical lure dragged around a circular track at controlled speed. This single innovation transformed the sport into an urban spectator industry, enabling standardized distances, controlled trap boxes, and precise parimutuel wagering.',
      },
      {
        type: 'paragraph',
        content:
          'The mechanical lure solved the fundamental problem of coursing: it eliminated the variability of live game and replaced it with a reproducible, fair contest of pure speed and stamina. For the first time, race times could be compared across meetings, distances could be standardized, and spectators could wager with confidence that every dog faced identical conditions.',
      },
      {
        type: 'heading',
        content: '1960s–1990s: Institutional Governance and Broadcast',
      },
      {
        type: 'paragraph',
        content:
          'State-level governing bodies formed to standardize the sport. Greyhound Racing Victoria, Greyhound Racing NSW, and equivalent bodies in Queensland, South Australia, and Western Australia established uniform race distances (sprints, middle-distance, and staying tiers), licensing requirements for trainers, and integrity testing protocols.',
      },
      {
        type: 'paragraph',
        content:
          'The integration of nationwide broadcast distribution via Sky Racing in the 1990s brought greyhound racing into living rooms across the country. For the first time, punters could watch and wager on races from multiple states in a single afternoon, dramatically expanding the sport\'s commercial footprint.',
      },
      {
        type: 'image',
        image:
          'https://images.pexels.com/photos/4135333/pexels-photo-4135333.jpeg?auto=compress&cs=tinysrgb&w=1200',
        alt: 'Stadium floodlights illuminating the night sky',
        caption: 'Night racing under floodlights became a defining feature of Australian greyhound tracks',
      },
      {
        type: 'heading',
        content: '2015–Present: Welfare Transformation and Digital Infrastructure',
      },
      {
        type: 'paragraph',
        content:
          'Industry reforms introduced microchipping, full lifecycle tracking, DNA testing for breeding verification, track redesigns (including transition bends and straight tracks), and sub-second digital timing sensors. These changes were driven by both welfare imperatives and the demand for richer data for punters and analysts.',
      },
      {
        type: 'paragraph',
        content:
          'Modern tracks now feature electronic timing accurate to thousandths of a second, GPS tracking of individual runners during races, and digital form databases accessible in real time. The same data infrastructure that powers integrity monitoring also feeds the predictive models that platforms like Greyhound Edge use to generate win probabilities and confidence ratings.',
      },
      {
        type: 'callout',
        content:
          'Every feature in the Greyhound Edge dashboard — from speed maps to confidence scores — traces its lineage back to this evolution. The mechanical lure made racing fair; digital timing made it measurable; and the data infrastructure made it predictable.',
      },
    ],
  },
  {
    slug: 'fernando-bale-benchmark-australian-greyhound-racing',
    title: 'Fernando Bale: The Benchmark of Modern Australian Greyhound Racing and Breeding',
    excerpt:
      'With 35 wins from 44 starts, 8 Group 1 titles, and over $1.3 million in prizemoney, Fernando Bale redefined sprinting performance before becoming one of the most prolific stud dogs in racing history.',
    date: 'September 17, 2026',
    readTime: '6 min read',
    category: 'Champions',
    heroImage:
      'https://images.pexels.com/photos/3732465/pexels-photo-3732465.jpeg?auto=compress&cs=tinysrgb&w=1200',
    heroAlt: 'A joyful dog running across a grass field',
    author: 'Greyhound Edge Editorial Team',
    sections: [
      {
        type: 'paragraph',
        content:
          'Whelped in March 2013 by Kelsos Fusileer out of Chloe Allen, Fernando Bale redefined the performance metrics of Australian sprinting before becoming one of the most prolific stud dogs in racing history. His career set new benchmarks for win rate, prizemoney, and Group 1 dominance — and his breeding legacy continues to shape the sport today.',
      },
      {
        type: 'heading',
        content: 'Career Statistics',
      },
      {
        type: 'table',
        headers: ['Metric', 'Fernando Bale Career Statistics'],
        rows: [
          ['Race Record', '44 Starts: 35 Wins, 3 Seconds, 2 Thirds'],
          ['Prizemoney', '$1,299,370 (First Australian greyhound to break the $1M barrier)'],
          ['Group 1 Titles', '8 Group 1 Victories (including Australian Cup, Melbourne Cup, Golden Easter Egg)'],
          ['Win Rate', '~80% Win Strike Rate'],
        ],
      },
      {
        type: 'image',
        image:
          'https://images.pexels.com/photos/12040559/pexels-photo-12040559.jpeg?auto=compress&cs=tinysrgb&w=1200',
        alt: 'Artistic blur effect of a dog running captured in black-and-white',
        caption: 'Fernando Bale\'s explosive acceleration made him nearly impossible to beat from the front',
      },
      {
        type: 'heading',
        content: 'The On-Track Mechanics',
      },
      {
        type: 'paragraph',
        content:
          'Fernando Bale\'s racing style was characterized by extreme initial acceleration. His first-split timing regularly broke track sectional records, allowing him to clear the field before the first turn and eliminate interference risks. In greyhound racing, the leader at the first bend has an overwhelming statistical advantage — and Fernando Bale was almost always that leader.',
      },
      {
        type: 'paragraph',
        content:
          'His ability to produce sub-5.00-second first splits over 520m at Wentworth Park gave him a margin that even elite closers could not reel in. The combination of raw box speed and the rail-running instinct meant he rarely faced traffic trouble — the single biggest variable that can undo a dominant runner.',
      },
      {
        type: 'heading',
        content: 'The Breeding Legacy',
      },
      {
        type: 'paragraph',
        content:
          'Upon retirement to stud, Fernando Bale transformed the global bloodline landscape. His progeny have won tens of millions in prizemoney across Australia, consistently dominating the national Sires\' Premiership. His genetic line passes on explosive early box pace and high chasing drive, making his bloodline a core foundation in modern racing pedigrees.',
      },
      {
        type: 'paragraph',
        content:
          'For analysts and modellers, the Fernando Bale line is a critical feature in any predictive system. Dogs sired by Fernando Bale and his descendants consistently show faster first-split times and higher win probabilities over sprint distances, making bloodline data a valuable input for form analysis.',
      },
      {
        type: 'callout',
        content:
          'Greyhound Edge incorporates sire line and damline data into its feature pipeline. When a Fernando Bale progeny lines up in Box 1 over a sprint distance, the model adjusts its first-split projection upward — reflecting the genetic predisposition for early speed that this bloodline consistently delivers.',
      },
    ],
  },
  {
    slug: 'tommy-shelby-peoples-dog-sire-powerhouse',
    title: 'Tommy Shelby: The "People\'s Dog" and Modern Sire Powerhouse',
    excerpt:
      'Named after the lead in Peaky Blinders, Tommy Shelby won 29 from 44 starts, earned over $1M, and claimed three Group 1 titles before becoming a foundational sire successor to Fernando Bale.',
    date: 'September 17, 2026',
    readTime: '5 min read',
    category: 'Champions',
    heroImage:
      'https://images.pexels.com/photos/8145378/pexels-photo-8145378.jpeg?auto=compress&cs=tinysrgb&w=1200',
    heroAlt: 'Two dogs joyfully running through a lush green field',
    author: 'Greyhound Edge Editorial Team',
    sections: [
      {
        type: 'paragraph',
        content:
          'Named after the lead character in Peaky Blinders, the blue dog Tommy Shelby (by Fernando Bale out of Serena Fly High) became a national fan favorite and a top-tier Group 1 competitor. His combination of mid-race acceleration, track intelligence, and versatility across distances and tracks made him one of the most compelling racers of his generation.',
      },
      {
        type: 'heading',
        content: 'Career Statistics',
      },
      {
        type: 'table',
        headers: ['Metric', 'Tommy Shelby Career Statistics'],
        rows: [
          ['Race Record', '44 Starts: 29 Wins, 7 Seconds, 4 Thirds'],
          ['Prizemoney', '$1,020,870'],
          ['Major Titles', 'Group 1 Hobart Thousand, Group 1 Australian Cup, Group 1 Golden Easter Egg'],
          ['Trainer', 'Steven Withers (Western Australia)'],
        ],
      },
      {
        type: 'heading',
        content: 'The Racing Profile',
      },
      {
        type: 'paragraph',
        content:
          'Unlike pure front-runners who rely solely on early box clearance, Tommy Shelby possessed exceptional middle-race acceleration and track intelligence. He won across multiple track configurations nationwide — from Cannington in WA to Wentworth Park in NSW and The Meadows in Victoria. This versatility is rare in elite greyhounds, who typically specialise in one track geometry or distance category.',
      },
      {
        type: 'paragraph',
        content:
          'His second-split times — the transit speed through the back straight — were consistently elite, allowing him to make ground from behind without colliding with other runners. This mid-race gear change is what separated him from other Fernando Bale progeny who shared his father\'s early speed but lacked the same cruising velocity.',
      },
      {
        type: 'image',
        image:
          'https://images.pexels.com/photos/5389345/pexels-photo-5389345.jpeg?auto=compress&cs=tinysrgb&w=1200',
        alt: 'Close-up of two Rhodesian Ridgeback dogs outdoors',
        caption: 'Tommy Shelby\'s versatility across tracks and distances set him apart from single-distance specialists',
      },
      {
        type: 'heading',
        content: 'The Stud Career',
      },
      {
        type: 'paragraph',
        content:
          'Following his retirement, Tommy Shelby transitioned to stud duties as one of Fernando Bale\'s primary sire successors. His litters are tracked closely for retaining his father\'s early speed combined with his own stamina over the 500m distance. Breeders specifically pair Tommy Shelby with damlines that complement his mid-race strength, aiming to produce runners capable of winning over both sprint and middle-distance trips.',
      },
      {
        type: 'callout',
        content:
          'When Greyhound Edge flags a runner as Tommy Shelby progeny over a 500m–600m trip, the model weights second-split projections and middle-distance track records more heavily — reflecting the genetic tendency for sustained mid-race pace that this bloodline carries.',
      },
    ],
  },
  {
    slug: 'leading-sire-lines-bloodlines-australian-greyhound-racing',
    title: 'Leading Sire Lines and Bloodlines in Australian Greyhound Racing',
    excerpt:
      'From the Fernando Bale line\'s explosive early speed to the Barcia Bale line\'s mid-race torque — a guide to the dominant sire lines, damlines, and breeding genetics shaping modern Australian greyhound racing.',
    date: 'September 17, 2026',
    readTime: '7 min read',
    category: 'Breeding',
    heroImage:
      'https://images.pexels.com/photos/8730427/pexels-photo-8730427.jpeg?auto=compress&cs=tinysrgb&w=1200',
    heroAlt: 'Two Siberian Huskies playfully interacting in a snowy landscape',
    author: 'Greyhound Edge Editorial Team',
    sections: [
      {
        type: 'paragraph',
        content:
          'In racing greyhound terminology, "breed" refers to specific sire lines and damlines, as all registered racers belong to the global Greyhound breed. Australian racing bloodlines combine imported American and Irish speed with domestic stamina, producing animals uniquely suited to the track geometries and distance categories found across the country.',
      },
      {
        type: 'heading',
        content: 'The Modern Dominant Sire Lines',
      },
      {
        type: 'subheading',
        content: 'The Fernando Bale Line',
      },
      {
        type: 'paragraph',
        content:
          'Focuses on explosive first-split speed, low box-rise times, and efficient cornering technique. Progeny consistently show sub-5.00 second first splits over 520m, making them dominant on tracks with short runs to the first turn where early box position is decisive.',
      },
      {
        type: 'subheading',
        content: 'The Barcia Bale Line',
      },
      {
        type: 'paragraph',
        content:
          'Known for heavier, high-torque frames, powerful mid-race drive, and late-race run-home strength. Barcia Bale progeny tend to perform best on tracks with long sweeping turns and wide home straights (such as Sandown Park), where their cruising velocity and stamina can be fully deployed.',
      },
      {
        type: 'subheading',
        content: 'The Bernardo Line',
      },
      {
        type: 'paragraph',
        content:
          'Excellent modern producers of middle-distance (500m–600m) contenders with balanced split metrics. Bernardo progeny are valued for their consistency rather than explosive single-sector dominance, making them reliable performers across varied track configurations.',
      },
      {
        type: 'image',
        image:
          'https://images.pexels.com/photos/9040438/pexels-photo-9040438.jpeg?auto=compress&cs=tinysrgb&w=1200',
        alt: 'Two Bernese Mountain Dogs lying on the floor next to a laptop',
        caption: 'Bloodline analysis combines sire line tendencies with damline characteristics for full pedigree assessment',
      },
      {
        type: 'subheading',
        content: 'The Aston Dee Bee Line',
      },
      {
        type: 'paragraph',
        content:
          'Renowned for raw muscular power, high sprint speed over 300m–400m, and physical durability. Aston Dee Bee progeny are particularly dominant on straight tracks (Healesville, Capalaba) where pure acceleration without turn negotiation determines the winner.',
      },
      {
        type: 'heading',
        content: 'The Influence of Broodbitches (Damlines)',
      },
      {
        type: 'paragraph',
        content:
          'In quantitative pedigree analysis, the damline often carries equal or greater weight than the sire. While sires contribute genetic material to hundreds of offspring annually, a top broodbitch produces a small, carefully managed litter — and her specific genetic contribution to track performance is disproportionately significant.',
      },
      {
        type: 'subheading',
        content: 'The "Bale" Damline (Paul Wheeler)',
      },
      {
        type: 'paragraph',
        content:
          'The single most influential female family in modern Australasian racing, generating dozens of Group 1 winners over three decades. Paul Wheeler\'s breeding program focused on selecting broodbitches with proven first-split speed and high chase drive, then crossing them with complementary sire lines.',
      },
      {
        type: 'subheading',
        content: 'The "Aston" Line (Ray Borda)',
      },
      {
        type: 'paragraph',
        content:
          'Consistently produces high-strike-rate short-course and sprint performers. The Borda breeding program emphasises raw acceleration and box speed, making Aston damline progeny particularly effective on tracks with short straight sections before the first bend.',
      },
      {
        type: 'callout',
        content:
          'Greyhound Edge\'s model incorporates bloodline data as a feature layer. When a runner\'s sire and dam lines are both associated with strong first-split performance, the model adjusts its early-speed projection — which in turn affects the win probability, confidence rating, and false-favourite detection.',
      },
    ],
  },
  {
    slug: 'split-speeds-sectional-timing-greyhound-form-analysis',
    title: 'Understanding Split Speeds and Sectional Timing in Greyhound Form Analysis',
    excerpt:
      'First splits, middle pace, and run-home times — the three core sectionals that determine race outcomes. Here is how each phase is measured, what it reveals, and why the leader at the first bend usually wins.',
    date: 'September 17, 2026',
    readTime: '8 min read',
    category: 'Analysis',
    heroImage:
      'https://images.pexels.com/photos/19730401/pexels-photo-19730401.jpeg?auto=compress&cs=tinysrgb&w=1200',
    heroAlt: 'Vintage mechanical stopwatch with black dial against a dark background',
    author: 'Greyhound Edge Editorial Team',
    sections: [
      {
        type: 'paragraph',
        content:
          'Sectional times (splits) divide a race into measurable geometric phases. Evaluating splits isolates an individual greyhound\'s raw physical output from race interference, providing a cleaner signal of capability than total race time alone. Understanding these three phases is the foundation of all modern greyhound form analysis.',
      },
      {
        type: 'code',
        content:
          '[ START ] --> (1st Split: Box Exit to Bend 1) --> (2nd Split: Back Straight) --> (Run-Home: Final Turn to Line) --> [ FINISH ]',
      },
      {
        type: 'heading',
        content: 'The Three Core Sectionals',
      },
      {
        type: 'subheading',
        content: 'First Split (Early Speed)',
      },
      {
        type: 'paragraph',
        content:
          'What it measures: The time elapsed from the trap lids opening to the first timing sensor prior to or at the first turn.',
      },
      {
        type: 'paragraph',
        content:
          'Analytical value: Determines whether a dog can lead the field into the first corner. The leader at the first bend has an overwhelming statistical probability of placing or winning — often cited as 60% or higher across most Australian track configurations. This is the single most predictive metric in greyhound racing.',
      },
      {
        type: 'image',
        image:
          'https://images.pexels.com/photos/35678274/pexels-photo-35678274.jpeg?auto=compress&cs=tinysrgb&w=1200',
        alt: 'Aerial shot of a track field with numbered lanes',
        caption: 'Box exit speed and the run to the first turn is the most predictive metric in form analysis',
      },
      {
        type: 'subheading',
        content: 'Second Split (Middle Pace)',
      },
      {
        type: 'paragraph',
        content:
          'What it measures: The transit speed through the back straight — the section between the first turn and the home turn.',
      },
      {
        type: 'paragraph',
        content:
          'Analytical value: Measures a runner\'s ability to maintain high cruising velocity or make ground from behind without colliding with other runners. A dog with an elite second split can overcome a mediocre first split by running around or through the field during the back straight, positioning itself for a winning run-home.',
      },
      {
        type: 'subheading',
        content: 'Run-Home Time (Stamina & Recovery)',
      },
      {
        type: 'paragraph',
        content:
          'What it measures: The final sector from the home turn to the winning post.',
      },
      {
        type: 'paragraph',
        content:
          'Analytical value: Highlights late-race stamina. A dog with a slow first split but an elite run-home time is classified as a "closer" or "run-on dog" — often targeted for step-ups to 600m+ distances where early speed becomes less decisive and sustained stamina matters more.',
      },
      {
        type: 'heading',
        content: 'Why Sectional Analysis Matters More Than Total Time',
      },
      {
        type: 'paragraph',
        content:
          'Total race time is a blunt instrument. A dog that wins in 30.10 seconds over 520m might have done so by leading from the front with no interference, or by weaving through traffic from Box 8 with multiple checks. The sectional breakdown reveals which scenario actually occurred, and therefore whether the performance is repeatable.',
      },
      {
        type: 'paragraph',
        content:
          'Two dogs can post identical total times with fundamentally different performance profiles: one a front-running speedster with a 4.92 first split and a slow 7.10 run-home, the other a closer with a 5.15 first split but an elite 6.85 run-home. On a different track or box draw, these profiles produce very different outcomes.',
      },
      {
        type: 'callout',
        content:
          'Greyhound Edge\'s speed maps are built from sectional data, not total times. The model projects each runner\'s first-split, second-split, and run-home times independently, then simulates the race to produce win probabilities. This is why two runners with similar overall form can receive very different confidence ratings — their sectional profiles tell different stories.',
      },
    ],
  },
  {
    slug: 'anatomy-australian-greyhound-tracks-geometry-turns-box-dynamics',
    title: 'Anatomy of Australian Greyhound Tracks: Geometry, Turns, and Box Dynamics',
    excerpt:
      'From Wentworth Park\'s tight first turn to Healesville\'s straight 300m — how track architecture, turn camber, and box-to-bend distance dictate race dynamics and collision probability across every major Australian venue.',
    date: 'September 17, 2026',
    readTime: '9 min read',
    category: 'Tracks',
    heroImage:
      'https://images.pexels.com/photos/35678275/pexels-photo-35678275.jpeg?auto=compress&cs=tinysrgb&w=1200',
    heroAlt: 'Aerial perspective of a red running track and adjacent green field',
    author: 'Greyhound Edge Editorial Team',
    sections: [
      {
        type: 'paragraph',
        content:
          'Track architecture dictates race dynamics, collision probability, and box advantage across Australian states. The same dog can perform dramatically differently at Wentworth Park versus Sandown Park versus Healesville — not because of fitness or form changes, but because the track geometry favours or penalises its running style. Understanding these differences is essential for any serious form analyst.',
      },
      {
        type: 'heading',
        content: 'Major Australian Track Profiles',
      },
      {
        type: 'table',
        headers: ['Track', 'State', 'Type', 'Distances', 'Distinct Geometric Characteristics'],
        rows: [
          ['Wentworth Park', 'NSW', 'Circular (Two Turns)', '520m, 720m', 'Standard city circumference. Tight first turn heavily favors Box 1 on the rail.'],
          ['Sandown Park', 'VIC', 'Two-Turn Oval', '515m, 595m, 715m', 'Long, sweeping turns and a wide home straight allow late-closing runners room to pass.'],
          ['The Meadows', 'VIC', 'Two-Turn Oval', '525m, 600m, 730m', 'Tighter turns than Sandown; strong front-running bias on the 525m sprint trip.'],
          ['Angle Park', 'SA', 'Two-Turn Oval', '342m, 530m, 595m', 'Modern cambered surface re-engineered to balance inside and outside running lines.'],
          ['Albion Park', 'QLD', 'Two-Turn Oval', '331m, 395m, 520m', 'Tight first turn from the 520m boxes creates heavy compression for boxes 4, 5, and 6.'],
          ['Cannington', 'WA', 'Two-Turn Oval', '380m, 520m, 600m', 'Deep sand base and sweeping home bend; rewards high cruising velocity.'],
          ['Healesville / Capalaba', 'VIC / QLD', 'Straight Track', '300m, 350m, 366m', 'Zero turns. Eliminates first-bend collision risk and provides an even baseline across all box draws.'],
        ],
      },
      {
        type: 'image',
        image:
          'https://images.pexels.com/photos/5110697/pexels-photo-5110697.jpeg?auto=compress&cs=tinysrgb&w=1200',
        alt: 'Aerial view of track and soccer field showing sports facilities from above',
        caption: 'Track geometry — turn radius, straight length, and surface composition — varies significantly across Australian venues',
      },
      {
        type: 'heading',
        content: 'Why Track Design Influences Performance',
      },
      {
        type: 'subheading',
        content: 'Turn Camber (Banking)',
      },
      {
        type: 'paragraph',
        content:
          'Modern tracks feature 8% to 10% banking on turns. This counteracts centrifugal forces, preventing wide runners from sliding off track and reducing injury risk. Tracks with steeper camber allow dogs to maintain higher speeds through turns, while tracks with shallower banking force runners to decelerate into the bend — disadvantaging front-runners who lose their lead at the first turn.',
      },
      {
        type: 'subheading',
        content: 'Run to the First Turn',
      },
      {
        type: 'paragraph',
        content:
          'Tracks with a short distance between the traps and the first bend (less than 80 meters) produce higher collision rates, because dogs have less time to sort into running order before cornering. Boxes 1 and 2 are heavily favoured on these tracks because they have the shortest rail-line distance to the turn. Tracks with runs over 100 meters allow greyhounds to settle into running order before cornering, making box draw less decisive and rewarding sustained cruising speed over pure box speed.',
      },
      {
        type: 'subheading',
        content: 'Surface Composition',
      },
      {
        type: 'paragraph',
        content:
          'Track surfaces vary from deep sand (Cannington) to harder packed compositions (Wentworth Park). Deep sand surfaces absorb more energy with each stride, favouring dogs with higher torque and stamina. Harder surfaces reward raw speed and acceleration but can increase injury risk. Surface condition on the day — affected by rainfall, harrow depth, and temperature — shifts these dynamics further.',
      },
      {
        type: 'heading',
        content: 'Box Draw Bias by Track',
      },
      {
        type: 'paragraph',
        content:
          'Box advantage is not uniform across tracks. At Wentworth Park over 520m, Box 1 wins approximately 20% of races — well above the 12.5% baseline expected from a random draw across 8 boxes. At Sandown Park over 515m, the bias is less extreme, with Boxes 1–3 sharing more evenly. At Healesville\'s straight 300m, box advantage is negligible because there are no turns to negotiate.',
      },
      {
        type: 'paragraph',
        content:
          'These biases are stable over large samples but can shift with track renovations, surface changes, and distance reconfigurations. Models that incorporate track-specific box bias as a feature — rather than treating all tracks identically — produce significantly better calibrated probability estimates.',
      },
      {
        type: 'callout',
        content:
          'Greyhound Edge incorporates track-specific box bias coefficients for every major Australian venue. When the model evaluates a race at Albion Park over 520m, it applies heavier compression penalties to middle boxes (4–6) than it would for the same draw at Sandown Park. This is why the same dog can receive different confidence ratings at different tracks — the geometry demands it.',
      },
    ],
  },
  {
    slug: 'modeling-track-surface-degradation-harrow-moisture-velocity',
    title: 'Modeling Track Surface Degradation: Harrow Depth, Moisture, and Velocity Decay',
    excerpt:
      'Track surface physics directly influence kinetic transfer and cornering friction. Here is how harrow depth, moisture index, and rail wear shift baseline speeds throughout a single race meeting — and how predictive models correct for it.',
    date: 'September 17, 2026',
    readTime: '9 min read',
    category: 'Analysis',
    heroImage:
      'https://images.pexels.com/photos/1478450/pexels-photo-1478450.jpeg?auto=compress&cs=tinysrgb&w=1200',
    heroAlt: 'Detailed texture of fine coastal sand captured in a close-up shot',
    author: 'Greyhound Edge Engineering Team',
    sections: [
      {
        type: 'paragraph',
        content:
          'Track surface physics directly influence kinetic transfer and cornering friction. Surface conditions are non-stationary throughout a single race meeting, shifting between the first race and the final event. A model that treats a 30.00-second run in Race 1 the same as a 30.00-second run in Race 8 — without accounting for surface degradation — will systematically misjudge form.',
      },
      {
        type: 'heading',
        content: 'Physical Surface Variables',
      },
      {
        type: 'subheading',
        content: 'Harrow Depth',
      },
      {
        type: 'paragraph',
        content:
          'Track curators mechanically loosen the track sand or loam (typically to depths between 25mm and 40mm) to cushion impact. A deeper harrow increases traction demands, reducing initial burst acceleration and favoring high-torque runners. Conversely, a shallow harrow produces a firmer, faster surface that rewards explosive box speed but increases injury risk.',
      },
      {
        type: 'subheading',
        content: 'Moisture Index',
      },
      {
        type: 'paragraph',
        content:
          'Tracks dry continuously under sunlight and wind, shifting sand from firm and cohesive to loose and rolling. Water tanker applications between races reset surface compaction, altering track baseline speeds within minutes. A track that runs fast in Race 2 can be two to three tenths slower by Race 6 if no watering occurs — a shift large enough to flip a model\'s probability rankings.',
      },
      {
        type: 'image',
        image:
          'https://images.pexels.com/photos/34346947/pexels-photo-34346947.jpeg?auto=compress&cs=tinysrgb&w=1200',
        alt: 'Detailed view of sandy beach showcasing natural wind patterns and textures',
        caption: 'Surface moisture and harrow depth shift baseline track speeds throughout a meeting',
      },
      {
        type: 'subheading',
        content: 'Track Camber and Rail Wear',
      },
      {
        type: 'paragraph',
        content:
          'Continuous running compresses the innermost running line along the rail, creating a compacted "fast lane" while outside lanes remain loose. Over the course of a 10-race meeting, the rail line becomes progressively firmer — subtly increasing the advantage of inside box draws in later races. This effect is most pronounced on tracks with high daily usage and minimal surface renovation between meetings.',
      },
      {
        type: 'heading',
        content: 'Calculating the Dynamic Daily Track Variant',
      },
      {
        type: 'paragraph',
        content:
          'To prevent non-stationary surface conditions from polluting baseline speed figures, predictive engines apply a dynamic track variant (TV) across consecutive races at the same meeting. The variant measures how much faster or slower the surface is running relative to the long-term benchmark for that track and distance.',
      },
      {
        type: 'code',
        content:
          'TV(m) = Median({ T(i,d) - mu(d) }) for all runners i in Race m\n\nWhere:\n  T(i,d) = recorded individual race time over distance d\n  mu(d)  = long-term benchmark median for that track and distance\n  m      = race number within the meeting',
      },
      {
        type: 'paragraph',
        content:
          'A negative variant means the surface is running fast (firm, fresh harrow). A positive variant means the surface is running slow (drying, loose, or worn). The variant is recalculated after each race, giving the model a real-time correction factor for every subsequent race on the same card.',
      },
      {
        type: 'code',
        content:
          'Race 1 (Fresh Harrow, Firm)     -->  TV = -0.12s  (Fast Surface)\nRace 5 (Drying Sand, Loose)    -->  TV = +0.21s  (Slow Surface)\nRace 8 (Post-Watering Pack)    -->  TV = -0.04s  (Standard Surface)',
      },
      {
        type: 'image',
        image:
          'https://images.pexels.com/photos/19130036/pexels-photo-19130036.jpeg?auto=compress&cs=tinysrgb&w=1200',
        alt: 'Close-up view of rippling patterns in desert sand dunes with a warm earthy tone',
        caption: 'The dynamic track variant corrects raw run times for real-time surface conditions',
      },
      {
        type: 'heading',
        content: 'Why This Matters for Form Analysis',
      },
      {
        type: 'paragraph',
        content:
          'Adjusting raw run times by the real-time track variant prevents models from misinterpreting simple ground-condition shifts as changes in a greyhound\'s underlying physical fitness. Without this correction, a dog that runs a slow time on a deteriorating surface in Race 8 would be incorrectly downgraded by the model — when in fact its adjusted time may represent a career-best performance.',
      },
      {
        type: 'paragraph',
        content:
          'The correction also works in the opposite direction: a fast time on a freshly harrowed, firm surface in Race 1 may look impressive in raw terms but, once adjusted for the negative track variant, reveals a merely average performance. This distinction is critical for identifying genuine form improvement versus surface-assisted flattery.',
      },
      {
        type: 'callout',
        content:
          'Greyhound Edge applies a dynamic track variant to every run time before feeding it into the speed index calculation. This ensures that the win probabilities and confidence ratings you see on the dashboard reflect each runner\'s true physical output, not the surface conditions they happened to encounter.',
      },
    ],
  },
  {
    slug: 'machine-learning-trainer-form-dynamics-nested-group-variances',
    title: 'Machine Learning for Trainer Form Dynamics: Handling Nested Group Variances',
    excerpt:
      'Trainer strike rates are confounded by class bias and small sample sizes. Here is how hierarchical Bayesian models and empirical Bayes shrinkage produce stable, unbiased kennel performance ratings for predictive systems.',
    date: 'September 17, 2026',
    readTime: '10 min read',
    category: 'Machine Learning',
    heroImage:
      'https://images.pexels.com/photos/37107254/pexels-photo-37107254.jpeg?auto=compress&cs=tinysrgb&w=1200',
    heroAlt: 'Trainer and Border Collie in action during outdoor agility training session',
    author: 'Greyhound Edge Engineering Team',
    sections: [
      {
        type: 'paragraph',
        content:
          'Greyhound performance is inextricably tied to kennel preparation, nutrition, and trial scheduling. In predictive machine learning pipelines, trainer influence cannot be modeled as a simple historical strike-rate percentage without creating significant survivor and class bias. A kennel that wins 30% of the time sounds impressive — but if those wins came from elite bloodlines in low-grade races where the base expectation was 35%, the trainer is actually underperforming the market.',
      },
      {
        type: 'heading',
        content: 'Methodological Limitations of Raw Strike Rates',
      },
      {
        type: 'subheading',
        content: 'Class Confounding',
      },
      {
        type: 'paragraph',
        content:
          'High-profile kennels often manage top-tier bloodlines that compete in Group races or Grade 5 races where they are heavily favored. A raw 30% strike rate does not indicate superior conditioning if the base expectation of that stock was 35%. The trainer\'s contribution — the delta between expected and actual performance — is what matters, not the raw win count.',
      },
      {
        type: 'subheading',
        content: 'Small Sample Volatility',
      },
      {
        type: 'paragraph',
        content:
          'Low-volume trainers with 2 wins from 5 starts exhibit an artificial 40% strike rate that fails to hold out-of-sample validity. Without sufficient observations, raw percentages are dominated by noise rather than signal. A model that takes these numbers at face value will systematically overrate small-sample trainers and underrate proven large-sample kennels.',
      },
      {
        type: 'image',
        image:
          'https://images.pexels.com/photos/9810640/pexels-photo-9810640.jpeg?auto=compress&cs=tinysrgb&w=1200',
        alt: 'An outdoor kennel scene featuring dogs near a wheelbarrow in a fenced area',
        caption: 'Kennel preparation and conditioning contribute measurable performance deltas beyond raw strike rates',
      },
      {
        type: 'heading',
        content: 'Hierarchical Bayesian Encoding of Kennel Form',
      },
      {
        type: 'paragraph',
        content:
          'Engineers deploy empirical Bayes shrinkage or hierarchical generalized linear mixed models (GLMM) to stabilize trainer performance metrics. The core idea: a trainer\'s observed strike rate is shrunk toward the population mean in proportion to the uncertainty of the estimate. Small samples shrink aggressively; large samples barely move.',
      },
      {
        type: 'code',
        content:
          'theta_hat(j) = [ n(j) / (n(j) + tau^2) ] * y_bar(j)\n              + [ tau^2 / (n(j) + tau^2) ] * mu_pop\n\nWhere:\n  theta_hat(j) = adjusted trainer rating for trainer j\n  y_bar(j)     = observed sample strike rate across n(j) runs\n  mu_pop       = global population mean strike rate\n  tau^2        = variance scaling factor (prior strength)',
      },
      {
        type: 'paragraph',
        content:
          'Trainers with low sample sizes regress toward the population baseline, preventing model overconfidence on short runs of form. A trainer with 2 wins from 5 starts (40% raw) might shrink to a 22% adjusted rating — close to the population mean — until more data accumulates. A trainer with 150 wins from 400 starts (37.5% raw) barely moves, because the large sample provides enough evidence that the performance is genuine.',
      },
      {
        type: 'image',
        image:
          'https://images.pexels.com/photos/19017773/pexels-photo-19017773.jpeg?auto=compress&cs=tinysrgb&w=1200',
        alt: 'A woman engages in training her Labrador Retriever in a sunny outdoor setting',
        caption: 'Bayesian shrinkage prevents small-sample trainers from being overrated by the model',
      },
      {
        type: 'heading',
        content: 'Quantifiable Performance Signals',
      },
      {
        type: 'paragraph',
        content:
          'Beyond the adjusted strike rate, several trainer-specific signals carry predictive weight in modern pipelines:',
      },
      {
        type: 'table',
        headers: ['Kennel Indicator', 'Data Signal Extracted', 'Analytical Impact'],
        rows: [
          ['First-Up After Spell', 'Days since last official start (>42 days) combined with trial data', 'Measures the trainer\'s baseline conditioning capability off long layoffs.'],
          ['Kennel Transfer', 'First run under a new trainer license', 'Isolates the immediate delta in performance attributable to environmental and training shifts.'],
          ['Inter-Track Relocation', 'Transit distance from kennel base to track venue', 'Quantifies travel fatigue versus home-track familiarity.'],
        ],
      },
      {
        type: 'heading',
        content: 'The Kennel Transfer Signal',
      },
      {
        type: 'paragraph',
        content:
          'When a greyhound moves to a new trainer, the first-up run under the new kennel is one of the most information-dense data points in the dog\'s career. It isolates the environmental and conditioning delta from the dog\'s inherent ability — if a dog improves significantly first-up under a new trainer, the model can attribute that improvement to the kennel\'s conditioning program rather than to the dog\'s raw talent.',
      },
      {
        type: 'paragraph',
        content:
          'Conversely, a dog that regresses under a new trainer after performing well elsewhere may indicate a poor fit between the kennel\'s training methods and the dog\'s physical profile. This signal is particularly valuable when combined with the dog\'s age — older dogs transferring kennels are more likely to have established habits that resist new conditioning approaches.',
      },
      {
        type: 'callout',
        content:
          'Greyhound Edge applies Bayesian-shrunk trainer ratings as a feature layer in the model. When a kennel transfer occurs, the model temporarily increases the uncertainty on that runner\'s projection — widening the confidence interval until enough runs under the new trainer accumulate to stabilize the estimate. This is why a first-up kennel transfer often shows a wider confidence range in the dashboard.',
      },
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
