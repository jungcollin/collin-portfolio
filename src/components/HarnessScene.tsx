"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { prepareWithSegments, layoutWithLines } from "@chenglou/pretext";

/* ─── pretext text renderer ─────────────────── */

function ptText(
  ctx: CanvasRenderingContext2D,
  text: string,
  font: string,
  maxW: number,
  lh: number,
  x: number,
  y: number,
  color: string,
  align: CanvasTextAlign = "left",
): number {
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = align;
  try {
    const p = prepareWithSegments(text, font);
    const r = layoutWithLines(p, maxW, lh);
    for (let i = 0; i < r.lines.length; i++) {
      ctx.fillText(r.lines[i].text, x, y + i * lh);
    }
    return r.lines.length * lh;
  } catch {
    let line = "";
    let li = 0;
    for (const ch of text) {
      if (ctx.measureText(line + ch).width > maxW && line) {
        ctx.fillText(line, x, y + li * lh);
        line = ch;
        li++;
      } else {
        line += ch;
      }
    }
    if (line) { ctx.fillText(line, x, y + li * lh); li++; }
    return li * lh;
  }
}

/* ─── Canvas helpers ────────────────────────── */

function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath(); ctx.fill(); ctx.stroke();
}

function arw(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  const a = Math.atan2(y2 - y1, x2 - x1), hl = 6;
  ctx.beginPath();
  ctx.moveTo(x2, y2); ctx.lineTo(x2 - hl * Math.cos(a - 0.4), y2 - hl * Math.sin(a - 0.4));
  ctx.moveTo(x2, y2); ctx.lineTo(x2 - hl * Math.cos(a + 0.4), y2 - hl * Math.sin(a + 0.4));
  ctx.stroke();
}

function divider(ctx: CanvasRenderingContext2D, pad: number, w: number, y: number) {
  ctx.strokeStyle = C.amberBorder; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(w - pad, y); ctx.stroke();
}

/* ─── Fonts & Colors ────────────────────────── */

const F = {
  title: '600 20px "IBM Plex Serif", serif',
  subtitle: '300 11px "IBM Plex Sans", sans-serif',
  section: '600 14px "IBM Plex Serif", serif',
  node: '500 12px "IBM Plex Sans", sans-serif',
  nodeSub: '300 10px "IBM Plex Sans", sans-serif',
  label: '500 9px "IBM Plex Sans", sans-serif',
  body: '300 12px "IBM Plex Sans", sans-serif',
  bold: '500 13px "IBM Plex Sans", sans-serif',
  tiny: '300 10px "IBM Plex Sans", sans-serif',
};

const C = {
  amber: "#f59e0b",
  amberLight: "#fef3c7",
  amberDim: "rgba(217,119,6,0.5)",
  amberBorder: "rgba(217,119,6,0.3)",
  white60: "rgba(255,255,255,0.6)",
  white40: "rgba(255,255,255,0.4)",
  white25: "rgba(255,255,255,0.25)",
  red: "rgba(248,113,113,0.7)",
  redBg: "rgba(69,10,10,0.2)",
  redBorder: "rgba(153,27,27,0.5)",
  green: "rgba(52,211,153,0.7)",
  greenBg: "rgba(6,78,59,0.2)",
  greenBorder: "rgba(4,120,87,0.5)",
  blue: "rgba(96,165,250,0.7)",
  blueBg: "rgba(23,37,84,0.2)",
  purple: "rgba(192,132,252,0.7)",
  purpleBg: "rgba(59,7,100,0.2)",
  purpleBorder: "rgba(126,34,206,0.5)",
};

/* ─── Shared: Principles + PDCA ─────────────── */

