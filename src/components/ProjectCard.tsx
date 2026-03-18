import { GitHubRepo } from "@/lib/github";

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Java: "#b07219",
  Kotlin: "#A97BFF",
  Go: "#00ADD8",
  Rust: "#dea584",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  Swift: "#F05138",
  Ruby: "#701516",
  Dart: "#00B4AB",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  PHP: "#4F5D95",
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 30) return `${diffDays}d ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

export default function ProjectCard({ repo }: { repo: GitHubRepo }) {
  const langColor = repo.language
    ? LANGUAGE_COLORS[repo.language] ?? "#8b8b8b"
    : null;

  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 transition-all hover:border-neutral-600 hover:bg-neutral-900"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-mono text-base font-semibold text-neutral-100 group-hover:text-blue-400 transition-colors">
          {repo.name}
        </h3>
        <span className="shrink-0 text-xs text-neutral-500">
          {formatDate(repo.updated_at)}
        </span>
      </div>

      {repo.description && (
        <p className="mt-2 text-sm leading-relaxed text-neutral-400 line-clamp-2">
          {repo.description}
        </p>
      )}

      <div className="mt-4 flex items-center gap-4 text-xs text-neutral-500">
        {repo.language && (
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: langColor ?? "#8b8b8b" }}
            />
            {repo.language}
          </span>
        )}

        {repo.stargazers_count > 0 && (
          <span className="flex items-center gap-1">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
            {repo.stargazers_count}
          </span>
        )}

        {repo.forks_count > 0 && (
          <span className="flex items-center gap-1">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
              />
            </svg>
            {repo.forks_count}
          </span>
        )}

        {repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {repo.topics.slice(0, 3).map((topic) => (
              <span
                key={topic}
                className="rounded-full bg-blue-500/10 px-2 py-0.5 text-blue-400"
              >
                {topic}
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  );
}
