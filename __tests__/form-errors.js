import React from "react";
import {
  render,
  fireEvent,
  waitForElement,
  waitForElementToBeRemoved
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Form from "../src/index";

const NAME = "input";
const ERROR_MESSAGE = "Not a color";
const REGEXP = /^#[a-f0-9]+$/;
const USER_INPUT = "#dadb0dy";

const dataReader = jest.fn();
const handleReset = jest.fn();

beforeEach(() => {
  dataReader.mockReset();
  handleReset.mockReset();
});

test("HTMLElement constraints cause form error", async done => {
  const handleData = state => {
    try {
      if (state.errors[NAME]) dataReader(state.errors[NAME]);
    } catch (error) {
      // drop it
    }
  };

  const { getByLabelText } = render(
    <Form onReset={handleReset} onData={handleData}>
      <label htmlFor={NAME}>
        Input here
        <input id={NAME} name={NAME} type="text" pattern={REGEXP.toString()} />
      </label>
    </Form>
  );

  const input = getByLabelText(/input here/i);
  expect(input.value).toBe("");

  await fireEvent.focus(input);
  await userEvent.type(input, USER_INPUT);
  await fireEvent.blur(input);

  expect(dataReader).toHaveBeenCalled();

  done();
});

test("validateOnChange", async done => {
  const handleData = state => {
    try {
      if (state.errors[NAME]) dataReader(state.errors[NAME]);
    } catch (error) {
      // drop it
    }
  };

  const { getByLabelText } = render(
    <Form
      onReset={handleReset}
      onData={handleData}
      validateOnChange={{
        [NAME]: value => (REGEXP.test(value) ? "" : ERROR_MESSAGE)
      }}
    >
      <label htmlFor={NAME}>
        Input here
        <input id={NAME} name={NAME} type="text" />
      </label>
    </Form>
  );

  const input = getByLabelText(/input here/i);
  expect(input.value).toBe("");

  await fireEvent.focus(input);
  await userEvent.type(input, USER_INPUT);
  await fireEvent.blur(input);

  expect(dataReader).toHaveBeenCalled();

  done();
});

test("validateOnBlur", async done => {
  const handleData = state => {
    try {
      if (state.errors[NAME]) dataReader(state.errors[NAME]);
    } catch (error) {
      // drop it
    }
  };

  const { getByLabelText } = render(
    <Form
      onReset={handleReset}
      onData={handleData}
      validateOnBlur={{
        [NAME]: value => (REGEXP.test(value) ? "" : ERROR_MESSAGE)
      }}
    >
      <label htmlFor={NAME}>
        Input here
        <input id={NAME} name={NAME} type="text" />
      </label>
    </Form>
  );

  const input = getByLabelText(/input here/i);
  expect(input.value).toBe("");

  await fireEvent.focus(input);
  await userEvent.type(input, USER_INPUT);
  await fireEvent.blur(input);

  expect(dataReader).toHaveBeenCalled();

  done();
});

test("Focus the first element with an error", async done => {
  const { getByLabelText, getByText } = render(
    <Form onSubmit={event => event.preventDefault()}>
      <label htmlFor="A">
        A
        <input id="A" name="A" type="text" pattern="^[a-f0-9]$" />
      </label>
      <label htmlFor="B">
        B
        <input id="B" name="B" type="text" pattern="^[a-f0-9]$" />
      </label>

      <button type="submit">Submit</button>
    </Form>
  );

  const inputA = getByLabelText("A");
  const inputB = getByLabelText("B");
  const submit = getByText("Submit");

  await userEvent.type(inputA, "boboddy");
  await userEvent.type(inputB, "boboddy");
  await userEvent.click(submit);

  expect(inputA).toBe(document.activeElement);

  done();
});

test("domValidation is overriden by validateOnChange", async done => {
  const { getByLabelText } = render(
    <Form
      domValidation
      onSubmit={event => event.preventDefault()}
      validateOnChange={{
        [NAME]: value => (REGEXP.test(value) ? "" : "validateOnChange")
      }}
    >
      <label htmlFor={NAME}>
        Input here
        <input
          id={NAME}
          name={NAME}
          type="text"
          pattern={REGEXP.toString()}
          data-errormessage="data-errormessage"
        />
      </label>
    </Form>
  );

  const input = getByLabelText(/input here/i);

  await userEvent.type(input, "boboddy");

  expect(input.validationMessage).toBe("validateOnChange");

  done();
});

/** @FIXME
 * Validation is intentionally fired after reset but not on mount...
 * Is this an intentional feature, or an oversight?
 */
xtest("Reset form", async done => {
  function FormStateManager(props) {
    const [error, setError] = React.useState("");
    const handleData = state => {
      try {
        setError(state.errors[NAME]);
      } catch (e) {
        // do nothing
      }
    };

    return props.children(error, handleData);
  }
  const { getByLabelText, getByText } = render(
    <FormStateManager>
      {(error, handleData) => (
        <Form
          onData={handleData}
          validateOnChange={{
            [NAME]: value => (REGEXP.test(value) ? "" : ERROR_MESSAGE)
          }}
        >
          <label htmlFor={NAME}>
            Input here
            <input id={NAME} name={NAME} type="text" />
            {error && <p>{error}</p>}
          </label>

          <button type="reset">Reset</button>
        </Form>
      )}
    </FormStateManager>
  );

  const input = getByLabelText(/input here/i);
  expect(input.value).toBe("");

  await fireEvent.focus(input);
  await userEvent.type(input, USER_INPUT);
  await fireEvent.blur(input);

  await waitForElement(() => getByText(ERROR_MESSAGE));

  await fireEvent.click(getByText("Reset"));
  await waitForElementToBeRemoved(() => getByText(ERROR_MESSAGE));

  done();
});
