export default function About() {
  return (
    <section id="about" className="py-16">
      <h2 className="text-lg font-semibold text-neutral-100">About</h2>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-neutral-400">
        <p>
          Software engineer building things with code.
          Explore my open-source projects and experiments below.
        </p>
        <div className="flex gap-4 pt-2">
          <a
            href="https://github.com/jungcollin"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-300 transition-colors hover:text-white"
          >
            GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
