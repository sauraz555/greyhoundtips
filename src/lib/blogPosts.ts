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
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
