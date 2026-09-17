import { useEffect, useState } from 'react';
import { Cpu, Database, CheckCircle2, Loader2, GitBranch, BarChart3, Brain, Activity } from 'lucide-react';

interface PipelineStep {
  label: string;
  status: 'done' | 'active' | 'pending';
  icon: typeof Cpu;
}

interface ActivityItem {
  id: number;
  text: string;
  time: string;
  type: 'scan' | 'model' | 'flag' | 'sync';
}

const FEED_TEMPLATES: Omit<ActivityItem, 'id' | 'time'>[] = [
  { text: 'Form data synced for Sandown R5', type: 'sync' },
  { text: 'Model recalculated — box 1 probability up 4.2%', type: 'model' },
  { text: 'Speed map regenerated for Wentworth Park R3', type: 'model' },
  { text: 'False-favourite detected: Richmond R2 box 4', type: 'flag' },
  { text: 'Market price update received for 12 races', type: 'sync' },
  { text: 'Win probability distribution reweighted for The Gardens R7', type: 'model' },
  { text: 'Trainer stats refreshed across 8 meetings', type: 'sync' },
  { text: 'Early-speed profile updated for Ballarat R1 box 6', type: 'model' },
  { text: 'Track bias analysis complete for Dapto meeting', type: 'model' },
  { text: 'Historical pattern match found for Warrnambool R4', type: 'model' },
  { text: 'Box draw data ingested for 23 races', type: 'sync' },
  { text: 'Grade transition model applied to Geelong R6', type: 'model' },
];

const TYPE_META: Record<ActivityItem['type'], { icon: typeof Cpu; color: string; bg: string }> = {
  scan: { icon: GitBranch, color: 'text-ink-500', bg: 'bg-ink-100' },
  model: { icon: Brain, color: 'text-amber-600', bg: 'bg-amber-100' },
  flag: { icon: BarChart3, color: 'text-green-600', bg: 'bg-green-100' },
  sync: { icon: Database, color: 'text-ink-500', bg: 'bg-ink-100' },
};

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 5) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  const min = Math.floor(diff / 60);
  if (min < 60) return `${min}m ago`;
  return `${Math.floor(min / 60)}h ago`;
}

