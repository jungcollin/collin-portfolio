import { fetchRepos } from "@/lib/github";
import ProjectCard from "@/components/ProjectCard";
import About from "@/components/About";

export default async function Home() {
  const repos = await fetchRepos();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-3xl px-6 py-20">
        {/* Header */}
        <header>
          <h1 className="font-mono text-2xl font-bold tracking-tight">
            jungcollin
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            {repos.length} repositories
          </p>
        </header>

        {/* About */}
        <About />

        {/* Projects */}
        <section id="projects">
          <h2 className="text-lg font-semibold text-neutral-100">Projects</h2>
          <div className="mt-6 grid gap-4">
            {repos.map((repo) => (
              <ProjectCard key={repo.id} repo={repo} />
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-20 border-t border-neutral-800 pt-8 text-center text-xs text-neutral-600">
          Built with Next.js &middot; Data from GitHub API
        </footer>
      </div>
    </div>
  );
}
