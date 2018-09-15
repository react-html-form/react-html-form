# <img src='./assets/logo.jpg' width="344" alt='react-html-form' />

> The simplest form component for React

## Overview

"HTML form elements work a little bit differently from other DOM elements in React, because form elements naturally keep some internal state."[1] What this means, unfortunately, is that managing form state in React is not an easy feat.

Our mission is to build a great developer experience around forms. We let you manage forms with a straightforward API by _embracing_ the fact that forms keep internal state, not fighting against it.

## Problems with current form libraries

Other React form libraries introduce patterns that aren’t very ergonomic or have a large API surface. They often require the user to build their own input primitives that are tightly coupled to the library. Even more, they usually require the user to bring their own validation, something the browser actually offers for free!

## How react-html-form is different

We keep our API surface small by pulling form state (values and errors) directly out of the DOM through the `HTMLFormElement` interface.

---

## Credits

- Logomark via [align](https://thenounproject.com/search/?q=react-html-form&i=468358) by Chameleon Design from the Noun Project

## Footnotes:

1: https://reactjs.org/docs/forms.html

## License

MIT
