import "../../node_modules/highlight.js/styles/stackoverflow-dark.css";
declare abstract class DocNode {
    abstract renderMarkdown(): string;
    abstract renderHtml(): string;
    abstract body(): any;
    parentEditor: MarkdownEditor;
    kind: string;
    disposition: string;
    layout: string;
    lang: string;
    uid: string;
    constructor(parentEditor: MarkdownEditor);
    serialize(): any;
    deserialize(blob: any): DocNode;
    isAux(): boolean;
    title(): string;
    renderTitle(): import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
        [key: string]: any;
    }>;
    renderNode(): import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
        [key: string]: any;
    }>;
    clone(): DocNode;
}
export declare function createNodeFromBlob(parentEditor: MarkdownEditor, node: any): DocNode | undefined;
export declare function createNodesFromBlob(parentEditor: MarkdownEditor, nodes: any): DocNode[];
declare class MarkdownEditor {
    auxNodes: DocNode[];
    nodes: DocNode[];
    updateFunc: any;
    debounceUpdate: any;
    id: string;
    draggedUid: string;
    saveTargets: string[];
    selectedTarget: string;
    selectedUid: string;
    constructor(updateFunc?: any);
    init(): void;
    serialize(): any;
    serializeForExport(pretty?: boolean): string;
    deserialize(blob: any): this;
    deserializeFromExport(json: string): this;
    selectUid(uid: string): void;
    getSelectedIndex(): number;
    clear(): void;
    effNodes(): DocNode[];
    saveAs(name: string): void;
    loadFrom(name: string): Promise<void>;
    addTarget(name: string): void;
    removeTarget(name: string): void;
    selectTarget(name: string): void;
    delete(uid: string): void;
    insertBefore(uid: string): void;
    update(): void;
    addNode(node: DocNode): void;
    addText(): void;
    addCode(lang: string): void;
    addHeadingN(n: number): void;
    renderNode(): import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
        [key: string]: any;
    }>;
    renderMarkdown(): string;
    renderHtml(): string;
    scrollSelectedIntoView(): void;
}
declare const _default: import("vue").DefineComponent<{
    id: {
        type: StringConstructor;
        default: string;
    };
}, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{
    id?: unknown;
} & {
    id: string;
} & {}>, {
    id: string;
}>;
export default _default;
