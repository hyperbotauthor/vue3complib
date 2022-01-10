declare const _default: import("vue").DefineComponent<{
    size: {
        type: NumberConstructor;
        default: number;
    };
    color: {
        type: StringConstructor;
        default: string;
    };
    icon: {
        type: StringConstructor;
        required: true;
    };
}, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{
    size?: unknown;
    color?: unknown;
    icon?: unknown;
} & {
    size: number;
    color: string;
    icon: string;
} & {}>, {
    size: number;
    color: string;
}>;
export default _default;