function drawShared(ctx: CanvasRenderingContext2D, w: number, startY: number): number {
  const pad = 28, cw = w - pad * 2, cx = w / 2;
  let y = startY;

  // ── Principles
  ptText(ctx, "Shared Design Principles", F.section, cw, 18, pad, y + 14, C.amber);
  y += 32;

  const principles = [
    { num: "01", title: "Generator-Evaluator Separation",
      why: "LLM은 자기가 만든 코드를 관대하게 평가한다. 이 자기 편향은 모델이 발전해도 해결되지 않는 구조적 문제다.",
      how: "코드를 생성한 에이전트와 완전히 별도의 서브에이전트가 독립된 컨텍스트에서 검수한다." },
    { num: "02", title: "Runtime Evaluator",
      why: '코드를 읽고 "맞는 것 같다"고 판단하는 것과 실행해서 확인하는 것은 근본적으로 다르다.',
      how: 'Playwright, curl, 대표 입력 실행으로 증거를 수집하고 PASS/FAIL/PARTIAL VERDICT로 종결한다.' },
    { num: "03", title: "Session Continuity",
      why: "컨텍스트가 길어지거나 스레드를 분리하면 모델은 초반 결정을 잊는다. 장기 작업에서는 명시적 핸드오프가 필요하다.",
      how: "Claude는 Stop hook으로 HANDOFF.md를 자동 관리하고, Codex는 phase 문서와 thread handoff를 파일로 넘긴다. 새 세션은 파일을 먼저 읽고 이어간다." },
    { num: "04", title: "Minimal Harness",
      why: "모든 규칙은 '모델이 이것을 혼자 못한다'는 가설이다. 많을수록 자율성을 제한한다.",
      how: '전역에는 구조적으로 필요한 것만 두고, 프로젝트 사실과 코딩 기준은 각 레포의 docs로 밀어낸다. "적게 넣어라."' },
  ];

  for (const p of principles) {
    ctx.fillStyle = "rgba(217,119,6,0.25)"; ctx.strokeStyle = "rgba(217,119,6,0.35)";
    ctx.beginPath(); ctx.arc(pad + 12, y + 10, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ptText(ctx, p.num, F.node, 20, 14, pad + 12, y + 14, C.amber, "center");
    ptText(ctx, p.title, F.section, cw - 36, 18, pad + 32, y + 14, C.amberLight);
    y += 30;

    // WHY
    ctx.fillStyle = C.redBg; ctx.strokeStyle = "transparent";
    const whyH = ptText(ctx, p.why, F.body, cw - 20, 18, pad + 14, y + 24, "transparent") + 30;
    ctx.fillStyle = C.redBg; ctx.strokeStyle = "transparent"; rrect(ctx, pad, y, cw, whyH, 4);
    ctx.fillStyle = C.redBorder; ctx.fillRect(pad, y, 2, whyH);
    ptText(ctx, "WHY", F.label, cw - 16, 12, pad + 12, y + 14, C.red);
    ptText(ctx, p.why, F.body, cw - 20, 18, pad + 12, y + 28, C.white60);
    y += whyH + 4;

    // HOW
    ctx.fillStyle = C.greenBg; ctx.strokeStyle = "transparent";
    const howH = ptText(ctx, p.how, F.body, cw - 20, 18, pad + 14, y + 24, "transparent") + 30;
    ctx.fillStyle = C.greenBg; ctx.strokeStyle = "transparent"; rrect(ctx, pad, y, cw, howH, 4);
    ctx.fillStyle = C.greenBorder; ctx.fillRect(pad, y, 2, howH);
    ptText(ctx, "HOW", F.label, cw - 16, 12, pad + 12, y + 14, C.green);
    ptText(ctx, p.how, F.body, cw - 20, 18, pad + 12, y + 28, C.white60);
    y += howH + 16;
  }

  divider(ctx, pad, w, y); y += 20;

  // ── PDCA
  ptText(ctx, "PDCA Quality Cycle", F.section, cw, 18, pad, y + 14, C.amber);
  ptText(ctx, "Claude Code: .claude harness / Codex: pdca-native runtime", F.tiny, cw, 12, pad + cw, y + 14, C.white25, "right");
  y += 32;

  const pdca = [
    { l: "P", n: "Plan", d: "요구사항 분석 → 설계 문서", c: C.blue, bg: C.blueBg },
    { l: "D", n: "Do", d: "Design 기반 구현", c: C.green, bg: C.greenBg },
    { l: "C", n: "Check", d: "설계 vs 구현 일치율", c: C.amber, bg: "rgba(69,26,3,0.2)" },
    { l: "A", n: "Act", d: "<90% → 자동 반복", c: C.red, bg: C.redBg },
  ];
  const pw = (cw - 12) / 4;
  pdca.forEach((item, i) => {
    const ix = pad + i * (pw + 4);
    ctx.fillStyle = item.bg; ctx.strokeStyle = "transparent"; rrect(ctx, ix, y, pw, 60, 4);
    ptText(ctx, item.l, F.title, pw, 22, ix + pw / 2, y + 20, item.c, "center");
    ptText(ctx, item.n, F.node, pw - 8, 14, ix + pw / 2, y + 36, C.amberLight, "center");
    ptText(ctx, item.d, F.tiny, pw - 8, 12, ix + pw / 2, y + 50, C.white40, "center");
  });
  ctx.strokeStyle = C.amberBorder; ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) { const ax = pad + (i + 1) * (pw + 4) - 2; arw(ctx, ax - 8, y + 30, ax + 4, y + 30); }
  y += 80;

  // footer
  ptText(ctx, "All text measured and rendered with @chenglou/pretext — no DOM text.", F.tiny, cw, 12, cx, y + 4, C.white25, "center");
  ptText(ctx, "Based on: Anthropic — Harness Design for Long-Running Apps", F.tiny, cw, 12, cx, y + 18, C.amberDim, "center");

  return y + 40;
}

