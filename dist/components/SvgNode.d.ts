export declare class SvgNode_ {
    width: number;
    height: number;
    node: any;
    constructor(setWidth: number, setHeight: number);
    addCircle(x: any, y: any, r: any, fill?: any, stroke?: any): SVGCircleElement;
    addRectangle(x: any, y: any, width: any, height: any, fill?: any, stroke?: any): SVGRectElement;
    addText(x: any, y: any, text: string): SVGTextElement;
}
export declare function SvgNode(width: number, height: number): SvgNode_;
