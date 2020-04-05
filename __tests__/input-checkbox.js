import React from "react";
import { render, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Form from "../src/index.tsx";

const NAME = "input";

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

test("Checkbox Input", async done => {
  const handleData = state => {
    try {
      // HANDLE CHANGE
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
        I accept
        <input id={NAME} name={NAME} type="checkbox" />
      </label>
    </Form>
  );

  const input = getByLabelText(/i accept/i);
  // DEFAULT VAULE
  expect(input.checked).toBe(false);

  // CHANGE VALUE
  userEvent.click(input);
  fireEvent.blur(input);

  expect(handleFocus).toHaveBeenCalled();
  // CHECK VALUE
  expect(dataReader).toHaveBeenCalledWith(true);
  expect(handleBlur).toHaveBeenCalled();

  done();
});

test("Checkbox Input Group", async done => {
  const PACT_1 = "I accept the Terms";
  const PACT_2 = "I submit to Searches";
  const PACT_3 = "I swear Fealty";
  const PACT_4 = "Wait… I take it all back";

  const handleData = state => {
    try {
      // HANDLE CHANGE
      if (Array.isArray(state.values[NAME])) dataReader(state.values[NAME]);
      else dataReader(state.values[NAME]);
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
      <label htmlFor={PACT_1}>
        {PACT_1}
        <input id={PACT_1} name={NAME} value={PACT_1} type="checkbox" />
      </label>

      <label htmlFor={PACT_2}>
        {PACT_2}
        <input id={PACT_2} name={NAME} value={PACT_2} type="checkbox" />
      </label>

      <label htmlFor={PACT_3}>
        {PACT_3}
        <input id={PACT_3} name={NAME} value={PACT_3} type="checkbox" />
      </label>

      <label htmlFor={PACT_4}>
        {PACT_4}
        <input id={PACT_4} name={NAME} value={PACT_4} type="checkbox" />
      </label>
    </Form>
  );

  const input1 = getByLabelText(PACT_1);
  const input2 = getByLabelText(PACT_2);
  const input3 = getByLabelText(PACT_3);
  const input4 = getByLabelText(PACT_4);
  // DEFAULT VAULE
  expect(input1.checked).toBe(false);

  fireEvent.focus(input1);
  userEvent.click(input1); // values[NAME] = "I agree…"
  fireEvent.focus(input2);
  userEvent.click(input2); // values[NAME] = ["I agree…", "I submit…"]
  fireEvent.focus(input3);
  userEvent.click(input3); // values[NAME] = ["I agree…", "I submit…", "I swear…"]
  fireEvent.focus(input4);
  userEvent.click(input4);
  fireEvent.blur(input4);

  expect(handleFocus).toHaveBeenCalled();
  // CHECK VALUE
  expect(dataReader).toHaveBeenCalledWith(
    expect.arrayContaining([PACT_1, PACT_2, PACT_3, PACT_4])
  );
  expect(handleBlur).toHaveBeenCalled();

  done();
});
