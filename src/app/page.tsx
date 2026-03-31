"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import TypeWriter from "@/components/TypeWriter";
import HarnessScene from "@/components/HarnessScene";

const BASE_PATH = process.env.__NEXT_ROUTER_BASEPATH ?? "";

type Scene = "main" | "selfIntro" | "selfIntroDetail";
type VideoState = "idle" | "effect" | "intro" | "introDetail";

const NPC_LINES: Record<string, string> = {
  greeting: '"어서 오게, 낯선이... 자네도 내 작업이 궁금해서 왔나?"',
  selfIntro: '"더지형을 소개해달라고? 좋아, 소개해주지."',
  selfIntroDetail: '"이 사내가 바로 더지형이야... 코드를 짜고, 게임을 만들고, 이 술집을 운영하는 놈이지."',
  back: '"더 궁금한 게 있나, 친구?"',
};

interface MenuItem {
  id: string;
  tag: string;
  label: string;
  desc: string;
  url: string | null;
  action?: "selfIntro" | "harness";
}

const MENU_ITEMS: MenuItem[] = [
  { id: "wanted", tag: "WANTED", label: "더지형", desc: "이 사내는 누구인가?", url: null, action: "selfIntro" },
  { id: "harness", tag: "IN USE", label: "AI Harness", desc: "이 포트폴리오에 적용 중", url: null, action: "harness" },
  { id: "story", tag: "Grafolio", label: "더지형 이야기", desc: "vlog", url: "https://grafolio.ogq.me/profile/%EB%8D%94%EC%A7%80%ED%98%95/project" },
  { id: "one-life-relay", tag: "Game", label: "ONE LIFE RELAY", desc: "스테이지 제작, 릴레이 게임", url: "https://jungcollin.github.io/series_game" },
  { id: "lucky-bite", tag: "LuckyBite", label: "확률 시뮬레이터", desc: "비공개", url: null },
  { id: "series", tag: "Series", label: "영상 시리즈 서비스", desc: "비공개", url: null },
  { id: "24h-midnight", tag: "24H Midnight", label: "24시간 심야서비스", desc: "비공개", url: null },
  { id: "new-museum", tag: "new museum", label: "3D 미술관", desc: "비공개", url: null },
  { id: "fadepost", tag: "App", label: "fadepost", desc: "비공개", url: null },
];

const DUST = [
  { id: 0, left: "5%", size: 2, dur: 10, delay: 0, opacity: 0.3 },
  { id: 1, left: "12%", size: 1.5, dur: 14, delay: 3, opacity: 0.2 },
  { id: 2, left: "22%", size: 2.5, dur: 9, delay: 7, opacity: 0.4 },
  { id: 3, left: "30%", size: 1, dur: 18, delay: 1, opacity: 0.25 },
  { id: 4, left: "38%", size: 2, dur: 12, delay: 5, opacity: 0.35 },
  { id: 5, left: "45%", size: 1.8, dur: 15, delay: 9, opacity: 0.2 },
  { id: 6, left: "52%", size: 2.2, dur: 11, delay: 2, opacity: 0.3 },
  { id: 7, left: "58%", size: 1.3, dur: 20, delay: 6, opacity: 0.45 },
  { id: 8, left: "65%", size: 2, dur: 13, delay: 11, opacity: 0.25 },
  { id: 9, left: "72%", size: 1.6, dur: 16, delay: 4, opacity: 0.3 },
  { id: 10, left: "78%", size: 2.8, dur: 10, delay: 8, opacity: 0.2 },
  { id: 11, left: "85%", size: 1.2, dur: 19, delay: 0.5, opacity: 0.35 },
  { id: 12, left: "90%", size: 2, dur: 14, delay: 10, opacity: 0.4 },
  { id: 13, left: "95%", size: 1.5, dur: 17, delay: 3.5, opacity: 0.2 },
  { id: 14, left: "8%", size: 2.3, dur: 12, delay: 6.5, opacity: 0.3 },
  { id: 15, left: "18%", size: 1, dur: 21, delay: 1.5, opacity: 0.25 },
  { id: 16, left: "42%", size: 2.5, dur: 11, delay: 8.5, opacity: 0.35 },
  { id: 17, left: "55%", size: 1.7, dur: 15, delay: 4.5, opacity: 0.2 },
  { id: 18, left: "68%", size: 2, dur: 13, delay: 7.5, opacity: 0.4 },
  { id: 19, left: "82%", size: 1.4, dur: 18, delay: 2.5, opacity: 0.3 },
];

