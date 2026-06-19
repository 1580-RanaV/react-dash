

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import BackButton from "./BackButton";
import {
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  Link2,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Star,
  ThumbsDown,
  ThumbsUp,
  Volume2,
  X,
} from "lucide-react";

const MEETING_DURATION = 5633;

const TOPIC_ITEMS = [
  {
    time: "00:00",
    text: "Weekly engineering standup covering ML model progress, PW customer delivery timeline, auth/console readiness, and next-week planning.",
    children: [
      {
        time: "01:09",
        text: "Roman reported ML model training completed locally, but results need continued debugging and configuration.",
      },
      {
        time: "01:09",
        text: "Feature selection filtered out 70-80% of events, keeping the system manageable as feature types expand.",
      },
    ],
  },
  {
    time: "03:17",
    text: "PW customer delivery timeline and demo readiness.",
    children: [
      {
        time: "03:37",
        text: "Roman estimated processed PW data could be ready by Wednesday evening or Thursday morning if ingestion starts Monday.",
      },
      {
        time: "09:29",
        text: "Sid escalated urgency and set the target demo window for Thursday or Friday.",
      },
    ],
  },
  {
    time: "15:34",
    text: "Auth readiness and staging validation.",
    children: [
      {
        time: "15:34",
        text: "Koray reported mobile auth working on staging, with desktop callback issues actively being fixed.",
      },
      {
        time: "19:51",
        text: "Yaroslav flagged API key usage as the highest priority release blocker.",
      },
    ],
  },
  {
    time: "53:07",
    text: "Next-week planning, incidents, and follow-up work.",
    children: [
      {
        time: "53:57",
        text: "Roman noted the mid-week metadata downtime incident needs to be logged and tracked.",
      },
      {
        time: "12:43",
        text: "PW provided new S3 paths and confirmed they will be updated regularly with incoming data.",
      },
    ],
  },
];

const TRANSCRIPT = [
  {
    initials: "SC",
    name: "Sid Chaudhary",
    time: "00:06",
    color: "bg-slate-100 text-slate-500 dark:bg-white/8 dark:text-stone-300",
    text: "But it's nice that you guys miss me. Okay, Roman, like we can stay a few minutes to discuss. I don't know how to do this production or staging reduction, but I'm sure we can quickly figure it out. From my perspective, I don't want a production environment with any hiccups because we don't want an on call with any hiccups. But aging environment I think is where we can conquer. Stay briefly and wrap this decision up. It's difficult to do. Please, gentlemen. Hello everyone. I'm alive in case you're wondering.",
  },
  {
    initials: "RB",
    name: "Roman Bohdan",
    time: "01:09",
    color: "bg-slate-100 text-slate-500 dark:bg-white/8 dark:text-stone-300",
    actions: true,
    text: "Hello. Okay, let's get started. Let's start with music from my site for today. Working the ML, I know that the first model trained on the test data on production. Well, I mean not on production locally, just one service on my local machine but except this. All other stuff on prod working directly there. And yes, we got training output on metric sims. Forgive it. Well, I mean calculations of those metrics are not good because the data was too random and I've had a bad goal management for my insertion strategy so went a bit tougher. So we need to continue debugging and configuring this stuff. PK filtration is pretty interesting. Also works, but also need to play a bit with it for prediction. Have not yet tested. Same with nbp. It's all code completed but requires manual debugging and testing the model.",
  },
  {
    initials: "AT",
    name: "Aman Tiwari",
    time: "03:17",
    color: "bg-blue-500 text-white",
    text: "Roman. Do we have a timeline on when we can have PW's data processed and we can hand it off to them for the first review?",
  },
  {
    initials: "RB",
    name: "Roman Bohdan",
    time: "03:37",
    color: "bg-slate-100 text-slate-500 dark:bg-white/8 dark:text-stone-300",
    text: "Look, I'm afraid that algorithm running will take some time and if we want to do it properly we need the data to land first. If ingestion starts Monday, processed data can be in the database by Wednesday evening or Thursday morning.",
  },
  {
    initials: "SC",
    name: "Sid Chaudhary",
    time: "09:29",
    color: "bg-slate-100 text-slate-500 dark:bg-white/8 dark:text-stone-300",
    text: "PW already asked for a demo today, so this needs to be treated as urgent. Ingest Monday, run the model every day, and by Thursday or Friday at the absolute latest we should be ready to show something solid.",
  },
  {
    initials: "YK",
    name: "Yaroslav Bezruchenko",
    time: "19:51",
    color: "bg-emerald-500 text-white",
    text: "Audit login history and invites are fixed and working at project level. API keys creation and audit work, but API key usage is degraded, so that is the highest priority item before release.",
  },
];

