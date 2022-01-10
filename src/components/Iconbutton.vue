<script lang="ts">
import { defineComponent, h, ref, onMounted } from "vue";

export default defineComponent({
  name: "Iconbutton",
  props: {
    size: {
      type: Number,
      default: 16,
    },
    color: {
      type: String,
      default: "white",
    },
    icon: {
      type: String,
      required: true,
    },
  },
  setup(props, { emit }) {
    return () => {
      return h(
        "div",
        {
          class: ["iconbutton", props.color],
          style: `width: ${props.size}px; height: ${props.size}px;`,
        },
        [
          h(
            "div",
            {
              class: ["icon", props.icon],
              style: `width: ${props.size}px; height: ${props.size}px;`,
            },
            []
          ),
        ]
      );
    };
  },
});
</script>

<style>
.iconbutton {
  position: "relative";
  display: inline-block;
  margin: 1px;
  cursor: pointer;
}
.iconbutton .icon {
  position: absolute;
}
.iconbutton.white {
  background-color: #fff;
}
.iconbutton.green {
  background-color: #afa;
}
.iconbutton.blue {
  background-color: #aaf;
}
.iconbutton.red {
  background-color: #faa;
}
.iconbutton.yellow {
  background-color: #ffa;
}
.iconbutton.trasparent {
  background-color: transparent;
}

