<script lang="ts">
import _ from "lodash";

import { h, defineComponent, reactive, onMounted, ref } from "vue";

import {
  Tabpane,
  px,
  Target,
  arrayMove,
  md2html,
  capitalizeFirstLetter,
  uid,
  Button,
  FontSelector,
  getLocal,
} from "../index";

import { SmartStore } from "@publishvue/smartstore";

import "../../node_modules/highlight.js/styles/stackoverflow-dark.css";
import hljs from "highlight.js";

const sm = new SmartStore();

abstract class DocNode {
  abstract renderMarkdown(): string;
  abstract renderHtml(): string;
  abstract body(): any;

  parentEditor: MarkdownEditor;

  kind: string;
  disposition: string;
  layout: string;
  lang: string;

  uid: string;

  constructor(parentEditor: MarkdownEditor) {
    this.parentEditor = parentEditor;
    this.uid = uid();
    this.disposition = "";
    this.kind = "docnode";
    this.layout = "";
    this.lang = "";
  }
  serialize(): any {
    return {
      kind: this.kind,
      uid: this.uid,
      disposition: this.disposition,
      layout: this.layout,
      lang: this.lang,
    };
  }
  deserialize(blob: any): DocNode {
    this.disposition = blob.disposition || "";
    this.uid = typeof blob.uid === "string" ? blob.uid || uid() : uid();
    this.layout = blob.layout || "";
    this.lang = blob.lang || "";
    return this;
  }
  isAux() {
    return !!this.disposition;
  }
  title() {
    if (this.disposition) return capitalizeFirstLetter(this.disposition);
    if (this.layout)
      return (
        capitalizeFirstLetter(this.layout) +
        " " +
        capitalizeFirstLetter(this.lang)
      );
    return capitalizeFirstLetter(this.kind);
  }
  renderTitle() {
    return h(
      "div",
      {
        class: {
          titlebar: true,
          aux: this.isAux(),
        },
        draggable: this.isAux() ? undefined : true,
        onDragstart: (ev: any) => {
          this.parentEditor.draggedUid = this.uid;
        },
        onDrop: (ev: any) => {
          ev.preventDefault();
          this.parentEditor.insertBefore(this.uid);
        },
        onDragover: (ev: any) => {
          ev.preventDefault();
        },
        onClick: () => {
          if (this.isAux()) return;
          this.parentEditor.selectUid(this.uid);
        },
      },
      [
        h(
          "div",
          {
            class: "title",
          },
          [this.title()]
        ),
        this.isAux()
          ? undefined
          : h(
              "button",
              {
                class: ["delete"],
                onClick: () => {
                  this.parentEditor.delete(this.uid);
                },
              },
              ["Delete"]
            ),
      ]
    );
  }
  renderNode() {
    return h(
      "div",
      {
        class: [
          "docnode",
          this.kind,
          this.disposition,
          this.layout,
          this.lang,
          this.uid === react.selectedUid ? "selected" : "",
        ],
        uid: this.uid,
        id: `docnode${this.uid}`,
      },
      [this.renderTitle(), this.body()]
    );
  }
  clone(): DocNode {
    const node =
      createNodeFromBlob(this.parentEditor, this.serialize()) ||
      new TextNode(this.parentEditor);
    node.uid = this.uid;
    return node;
  }
}

export function createNodeFromBlob(
  parentEditor: MarkdownEditor,
  node: any
): DocNode | undefined {
  if (node.kind === "text") return new TextNode(parentEditor).deserialize(node);
  if (node.kind.match(/^heading/))
    return new HeadingN(parentEditor).deserialize(node);
  return undefined;
}
export function createNodesFromBlob(
  parentEditor: MarkdownEditor,
  nodes: any
): DocNode[] {
  if (!nodes) return [];
  return _.compact(
    nodes.map((node: any) => createNodeFromBlob(parentEditor, node))
  );
}