const MORE_PARTICIPANTS = [
  { initials: "R", name: "Rana", color: "bg-blue-50 text-blue-700 dark:bg-blue-500/12 dark:text-blue-300" },
  { initials: "VG", name: "Ved Gorakh Raut", color: "bg-teal-500 text-white" },
  { initials: "AP", name: "Aman Patel", color: "bg-orange-500 text-white" },
  { initials: "YB", name: "Yaroslav Bezruchenko", color: "bg-sky-500 text-white" },
  { initials: "BG", name: "Besik Gugushvili", color: "bg-purple-500 text-white" },
  { initials: "MM", name: "Matvii Marchenko", color: "bg-pink-500 text-white" },
  { initials: "KB", name: "Koray Balci", color: "bg-emerald-500 text-white" },
  { initials: "MB", name: "Roman Bohdan", color: "bg-slate-100 text-slate-500 dark:bg-white/8 dark:text-stone-300" },
];

function Initial({ label, className }: { label: string; className: string }) {
  return <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${className}`}>{label}</span>;
}

function TimeBadge({ time }: { time: string }) {
  return <span className="inline-flex rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-500/12 dark:text-blue-300">{time}</span>;
}

function formatPlayerTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.min(MEETING_DURATION, Math.floor(seconds)));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;

  if (hours > 0) return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function MeetingDetailView() {
  const [showParticipants, setShowParticipants] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function copyLink() {
    navigator.clipboard?.writeText("https://intempt.com/share/meeting/rd-check-in");
    setLinkCopied(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setLinkCopied(false), 2000);
  }
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(72);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [seekNudge, setSeekNudge] = useState<null | "-10" | "+10">(null);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = window.setInterval(() => {
      setCurrentTime((time) => {
        if (time >= MEETING_DURATION) {
          setIsPlaying(false);
          return MEETING_DURATION;
        }

        return time + 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isPlaying]);

  function seekBy(amount: number) {
    setCurrentTime((time) => Math.max(0, Math.min(MEETING_DURATION, time + amount)));
    setSeekNudge(amount > 0 ? "+10" : "-10");
    window.setTimeout(() => setSeekNudge(null), 520);
  }

  function renderPlayer(isLarge = false) {
    const progress = (currentTime / MEETING_DURATION) * 100;

    return (
      <div className={`relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-black ${isLarge ? "max-h-[82vh]" : ""}`}>
        <button
          type="button"
          onClick={() => setIsPlaying((playing) => !playing)}
          className="absolute inset-0"
          aria-label={isPlaying ? "Pause meeting" : "Play meeting"}
        />

        {seekNudge ? (
          <div className="pointer-events-none absolute top-1/2 -translate-y-1/2 rounded-full bg-white/12 px-4 py-2 text-lg font-semibold text-white backdrop-blur-md animate-pop-in">
            {seekNudge}s
          </div>
        ) : null}

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-black/45 px-4 py-2 text-white backdrop-blur-md">
          <button
            type="button"
            onClick={() => seekBy(-10)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full transition-all duration-150 hover:scale-105 hover:bg-white/12"
            aria-label="Back 10 seconds"
          >
            <RotateCcw size={15} />
          </button>
          <button
            type="button"
            onClick={() => setIsPlaying((playing) => !playing)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition-all duration-150 hover:scale-105"
            aria-label={isPlaying ? "Pause meeting" : "Play meeting"}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
          </button>
          <button
            type="button"
            onClick={() => seekBy(10)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full transition-all duration-150 hover:scale-105 hover:bg-white/12"
            aria-label="Forward 10 seconds"
          >
            <RotateCw size={15} />
          </button>
          <span className="whitespace-nowrap text-xs font-medium">
            {formatPlayerTime(currentTime)} / {formatPlayerTime(MEETING_DURATION)}
          </span>
          <label className="flex items-center gap-2">
            <Volume2 size={15} />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
              aria-label="Volume"
              className="h-1 w-20 cursor-pointer accent-white"
            />
          </label>
        </div>

        {!isLarge ? (
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="absolute bottom-5 right-5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition-all duration-150 hover:scale-105 hover:bg-white/12"
            aria-label="Open fullscreen player"
          >
            <Maximize2 size={15} />
          </button>
        ) : null}

        <div className="absolute inset-x-5 bottom-1 h-0.5 overflow-hidden rounded-full bg-white/15">
          <div className="h-full rounded-full bg-white transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-h-0 flex-col animate-fade-up">
      <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <BackButton href="/meetings" />
          <span className="truncate font-medium text-stone-900 dark:text-stone-100">R&amp;D check-in</span>
        </div>
        <div className="flex shrink-0 gap-1 p-1 rounded-xl bg-stone-100 dark:bg-(--input)">
          <a
            href="https://intempt.com/share/meeting/rd-check-in"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium text-stone-500 dark:text-stone-400 transition-all duration-100 hover:bg-white dark:hover:bg-white/8 hover:text-stone-900 dark:hover:text-stone-100 hover:shadow-sm"
          >
            <ExternalLink size={13} />
            View public link
          </a>
          <button
            type="button"
            onClick={copyLink}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-100 hover:bg-white dark:hover:bg-white/8 hover:shadow-sm text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
          >
            {linkCopied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
            {linkCopied ? "Copied" : "Copy link"}
          </button>
        </div>
      </div>

      <div className="grid flex-1 min-h-0 grid-cols-[minmax(0,900px)_minmax(420px,1fr)] gap-0">
        <div className="flex min-h-0 flex-col overflow-hidden px-4 pb-4">
          <div className="mb-4 flex w-full max-w-[875px] shrink-0 flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-2">
                <CalendarDays size={14} className="text-slate-400 dark:text-slate-500" />
                Jun 5, 2026 8:00-9:35 PM
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock size={14} className="text-slate-400 dark:text-slate-500" />
                01:33:53
              </span>
              <span className="flex items-center -space-x-1.5">
                <Initial label="SC" className="bg-slate-100 text-slate-500 ring-2 ring-white dark:bg-white/8 dark:text-stone-300 dark:ring-[#1a1a1a]" />
                <Initial label="RB" className="bg-slate-100 text-slate-500 ring-2 ring-white dark:bg-white/8 dark:text-stone-300 dark:ring-[#1a1a1a]" />
                <Initial label="AT" className="bg-blue-500 text-white ring-2 ring-white dark:ring-[#1a1a1a]" />
              </span>
              <span className="relative">
                <button
                  type="button"
                  onClick={() => setShowParticipants((open) => !open)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition-colors hover:text-stone-900 dark:text-slate-400 dark:hover:text-stone-100"
                >
                  +8 others
                  <ChevronDown size={12} className={`transition-transform ${showParticipants ? "rotate-180" : ""}`} />
                </button>
                {showParticipants ? (
                  <div
                    className="absolute left-0 top-[calc(100%+8px)] z-20 w-56 overflow-hidden rounded-lg shadow-xl"
                    style={{ background: "var(--content-bg)", border: "1px solid var(--border)" }}
                  >
                    <div className="max-h-56 overflow-y-auto py-2">
                      {MORE_PARTICIPANTS.map((participant) => (
                        <div key={participant.name} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-stone-900 dark:text-stone-100">
                          <Initial label={participant.initials} className={`h-6 w-6 text-[9px] ${participant.color}`} />
                          <span className="truncate">{participant.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </span>
            </div>
          </div>

          <div className="w-full max-w-[875px] shrink-0 rounded-2xl bg-black p-3 shadow-sm">
            {renderPlayer()}
          </div>

          <section className="mt-6 min-h-0 w-full max-w-[875px] flex-1 overflow-y-auto pr-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-stone-950 dark:text-stone-100">Topics</h2>
              <button className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-stone-100 dark:text-slate-400 dark:hover:bg-white/8">
                <Copy size={15} />
              </button>
            </div>
            <div className="space-y-5">
              {TOPIC_ITEMS.map((item) => (
                <div key={`${item.time}-${item.text}`} className="relative pl-[78px]">
                  <div className="absolute left-0 top-0">
                    <TimeBadge time={item.time} />
                  </div>
                  <p className="pt-0.5 text-sm leading-6 text-stone-900 dark:text-stone-100">{item.text}</p>
                  {item.children.length ? (
                    <div className="relative mt-3 space-y-4 pl-10">
                      <div className="absolute bottom-1 left-4 top-0 w-px bg-slate-200 dark:bg-white/12" />
                      {item.children.map((child) => (
                        <div key={`${child.time}-${child.text}`} className="relative grid grid-cols-[64px_minmax(0,1fr)] gap-3">
                          <TimeBadge time={child.time} />
                          <p className="text-sm leading-6 text-stone-900 dark:text-stone-100">{child.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="min-h-0 overflow-y-auto px-6 py-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-950 dark:text-stone-100">Transcript</h2>
            <button className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-stone-100 dark:text-slate-400 dark:hover:bg-white/8">
              <Copy size={15} />
            </button>
          </div>
          <div className="space-y-7">
            {TRANSCRIPT.map((entry) => (
              <article key={`${entry.name}-${entry.time}`} className="flex gap-3">
                <Initial label={entry.initials} className={entry.color} />
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">{entry.name}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-stone-600" />
                    <TimeBadge time={entry.time} />
                    {entry.actions ? (
                      <span className="ml-1 flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Star size={13} />
                        <FileText size={13} />
                        <ThumbsUp size={13} />
                        <ThumbsDown size={13} />
                        <Link2 size={13} />
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm leading-6 text-stone-900 dark:text-stone-100">{entry.text}</p>
                </div>
              </article>
            ))}
          </div>
        </aside>
      </div>

      {isFullscreen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-sm animate-fade-up">
          <button
            type="button"
            aria-label="Close fullscreen player"
            onClick={() => setIsFullscreen(false)}
            className="absolute right-6 top-6 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur transition hover:scale-105 hover:bg-white/20"
          >
            <X size={22} />
          </button>
          <div className="w-full max-w-6xl rounded-2xl bg-black p-3 shadow-2xl">
            {renderPlayer(true)}
          </div>
        </div>
      ) : null}
    </div>
  );
}
