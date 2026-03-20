import { projects } from "@/lib/projects";
import ProjectCard from "@/components/ProjectCard";
import About from "@/components/About";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      {/* Top Toolbar */}
      <header className="sticky top-0 z-50 flex h-[76px] items-center justify-between border-b-[2px] border-black bg-white px-8">
        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <div className="flex h-[44px] w-[44px] items-center justify-center border-[2px] border-black">
            <span className="font-[var(--font-serif)] text-lg font-semibold">C</span>
          </div>
          <div className="h-[32px] w-[1px] bg-black" />
          <div className="flex h-[44px] items-center border-[2px] border-black px-4">
            <span className="font-[var(--font-serif)] text-sm font-medium tracking-wide">PORTFOLIO</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/jungcollin"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-[44px] items-center gap-2 border-[2px] border-black px-5 text-xs font-medium uppercase tracking-wider transition-colors duration-150 hover:bg-black hover:text-white"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="bg-[#F9FAFB]">
        <div className="mx-auto max-w-[1200px] px-8 py-16">
          {/* Hero / About Section */}
          <section className="animate-fade-in-up stagger-1 mb-16">
            <About />
          </section>

          {/* Projects Header */}
          <div className="animate-fade-in-up stagger-2 mb-8 flex items-end justify-between border-b-[2px] border-black pb-4">
            <div>
              <h2 className="font-[var(--font-serif)] text-2xl font-semibold tracking-tight">
                PROJECTS
              </h2>
              <p className="mt-1 text-xs font-light uppercase tracking-widest text-[#9CA3AF]">
                Open Source & Experiments
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-[var(--font-serif)] text-sm font-medium">
                ({projects.length})
              </span>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <div
                key={project.id}
                className={`animate-fade-in-up stagger-${Math.min(index + 3, 6)}`}
              >
                <ProjectCard project={project} index={index} />
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Contextual Hint Bar */}
      <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 animate-fade-in-up">
        <div className="flex items-center gap-3 border-[2px] border-black bg-white px-6 py-3">
          <span className="text-[11px] font-light uppercase tracking-widest text-[#9CA3AF]">
            Navigate
          </span>
          <span className="border border-[#E5E7EB] px-1.5 py-0.5 font-mono text-[10px]">
            scroll
          </span>
          <span className="text-[11px] font-light uppercase tracking-widest text-[#9CA3AF]">
            to explore projects
          </span>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t-[2px] border-black bg-white px-8 py-8">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between">
          <span className="text-[11px] font-light uppercase tracking-widest text-[#9CA3AF]">
            Built with Next.js
          </span>
          <span className="font-[var(--font-serif)] text-xs font-medium">
            jungcollin &copy; {new Date().getFullYear()}
          </span>
        </div>
      </footer>
    </div>
  );
}
