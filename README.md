# <img src='./assets/logo.jpg' width="344" alt='react-html-form' />

> The simplest form component for React

**Notice:** This project is in beta. I'm seeking beta testers and co-authors/maintainers.

###### Immediate roadmap: feedback/bug reports from the community, documentation, unit tests.

## Overview

"HTML form elements work a little bit differently from other DOM elements in React, because form elements naturally keep some internal state."[1] What this means, unfortunately, is that managing form state in React is not an easy feat.

Our mission is to build a great developer experience around forms. We let you manage forms with a straightforward API by **_embracing_ the fact that forms keep internal state, not fighting against it.**

## Problems with current form libraries

Other React form libraries introduce patterns that aren’t very ergonomic or have a large API surface. They often require the user to build their own input primitives that are tightly coupled to the library. Even more, they usually require the user to bring their own validation, something the browser actually offers for free!

## How react-html-form is different

We keep our API surface small by pulling form state (values and errors) directly out of the DOM through the `HTMLFormElement` interface.

## Install

```sh
$ npm install react-html-form@beta --save
$ # or
$ yarn add react-html-form@beta
```

## Usage

See https://codesandbox.io/embed/x70lxkzkvo?hidenavigation=1&view=split for a full "KitchenSink" demo.

```jsx
import Form from "react-html-form";
import React from "react";

class MyPage extends React.Component {
  handleSubmit(event, formState, formReference) {
    // formState = {
    //   values: {
    //     usersName: 'demo',
    //     usersEmail: 'demo@example.com',
    //   },
    //   errors: {},
    //   dirty: {
    //     usersName: true,
    //     usersEmail: true,
    //   },
    //   touched: {
    //     usersName: true,
    //     usersEmail: true,
    //   },
    //   blurred: {
    //     usersName: true,
    //     usersEmail: true,
    //   },
    //   isDirty: true,
    //   isValid: true,
    //   isValidating: false,
    //   submitCount: 1
    // }
    yourHttpClient.post("http://api.example.com/", formState.values);
  }

  render() {
    return (
      <React.Fragment>
        <Form
          // include `WithData` to any form event handler to get the form state included for free as the second argument. The third argument is a reference to the form itself
          // You can still use the standard `onSubmit` if you please
          onSubmitWithData={this.handleSubmit}
        >
          <label>Name:</label>
          <input
            required
            data-errormessage="Name can only include letters"
            pattern="A-Za-z+"
            name="usersName"
            type="text"
          />
          <br />
          <label>Email</label>
          <input required name="email" type="email" />
          <br />
          <button type="submit">Submit</button>
        </Form>
      </React.Fragment>
    );
  }
}
```

---

## Credits

- Logomark via [align](https://thenounproject.com/search/?q=react-html-form&i=468358) by Chameleon Design from the Noun Project

## Footnotes:

1: https://reactjs.org/docs/forms.html

## License

MIT
