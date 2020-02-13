import React from "react";
import { render, wait, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Form from "../../src/index";

const NAME = "input";
const USER_INPUT = "Hey there!";
const dataReader = jest.fn();
const handleBlur = jest.fn();
const handleChange = jest.fn();
const handleChangeWithData = jest.fn();
const handleFocus = jest.fn();
const handleReset = jest.fn();
const handleResetWithData = jest.fn();
const handleSubmit = jest.fn();
const handleSubmitWithData = jest.fn();

beforeEach(() => {
  dataReader.mockReset();
  handleBlur.mockReset();
  handleChange.mockReset();
  handleChangeWithData.mockReset();
  handleFocus.mockReset();
  handleReset.mockReset();
  handleResetWithData.mockReset();
  handleSubmit.mockReset();
  handleSubmitWithData.mockReset();
});

test("Uncontrolled Input", async done => {
  const handleData = (state, _form) => {
    try {
      dataReader(state.values[NAME]);
    } catch (error) {}
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

  const input: HTMLInputElement = getByLabelText(/input here/i) as any;
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

  const input: HTMLInputElement = getByLabelText(NAME) as any;

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
        [NAME]: value => {
          let error = "";
          if (value !== USER_INPUT) error = ERROR_TEXT;
          return error;
        }
      }}
    >
      <label>
        {NAME}
        <input id={NAME} name={NAME} />
      </label>
    </Form>
  );

  const input = getByLabelText(NAME);

  await userEvent.type(input, USER_INPUT.slice(2));
  await wait();

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
        [NAME]: value => {
          let error = "";
          if (value !== USER_INPUT) error = ERROR_TEXT;
          return error;
        }
      }}
    >
      <label>
        {NAME}
        <input id={NAME} name={NAME} onBlur={() => dataReader(BLURRED)} />
      </label>
    </Form>
  );

  const input = getByLabelText(NAME);

  await userEvent.type(input, USER_INPUT.slice(2));
  await wait();

  fireEvent.blur(input);

  expect(dataReader).toHaveBeenCalledWith(BLURRED);
  expect(dataReader).toHaveBeenCalledWith(ERROR_TEXT);

  done();
});

test.todo("Async Input Validation onBlur");
