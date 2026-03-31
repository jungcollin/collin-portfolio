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
    { num: "02", title: "Runtime Verification",
      why: '코드를 읽고 "맞는 것 같다"고 판단하는 것과 실행해서 확인하는 것은 근본적으로 다르다.',
      how: 'Playwright/curl로 실제 실행하여 스크린샷과 응답 데이터로만 판단한다. 기본 자세: "아마 버그가 있을 것이다."' },
    { num: "03", title: "Session Continuity",
      why: "컨텍스트가 길어지거나 스레드를 분리하면 모델은 초반 결정을 잊는다. 장기 작업에서는 명시적 핸드오프가 필요하다.",
      how: "HANDOFF.md나 phase 문서(Plan/Design/Analysis)로 맥락을 넘긴다. 새 세션이나 새 스레드는 파일을 먼저 읽고 이어간다." },
    { num: "04", title: "Minimal Harness",
      why: "모든 규칙은 '모델이 이것을 혼자 못한다'는 가설이다. 많을수록 자율성을 제한한다.",
      how: '모델 발전 시 규칙을 제거하며 stress test. 실패에서 시작한다. "적게 넣어라."' },
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
  const dirH = ptText(ctx, "Opus가 설계하고, Sonnet(Frontend)과 Codex(Backend)를 병렬 dispatch하여 구현시킨 뒤, 교차 검수와 Runtime QA로 품질을 보장하는 멀티에이전트 오케스트레이션.", F.body, cw, 18, pad, y + 12, C.white60);
  y += dirH + 24;

  // Flow Diagram
  ptText(ctx, "Commander Procedure (4-Step)", F.section, cw, 18, pad, y + 14, C.amber);
  y += 28;

  const fy = y;
  const nw = 130, nh = 46;
  const nodes = [
    { label: "Plan + Design", sub: "Opus (Commander)", x: cx, y: fy + 28 },
    { label: "Frontend", sub: "Sonnet Agent", x: cx - 100, y: fy + 110 },
    { label: "Backend", sub: "Codex CLI", x: cx + 100, y: fy + 110 },
    { label: "Cross-Evaluate", sub: "claude review + Evaluator", x: cx, y: fy + 192 },
    { label: "Runtime QA", sub: "Playwright / curl", x: cx, y: fy + 260 },
  ];

  ctx.strokeStyle = C.amberBorder; ctx.lineWidth = 1.5;
  arw(ctx, nodes[0].x, nodes[0].y + nh / 2, nodes[1].x, nodes[1].y - nh / 2);
  arw(ctx, nodes[0].x, nodes[0].y + nh / 2, nodes[2].x, nodes[2].y - nh / 2);
  arw(ctx, nodes[1].x, nodes[1].y + nh / 2, nodes[3].x, nodes[3].y - nh / 2);
  arw(ctx, nodes[2].x, nodes[2].y + nh / 2, nodes[3].x, nodes[3].y - nh / 2);
  arw(ctx, nodes[3].x, nodes[3].y + nh / 2, nodes[4].x, nodes[4].y - nh / 2);

  ptText(ctx, "parallel dispatch", F.tiny, 100, 12, cx, fy + 74, C.amberDim, "center");

  // retry loop
  ctx.strokeStyle = "rgba(248,113,113,0.3)"; ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(nodes[4].x + nw / 2 + 8, nodes[4].y);
  ctx.lineTo(w - pad - 8, nodes[4].y);
  ctx.lineTo(w - pad - 8, nodes[0].y);
  ctx.lineTo(nodes[0].x + nw / 2 + 8, nodes[0].y);
  ctx.stroke(); ctx.setLineDash([]);
  ptText(ctx, "FAIL: max 3 retry", F.tiny, 100, 12, w - pad - 12, fy + 150, "rgba(248,113,113,0.5)", "right");

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
  ptText(ctx, "Harness Configuration", F.section, cw, 18, pad, y + 14, C.amber);
  ptText(ctx, "~/.claude/", F.tiny, 60, 12, pad + cw, y + 14, C.white25, "right");
  y += 28;

  const items = [
    { file: "CLAUDE.md", desc: "Commander Procedure 4-Step 정의. Plan+Design → Dispatch → Cross-Evaluate → Fix." },
    { file: "rules/HARNESS.md", desc: 'Generator-Evaluator 분리, Runtime Evaluator, Session Continuity를 정의. VERDICT 프로토콜과 adversarial probe 기준 포함.' },
    { file: "agents/sonnet-coder.md", desc: "Frontend 전용 에이전트. Design의 Frontend 섹션만 구현. TDD 방식. Backend 접근 금지." },
    { file: "agents/codex-backend.md", desc: "Backend 전용 에이전트. Design의 Backend 섹션만 구현. Frontend 접근 금지." },
    { file: "agents/cross-evaluator.md", desc: '"절대 관대하게 보지 마라." 별도 컨텍스트에서 Design 기준 PASS/FAIL을 판단하고 구체적 수정 지시를 만든다.' },
    { file: "agents/playwright-expert.md", desc: "실행 기반 QA 담당. UI 흐름 변경 시 Playwright로 실제 화면과 상호작용을 검증한다." },
    { file: "hooks/session_handoff.sh", desc: "Stop hook. 미커밋 변경 감지 시 HANDOFF.md 자동 생성, 없으면 삭제. 세션 간 맥락 유실 방지." },
    { file: "hooks/pre_commit_build.sh", desc: "PreToolUse hook. Bash 명령 실행 전 빌드 검증. 깨진 빌드 상태에서 커밋 방지." },
    { file: "hooks/post_tool_use_format.sh", desc: "PostToolUse hook. Edit/Write 후 자동 포맷팅 실행. 코드 스타일 일관성 유지." },
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
  const dirH = ptText(ctx, "Codex는 /pdca를 유일한 진입점으로 두고 phase별 스레드와 프로파일을 분리한다. Python 기반 pdca-native 런타임이 중앙 상태, 문서 경로, feature lock, 검증 루프를 관리하며, canonical agent/skill/plugin 세트를 조합해 실행한다. Claude-first 레포에서는 Opus의 Backend Expert로도 동작한다.", F.body, cw, 18, pad, y + 12, C.white60);
  y += dirH + 24;

  // Thread/Profile Flow
  ptText(ctx, "Thread & Profile Separation", F.section, cw, 18, pad, y + 14, C.purple);
  y += 28;

  const fy = y;
  const bw = 150, bh = 56;
  const threads = [
    { label: "Planning Thread", sub: "gpt54_high profile", phase: "PM + Plan + Design", x: cx, y: fy + 30, c: C.blue },
    { label: "Impl Thread", sub: "codex53_xhigh profile", phase: "Do", x: cx, y: fy + 110, c: C.green },
    { label: "Eval Thread", sub: "gpt54_high profile", phase: "Analyze + Report", x: cx, y: fy + 190, c: C.amber },
  ];

  ctx.strokeStyle = C.purpleBorder; ctx.lineWidth = 1.5;
  arw(ctx, cx, threads[0].y + bh / 2, cx, threads[1].y - bh / 2);
  arw(ctx, cx, threads[1].y + bh / 2, cx, threads[2].y - bh / 2);

  // handoff labels
  ptText(ctx, "docs + diff handoff", F.tiny, 120, 12, cx + 85, fy + 74, C.purpleBorder, "left");
  ptText(ctx, "docs + diff handoff", F.tiny, 120, 12, cx + 85, fy + 154, C.purpleBorder, "left");

  threads.forEach((t) => {
    ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.strokeStyle = C.purpleBorder; ctx.lineWidth = 1;
    rrect(ctx, t.x - bw / 2, t.y - bh / 2, bw, bh, 6);
    ptText(ctx, t.label, F.node, bw - 16, 15, t.x, t.y - 10, C.amberLight, "center");
    ptText(ctx, t.sub, F.tiny, bw - 16, 12, t.x, t.y + 6, t.c, "center");
    ptText(ctx, t.phase, F.nodeSub, bw - 16, 13, t.x, t.y + 20, C.white40, "center");
  });

  y = fy + 230;
  divider(ctx, pad, w, y); y += 20;

  // Harness details
  ptText(ctx, "Harness Configuration", F.section, cw, 18, pad, y + 14, C.purple);
  ptText(ctx, "~/.codex/", F.tiny, 60, 12, pad + cw, y + 14, C.white25, "right");
  y += 28;

  const items = [
    { label: "config.toml as Source of Truth", desc: "모델 정책, trusted roots, approval/sandbox 기본값, MCP 서버, curated plugin 활성화가 모두 config.toml에 모인다. 기본 상위 모델은 gpt-5.4 / high." },
    { label: "PDCA Entry Surface", desc: "사용자 진입점은 /pdca pm|plan|design|do|analyze|report|archive. 내부 실행은 bin/codex-task design|implement|review와 프로필 매핑으로 라우팅된다." },
    { label: "PDCA Native Runtime", desc: "pdca_state.py, pdca_docs.py, pdca_harness.py, pdca_team.py가 ~/.codex/pdca 중앙 상태, 문서 경로, feature lock, pre/post-write 가드, run-dev/observe 루프를 관리한다." },
    { label: "Profile + Thread Separation", desc: "gpt54_high는 기획/설계/리뷰, codex53_xhigh는 구현에 사용한다. PM/Plan/Design, Do, Analyze/Report를 서로 다른 스레드로 나누고 파일로 handoff한다." },
    { label: "Skills + Plugins", desc: "skills/에는 pdca-native, playwright, openai-docs 같은 재사용 스킬이 들어 있고, plugin 계층은 GitHub, Slack, Calendar, Figma, Stripe, Build Web/iOS, Game Studio를 연결한다." },
    { label: "Canonical Agent Set", desc: "현재는 9개 PDCA team role과 5개 specialist, 총 14개 TOML agent만 canonical로 유지한다. discovery~security가 팀 역할이고 gap-detector, code-analyzer, design-validator, report-generator, ui-evaluator가 specialist다." },
    { label: "Compact Baseline + Verify", desc: "최소 하네스는 AGENTS.md, architecture/runbook/glossary/conventions, docs/generated, .codex/pdca.json으로 정의한다. 변경 후에는 bin/codex-home-verify와 PDCA runtime test로 검증한다." },
    { label: "3-Tier Integration", desc: "Claude-first 레포에서는 Codex가 Backend Expert로 동작한다. docs/02-design의 Backend 섹션만 구현하고 Shared를 계약으로 사용하며, 필요하면 별도 worktree에서 분리 실행한다." },
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
