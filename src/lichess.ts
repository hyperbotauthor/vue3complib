import { FetchClient, lichess } from "@publishvue/fetchclient";

export const lichessClient = new FetchClient(window.fetch.bind(window), {
  apiBaseUrl: "https://lichess.org/api",
  bearer: localStorage.getItem("LICHESS_TOKEN") || "",
});

export const gamesOfUser = lichessClient.extend("games/user", {
  headers: {
    Accept: "application/x-ndjson",
  },
});

export const exportGame = new FetchClient(window.fetch.bind(window), {
  apiBaseUrl: "https://lichess.org/game/export",
  headers: {
    Accept: "application/json",
  },
});

export function toExplorerVariant(variant: string) {
  if (variant === "chess") return "standard";
  if (variant === "3check") return "threeCheck";
  if (variant === "racingkings") return "racingKings";
  if (variant === "kingofthehill") return "kingOfTheHill";
  return variant;
}

export function toChessopsVariant(variant: string) {
  if (variant === "standard") return "chess";
  if (variant === "threeCheck") return "3check";
  if (variant === "racingKings") return "racingkings";
  if (variant === "kingOfTheHill") return "kingofthehill";
  return variant;
}

export async function getGame(id: string, username: string) {
  const blob = await exportGame.fetchJson(id);
  const game = new lichess.ParsedGame(blob, username);

  return game;
}

export async function getLichessGames(propsOpt: any) {
  const props = propsOpt || {};
  const account = await lichessClient.fetchJson("account");
  const username = props.username || account.username || "DrNykterstein";
  console.info("getting games of", username);
  const urlParams: any = {
    max: props.max || 100,
  };
  if (props.variant) {
    if (props.variant === "standard" || props.variant === "chess") {
      urlParams.perfType = "ultraBullet,bullet,blitz,rapid,classical";
    } else {
      urlParams.perfType = toExplorerVariant(props.variant);
    }
  }
  const gamesRaw = await gamesOfUser.fetchNdJson(username, {
    urlParams,
  });

  const games = gamesRaw.filter((game: any) => game.speed !== "correspondence");

  return [
    username,
    games.map((game: any) => new lichess.ParsedGame(game, username)),
  ];
}

export const VARIANTS = [
  { display: "Standard", value: "chess" },
  { display: "Atomic", value: "atomic" },
  { display: "Antichess", value: "antichess" },
  { display: "Horde", value: "horde" },
  { display: "King of the Hill", value: "kingofthehill" },
  { display: "Racing Kings", value: "racingkings" },
  { display: "Three Check", value: "3check" },
];
