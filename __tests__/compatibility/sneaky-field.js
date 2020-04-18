import React, { useState } from "react";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Form from "../../src/index";

const USERNAME = "username";
const PASSWORD = "password";

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

function StateContainer({ children }) {
  return children(useState());
}

/** @FIXME
 * Additions to the functionality of `getFormState` broke this a while ago.
 * the functionality was added here, but this doesn't seem to work any longer.
 * it should work be made to work in refactoring tho.
 * https://github.com/ewolfe/react-html-form/blob/ae0a016ec2cc86026f5c6d9f9fbc385595d60651/src/index.js
 */
// eslint-disable-next-line jest/no-disabled-tests
test.skip("Reset removes dynamic fields from state", async done => {
  const handleData = (_e, state) => {
    try {
      if (!state.values[PASSWORD] && state.values[USERNAME]) dataReader();
    } catch (error) {
      // drop it
    }
  };

  const { getByLabelText, getByText } = render(
    <StateContainer>
      {([state, setState]) => (
        <Form
          onData={({ values = {} }) => {
            setState(prev => ({ ...prev, ...values }));
          }}
          onResetWithData={handleData}
        >
          <label htmlFor={USERNAME}>
            {USERNAME}
            <input id={USERNAME} name={USERNAME} type="text" />
          </label>

          {state && state[USERNAME] && (
            <label htmlFor={PASSWORD}>
              {PASSWORD}
              <input id={PASSWORD} name={PASSWORD} type="text" />
            </label>
          )}

          <button type="reset">Reset</button>
        </Form>
      )}
    </StateContainer>
  );

  const reset = getByText("Reset");

  const no1 = getByLabelText(USERNAME);

  await userEvent.type(no1, USERNAME);

  const no2 = getByLabelText(PASSWORD);

  await userEvent.type(no2, PASSWORD);

  userEvent.click(reset);

  await waitFor(() => {
    expect(dataReader).toHaveBeenCalled();
  });

  done();
});
