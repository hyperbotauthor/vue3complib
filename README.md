---
artifact: "Vue 3 Component Library"
status: "beta"
---

[![npm version](https://badge.fury.io/js/@publishvue%2Fvue3complib.svg)](https://badge.fury.io/js/@publishvue%2Fvue3complib)

# vue3complib

Vue 3 component library.

<img src="https://raw.githubusercontent.com/hyperbotauthor/transpimg/main/vuecomps.png" width="100" height="80" />

[View Component Demo](https://demo--vue3complib.netlify.app/)

## Project setup

```
yarn install
```

### Build library

```
yarn build
```

### Compiles and hot-reloads for development

```
yarn serve
```

### Lints and fixes files

```
yarn lint
```

# components

## Labeled

Labeled content. Label can be either on left or right side.

### Props

#### `label`

- `String`, required. Label to be displayed.

#### `rev`

- `Boolean`, optional, defaults to `false`. By default the label is rendered on the left side. If `rev` is `true` then the label will be rendered on the right side.

## Perscheck

Persistent checkbox.

### Props

#### `id`

- `String`, required. Local storage unique ID, to be used to store checkbox state.

#### `default`

- `Boolean`, optional, defaults to `false`. Default value to use when there is not a yet a stored value in local storage, `false` for unchecked and `true` for checked.

### Events

#### `perscheckchanged`

Event content

- `id`

Local storage unique ID.

- `checked`

Checked status of persistent checkbox, `false` for unchecked, `true` for checked.

## Perstext

Persistent text input.

### Props

#### `id`

- `String`, required. Local storage unique ID, to be used to store text input value.

#### `default`

- `String`, optional, defaults to empty string. Default value to use when there is not a yet a stored value in local storage.

#### `buttoncaption`

- `String`, optional, defaults to empty string. If non empty, a submit button with this caption will be added.

#### `onsubmitclear`

- `Boolean`, optional, default to `false`. Clear text on submit.

### Events

#### `perstextchanged`

Event content

- `id`

Local storage unique ID.

- `value`

Value of the persistent text input.

- `submit`

Boolean, set to `true` if the text was submitted by pressing ENTER or the submit button, `undefined` otherwise.

## Perscombo

Persistent combo box.

### Props

#### `id`

- `String`, required. Local storage unique ID, to be used to store selected value.

#### `options`

- `Array`, optional ( a default with 3 test options is provided ). Each element of the array is an object that has a `display` and a `value` field. The former will be shown to the user, that latter will be returned as selected value.

```javascript
[
  {
    display: "Display1", 
    value: "value1",
  },
  {
    display: "Display2", 
    value: "value2",
  },
  ...
}
```

### Events

#### `perscombochanged`

Event content

- `id`

Local storage unique ID.

- `value`

Selected value of the persistent combo.

## Tabpane

Tabpane.

### Props

#### `id`

- `String`, required. Local storage unique ID, to be used to store selected tab.

#### `width`

- `Number`, optional. Width of tab content in `px`. Defaults to 600. Should be set using `v-bind:` or `:`.

#### `height`

- `Number`, optional. Height of tab content in `px`. Defaults to 400. Should be set using `v-bind:` or `:`.

### Slots

Every child of a `Tabpane` is considered a tab. It can be any valid HTML element. You should add attribute `caption` to each of these elements ( or accept default tab name, which is `Tab {index of tab}` ).

#### Example

```html
<Tabpane
  id="tabpane"
  v-on:tabpanechanged="event"
  :width="300"
  :height="100"
>
  <div caption="Custom tab">custom</div>
  <div>tab 1</div>
  <div>tab 2</div>
</Tabpane>
```

### Events

#### `tabpanechanged`

Event content

- `id`

Local storage unique ID.

- `selectedTab`

Index of selected tab.

- `selectedTabCaption`

Caption of selected tab.

## Link

Link that opens in new tab.

### Props

#### `href`

- `String`, required. Url or link.

#### `caption`

- `String`, optional, defaults to `href`. Caption of link.

## Chessboard

Chessboard.

### Props

#### `fen`

FEN of the initial position. Optional, if no FEN is specified, the starting position will be set up.

### Events

#### chessboardmoveplayed

Event content

- `orig`

Original square of the move.

- `dest`

Destination square of the move.

- `uci`

Move in UCI notation.

- `isLegal`

True if the move is legal, false otherwise.

- `legals`

Legal UCIs for this move. Can be more than one if the move is promotion.

- `legalUci`

If the move is legal, this is the UCI move the board actually played ( the first of legal UCIs ).

- `san`

Move in SAN notation.