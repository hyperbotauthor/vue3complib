declare const _default: import("vue").DefineComponent<{
    id: {
        type: StringConstructor;
        default: string;
    };
    variant: {
        type: StringConstructor;
        default: string;
    };
    fen: {
        type: StringConstructor;
        default: string;
    };
    completed: {
        type: ArrayConstructor;
        default: () => never[];
    };
}, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{
    id?: unknown;
    variant?: unknown;
    fen?: unknown;
    completed?: unknown;
} & {
    id: string;
    variant: string;
    fen: string;
    completed: unknown[];
} & {}>, {
    id: string;
    variant: string;
    fen: string;
    completed: unknown[];
}>;
export default _default;
