const SVG_ELEMENT_TYPE = "http://www.w3.org/2000/svg";

export class SvgNode_ {
  width: number;
  height: number;
  node: any;

  constructor(setWidth: number, setHeight: number) {
    this.width = setWidth;
    this.height = setHeight;

    this.node = document.createElementNS(SVG_ELEMENT_TYPE, "svg");

    const viewBox = `0 0 ${this.width} ${this.height}`;

    this.node.setAttributeNS(null, "viewBox", viewBox);
  }

  addCircle(x: any, y: any, r: any, fill?: any, stroke?: any) {
    const circleNode = document.createElementNS(SVG_ELEMENT_TYPE, "circle");

    circleNode.setAttributeNS(null, "cx", `${x}`);
    circleNode.setAttributeNS(null, "cy", `${y}`);
    circleNode.setAttributeNS(null, "r", `${r}`);
    if (fill) circleNode.setAttributeNS(null, "fill", fill);
    if (stroke) circleNode.setAttributeNS(null, "stroke", stroke);

    this.node.appendChild(circleNode);
    return circleNode;
  }

  addRectangle(
    x: any,
    y: any,
    width: any,
    height: any,
    fill?: any,
    stroke?: any
  ) {
    const rectangleNode = document.createElementNS(SVG_ELEMENT_TYPE, "rect");

    rectangleNode.setAttributeNS(null, "x", `${x}`);
    rectangleNode.setAttributeNS(null, "y", `${y}`);
    rectangleNode.setAttributeNS(null, "width", `${width}`);
    rectangleNode.setAttributeNS(null, "height", `${height}`);
    if (fill) rectangleNode.setAttributeNS(null, "fill", fill);
    if (stroke) rectangleNode.setAttributeNS(null, "stroke", stroke);

    this.node.appendChild(rectangleNode);
    return rectangleNode;
  }

  addText(x: any, y: any, text: string) {
    const textNode = document.createElementNS(SVG_ELEMENT_TYPE, "text");

    textNode.setAttributeNS(null, "x", `${x}`);
    textNode.setAttributeNS(null, "y", `${y}`);

    textNode.appendChild(document.createTextNode(text));
    this.node.appendChild(textNode);

    return textNode;
  }
}

export function SvgNode(width: number, height: number) {
  return new SvgNode_(width, height);
}
