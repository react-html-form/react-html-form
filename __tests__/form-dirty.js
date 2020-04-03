import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Form from "../src/index";

const NAME = "input";
const USER_INPUT = "something";
const SET = "DIRTY";
const UNSET = "CLEAN";

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

test("Dirty handling", async done => {
  const handleData = state => {
    try {
      if (state.dirty[NAME]) dataReader(SET);
      else dataReader(UNSET);
    } catch (error) {
      // drop it
    }
  };

  const { getByLabelText, getByText } = render(
    <Form onData={handleData}>
      <label htmlFor={NAME}>
        Input here
        <input id={NAME} name={NAME} type="text" />
      </label>

      <button type="reset">Reset</button>
    </Form>
  );

  const input = getByLabelText(/input here/i);
  const reset = getByText("Reset");

  await fireEvent.focus(input);

  expect(dataReader).toHaveBeenLastCalledWith(UNSET);

  await fireEvent.focus(input);
  await userEvent.type(input, USER_INPUT);
  await fireEvent.change(input, { target: { value: "" } });

  expect(input.value).toBe("");

  await userEvent.tab();

  expect(dataReader).toHaveBeenLastCalledWith(SET);

  await userEvent.click(reset);

  // a setTimeout is used to make sure reset handling for all elements has finalized
  // this makes the reset button an asyncronous action
  await waitFor(() => expect(dataReader).toHaveBeenLastCalledWith(UNSET));

  done();
});
