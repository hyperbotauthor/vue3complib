export declare class DomImage {
    img: any;
    constructor(width: number, height: number);
    set src(url: any);
    get naturalWidth(): number;
    get naturalHeight(): number;
    fromStyle(selector: string, onload: any): void;
}
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
declare const _default: import("vue").DefineComponent<{
    id: {
        type: StringConstructor;
        default: string;
    };
    size: {
        type: NumberConstructor;
        default: number;
    };
}, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{
    id?: unknown;
    size?: unknown;
} & {
    id: string;
    size: number;
} & {}>, {
    id: string;
    size: number;
}>;
export default _default;
