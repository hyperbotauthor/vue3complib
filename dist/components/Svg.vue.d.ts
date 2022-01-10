declare const _default: import("vue").DefineComponent<{
    gridSize: {
        type: NumberConstructor;
        default: number;
    };
    width: {
        type: NumberConstructor;
        default: number;
    };
    height: {
        type: NumberConstructor;
        default: number;
    };
    drawGrid: {
        type: BooleanConstructor;
        default: boolean;
    };
}, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{
    gridSize?: unknown;
    width?: unknown;
    height?: unknown;
    drawGrid?: unknown;
} & {
    gridSize: number;
    width: number;
    height: number;
    drawGrid: boolean;
} & {}>, {
    gridSize: number;
    width: number;
    height: number;
    drawGrid: boolean;
}>;
export default _default;