class TextNode extends DocNode {
  content: string;
  constructor(parentEditor: MarkdownEditor) {
    super(parentEditor);
    this.kind = "text";
    this.content = "";
  }
  serialize() {
    return {
      ...super.serialize(),
      ...{
        content: this.content,
      },
    };
  }
  deserialize(blob: any) {
    super.deserialize(blob);
    this.content = blob.content || "";
    return this;
  }
  fontSize() {
    return 16;
  }
  input(ev: any) {
    const text = ev.target.value;
    this.content = text;
    store();
  }
  body() {
    return h(
      "textarea",
      {
        style: {
          "font-size": px(this.fontSize()),
        },
        key: uid(),
        onInput: this.input.bind(this),
        id: `textarea${this.uid}`,
      },
      [this.content]
    );
  }
  renderMarkdown() {
    if (this.layout === "code") {
      return "```" + this.lang + "\n" + this.content + "\n```";
    }
    return "\n" + this.content;
  }
  renderHtml() {
    if (this.layout === "code") {
      const html = this.lang
        ? hljs.highlight(this.content, { language: this.lang }).value
        : hljs.highlightAuto(this.content).value;
      return "<pre class='html code'>" + html + "</pre>";
    }
    return md2html(this.content)
      .split("\n\n")
      .map((p) => "<p>" + p + "</p>")
      .join("\n");
  }
}

class HeadingN extends TextNode {
  n: number;
  constructor(parentEditor: MarkdownEditor) {
    super(parentEditor);
    this.n = 1;
    this.kind = "heading1";
  }
  fontSize() {
    return (5 - this.n) * 3 + 12;
  }
  deserialize(blob: any) {
    super.deserialize(blob);
    this.n = blob.n || 1;
    this.kind = `heading${this.n}`;
    return this;
  }
  serialize() {
    return {
      ...super.serialize(),
      ...{
        n: this.n,
      },
    };
  }
  title() {
    if (this.isAux()) return super.title();
    return `Heading - ${this.n}`;
  }
  renderMarkdown() {
    return "\n" + "#####".substring(0, this.n) + " " + this.content;
  }
  renderHtml() {
    return `<h${this.n}>${md2html(this.content)}</h${this.n}>`;
  }
}

