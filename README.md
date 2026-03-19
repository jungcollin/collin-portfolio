# collin-portfolio

개인 포트폴리오 사이트. 직접 만든 프로젝트들을 썸네일, 설명, 라이브 데모 링크와 함께 소개합니다.

## Projects

| Project | Description | Link |
|---------|-------------|------|
| **series_game** | One Life Relay - 똥비 15초 생존 브라우저 게임 | [Live Demo](https://jungcollin.github.io/series_game) |

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Font**: Geist Sans / Geist Mono

## Getting Started

```bash
npm install
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main page
├── components/
│   ├── About.tsx           # About section
│   └── ProjectCard.tsx     # Project card with thumbnail
└── lib/
    └── projects.ts         # Curated project data
public/
└── projects/               # Project thumbnails
```

프로젝트를 추가하려면 `src/lib/projects.ts`의 `projects` 배열에 항목을 추가하면 됩니다.