/* ─── Tab: Claude Code ──────────────────────── */

function drawClaudeTab(ctx: CanvasRenderingContext2D, w: number): number {
  const pad = 28, cw = w - pad * 2, cx = w / 2;
  let y = 24;

  // Direction
  ptText(ctx, "Claude Code as Commander", F.section, cw, 18, pad, y + 14, C.amber);
  y += 28;
  const dirH = ptText(ctx, "Claude README의 정본은 'Global Configuration'이다. 전역에는 모델이 구조적으로 못하는 것만 두고, Opus 4.6 [1M] Commander가 Plan, Design, Evaluate를 맡으며 Sonnet 4.6과 GPT-5.3-codex를 병렬 dispatch한다. 프로젝트 사실은 shim이 아니라 docs가 단일 정본이다.", F.body, cw, 18, pad, y + 12, C.white60);
  y += dirH + 24;

  // Flow Diagram
  ptText(ctx, "Commander Architecture", F.section, cw, 18, pad, y + 14, C.amber);
  y += 28;

  const fy = y;
  const nw = 130, nh = 46;
  const nodes = [
    { label: "Commander", sub: "Opus 4.6 [1M]", x: cx, y: fy + 28 },
    { label: "Frontend", sub: "Sonnet 4.6", x: cx - 100, y: fy + 110 },
    { label: "Backend Expert", sub: "GPT-5.3-codex", x: cx + 100, y: fy + 110 },
    { label: "Cross-Evaluate", sub: "Codex review + Evaluator", x: cx, y: fy + 192 },
    { label: "Fix / Retry", sub: "max 3 loops", x: cx, y: fy + 260 },
  ];

  ctx.strokeStyle = C.amberBorder; ctx.lineWidth = 1.5;
  arw(ctx, nodes[0].x, nodes[0].y + nh / 2, nodes[1].x, nodes[1].y - nh / 2);
  arw(ctx, nodes[0].x, nodes[0].y + nh / 2, nodes[2].x, nodes[2].y - nh / 2);
  arw(ctx, nodes[1].x, nodes[1].y + nh / 2, nodes[3].x, nodes[3].y - nh / 2);
  arw(ctx, nodes[2].x, nodes[2].y + nh / 2, nodes[3].x, nodes[3].y - nh / 2);
  arw(ctx, nodes[3].x, nodes[3].y + nh / 2, nodes[4].x, nodes[4].y - nh / 2);

  ptText(ctx, "docs/ as protocol", F.tiny, 100, 12, cx, fy + 74, C.amberDim, "center");

  // runtime evaluator loop
  ctx.strokeStyle = "rgba(248,113,113,0.3)"; ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(nodes[4].x + nw / 2 + 8, nodes[4].y);
  ctx.lineTo(w - pad - 8, nodes[4].y);
  ctx.lineTo(w - pad - 8, nodes[0].y);
  ctx.lineTo(nodes[0].x + nw / 2 + 8, nodes[0].y);
  ctx.stroke(); ctx.setLineDash([]);
  ptText(ctx, "Runtime Evaluator -> FAIL -> loop", F.tiny, 150, 12, w - pad - 12, fy + 150, "rgba(248,113,113,0.5)", "right");

  for (const n of nodes) {
    const hl = n.sub.includes("Sonnet") || n.sub.includes("Codex");
    ctx.fillStyle = hl ? "rgba(217,119,6,0.12)" : "rgba(0,0,0,0.5)";
    ctx.strokeStyle = hl ? "rgba(217,119,6,0.4)" : C.amberBorder;
    ctx.lineWidth = 1; rrect(ctx, n.x - nw / 2, n.y - nh / 2, nw, nh, 6);
    ptText(ctx, n.label, F.node, nw - 16, 15, n.x, n.y - 4, C.amberLight, "center");
    ptText(ctx, n.sub, F.nodeSub, nw - 16, 13, n.x, n.y + 14, C.white40, "center");
  }

  y = fy + 300;
  divider(ctx, pad, w, y); y += 20;

  // Harness files
  ptText(ctx, "README Surface", F.section, cw, 18, pad, y + 14, C.amber);
  ptText(ctx, "~/.claude/", F.tiny, 60, 12, pad + cw, y + 14, C.white25, "right");
  y += 28;

  const items = [
    { file: "CLAUDE.md", desc: "Entry point. Core Principles, Rule Priority, Commander Procedure, Git 제한을 둔다." },
    { file: "settings.json", desc: "Opus 4.6 [1M], acceptEdits, high effort, ko, hooks, enabledPlugins를 정의한다." },
    { file: "rules/HARNESS.md", desc: "Generator-Evaluator 분리, Runtime Evaluator, Session Continuity를 정의하고 VERDICT 프로토콜을 둔다." },
    { file: "rules/CODING_STANDARD.md", desc: "전역 코딩 규칙을 두지 않고 레포의 docs/standards/CODING_STANDARD.md 포인터만 유지한다." },
    { file: "hooks/", desc: "pre_commit_build, post_tool_use_format, session_handoff로 빌드 검증, 포맷팅, HANDOFF 자동 관리를 수행한다." },
    { file: "commands/ + skills/", desc: "plan, verify, e2e 같은 커맨드와 git-issue, git-worktree, portless, codex-delegator 계열 스킬이 워크플로를 확장한다." },
    { file: "agents/", desc: "sonnet-coder, codex-backend, cross-evaluator, playwright-expert가 역할별 실행과 검증을 맡는다." },
    { file: "plugins / projects / statusline", desc: "플러그인 활성화, 프로젝트별 메모리, 커스텀 status line이 전역 운영 경험을 구성한다." },
  ];

  items.forEach((it) => {
    ptText(ctx, it.file, F.bold, cw, 16, pad, y + 12, C.amberLight);
    const dh = ptText(ctx, it.desc, F.body, cw, 18, pad, y + 28, C.white40);
    y += 28 + dh + 6;
  });

  return y;
}

