declare const _default: import("vue").DefineComponent<{
    id: {
        type: StringConstructor;
        required: true;
    };
    scrollBarWidth: {
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
    selectedCaption: {
        type: StringConstructor;
        default: string;
    };
}, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{
    id?: unknown;
    scrollBarWidth?: unknown;
    width?: unknown;
    height?: unknown;
    selectedCaption?: unknown;
} & {
    id: string;
    scrollBarWidth: number;
    width: number;
    height: number;
    selectedCaption: string;
} & {}>, {
    scrollBarWidth: number;
    width: number;
    height: number;
    selectedCaption: string;
}>;
export default _default;
