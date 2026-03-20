import { Project } from "@/lib/projects";

export default function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  return (
    <div className="group relative border-[2px] border-black bg-white transition-all duration-150 hover:animate-pulse-border">
      {/* Index Badge */}
      <div className="absolute -left-[1px] -top-[1px] z-10 flex h-[28px] w-[28px] items-center justify-center bg-black">
        <span className="font-[var(--font-serif)] text-xs font-medium text-white">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {/* Thumbnail */}
      {project.thumbnail && (
        <div className="relative aspect-video w-full overflow-hidden border-b-[2px] border-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${process.env.__NEXT_ROUTER_BASEPATH ?? ""}${project.thumbnail}`}
            alt={project.name}
            className="absolute inset-0 h-full w-full object-cover grayscale transition-all duration-300 group-hover:grayscale-0"
          />
          {/* Scan line effect on hover */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        {/* Project Name */}
        <a
          href={project.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-[var(--font-serif)] text-base font-semibold tracking-tight transition-colors duration-150 hover:bg-black hover:text-white hover:px-1 hover:-mx-1"
        >
          {project.name}
        </a>

        {/* Description */}
        <p className="mt-3 text-[13px] font-light leading-relaxed text-[#4B5563]">
          {project.description}
        </p>

        {/* Language & Topics */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {project.language && (
            <span className="border border-black px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest">
              {project.language}
            </span>
          )}
          {project.topics.map((topic) => (
            <span
              key={topic}
              className="border border-[#E5E7EB] px-2 py-0.5 text-[10px] font-light uppercase tracking-widest text-[#9CA3AF] transition-colors duration-150 hover:border-black hover:text-black"
            >
              {topic}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center gap-3 border-t-[1px] border-[#E5E7EB] pt-4">
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border-[2px] border-black px-4 py-2 text-[11px] font-medium uppercase tracking-wider transition-colors duration-150 hover:bg-black hover:text-white"
          >
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Source
          </a>
          {project.serviceUrl && (
            <a
              href={project.serviceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-black px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-white transition-colors duration-150 hover:bg-white hover:text-black hover:outline hover:outline-[2px] hover:outline-black"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                />
              </svg>
              Live Demo
            </a>
          )}
        </div>
      </div>

      {/* Corner Handles (Selection Overlay style) - visible on hover */}
      <div className="pointer-events-none absolute -inset-[6px] opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        <div className="absolute left-0 top-0 h-[8px] w-[8px] bg-black" />
        <div className="absolute right-0 top-0 h-[8px] w-[8px] bg-black" />
        <div className="absolute bottom-0 left-0 h-[8px] w-[8px] bg-black" />
        <div className="absolute bottom-0 right-0 h-[8px] w-[8px] bg-black" />
      </div>
    </div>
  );
}
