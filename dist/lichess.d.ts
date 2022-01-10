import { FetchClient } from "@publishvue/fetchclient";
export declare const lichessClient: FetchClient;
export declare const gamesOfUser: FetchClient;
export declare const exportGame: FetchClient;
export declare function toExplorerVariant(variant: string): string;
export declare function toChessopsVariant(variant: string): string;
export declare function getGame(id: string, username: string): Promise<import("@publishvue/fetchclient/dist/models/lichess/game").ParsedGame>;
export declare function getLichessGames(propsOpt: any): Promise<any[]>;
export declare const VARIANTS: {
    display: string;
    value: string;
}[];
