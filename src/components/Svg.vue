<script lang="ts">
import { defineComponent, h, ref, onMounted, reactive } from "vue";

import { Button } from "../index";

// https://raw.githubusercontent.com/petercollingridge/code-for-blog/master/svg-interaction/draggable/draggable_restricted.svg
function makeDraggable(
  svg: any,
  boundaryX1: any,
  boundaryY1: any,
  boundaryX2: any,
  boundaryY2: any,
  gridSize: any
) {
  svg.addEventListener("mousedown", startDrag);
  svg.addEventListener("mousemove", drag);
  svg.addEventListener("mouseup", endDrag);
  svg.addEventListener("mouseleave", endDrag);
  svg.addEventListener("touchstart", startDrag);
  svg.addEventListener("touchmove", drag);
  svg.addEventListener("touchend", endDrag);
  svg.addEventListener("touchleave", endDrag);
  svg.addEventListener("touchcancel", endDrag);

  let selectedElement: any;
  let offset: any;
  let transform: any;
  let bbox: any;
  let minX: any;
  let maxX: any;
  let minY: any;
  let maxY: any;
  let confined: any;
  let snapToGrid: any;

  function getMousePosition(evt: any) {
    var CTM = svg.getScreenCTM();
    if (evt.touches) {
      evt = evt.touches[0];
    }
    return {
      x: (evt.clientX - CTM.e) / CTM.a,
      y: (evt.clientY - CTM.f) / CTM.d,
    };
  }

  function startDrag(evt: any) {
    if (evt.target.classList.contains("draggable")) {
      selectedElement = evt.target;
      offset = getMousePosition(evt);

      // Make sure the first transform on the element is a translate transform
      var transforms = selectedElement.transform.baseVal;

      if (
        transforms.length === 0 ||
        transforms.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE
      ) {
        // Create an transform that translates by (0, 0)
        var translate = svg.createSVGTransform();
        translate.setTranslate(0, 0);
        selectedElement.transform.baseVal.insertItemBefore(translate, 0);
      }

      // Get initial translation
      transform = transforms.getItem(0);
      offset.x -= transform.matrix.e;
      offset.y -= transform.matrix.f;

      confined = evt.target.classList.contains("confine");
      snapToGrid = evt.target.classList.contains("snaptogrid");

      if (confined) {
        bbox = selectedElement.getBBox();
        minX = boundaryX1 - bbox.x;
        maxX = boundaryX2 - bbox.x - bbox.width;
        minY = boundaryY1 - bbox.y;
        maxY = boundaryY2 - bbox.y - bbox.height;
      }
    }
  }

  function drag(evt: any) {
    if (selectedElement) {
      evt.preventDefault();

      var coord = getMousePosition(evt);
      var dx = coord.x - offset.x;
      var dy = coord.y - offset.y;

      if (confined) {
        if (dx < minX) {
          dx = minX;
        } else if (dx > maxX) {
          dx = maxX;
        }
        if (dy < minY) {
          dy = minY;
        } else if (dy > maxY) {
          dy = maxY;
        }
      }

      if (snapToGrid) {
        const modx = dx % gridSize;
        const mody = dy % gridSize;
        dx -= modx;
        dy -= mody;
      }

      transform.setTranslate(dx, dy);
    }
  }

  function endDrag(evt: any) {
    selectedElement = false;
  }
}

