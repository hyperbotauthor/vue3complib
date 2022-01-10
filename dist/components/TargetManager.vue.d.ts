import "../lib.scss";
export declare type Constructor<T = {}> = new (...args: any[]) => T;
export interface CanManageTargets {
    save(target: string): void;
    load(target: string): void;
    delete(target: string): void;
    getState(def: TargetManagerState): Promise<TargetManagerState>;
    storeState(tms: TargetManagerState): void;
}
export declare type TargetManagerState = {
    targets: string[];
    selected: string;
};
export declare function EquipWithTargetManagerBase<TBase extends Constructor<CanManageTargets>>(Base: TBase): {
    new (...args: any[]): {
        state: TargetManagerState;
        initState(): Promise<void>;
        update(): void;
        remove(target: string, force?: boolean | undefined): boolean;
        add(target: string): void;
        select(target: string): void;
        save(target: string): void;
        load(target: string): void;
        delete(target: string): void;
        getState(def: TargetManagerState): Promise<TargetManagerState>;
        storeState(tms: TargetManagerState): void;
    };
} & TBase;
export declare class MockTargetManagerFunctionality {
    storeState(tms: TargetManagerState): void;
    getState(def: TargetManagerState): Promise<any>;
    save(target: string): void;
    load(target: string): void;
    delete(target: string): void;
}
export declare const TargetManager: {
    new (...args: any[]): {
        state: TargetManagerState;
        initState(): Promise<void>;
        update(): void;
        remove(target: string, force?: boolean | undefined): boolean;
        add(target: string): void;
        select(target: string): void;
        save(target: string): void;
        load(target: string): void;
        delete(target: string): void;
        getState(def: TargetManagerState): Promise<TargetManagerState>;
        storeState(tms: TargetManagerState): void;
    };
} & typeof MockTargetManagerFunctionality;
declare const _default: import("vue").DefineComponent<{
    colorbuttons: {
        type: BooleanConstructor;
        default: boolean;
    };
    targetmanager: {
        type: {
            new (...args: any[]): {
                state: TargetManagerState;
                initState(): Promise<void>;
                update(): void;
                remove(target: string, force?: boolean | undefined): boolean;
                add(target: string): void;
                select(target: string): void;
                save(target: string): void;
                load(target: string): void;
                delete(target: string): void;
                getState(def: TargetManagerState): Promise<TargetManagerState>;
                storeState(tms: TargetManagerState): void;
            };
        } & typeof MockTargetManagerFunctionality;
        default: () => {
            state: TargetManagerState;
            initState(): Promise<void>;
            update(): void;
            remove(target: string, force?: boolean | undefined): boolean;
            add(target: string): void;
            select(target: string): void;
            save(target: string): void;
            load(target: string): void;
            delete(target: string): void;
            getState(def: TargetManagerState): Promise<TargetManagerState>;
            storeState(tms: TargetManagerState): void;
        } & MockTargetManagerFunctionality;
    };
}, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{
    colorbuttons?: unknown;
    targetmanager?: unknown;
} & {
    targetmanager: {
        state: TargetManagerState;
        initState(): Promise<void>;
        update(): void;
        remove(target: string, force?: boolean | undefined): boolean;
        add(target: string): void;
        select(target: string): void;
        save(target: string): void;
        load(target: string): void;
        delete(target: string): void;
        getState(def: TargetManagerState): Promise<TargetManagerState>;
        storeState(tms: TargetManagerState): void;
    } & MockTargetManagerFunctionality;
    colorbuttons: boolean;
} & {}>, {
    targetmanager: {
        state: TargetManagerState;
        initState(): Promise<void>;
        update(): void;
        remove(target: string, force?: boolean | undefined): boolean;
        add(target: string): void;
        select(target: string): void;
        save(target: string): void;
        load(target: string): void;
        delete(target: string): void;
        getState(def: TargetManagerState): Promise<TargetManagerState>;
        storeState(tms: TargetManagerState): void;
    } & MockTargetManagerFunctionality;
    colorbuttons: boolean;
}>;
export default _default;