class MarkdownEditor {
  auxNodes: DocNode[] = [];
  nodes: DocNode[] = [];
  updateFunc: any;
  debounceUpdate: any;
  id: string = "markdowneditor";
  draggedUid: string;
  saveTargets: string[];
  selectedTarget: string;
  selectedUid: string = uid();
  constructor(updateFunc?: any) {
    this.init();
    this.updateFunc = updateFunc;
    this.debounceUpdate = _.debounce(this.update.bind(this), 100);
    this.draggedUid = uid();
    this.saveTargets = ["Default"];
    this.selectedTarget = "Default";
  }
  init() {
    this.auxNodes = [
      new HeadingN(this).deserialize({ n: 1, disposition: "title" }),
      new HeadingN(this).deserialize({ n: 2, disposition: "abstract" }),
      new TextNode(this).deserialize({ disposition: "resources" }),
    ];
    this.nodes = [];
  }
  serialize(): any {
    const blob = {
      auxNodes: this.auxNodes.map((node) => node.serialize()),
      nodes: this.nodes.map((node) => node.serialize()),
      saveTargets: this.saveTargets,
      selectedTarget: this.selectedTarget,
      selectedUid: this.selectedUid,
    };
    return blob;
  }
  serializeForExport(pretty?: boolean): string {
    const blob = this.serialize();
    delete blob["saveTargets"];
    delete blob["selectedTarget"];
    return pretty ? JSON.stringify(blob, null, 2) : JSON.stringify(blob);
  }
  deserialize(blob: any) {
    if (blob.auxNodes) this.auxNodes = createNodesFromBlob(this, blob.auxNodes);
    this.nodes = createNodesFromBlob(this, blob.nodes);
    this.saveTargets = blob.saveTargets || ["Default"];
    this.selectedTarget = blob.selectedTarget || "Default";
    this.selectedUid = blob.selectedUid || uid();
    return this;
  }
  deserializeFromExport(json: string) {
    const blob = JSON.parse(json);
    const saveTargets = this.saveTargets;
    const selectedTarget = this.selectedTarget;
    this.deserialize(blob);
    this.saveTargets = saveTargets;
    this.selectedTarget = selectedTarget;
    this.update();
    return this;
  }
  selectUid(uid: string) {
    this.selectedUid = uid;
    this.debounceUpdate();
  }
  getSelectedIndex(): number {
    return this.nodes.findIndex((node) => node.uid === this.selectedUid);
  }
  clear() {
    this.init();
    this.update();
  }
  effNodes() {
    return this.auxNodes.concat(this.nodes);
  }
  saveAs(name: string) {
    sm.setItem(this.id + "/" + name, this.serialize());
  }
  async loadFrom(name: string) {
    const blob = await sm.getItem(this.id + "/" + name, undefined);
    if (blob === undefined) {
      window.alert("Nothing is saved under that name.");
      return;
    }
    const saveTargets = this.saveTargets;
    this.deserialize(blob);
    this.saveTargets = saveTargets;
    this.selectedTarget = name;
    this.update();
    this.scrollSelectedIntoView();
  }
  addTarget(name: string) {
    this.saveTargets.push(name);
    this.selectedTarget = name;
    this.update();
  }
  removeTarget(name: string) {
    if (name === "Default") return;
    this.saveTargets = this.saveTargets.filter((testName) => testName !== name);
    this.selectedTarget = "Default";
    this.update();
  }
  selectTarget(name: string) {
    this.selectedTarget = name;
    this.update();
  }
  delete(uid: string) {
    this.nodes = this.nodes.filter((node) => node.uid !== uid);
    this.update();
  }
  insertBefore(uid: string) {
    const draggedIndex = this.nodes.findIndex(
      (node) => node.uid === this.draggedUid
    );
    const index = this.nodes.findIndex((node) => node.uid === uid);
    arrayMove(this.nodes, draggedIndex, index);
    this.update();
  }
  update() {
    this.nodes = this.nodes.slice();
    if (this.updateFunc) this.updateFunc();
  }
  addNode(node: DocNode) {
    const index = this.getSelectedIndex();
    if (index < 0 || index >= this.nodes.length - 1) {
      this.nodes.push(node);
    } else {
      this.nodes.splice(index + 1, 0, node);
    }
    this.selectUid(node.uid);
    this.update();
    this.scrollSelectedIntoView();
  }
  addText() {
    const node = new TextNode(this);
    this.addNode(node);
  }
  addCode(lang: string) {
    const node = new TextNode(this).deserialize({ layout: "code", lang });
    this.addNode(node);
  }
  addHeadingN(n: number) {
    const node = new HeadingN(this).deserialize({ n });
    this.addNode(node);
  }
  renderNode() {
    const headerNodes = h(
      "div",
      { class: "header" },
      this.auxNodes.map((node) => node.renderNode())
    );
    const contentNodes = h(
      "div",
      { class: "content" },
      this.nodes.map((node) => node.renderNode())
    );
    return h("div", { class: "document" }, [
      headerNodes,
      h("hr"),
      contentNodes,
    ]);
  }
  renderMarkdown(): string {
    return this.nodes.map((node) => node.renderMarkdown()).join("\n");
  }
  renderHtml(): string {
    const head = this.auxNodes.map((node) => node.renderHtml()).join("\n");
    const body = this.nodes.map((node) => node.renderHtml()).join("\n");
    return head + "<hr>" + body;
  }
  scrollSelectedIntoView() {
    setTimeout(() => {
      const e = document.getElementById(`docnode${this.selectedUid}`);
      if (e) {
        e.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }, 0);
  }
}

const react = reactive({
  updateKey: 0,
  markdown: "",
  html: "",
  width: 0,
  height: 0,
  saveTargets: ["Default"],
  selectedTarget: "Default",
  selectedUid: uid(),
  json: "{}",
  fontFamily: "Arial",
  fontSize: 16,
});

function calcSize() {
  react.width = window.innerWidth - 30;
  react.height = window.innerHeight - 105;
}

function store() {
  const blob = md.serialize();
  sm.setItem(md.id, blob);
}

function updateMd() {
  react.updateKey++;
  react.saveTargets = md.saveTargets;
  react.selectedTarget = md.selectedTarget;
  react.selectedUid = md.selectedUid;
  react.json = md.serializeForExport();
  react.fontFamily = getLocal(md.id + "/fontselector/fontfamily", "Arial");
  react.fontSize = getLocal(md.id + "/fontselector/fontsize", 16);
  store();
}

const md = new MarkdownEditor(updateMd);

function createHeadingNButton(n: number) {
  return h(
    "button",
    {
      class: "bluebutton",
      onClick: () => {
        md.addHeadingN(n);
      },
    },
    [`+ H${n}`]
  );
}

export default defineComponent({
  name: "MarkdownEditor",
  props: {
    id: {
      type: String,
      default: "markdowneditor",
    },
  },
  setup(props, context) {
    onMounted(async () => {
      md.id = props.id + "/markdowneditor";
      await sm.open();
      const storedDocJson = await sm.getItem(md.id, undefined);
      if (storedDocJson) md.deserialize(storedDocJson);
      calcSize();
      window.onresize = () => {
        calcSize();
      };
      updateMd();
      md.scrollSelectedIntoView();
    });

    return () => {
      const closeButton = h(
        "button",
        {
          class: "redbutton",
          style: {
            "margin-left": px(20),
          },
          onClick: () => {
            context.emit("closed", {});
          },
        },
        ["Close"]
      );

      const addTextButton = h(
        "button",
        {
          class: "greenbutton",
          onClick: () => {
            md.addText();
          },
        },
        ["+ Text"]
      );

      const addCodeButton = h(
        "button",
        {
          class: "yellowbutton",
          onClick: () => {
            const lang = window.prompt(
              "Code language ( empty = no particular language ) ?"
            );
            if (typeof lang !== "string") return;
            md.addCode(lang);
          },
        },
        ["+ Code"]
      );

      const addCodeLangButtons = [
        ["+ JS", "javascript"],
        ["+ TS", "typescript"],
        ["+ Json", "json"],
        ["+ Toml", "toml"],
      ].map((entry) =>
        h(
          "button",
          {
            class: "yellowbutton",
            onClick: () => {
              md.addCode(entry[1]);
            },
          },
          [entry[0]]
        )
      );

      const addJavascriptCodeButton = h(
        "button",
        {
          class: "yellowbutton",
          onClick: () => {
            md.addCode("javascript");
          },
        },
        ["+ JS"]
      );

      const clearButton = h(
        "button",
        {
          class: "redbutton",
          onClick: () => {
            md.clear();
          },
        },
        ["Clear"]
      );

      const target = h(Target, {
        targets: react.saveTargets,
        selected: react.selectedTarget,
        onTargetchanged: (ev: any) => {
          //window.alert(JSON.stringify(ev))
          if (ev.action === "add") {
            md.addTarget(ev.target);
          } else if (ev.action === "remove") {
            md.removeTarget(ev.target);
          } else if (ev.action === "saveas") {
            md.saveAs(ev.target);
          } else if (ev.action === "loadfrom") {
            md.loadFrom(ev.target);
          } else if (ev.action === "selected") {
            md.selectTarget(ev.target);
          }
        },
      });

      const topControls = h(
        "div",
        {
          class: "topcontrols",
        },
        [
          addTextButton,
          addCodeButton,
          addCodeLangButtons,
          [1, 2, 3, 4, 5].map((i) => createHeadingNButton(i)),
          clearButton,
          target,
          closeButton,
        ]
      );

      const editorDiv = h(
        "div",
        {
          class: "editor",
          caption: "Editor",
        },
        react.updateKey === 0 ? "Loading editor ..." : md.renderNode()
      );

      const markdownRef: any = ref(0);

      const markdownPre = h("textarea", {
        class: "pre",
        ref: markdownRef,
        value: react.markdown,
        style: {
          height: px(react.height - 40),
        },
      });

      const markdownDiv = h(
        "div",
        {
          class: "markdown",
          caption: "Markdown",
        },
        [markdownPre]
      );

      const htmlDiv = h("div", {
        class: "html",
        innerHTML: react.html,
        style: {
          fontFamily: react.fontFamily,
          fontSize: px(react.fontSize),
        },
      });

      const htmlControlDiv = h("div", { caption: "Html Preview" }, [
        h(FontSelector, {
          id: props.id + "/markdowneditor/fontselector",
          onFontselectorchanged: () => {
            updateMd();
          },
        }),
        h("hr"),
        htmlDiv,
      ]);

      function focusSerde() {
        setTimeout(() => {
          serdeTextareaRef._rawValue.focus();
          serdeTextareaRef._rawValue.select();
          document.execCommand("copy");
        }, 0);
      }

      const serializeButton = h(Button, {
        caption: "Serialize",
        tooltip: "Serialize as_JSON",
        class: "bluebutton",
        onClick: () => {
          react.json = md.serializeForExport();
          focusSerde();
        },
      });

      const serializePrettyButton = h(Button, {
        caption: "Serialize Pretty",
        tooltip: "Serialize as_JSON prettified",
        class: "greenbutton",
        onClick: () => {
          react.json = md.serializeForExport(true);
          focusSerde();
        },
      });

      const serdeTextareaRef: any = ref(0);

      const deserializeButton = h(Button, {
        caption: "Deserialize",
        tooltip: "Deserialize from_JSON",
        class: "redbutton",
        onClick: () => {
          const json = serdeTextareaRef._rawValue.value;
          md.deserializeFromExport(json);
        },
      });

      const serdeTextarea = h("textarea", {
        value: react.json,
        ref: serdeTextareaRef,
      });

      const serdeControlsDiv = h("div", { class: "controls" }, [
        serializeButton,
        serializePrettyButton,
        deserializeButton,
      ]);

      const serdeDiv = h(
        "div",
        {
          class: "serde",
          caption: "Serialize / Deserialize",
        },
        [serdeControlsDiv, serdeTextarea]
      );

      const tabpane = h(
        Tabpane,
        {
          id: "editortabpane",
          width: react.width,
          height: react.height,
          onTabpanechanged: (ev: any) => {
            if (ev.selectedTabCaption === "Editor") {
              md.scrollSelectedIntoView();
            } else if (ev.selectedTabCaption === "Markdown") {
              react.markdown = md.renderMarkdown();
              setTimeout(() => {
                markdownRef._rawValue.focus();
                markdownRef._rawValue.select();
                document.execCommand("copy");
              }, 0);
            } else if (ev.selectedTabCaption === "Html Preview") {
              react.html = md.renderHtml();
            }
          },
        },
        () => [editorDiv, markdownDiv, htmlControlDiv, serdeDiv]
      );

      const vertContainer = h(
        "div",
        {
          class: "vertcont",
        },
        [topControls, tabpane]
      );
      return h(
        "div",
        {
          class: "markdowneditor",
        },
        [vertContainer]
      );
    };
  },
});
</script>

<style lang="scss">
@use "../lib" as *;

@mixin centeredcol {
  display: flex;
  flex-direction: column;
  align-items: center;
}
@mixin centeredrow {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.markdowneditor {
  .document {
    .header {
      padding: 5px;
      background-color: #ddd;
    }
  }
  .html.code {
    padding: 10px;
    background-color: #eee;
    background-image: linear-gradient(to right, #ee9, #9dd);
    font-weight: bold;
    font-size: 20px;
  }
  .markdown {
    width: calc(100% - 5px);
  }
  .pre {
    width: calc(100% - 10px);
  }
  textarea {
    padding: 5px;
  }
  .docnode.heading1 {
    .title {
      font-size: 26px;
      color: #070;
    }
    textarea {
      height: 28px;
    }
  }
  .docnode.heading2 {
    .title {
      font-size: 22px;
      color: #007;
    }
    textarea {
      height: 24px;
    }
  }
  .docnode.heading3 {
    .title {
      font-size: 20px;
      color: #077;
    }
    textarea {
      height: 22px;
    }
  }
  .docnode.heading4 {
    .title {
      font-size: 18px;
      color: #707;
    }
    textarea {
      height: 20px;
    }
  }
  .docnode.heading5 {
    .title {
      font-size: 16px;
      color: #770;
    }
    textarea {
      height: 18px;
    }
  }
  .docnode {
    font-family: Verdana;
  }
  .docnode.text {
    .title {
      background-color: #afa;
    }
  }
  .docnode.resources {
    .title {
      background-color: #fdf;
    }
  }
  .docnode.text.code {
    .title {
      color: #007;
      font-family: monospace;
      font-size: 16px;
      font-weight: bold;
      background-color: #aff;
    }
  }
  .docnode.text textarea {
    min-height: 100px;
  }
  @include centeredcol;
  .vertcont {
    @include centeredcol;
  }
  .topcontrols {
    padding: 5px;
    background-color: #eee;
    margin-bottom: 5px;
    width: calc(100% - 30px);
    text-align: center;
  }
  .docnode.title {
    border: solid 5px #7a7;
  }
  .docnode.abstract {
    border: solid 4px #77a;
  }
  .docnode.resources {
    border: solid 3px #aa7;
  }
  .docnode.selected {
    box-shadow: 5px 5px #7d7;
  }
  .docnode {
    padding: 2px;
    border: solid 1px;
    margin: 2px;
    margin-bottom: 6px;
    textarea {
      width: calc(100% - 12px);
      margin-bottom: -4px;
    }
    .titlebar {
      @include centeredrow;
      background-color: #eee;
      margin: 1px;
      margin-left: 0px;
      margin-top: 0px;
      margin-bottom: 2px;
      width: calc(100% - 1px);
      cursor: move;
    }
    .titlebar.aux {
      cursor: default;
    }
    .title {
      font-weight: bold;
      padding: 3px;
      background-color: #ffa;
      margin: 3px;
      width: 250px;
      text-align: center;
    }
    .delete {
      margin-left: 20px;
      background-color: #faa;
    }
  }
  .serde {
    textarea {
      margin-top: 10px;
      height: 400px;
      width: calc(100% - 10px);
    }
  }
}
</style>
