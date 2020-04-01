import React from "react";
import { render, fireEvent } from "@testing-library/react";
import Form from "../src/index";

const NAME = "input";

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

test("File Input", async done => {
  const handleData = state => {
    try {
      dataReader(state.values[NAME].files[0].type);
    } catch (error) {
      // drop it
    }
  };

  const FILE = new File(
    [`<html><body>Hello, world!</body></html>`],
    "hi-there.html",
    { type: "text/html" }
  );

  const { getByLabelText } = render(
    <Form
      onBlur={handleBlur}
      onChange={handleChange}
      onData={handleData}
      onFocus={handleFocus}
    >
      <label htmlFor={NAME}>
        Input here
        <input id={NAME} name={NAME} type="file" />
      </label>
    </Form>
  );

  const input = getByLabelText(/input here/i);
  expect(input.value).toBe("");

  fireEvent.focus(input);
  fireEvent.change(input, { target: { files: [FILE] } });
  fireEvent.blur(input);

  expect(handleFocus).toHaveBeenCalled();
  expect(dataReader).toHaveBeenCalledWith(FILE.type);
  expect(handleBlur).toHaveBeenCalled();

  done();
});