export default function Home() {
  const [scene, setScene] = useState<Scene>("main");
  const [showChoices, setShowChoices] = useState(false);
  const [npcLine, setNpcLine] = useState(NPC_LINES.greeting);
  const [fadeOut, setFadeOut] = useState(false);
  const [videoState, setVideoState] = useState<VideoState>("idle");
  const [fadeToBlack, setFadeToBlack] = useState(false);
  const [showHarness, setShowHarness] = useState(false);

  const changeScene = useCallback((next: Scene, line: string) => {
    setFadeOut(true);
    setShowChoices(false);
    setTimeout(() => {
      setScene(next);
      setNpcLine(line);
      setFadeOut(false);
    }, 600);
  }, []);

  const handleVideoEnd = useCallback((ended: VideoState) => {
    /*
     * ended = 방금 끝난 비디오의 종류
     * idle → effect, effect → idle (기본 루프)
     * intro → fade-to-black → introDetail
     * introDetail → fade-to-black → idle
     */
    if (ended === "idle") {
      setVideoState("effect");
      return;
    }
    if (ended === "effect") {
      setVideoState("idle");
      return;
    }
    if (ended === "intro") {
      setFadeToBlack(true);
      setTimeout(() => {
        setVideoState("introDetail");
        setNpcLine(NPC_LINES.selfIntroDetail);
        setScene("selfIntroDetail");
      }, 800);
      setTimeout(() => setFadeToBlack(false), 1200);
      return;
    }
    if (ended === "introDetail") {
      setFadeToBlack(true);
      setTimeout(() => {
        setVideoState("idle");
        setScene("main");
        setNpcLine(NPC_LINES.back);
        setShowChoices(false);
      }, 800);
      setTimeout(() => setFadeToBlack(false), 1200);
      return;
    }
  }, []);

  const enterSelfIntro = () => {
    setVideoState("intro");
    changeScene("selfIntro", NPC_LINES.selfIntro);
  };

  const enterHarness = () => {
    setShowHarness(true);
  };

  return (
    <div className="relative h-dvh w-screen overflow-hidden bg-black font-sans text-neutral-100 select-none">
      <VideoBackground
        videoState={videoState}
        fadeToBlack={fadeToBlack}
        onVideoStateChange={handleVideoEnd}
      />

      {/* Overlays */}
      <div className="pointer-events-none fixed inset-0 z-10 bg-black/20" />
      <div className="vignette" />
      <div className="film-grain" />

      {/* Dust */}
      <div className="pointer-events-none fixed inset-0 z-[15]">
        {DUST.map((p) => (
          <div
            key={p.id}
            className="dust-particle"
            style={{
              left: p.left,
              bottom: "-10px",
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* UI */}
      <div
        className={`relative z-30 flex h-full flex-col transition-opacity duration-500 ${fadeOut ? "opacity-0" : "opacity-100"}`}
      >
        {scene === "main" && (
          <DialogueUI
            npcLine={npcLine}
            showChoices={showChoices}
            onTypingDone={() => setShowChoices(true)}
            onSelfIntro={enterSelfIntro}
            onHarness={enterHarness}
          />
        )}
        {scene === "selfIntro" && (
          <SelfIntroUI
            npcLine={npcLine}
            onBack={() => {
              setVideoState("idle");
              changeScene("main", NPC_LINES.back);
            }}
          />
        )}
        {scene === "selfIntroDetail" && (
          <SelfIntroUI
            npcLine={npcLine}
            onBack={() => {
              setVideoState("idle");
              changeScene("main", NPC_LINES.back);
            }}
          />
        )}
      </div>

      {/* Harness Popup */}
      {showHarness && (
        <HarnessScene onClose={() => setShowHarness(false)} />
      )}
    </div>
  );
}

/* ─── Video Background ───────────────────────── */

function VideoBackground({
  videoState,
  fadeToBlack,
  onVideoStateChange,
}: {
  videoState: VideoState;
  fadeToBlack: boolean;
  onVideoStateChange: (s: VideoState) => void;
}) {
  const idleRef = useRef<HTMLVideoElement>(null);
  const effectRef = useRef<HTMLVideoElement>(null);
  const introRef = useRef<HTMLVideoElement>(null);
  const introDetailRef = useRef<HTMLVideoElement>(null);
  const [hasVideo, setHasVideo] = useState(true);

  /* videoState 변경 시: 나머지 전부 pause → 활성 비디오만 play */
  useEffect(() => {
    if (!hasVideo) return;
    const all = { idle: idleRef, effect: effectRef, intro: introRef, introDetail: introDetailRef };
    for (const [key, ref] of Object.entries(all)) {
      if (key === videoState) {
        if (ref.current) {
          ref.current.currentTime = 0;
          ref.current.play().catch(() => {});
        }
      } else {
        ref.current?.pause();
      }
    }
  }, [videoState, hasVideo]);

  const videoClass =
    "absolute inset-0 h-full w-full object-cover scale-[0.85]"; /* Fix 1: contain instead of cover */

  if (!hasVideo) {
    return (
      <div className="absolute inset-0 z-0">
        <div className="scene-saloon absolute inset-0" />
        <div className="warm-light" />
        <div className="warm-light-2" />
        <div className="ambient-haze" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${BASE_PATH}/images/npc.png`}
          alt=""
          className="npc-idle absolute bottom-0 left-1/2 h-[75vh] max-h-[800px] -translate-x-1/2 object-contain object-bottom"
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-0">
      {/* idle → onEnded reports "idle" ended */}
      <video
        ref={idleRef}
        autoPlay
        muted
        playsInline
        onError={() => setHasVideo(false)}
        onEnded={() => onVideoStateChange("idle")}
        className={`${videoClass} ${videoState === "idle" ? "visible" : "invisible"}`}
      >
        <source src={`${BASE_PATH}/videos/npc-idle.mp4`} type="video/mp4" />
      </video>

      {/* effect → onEnded reports "effect" ended */}
      <video
        ref={effectRef}
        muted
        playsInline
        onEnded={() => onVideoStateChange("effect")}
        className={`${videoClass} ${videoState === "effect" ? "visible" : "invisible"}`}
      >
        <source src={`${BASE_PATH}/videos/npc-effect.mp4`} type="video/mp4" />
      </video>

      {/* intro → onEnded reports "intro" ended */}
      <video
        ref={introRef}
        muted
        playsInline
        onEnded={() => onVideoStateChange("intro")}
        className={`${videoClass} ${videoState === "intro" ? "visible" : "invisible"}`}
      >
        <source src={`${BASE_PATH}/videos/npc-intro.mp4`} type="video/mp4" />
      </video>

      {/* introDetail → onEnded reports "introDetail" ended */}
      <video
        ref={introDetailRef}
        muted
        playsInline
        onEnded={() => onVideoStateChange("introDetail")}
        className={`${videoClass} ${videoState === "introDetail" ? "visible" : "invisible"}`}
      >
        <source src={`${BASE_PATH}/videos/npc-intro-detail.mp4`} type="video/mp4" />
      </video>

      {/* Fade-to-black overlay */}
      <div
        className={`absolute inset-0 z-[3] bg-black transition-opacity duration-700 ${fadeToBlack ? "opacity-100" : "opacity-0"} pointer-events-none`}
      />
    </div>
  );
}

/* ─── Dialogue UI ────────────────────────────── */

function DialogueUI({
  npcLine,
  showChoices,
  onTypingDone,
  onSelfIntro,
  onHarness,
}: {
  npcLine: string;
  showChoices: boolean;
  onTypingDone: () => void;
  onSelfIntro: () => void;
  onHarness: () => void;
}) {
  return (
    <>
      <div className="flex-1" />
      <div className="dialogue-gradient px-6 pt-16 pb-6">
        <div className="mx-auto max-w-2xl">
          {/* NPC dialogue */}
          <div className="mb-6 min-h-[3rem] text-center font-serif text-lg leading-relaxed text-amber-100 italic md:text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            <TypeWriter
              key={npcLine}
              text={npcLine}
              speed={35}
              onComplete={onTypingDone}
            />
          </div>

          {/* Arrow-navigated menu */}
          <MenuCarousel
            show={showChoices}
            items={MENU_ITEMS}
            onSelfIntro={onSelfIntro}
            onHarness={onHarness}
          />
        </div>
      </div>
    </>
  );
}

/* ─── Self Intro UI ──────────────────────────── */

function SelfIntroUI({
  npcLine,
  onBack,
}: {
  npcLine: string;
  onBack: () => void;
}) {
  const [showBack, setShowBack] = useState(false);

  return (
    <>
      <div className="flex-1" />
      <div className="dialogue-gradient px-6 pt-24 pb-10">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 min-h-[4rem] text-center font-serif text-lg leading-relaxed text-amber-100/90 italic md:text-xl">
            <TypeWriter
              key={npcLine}
              text={npcLine}
              speed={35}
              onComplete={() => setShowBack(true)}
            />
          </div>

          <div
            className={`transition-all duration-500 ${
              showBack
                ? "opacity-100 translate-y-0"
                : "pointer-events-none opacity-0 translate-y-4"
            }`}
          >
            <button
              onClick={onBack}
              className="western-btn border border-amber-900/25 px-6 py-3 text-xs tracking-wider text-neutral-500 uppercase hover:text-amber-100"
            >
              &larr; 돌아가기
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Menu Carousel ─────────────────────────── */

function MenuCarousel({
  show,
  items,
  onSelfIntro,
  onHarness,
}: {
  show: boolean;
  items: MenuItem[];
  onSelfIntro: () => void;
  onHarness: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const prev = useCallback(() => {
    setIdx((c) => (c > 0 ? c - 1 : items.length - 1));
  }, [items.length]);

  const next = useCallback(() => {
    setIdx((c) => (c < items.length - 1 ? c + 1 : 0));
  }, [items.length]);

  // keyboard arrows
  useEffect(() => {
    if (!show) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      if (e.key === "Enter") {
        const item = items[idx];
        if (item.action === "selfIntro") onSelfIntro();
        else if (item.action === "harness") onHarness();
        else if (item.url) window.open(item.url, "_blank", "noopener,noreferrer");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [show, prev, next, idx, items, onSelfIntro, onHarness]);

  // scroll selected item into view
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const child = container.children[idx] as HTMLElement | undefined;
    if (!child) return;
    const scrollLeft = child.offsetLeft - container.offsetWidth / 2 + child.offsetWidth / 2;
    container.scrollTo({ left: scrollLeft, behavior: "smooth" });
  }, [idx]);

  const baseClass =
    "group shrink-0 flex flex-col items-center gap-2 rounded-lg border px-5 py-4 min-w-[130px] text-center transition-all duration-200";

  const renderItem = (item: MenuItem, i: number) => {
    const isLocked = !item.url && !item.action;
    const isActive = i === idx;
    const ringClass = isActive ? "ring-2 ring-amber-500/60 scale-105" : "opacity-60 hover:opacity-100";

    const content = (
      <>
        <span className="font-western text-[10px] tracking-wider text-amber-400 uppercase">
          {item.tag}
        </span>
        <span className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors">
          {item.label}
        </span>
        <span className="text-[10px] text-white/50 leading-tight">
          {isLocked ? (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              {item.desc}
            </span>
          ) : (
            item.desc
          )}
        </span>
      </>
    );

    const style = { animationDelay: `${i * 0.08}s` };

    if (item.action) {
      const actionHandler = item.action === "selfIntro" ? onSelfIntro : onHarness;
      return (
        <button
          key={item.id}
          onClick={() => { setIdx(i); actionHandler(); }}
          className={`${baseClass} ${ringClass} border-amber-700/40 bg-black/50 hover:bg-amber-900/30 hover:border-amber-600/60 backdrop-blur-sm animate-[fadeSlideUp_0.4s_ease_both]`}
          style={style}
        >
          {content}
        </button>
      );
    }

    if (isLocked) {
      return (
        <div
          key={item.id}
          onClick={() => setIdx(i)}
          className={`${baseClass} ${ringClass} border-white/10 bg-black/40 backdrop-blur-sm cursor-default animate-[fadeSlideUp_0.4s_ease_both]`}
          style={style}
        >
          {content}
        </div>
      );
    }

    return (
      <a
        key={item.id}
        href={item.url!}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => setIdx(i)}
        className={`${baseClass} ${ringClass} border-amber-700/40 bg-black/50 hover:bg-amber-900/30 hover:border-amber-600/60 backdrop-blur-sm animate-[fadeSlideUp_0.4s_ease_both]`}
        style={style}
      >
        {content}
      </a>
    );
  };

  return (
    <div
      className={`transition-all duration-500 ${
        show ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-4"
      }`}
    >
      <div className="flex items-center gap-2">
        {/* Left arrow */}
        <button
          onClick={prev}
          className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full border border-amber-700/40 bg-black/50 text-amber-400/80 backdrop-blur-sm transition-all hover:bg-amber-900/30 hover:text-amber-300"
          aria-label="Previous"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Items */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-hidden py-2 px-1"
        >
          {items.map((item, i) => renderItem(item, i))}
        </div>

        {/* Right arrow */}
        <button
          onClick={next}
          className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full border border-amber-700/40 bg-black/50 text-amber-400/80 backdrop-blur-sm transition-all hover:bg-amber-900/30 hover:text-amber-300"
          aria-label="Next"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Keyboard hint */}
      <div className="mt-3 flex items-center justify-center gap-2">
        <kbd className="rounded border border-amber-900/30 bg-black/40 px-1.5 py-0.5 font-mono text-[10px] text-amber-400/60">&larr;</kbd>
        <kbd className="rounded border border-amber-900/30 bg-black/40 px-1.5 py-0.5 font-mono text-[10px] text-amber-400/60">&rarr;</kbd>
        <span className="text-[10px] tracking-wider text-white/30 uppercase">navigate</span>
        <kbd className="ml-2 rounded border border-amber-900/30 bg-black/40 px-1.5 py-0.5 font-mono text-[10px] text-amber-400/60">Enter</kbd>
        <span className="text-[10px] tracking-wider text-white/30 uppercase">select</span>
      </div>
    </div>
  );
}
