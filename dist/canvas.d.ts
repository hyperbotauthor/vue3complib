export declare function getStyle(className: string): string;
export declare class DomImage {
    img: any;
    constructor(width: number, height: number);
    set src(url: any);
    get naturalWidth(): number;
    get naturalHeight(): number;
    fromStyle(selector: string): Promise<unknown>;
}
export declare function getelse(obj: any, prop: any, def: any): any;
export declare class Canvas {
    width: number;
    height: number;
    ref: any;
    arrow(from: any, to: any, argsopt: any): void;
    uploadHref(kind: string): any;
    downloadHref(name: string, kind: string): any;
    drawImage(img: any, x: number, y: number, width: number, height: number): void;
    constructor(width: number, height: number);
    get ctx(): any;
    draw(): void;
    render(): any;
    resize(width: number, height: number): Canvas;
}
export declare function uciToCoords(uci: string, size: number, flip: boolean): any;
export declare function drawShapes(genUci: string, shapes: any, size: number, flip: boolean, canvas: any): void;
export declare function drawBoard(backgroundStyle: string, board: any, genUci: string, shapes: any, size: number, flip: boolean, canvas: any, exportcoords: boolean): Promise<void>;
