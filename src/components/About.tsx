export default function About() {
  return (
    <div className="border-[2px] border-black bg-white p-8 md:p-12">
      <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-16">
        {/* Left: Identity */}
        <div className="shrink-0">
          <div className="flex h-[80px] w-[80px] items-center justify-center border-[2px] border-black">
            <span className="font-[var(--font-serif)] text-3xl font-semibold">JC</span>
          </div>
          <div className="mt-4 border-t-[2px] border-black pt-3">
            <p className="text-[10px] font-medium uppercase tracking-widest text-[#9CA3AF]">
              Software Engineer
            </p>
          </div>
        </div>

        {/* Right: Bio */}
        <div className="flex-1">
          <h1 className="font-[var(--font-serif)] text-3xl font-semibold tracking-tight md:text-4xl">
            jungcollin
          </h1>
          <div className="mt-1 h-[2px] w-[60px] bg-black" />
          <p className="mt-6 text-[15px] font-light leading-[1.8] text-[#4B5563]">
            Software engineer building things with code.
            <br />
            Explore my open-source projects and experiments below.
          </p>
          <div className="mt-6 flex items-center gap-4">
            <a
              href="https://github.com/jungcollin"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border-[2px] border-black px-4 py-2 text-[11px] font-medium uppercase tracking-wider transition-colors duration-150 hover:bg-black hover:text-white"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              View GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
