const GITHUB_USERNAME = "jungcollin";
const GITHUB_API = "https://api.github.com";

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  updated_at: string;
  homepage: string | null;
  fork: boolean;
  archived: boolean;
}

export async function fetchRepos(): Promise<GitHubRepo[]> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  };

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(
    `${GITHUB_API}/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100&type=owner`,
    {
      headers,
      next: { revalidate: 3600 },
    }
  );

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status}`);
  }

  const repos: GitHubRepo[] = await res.json();

  return repos
    .filter((repo) => !repo.fork && !repo.archived)
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
}
