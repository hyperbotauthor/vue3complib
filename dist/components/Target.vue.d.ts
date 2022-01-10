import "../lib.scss";
declare const _default: import("vue").DefineComponent<{
    targets: {
        type: ArrayConstructor;
        default: () => string[];
    };
    selected: {
        type: StringConstructor;
        default: string;
    };
    colorbuttons: {
        type: BooleanConstructor;
        default: boolean;
    };
}, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{
    targets?: unknown;
    selected?: unknown;
    colorbuttons?: unknown;
} & {
    targets: unknown[];
    selected: string;
    colorbuttons: boolean;
} & {}>, {
    targets: unknown[];
    selected: string;
    colorbuttons: boolean;
}>;
export default _default;