export default function ModelStatus() {
  const [steps, setSteps] = useState<PipelineStep[]>([
    { label: 'Data Ingest', status: 'done', icon: Database },
    { label: 'Form Parsing', status: 'done', icon: GitBranch },
    { label: 'Model Run', status: 'active', icon: Brain },
    { label: 'Confidence Scoring', status: 'pending', icon: BarChart3 },
    { label: 'Output Ready', status: 'pending', icon: CheckCircle2 },
  ]);

  const [feed, setFeed] = useState<ActivityItem[]>([]);
  const [feedCounter, setFeedCounter] = useState(0);

  // Simulate pipeline progression
  useEffect(() => {
    const interval = setInterval(() => {
      setSteps((prev) => {
        const activeIdx = prev.findIndex((s) => s.status === 'active');
        if (activeIdx === -1) {
          // Reset cycle
          return prev.map((s, i) => ({
            ...s,
            status: i === 0 ? 'active' : i === 0 ? 'active' as const : 'pending' as const,
          })) as PipelineStep[];
        }
        if (activeIdx === prev.length - 1) {
          // All done — reset after a beat
          return prev.map((s, i) => ({
            ...s,
            status: i === 0 ? 'active' as const : 'pending' as const,
          }));
        }
        return prev.map((s, i) => {
          if (i < activeIdx) return { ...s, status: 'done' as const };
          if (i === activeIdx) return { ...s, status: 'done' as const };
          if (i === activeIdx + 1) return { ...s, status: 'active' as const };
          return s;
        });
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Simulate live activity feed
  useEffect(() => {
    const addFeedItem = () => {
      setFeedCounter((c) => c + 1);
      const template = FEED_TEMPLATES[Math.floor(Math.random() * FEED_TEMPLATES.length)];
      const newItem: ActivityItem = {
        ...template,
        id: Date.now(),
        time: new Date().toISOString(),
      };
      setFeed((prev) => [newItem, ...prev].slice(0, 6));
    };

    // Seed initial items
    const seed: ActivityItem[] = FEED_TEMPLATES.slice(0, 4).map((t, i) => ({
      ...t,
      id: i,
      time: new Date(Date.now() - (i + 1) * 15000).toISOString(),
    }));
    setFeed(seed);

    const interval = setInterval(addFeedItem, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Pipeline status */}
      <div className="card p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-900">
            <Cpu className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <h3 className="font-display text-sm tracking-wide text-ink-900">MODEL PIPELINE</h3>
            <p className="text-xs text-ink-400">Live processing status</p>
          </div>
          <span className="ml-auto flex items-center gap-1.5 text-xs text-green-600">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulseSubtle" />
            Running
          </span>
        </div>

        {/* Pipeline steps */}
        <div className="flex items-center gap-1">
          {steps.map((step, i) => (
            <div key={step.label} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex w-full items-center">
                {i > 0 && (
                  <div className={`h-0.5 flex-1 rounded-full transition-colors duration-500 ${
                    step.status === 'done' || step.status === 'active' ? 'bg-amber-500' : 'bg-ink-200'
                  }`} />
                )}
                <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-300 ${
                  step.status === 'done'
                    ? 'border-green-500 bg-green-50 text-green-600'
                    : step.status === 'active'
                      ? 'border-amber-500 bg-amber-50 text-amber-600 animate-glow'
                      : 'border-ink-200 bg-ink-50 text-ink-300'
                }`}>
                  {step.status === 'done' ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : step.status === 'active' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <step.icon className="h-4 w-4" />
                  )}
                </div>
                {i < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 rounded-full transition-colors duration-500 ${
                    steps[i + 1].status === 'done' || steps[i + 1].status === 'active' ? 'bg-amber-500' : 'bg-ink-200'
                  }`} />
                )}
              </div>
              <span className={`text-center text-[10px] font-semibold uppercase tracking-wide transition-colors ${
                step.status === 'done'
                  ? 'text-green-600'
                  : step.status === 'active'
                    ? 'text-amber-600'
                    : 'text-ink-400'
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* Throughput indicator */}
        <div className="mt-4 flex items-center justify-between rounded-lg bg-ink-50 px-3 py-2">
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-ink-400" />
            <span className="text-xs text-ink-500">Processing throughput</span>
          </div>
          <div className="flex items-center gap-1">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="w-1 rounded-full bg-amber-500 transition-all duration-300"
                style={{
                  height: `${8 + Math.sin((Date.now() / 200) + i) * 8 + 4}px`,
                  opacity: 0.3 + (i / 8) * 0.7,
                }}
              />
            ))}
            <span className="mono ml-2 text-xs font-bold text-ink-700">~240 races/min</span>
          </div>
        </div>
      </div>

      {/* Live activity feed */}
      <div className="card p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-900">
            <Activity className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <h3 className="font-display text-sm tracking-wide text-ink-900">ANALYSIS FEED</h3>
            <p className="text-xs text-ink-400">Live model activity</p>
          </div>
          <span className="ml-auto mono text-xs text-ink-400">{feedCounter} events</span>
        </div>

        <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
          {feed.map((item, idx) => {
            const meta = TYPE_META[item.type];
            return (
              <div
                key={item.id}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-all ${
                  idx === 0 ? 'bg-amber-50/50 animate-fadeIn' : 'hover:bg-ink-50'
                }`}
              >
                <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${meta.bg}`}>
                  <meta.icon className={`h-3.5 w-3.5 ${meta.color}`} />
                </div>
                <span className="flex-1 text-xs text-ink-600 truncate">{item.text}</span>
                <span className="mono text-[10px] text-ink-400 flex-shrink-0">{timeAgo(new Date(item.time))}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