/* ─── Tab: Codex ────────────────────────────── */

function drawCodexTab(ctx: CanvasRenderingContext2D, w: number): number {
  const pad = 28, cw = w - pad * 2, cx = w / 2;
  let y = 24;

  // Direction
  ptText(ctx, "Codex as Independent Operator", F.section, cw, 18, pad, y + 14, C.purple);
  y += 28;
  const dirH = ptText(ctx, "Codex README의 정본은 'codex-home Harness'다. 여러 머신에서 공용으로 쓰는 운영 환경으로 config, prompts, skills, docs, runtime scripts를 git으로 관리하고 비밀값과 로컬 상태를 분리한다. 사용자 진입점은 /pdca이고, pdca-native 런타임이 phase, docs, locks, verification을 제어한다.", F.body, cw, 18, pad, y + 12, C.white60);
  y += dirH + 24;

  // Thread/Profile Flow
  ptText(ctx, "PDCA Thread Routing", F.section, cw, 18, pad, y + 14, C.purple);
  y += 28;

  const fy = y;
  const bw = 148, bh = 56;
  const threads = [
    { label: "Planning Thread", sub: "gpt54_high", phase: "pm / plan / design", x: cx, y: fy + 30, c: C.blue },
    { label: "Implementation", sub: "codex53_xhigh", phase: "do", x: cx, y: fy + 110, c: C.green },
    { label: "Evaluation", sub: "gpt54_high", phase: "analyze / report", x: cx, y: fy + 190, c: C.amber },
    { label: "Archive", sub: "runtime cleanup", phase: "archive / cleanup", x: cx, y: fy + 270, c: C.red },
  ];

  ctx.strokeStyle = C.purpleBorder; ctx.lineWidth = 1.5;
  arw(ctx, cx, threads[0].y + bh / 2, cx, threads[1].y - bh / 2);
  arw(ctx, cx, threads[1].y + bh / 2, cx, threads[2].y - bh / 2);
  arw(ctx, cx, threads[2].y + bh / 2, cx, threads[3].y - bh / 2);

  // handoff labels
  ptText(ctx, "docs + diff handoff", F.tiny, 120, 12, cx + 85, fy + 74, C.purpleBorder, "left");
  ptText(ctx, "docs + diff handoff", F.tiny, 120, 12, cx + 85, fy + 154, C.purpleBorder, "left");
  ptText(ctx, "match rate + report", F.tiny, 120, 12, cx + 85, fy + 234, C.purpleBorder, "left");

  threads.forEach((t) => {
    ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.strokeStyle = C.purpleBorder; ctx.lineWidth = 1;
    rrect(ctx, t.x - bw / 2, t.y - bh / 2, bw, bh, 6);
    ptText(ctx, t.label, F.node, bw - 16, 15, t.x, t.y - 10, C.amberLight, "center");
    ptText(ctx, t.sub, F.tiny, bw - 16, 12, t.x, t.y + 6, t.c, "center");
    ptText(ctx, t.phase, F.nodeSub, bw - 16, 13, t.x, t.y + 20, C.white40, "center");
  });

  y = fy + 310;
  divider(ctx, pad, w, y); y += 20;

  // Harness details
  ptText(ctx, "README Surface", F.section, cw, 18, pad, y + 14, C.purple);
  ptText(ctx, "~/.codex/", F.tiny, 60, 12, pad + cw, y + 14, C.white25, "right");
  y += 28;

  const items = [
    { label: "config.toml", desc: "모델 정책, trusted roots, approval/sandbox 기본값, MCP 서버, plugin 활성화의 정본이다. 기본 상위 모델은 gpt-5.4 / high다." },
    { label: "bin/ + prompts/", desc: "codex-task, codex-home-verify, project-bootstrap과 design-thread, implement-thread, review-thread 프롬프트가 운영 진입점을 만든다." },
    { label: "templates/ + docs/", desc: "plan, design, do, analysis, report 템플릿과 architecture, runbook, model-profiles, thread-handoffs 같은 운영 문서가 함께 간다." },
    { label: "skills/pdca-native", desc: "pdca_state.py, pdca_docs.py, pdca_harness.py, pdca_team.py로 ~/.codex/pdca 중앙 상태와 문서 경로, feature lock, runtime loop를 관리한다." },
    { label: "PDCA Surface", desc: "README 기준 사용자 흐름은 /pdca pm, plan, design, do, analyze, report, archive이고 런타임 표면에는 iterate, cleanup, team, status, next도 포함된다." },
    { label: "Custom Agents", desc: "PDCA 팀 9개와 specialist 5개, 총 14개 TOML agent를 canonical 세트로 유지한다." },
    { label: "Compact Baseline", desc: "AGENTS.md, architecture/runbook/glossary/conventions, docs/generated, canonical PDCA 디렉터리와 .codex/pdca.json이 최소 하네스다." },
    { label: "Verification", desc: "bin/codex-home-verify와 test_pdca_runtime.py가 프로필 해석, 프롬프트, 런타임 메타데이터, bootstrap smoke test까지 점검한다." },
    { label: "3-Tier Backend Expert", desc: "Claude-first 저장소에서는 docs/02-design의 Backend 섹션만 구현하고 Shared를 계약으로 사용한다." },
  ];

  items.forEach((it) => {
    ptText(ctx, it.label, F.bold, cw, 16, pad, y + 12, C.amberLight);
    const dh = ptText(ctx, it.desc, F.body, cw, 18, pad, y + 28, C.white40);
    y += 28 + dh + 8;
  });

  return y;
}

