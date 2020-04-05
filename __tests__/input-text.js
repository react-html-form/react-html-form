import React from "react";
import { render, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Form from "../src/index.tsx";

const NAME = "input";
const USER_INPUT = "Hey there!";
const dataReader = jest.fn();
const handleBlur = jest.fn();
const handleChange = jest.fn();
const handleFocus = jest.fn();

beforeEach(() => {
  dataReader.mockReset();
  handleBlur.mockReset();
  handleChange.mockReset();
  handleFocus.mockReset();
});

test("Uncontrolled Input", async done => {
  const handleData = state => {
    try {
      dataReader(state.values[NAME]);
    } catch (error) {
      // drop it
    }
  };

  const { getByLabelText } = render(
    <Form
      onBlur={handleBlur}
      onChange={handleChange}
      onData={handleData}
      onFocus={handleFocus}
    >
      <label htmlFor={NAME}>
        Input here
        <input id={NAME} name={NAME} type="text" />
      </label>
    </Form>
  );

  const input = getByLabelText(/input here/i);
  expect(input.value).toBe("");

  fireEvent.focus(input);
  await userEvent.type(input, USER_INPUT);
  fireEvent.blur(input);

  expect(dataReader).toHaveBeenCalledWith(USER_INPUT);
  expect(handleChange).toHaveBeenCalledTimes(USER_INPUT.length);
  expect(handleFocus).toHaveBeenCalled();
  expect(handleBlur).toHaveBeenCalled();

  done();
});

test("Controlled Input", async done => {
  const Controller = function Controller(props) {
    const [state, useState] = React.useState("");
    return <>{props.children(state, useState)}</>;
  };

  const ref = { current: "" };
  const { getByLabelText } = render(
    <Controller>
      {(value, setValue) => (
        <Form
          onData={state => {
            ref.current = state.values[NAME];
            setValue(state.values[NAME]);
          }}
        >
          <label htmlFor={NAME}>
            {NAME}
            <input id={NAME} name={NAME} value={value} onChange={() => {}} />
          </label>
        </Form>
      )}
    </Controller>
  );

  const input = getByLabelText(NAME);

  await userEvent.type(input, USER_INPUT);
  expect(input.value).toBe(ref.current);
  expect(ref.current).toBe(USER_INPUT);

  done();
});

test("Input Validation onChange", async done => {
  const ERROR_TEXT = "ERROR bad input";
  const { getByLabelText } = render(
    <Form
      onData={({ errors }) => {
        dataReader(errors[NAME]);
      }}
      validateOnChange={{
        [NAME]: value => (value !== USER_INPUT ? ERROR_TEXT : "")
      }}
    >
      <label htmlFor={NAME}>
        {NAME}
        <input id={NAME} name={NAME} />
      </label>
    </Form>
  );

  const input = getByLabelText(NAME);

  await userEvent.type(input, USER_INPUT.slice(2));

  expect(dataReader).toBeCalledWith(ERROR_TEXT);

  done();
});

test.todo("Async Input Validation onChange");

test("Input Validation onBlur", async done => {
  const BLURRED = "BLURRED";
  const ERROR_TEXT = "ERROR bad input";
  const { getByLabelText } = render(
    <Form
      onData={({ errors = {} }) => {
        dataReader(errors[NAME]);
      }}
      validateOnBlur={{
        [NAME]: value => (value !== USER_INPUT ? ERROR_TEXT : "")
      }}
    >
      <label htmlFor={NAME}>
        {NAME}
        <input id={NAME} name={NAME} onBlur={() => dataReader(BLURRED)} />
      </label>
    </Form>
  );

  const input = getByLabelText(NAME);

  await userEvent.type(input, USER_INPUT.slice(2));
  await fireEvent.blur(input);

  expect(dataReader).toHaveBeenCalledWith(BLURRED);
  expect(dataReader).toHaveBeenCalledWith(ERROR_TEXT);

  done();
});

test("Text input handles `valueasbool`", async done => {
  const FALSE = "false";

  const { getByLabelText } = render(
    <Form
      onData={({ values = {} }) => {
        dataReader(values[NAME]);
      }}
    >
      <label htmlFor={NAME}>
        {NAME}
        <input type="text" id={NAME} name={NAME} data-valueasbool />
      </label>
    </Form>
  );

  const input = getByLabelText(NAME);

  await userEvent.type(input, FALSE);

  expect(dataReader).toHaveBeenLastCalledWith(false);

  await fireEvent.change(input, { target: { value: FALSE + 1 } });

  expect(dataReader).toHaveBeenLastCalledWith(true);

  done();
});

test.todo("Async Input Validation onBlur");