export default defineComponent({
  name: "Svg",
  props: {
    gridSize: {
      type: Number,
      default: 10,
    },
    width: {
      type: Number,
      default: 40,
    },
    height: {
      type: Number,
      default: 40,
    },
    drawGrid: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, context) {
    function nomSize(size: any) {
      return props.gridSize * size;
    }
    function nomWidth() {
      return nomSize(props.width);
    }
    function nomHeight() {
      return nomSize(props.height);
    }
    function nomSizeStr(size: any) {
      return `${nomSize(size)}`;
    }

    const svgNode = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );

    const viewBox = `0 0 ${nomWidth()} ${nomHeight()}`;

    svgNode.setAttributeNS(null, "viewBox", viewBox);

    function addCircle(
      x: any,
      y: any,
      r: any,
      fill?: any,
      stroke?: any,
      klass?: any
    ) {
      const circleNode = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      circleNode.setAttributeNS(
        null,
        "class",
        klass || "draggable confine snaptogrid"
      );
      circleNode.setAttributeNS(null, "cx", nomSizeStr(x));
      circleNode.setAttributeNS(null, "cy", nomSizeStr(y));
      circleNode.setAttributeNS(null, "r", nomSizeStr(r));
      if (fill) circleNode.setAttributeNS(null, "fill", fill);
      if (stroke) circleNode.setAttributeNS(null, "stroke", stroke);
      svgNode.appendChild(circleNode);
      return circleNode;
    }

    function addRectangle(
      x: any,
      y: any,
      width: any,
      height: any,
      fill?: any,
      stroke?: any,
      klass?: any
    ) {
      const rectangleNode = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      rectangleNode.setAttributeNS(
        null,
        "class",
        klass || "draggable confine snaptogrid"
      );
      rectangleNode.setAttributeNS(null, "x", nomSizeStr(x));
      rectangleNode.setAttributeNS(null, "y", nomSizeStr(y));
      rectangleNode.setAttributeNS(null, "width", nomSizeStr(width));
      rectangleNode.setAttributeNS(null, "height", nomSizeStr(height));
      if (fill) rectangleNode.setAttributeNS(null, "fill", fill);
      if (stroke) rectangleNode.setAttributeNS(null, "stroke", stroke);
      svgNode.appendChild(rectangleNode);
      return rectangleNode;
    }

    function addGrid() {
      for (let x = 0; x < props.width; x++) {
        for (let y = 0; y < props.height; y++) {
          addRectangle(x, y, 1, 1, "white", "#777");
        }
      }
    }

    const divRef: any = ref(0);
    const testRef: any = ref(0);
    const react = reactive({
      dataurl: "",
    });

    if (props.drawGrid) addGrid();

    addCircle(20, 20, 15, "blue");

    makeDraggable(svgNode, 0, 0, nomWidth(), nomHeight(), props.gridSize);

    onMounted(() => {
      divRef._rawValue.appendChild(svgNode);
    });

    return () => {
      return h("div", { class: ["vue3complib", "svg"] }, [
        h("div", { class: "vertcont" }, [
          h("div", { class: "horizcont" }, [
            h("div", { class: "svgdiv", ref: divRef }),
            h("div", { style: { marginLeft: "20px" } }, [
              "Test background Image",
            ]),
            h("div", { class: "testdiv", ref: testRef }),
          ]),
          h("div", { class: "controls" }, [
            h(Button, {
              caption: "Data Url Css",
              tooltip: "Render Data Url as Css",
              onClick: () => {
                // https://ourcodeworld.com/articles/read/1072/how-to-convert-a-html-svg-node-to-base64-with-javascript-in-the-browser
                // 1. Keep a DOM reference to the SVG element
                var SVGDomElement = svgNode;

                // 2. Serialize element into plain SVG
                var serializedSVG = new XMLSerializer().serializeToString(
                  SVGDomElement
                );

                // 3. convert svg to base64
                var base64Data = window.btoa(serializedSVG);

                const dataUrl =
                  "url(data:image/svg+xml;base64," + base64Data + ")";

                testRef._rawValue.style.backgroundImage = dataUrl;

                react.dataurl = `.svgicon {
    background-image: ${dataUrl};
    background-size: cover;
}`;
              },
            }),
          ]),
          h("div", { class: "dataurldiv" }, [
            h("textarea", { class: "dataurl", value: react.dataurl }),
          ]),
        ]),
      ]);
    };
  },
});
</script>

<style lang="scss">
.vue3complib.svg {
  display: inline-block;
  .svgdiv {
    width: 400px;
    height: 400px;
    border: solid 1px #007;
  }
  margin: 10px;
  cursor: move;
  textarea.dataurl {
    width: 1000px;
    height: 150px;
  }
  .controls {
    padding: 5px;
  }
  .vertcont {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .horizcont {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .testdiv {
    width: 100px;
    height: 100px;
    border: solid 1px #700;
    margin-left: 20px;
    background-size: cover;
  }
}
</style>
