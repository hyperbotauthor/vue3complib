declare const _default: import("vue").DefineComponent<{
    id: {
        type: StringConstructor;
        default: string;
    };
    defaultFamily: {
        type: StringConstructor;
        default: string;
    };
    defaultSize: {
        type: NumberConstructor;
        default: number;
    };
}, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{
    id?: unknown;
    defaultFamily?: unknown;
    defaultSize?: unknown;
} & {
    id: string;
    defaultFamily: string;
    defaultSize: number;
} & {}>, {
    id: string;
    defaultFamily: string;
    defaultSize: number;
}>;
export default _default;