.iconbutton .icon.spinner {
  background-image: url(data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22utf-8%22%3F%3E%0A%3C!--%20Generated%20by%20IcoMoon.io%20--%3E%0A%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%0A%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%0A%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M8%200c-4.355%200-7.898%203.481-7.998%207.812%200.092-3.779%202.966-6.812%206.498-6.812%203.59%200%206.5%203.134%206.5%207%200%200.828%200.672%201.5%201.5%201.5s1.5-0.672%201.5-1.5c0-4.418-3.582-8-8-8zM8%2016c4.355%200%207.898-3.481%207.998-7.812-0.092%203.779-2.966%206.812-6.498%206.812-3.59%200-6.5-3.134-6.5-7%200-0.828-0.672-1.5-1.5-1.5s-1.5%200.672-1.5%201.5c0%204.418%203.582%208%208%208z%22%3E%3C%2Fpath%3E%0A%3C%2Fsvg%3E%0A);
  background-size: cover;
}
.iconbutton .icon.tobegin {
  background-image: url(data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22utf-8%22%3F%3E%0A%3C!--%20Generated%20by%20IcoMoon.io%20--%3E%0A%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%0A%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%0A%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M4%2014v-12h2v5.5l5-5v11l-5-5v5.5z%22%3E%3C%2Fpath%3E%0A%3C%2Fsvg%3E%0A);
  background-size: cover;
}
.iconbutton .icon.arrowleft {
  background-image: url(data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22utf-8%22%3F%3E%0A%3C!--%20Generated%20by%20IcoMoon.io%20--%3E%0A%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%0A%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%0A%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M0.5%208l7.5%207.5v-4.5h8v-6h-8v-4.5z%22%3E%3C%2Fpath%3E%0A%3C%2Fsvg%3E%0A);
  background-size: cover;
}
.iconbutton .icon.arrowright {
  background-image: url(data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22utf-8%22%3F%3E%0A%3C!--%20Generated%20by%20IcoMoon.io%20--%3E%0A%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%0A%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%0A%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M15.5%208l-7.5-7.5v4.5h-8v6h8v4.5z%22%3E%3C%2Fpath%3E%0A%3C%2Fsvg%3E%0A);
  background-size: cover;
}
.iconbutton .icon.toend {
  background-image: url(data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22utf-8%22%3F%3E%0A%3C!--%20Generated%20by%20IcoMoon.io%20--%3E%0A%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%0A%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%0A%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M12%202v12h-2v-5.5l-5%205v-11l5%205v-5.5z%22%3E%3C%2Fpath%3E%0A%3C%2Fsvg%3E%0A);
  background-size: cover;
}
.iconbutton .icon.cross {
  background-image: url(data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22utf-8%22%3F%3E%0A%3C!--%20Generated%20by%20IcoMoon.io%20--%3E%0A%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%0A%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%0A%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M15.854%2012.854c-0-0-0-0-0-0l-4.854-4.854%204.854-4.854c0-0%200-0%200-0%200.052-0.052%200.090-0.113%200.114-0.178%200.066-0.178%200.028-0.386-0.114-0.529l-2.293-2.293c-0.143-0.143-0.351-0.181-0.529-0.114-0.065%200.024-0.126%200.062-0.178%200.114%200%200-0%200-0%200l-4.854%204.854-4.854-4.854c-0-0-0-0-0-0-0.052-0.052-0.113-0.090-0.178-0.114-0.178-0.066-0.386-0.029-0.529%200.114l-2.293%202.293c-0.143%200.143-0.181%200.351-0.114%200.529%200.024%200.065%200.062%200.126%200.114%200.178%200%200%200%200%200%200l4.854%204.854-4.854%204.854c-0%200-0%200-0%200-0.052%200.052-0.090%200.113-0.114%200.178-0.066%200.178-0.029%200.386%200.114%200.529l2.293%202.293c0.143%200.143%200.351%200.181%200.529%200.114%200.065-0.024%200.126-0.062%200.178-0.114%200-0%200-0%200-0l4.854-4.854%204.854%204.854c0%200%200%200%200%200%200.052%200.052%200.113%200.090%200.178%200.114%200.178%200.066%200.386%200.029%200.529-0.114l2.293-2.293c0.143-0.143%200.181-0.351%200.114-0.529-0.024-0.065-0.062-0.126-0.114-0.178z%22%3E%3C%2Fpath%3E%0A%3C%2Fsvg%3E%0A);
  background-size: cover;
}
.iconbutton .icon.star {
  background-image: url(data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22utf-8%22%3F%3E%0A%3C!--%20Generated%20by%20IcoMoon.io%20--%3E%0A%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%0A%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%0A%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M14.5%206.5c-0.444%200-0.843%200.193-1.118%200.5h-2.968l2.099-2.099c0.411%200.023%200.83-0.123%201.144-0.437%200.586-0.586%200.586-1.536%200-2.121s-1.536-0.586-2.121%200c-0.314%200.314-0.46%200.733-0.437%201.144l-2.099%202.099v-2.968c0.307-0.275%200.5-0.674%200.5-1.118%200-0.828-0.672-1.5-1.5-1.5s-1.5%200.672-1.5%201.5c0%200.444%200.193%200.843%200.5%201.118v2.968l-2.099-2.099c0.023-0.411-0.123-0.83-0.437-1.144-0.586-0.586-1.536-0.586-2.121%200s-0.586%201.536%200%202.121c0.314%200.314%200.733%200.46%201.144%200.437l2.099%202.099h-2.968c-0.275-0.307-0.674-0.5-1.118-0.5-0.828%200-1.5%200.672-1.5%201.5s0.672%201.5%201.5%201.5c0.444%200%200.843-0.193%201.118-0.5h2.968l-2.099%202.099c-0.411-0.023-0.83%200.123-1.144%200.437-0.586%200.586-0.586%201.536%200%202.121s1.536%200.586%202.121%200c0.314-0.314%200.46-0.733%200.437-1.144l2.099-2.099v2.968c-0.307%200.275-0.5%200.674-0.5%201.118%200%200.828%200.672%201.5%201.5%201.5s1.5-0.672%201.5-1.5c0-0.444-0.193-0.843-0.5-1.118v-2.968l2.099%202.099c-0.023%200.411%200.123%200.83%200.437%201.144%200.586%200.586%201.536%200.586%202.121%200s0.586-1.536%200-2.121c-0.314-0.314-0.733-0.46-1.144-0.437l-2.099-2.099h2.968c0.275%200.307%200.674%200.5%201.118%200.5%200.828%200%201.5-0.672%201.5-1.5s-0.672-1.5-1.5-1.5z%22%3E%3C%2Fpath%3E%0A%3C%2Fsvg%3E%0A);
  background-size: cover;
}
.iconbutton .icon.questionmark {
  background-image: url(data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22utf-8%22%3F%3E%0A%3C!--%20Generated%20by%20IcoMoon.io%20--%3E%0A%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%0A%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%0A%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M7%2011h2v2h-2zM11%204c0.552%200%201%200.448%201%201v3l-3%202h-2v-1l3-2v-1h-5v-2h6zM8%201.5c-1.736%200-3.369%200.676-4.596%201.904s-1.904%202.86-1.904%204.596c0%201.736%200.676%203.369%201.904%204.596s2.86%201.904%204.596%201.904c1.736%200%203.369-0.676%204.596-1.904s1.904-2.86%201.904-4.596c0-1.736-0.676-3.369-1.904-4.596s-2.86-1.904-4.596-1.904zM8%200v0c4.418%200%208%203.582%208%208s-3.582%208-8%208c-4.418%200-8-3.582-8-8s3.582-8%208-8z%22%3E%3C%2Fpath%3E%0A%3C%2Fsvg%3E%0A);
  background-size: cover;
}
.iconbutton .icon.openfolder {
  background-image: url(data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22utf-8%22%3F%3E%0A%3C!--%20Generated%20by%20IcoMoon.io%20--%3E%0A%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%0A%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%0A%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M13%2015l3-8h-13l-3%208zM2%206l-2%209v-13h4.5l2%202h6.5v2z%22%3E%3C%2Fpath%3E%0A%3C%2Fsvg%3E%0A);
  background-size: cover;
}
.iconbutton .icon.preferences {
  background-image: url(data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22utf-8%22%3F%3E%0A%3C!--%20Generated%20by%20IcoMoon.io%20--%3E%0A%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%0A%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%0A%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M14.59%209.535c-0.839-1.454-0.335-3.317%201.127-4.164l-1.572-2.723c-0.449%200.263-0.972%200.414-1.529%200.414-1.68%200-3.042-1.371-3.042-3.062h-3.145c0.004%200.522-0.126%201.051-0.406%201.535-0.839%201.454-2.706%201.948-4.17%201.106l-1.572%202.723c0.453%200.257%200.845%200.634%201.123%201.117%200.838%201.452%200.336%203.311-1.12%204.16l1.572%202.723c0.448-0.261%200.967-0.41%201.522-0.41%201.675%200%203.033%201.362%203.042%203.046h3.145c-0.001-0.517%200.129-1.040%200.406-1.519%200.838-1.452%202.7-1.947%204.163-1.11l1.572-2.723c-0.45-0.257-0.839-0.633-1.116-1.113zM8%2011.24c-1.789%200-3.24-1.45-3.24-3.24s1.45-3.24%203.24-3.24c1.789%200%203.24%201.45%203.24%203.24s-1.45%203.24-3.24%203.24z%22%3E%3C%2Fpath%3E%0A%3C%2Fsvg%3E%0A);
  background-size: cover;
}
.iconbutton .icon.search {
  background-image: url(data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22utf-8%22%3F%3E%0A%3C!--%20Generated%20by%20IcoMoon.io%20--%3E%0A%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%0A%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%0A%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M15.504%2013.616l-3.79-3.223c-0.392-0.353-0.811-0.514-1.149-0.499%200.895-1.048%201.435-2.407%201.435-3.893%200-3.314-2.686-6-6-6s-6%202.686-6%206%202.686%206%206%206c1.486%200%202.845-0.54%203.893-1.435-0.016%200.338%200.146%200.757%200.499%201.149l3.223%203.79c0.552%200.613%201.453%200.665%202.003%200.115s0.498-1.452-0.115-2.003zM6%2010c-2.209%200-4-1.791-4-4s1.791-4%204-4%204%201.791%204%204-1.791%204-4%204z%22%3E%3C%2Fpath%3E%0A%3C%2Fsvg%3E%0A);
  background-size: cover;
}
.iconbutton .icon.statsbars {
  background-image: url(data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22utf-8%22%3F%3E%0A%3C!--%20Generated%20by%20IcoMoon.io%20--%3E%0A%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%0A%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%0A%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M0%2013h16v2h-16zM2%209h2v3h-2zM5%205h2v7h-2zM8%208h2v4h-2zM11%202h2v10h-2z%22%3E%3C%2Fpath%3E%0A%3C%2Fsvg%3E%0A);
  background-size: cover;
}
.iconbutton .icon.pencil {
  background-image: url(data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22utf-8%22%3F%3E%0A%3C!--%20Generated%20by%20IcoMoon.io%20--%3E%0A%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%0A%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%0A%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M13.5%200c1.381%200%202.5%201.119%202.5%202.5%200%200.563-0.186%201.082-0.5%201.5l-1%201-3.5-3.5%201-1c0.418-0.314%200.937-0.5%201.5-0.5zM1%2011.5l-1%204.5%204.5-1%209.25-9.25-3.5-3.5-9.25%209.25zM11.181%205.681l-7%207-0.862-0.862%207-7%200.862%200.862z%22%3E%3C%2Fpath%3E%0A%3C%2Fsvg%3E%0A);
  background-size: cover;
}
.iconbutton .icon.chessboard {
  background-image: url(data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22utf-8%22%3F%3E%0A%3C!--%20Generated%20by%20IcoMoon.io%20--%3E%0A%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%0A%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%0A%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M0%200v16h16v-16h-16zM8%2015v-7h-7v-7h7v7h7v7h-7z%22%3E%3C%2Fpath%3E%0A%3C%2Fsvg%3E%0A);
  background-size: cover;
}
.iconbutton .icon.undo {
  background-image: url(data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22utf-8%22%3F%3E%0A%3C!--%20Generated%20by%20IcoMoon.io%20--%3E%0A%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%0A%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%0A%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M8%201c-2.209%200-4.209%200.896-5.657%202.343l-2.343-2.343v6h6l-2.243-2.243c1.086-1.086%202.586-1.757%204.243-1.757%203.314%200%206%202.686%206%206%200%201.792-0.786%203.401-2.032%204.5l1.323%201.5c1.661-1.466%202.709-3.611%202.709-6%200-4.418-3.582-8-8-8z%22%3E%3C%2Fpath%3E%0A%3C%2Fsvg%3E%0A);
  background-size: cover;
}
.iconbutton .icon.list {
  background-image: url(data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22utf-8%22%3F%3E%0A%3C!--%20Generated%20by%20IcoMoon.io%20--%3E%0A%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%0A%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%0A%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M6%201h10v2h-10v-2zM6%207h10v2h-10v-2zM6%2013h10v2h-10v-2zM0%202c0-1.105%200.895-2%202-2s2%200.895%202%202c0%201.105-0.895%202-2%202s-2-0.895-2-2zM0%208c0-1.105%200.895-2%202-2s2%200.895%202%202c0%201.105-0.895%202-2%202s-2-0.895-2-2zM0%2014c0-1.105%200.895-2%202-2s2%200.895%202%202c0%201.105-0.895%202-2%202s-2-0.895-2-2z%22%3E%3C%2Fpath%3E%0A%3C%2Fsvg%3E%0A);
  background-size: cover;
}
.iconbutton .icon.book {
  background-image: url(data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22utf-8%22%3F%3E%0A%3C!--%20Generated%20by%20IcoMoon.io%20--%3E%0A%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%0A%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%0A%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M14%202v13h-10.5c-0.829%200-1.5-0.672-1.5-1.5s0.671-1.5%201.5-1.5h9.5v-12h-10c-1.1%200-2%200.9-2%202v12c0%201.1%200.9%202%202%202h12v-14h-1z%22%3E%3C%2Fpath%3E%0A%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M3.501%2013v0c-0%200-0.001%200-0.001%200-0.276%200-0.5%200.224-0.5%200.5s0.224%200.5%200.5%200.5c0%200%200.001-0%200.001-0v0h9.498v-1h-9.498z%22%3E%3C%2Fpath%3E%0A%3C%2Fsvg%3E%0A);
  background-size: cover;
}
.iconbutton .icon.wrench {
  background-image: url(data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22utf-8%22%3F%3E%0A%3C!--%20Generated%20by%20IcoMoon.io%20--%3E%0A%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%0A%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%0A%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M15.671%2012.779l-7.196-6.168c0.335-0.63%200.525-1.348%200.525-2.111%200-2.485-2.015-4.5-4.5-4.5-0.455%200-0.893%200.068-1.307%200.193l2.6%202.6c0.389%200.389%200.389%201.025%200%201.414l-1.586%201.586c-0.389%200.389-1.025%200.389-1.414%200l-2.6-2.6c-0.125%200.414-0.193%200.852-0.193%201.307%200%202.485%202.015%204.5%204.5%204.5%200.763%200%201.482-0.19%202.111-0.525l6.168%207.196c0.358%200.418%200.969%200.441%201.358%200.052l1.586-1.586c0.389-0.389%200.365-1-0.052-1.358z%22%3E%3C%2Fpath%3E%0A%3C%2Fsvg%3E%0A);
  background-size: cover;
}
</style>
