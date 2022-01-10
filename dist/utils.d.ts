export declare function setLocal(key: string, value: any): void;
export declare function getLocal(key: string, deffault: any): any;
export declare function px(px: number): string;
export declare function capitalizeFirstLetter(str: string): string;
export declare function arrayMove(arr: any[], old_index: number, new_index: number): any[];
export declare function md2html(md: string): string;
export declare function uid(): string;
export declare function pause(delay: number): Promise<unknown>;
export declare type ColorDisposition = "text" | "background";
export declare function scoreColor(disposition: ColorDisposition, score: number): string;
