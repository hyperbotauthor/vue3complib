declare const _default: import("vue").DefineComponent<{
    label: {
        type: StringConstructor;
        required: true;
    };
    rev: {
        type: BooleanConstructor;
        default: boolean;
    };
}, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>[], unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{
    label?: unknown;
    rev?: unknown;
} & {
    label: string;
    rev: boolean;
} & {}>, {
    rev: boolean;
}>;
export default _default;
