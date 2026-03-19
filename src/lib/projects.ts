export interface Project {
  id: string;
  name: string;
  description: string;
  repoUrl: string;
  serviceUrl: string | null;
  thumbnail: string | null;
  language: string | null;
  topics: string[];
}

export const projects: Project[] = [
  {
    id: "series_game",
    name: "series_game",
    description:
      "One Life Relay - 똥비 15초 생존 게임. 터치/클릭으로 캐릭터를 이동하여 하늘에서 떨어지는 똥을 피하는 브라우저 게임.",
    repoUrl: "https://github.com/jungcollin/series_game",
    serviceUrl: "https://jungcollin.github.io/series_game",
    thumbnail: "/projects/series-game.png",
    language: "JavaScript",
    topics: ["game", "browser-game", "github-pages"],
  },
];