/* ─── Main Popup Component ──────────────────── */

export default function HarnessScene({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  const [canvasH, setCanvasH] = useState(800);
  const [tab, setTab] = useState<"claude" | "codex">("claude");

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const w = container.offsetWidth;
    const dpr = window.devicePixelRatio || 1;

    // Pass 1: measure
    canvas.width = w * dpr;
    canvas.height = 5000 * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `5000px`;
    let ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, 5000);

    const tabH = tab === "claude" ? drawClaudeTab(ctx, w) : drawCodexTab(ctx, w);
    divider(ctx, 28, w, tabH);
    const sharedH = drawShared(ctx, w, tabH + 20);

    // Pass 2: redraw at exact height
    canvas.width = w * dpr;
    canvas.height = sharedH * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${sharedH}px`;
    ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, sharedH);

    const tabH2 = tab === "claude" ? drawClaudeTab(ctx, w) : drawCodexTab(ctx, w);
    divider(ctx, 28, w, tabH2);
    drawShared(ctx, w, tabH2 + 20);

    setCanvasH(sharedH);
  }, [tab]);

  useEffect(() => {
    requestAnimationFrame(() => setEntered(true));
    const t = setTimeout(render, 200);
    window.addEventListener("resize", render);
    return () => { clearTimeout(t); window.removeEventListener("resize", render); };
  }, [render]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setEntered(false); setTimeout(onClose, 400); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const close = () => { setEntered(false); setTimeout(onClose, 400); };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto transition-all duration-400 ${
        entered ? "bg-black/90 backdrop-blur-lg" : "bg-transparent backdrop-blur-0"
      }`}
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div
        className={`relative mx-auto w-full max-w-[680px] px-4 py-8 transition-all duration-400 ${
          entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Header */}
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="font-serif text-xl font-semibold text-amber-100">
              AI Harness Engineering
            </h2>
            <p className="mt-1 text-[11px] tracking-wider text-white/30 uppercase">
              in use on this portfolio
            </p>
          </div>
          <button
            onClick={close}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/40 transition-colors hover:border-amber-600/40 hover:text-amber-400"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setTab("claude")}
            className={`rounded-lg border px-4 py-2.5 text-xs font-medium tracking-wider uppercase transition-all ${
              tab === "claude"
                ? "border-amber-600/60 bg-amber-900/30 text-amber-300"
                : "border-white/10 bg-black/40 text-white/40 hover:border-white/20 hover:text-white/60"
            }`}
          >
            Claude Code
          </button>
          <button
            onClick={() => setTab("codex")}
            className={`rounded-lg border px-4 py-2.5 text-xs font-medium tracking-wider uppercase transition-all ${
              tab === "codex"
                ? "border-purple-600/60 bg-purple-900/30 text-purple-300"
                : "border-white/10 bg-black/40 text-white/40 hover:border-white/20 hover:text-white/60"
            }`}
          >
            Codex
          </button>
        </div>

        {/* Canvas */}
        <div ref={containerRef} className="w-full">
          <canvas ref={canvasRef} className="w-full" style={{ height: canvasH }} />
        </div>
      </div>
    </div>
  );
}
