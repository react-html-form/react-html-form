import React from "react";
import { render, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Form from "../src/index";

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

test("Date input handles `valueasdate`", async done => {
  const { getByLabelText } = render(
    <Form
      onData={({ values = {} }) => {
        dataReader(values[NAME]);
      }}
    >
      <label htmlFor={NAME}>
        {NAME}
        <input type="date" id={NAME} name={NAME} data-valueasdate />
      </label>
    </Form>
  );

  const input = getByLabelText(NAME);

  await fireEvent.change(input, { target: { value: "1991-12-12" } });

  expect(input.value).toBe("1991-12-12");

  expect(dataReader).toHaveBeenLastCalledWith(new Date("12/12/1991 GMT+0"));

  done();
});
