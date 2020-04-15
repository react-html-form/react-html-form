import React from "react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Form from "../../src/index";

const NAME_1 = "input_1";
const NAME_2 = "input_2";

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

test("Ignores unnamed fields", async done => {
  const handleData = (_e, state) => {
    try {
      if (state.values[NAME_1]) dataReader(NAME_1);
      if (state.values[NAME_2]) dataReader(NAME_2);
    } catch (error) {
      // drop it
    }
  };

  const { getByLabelText, getByText } = render(
    <Form onSubmitWithData={handleData}>
      <label htmlFor={NAME_1}>
        {NAME_1}
        <input id={NAME_1} name={NAME_1} type="text" />
      </label>

      <label htmlFor={NAME_2}>
        {NAME_2}
        <input id={NAME_2} type="text" />
      </label>

      <button type="submit">Submit</button>
    </Form>
  );

  const no1 = getByLabelText(NAME_1);
  const no2 = getByLabelText(NAME_2);
  const submit = getByText("Submit");

  await userEvent.type(no1, NAME_1);
  await userEvent.type(no2, NAME_2);
  await userEvent.click(submit);

  expect(dataReader).toHaveBeenCalledWith(NAME_1);
  expect(dataReader).not.toHaveBeenCalledWith(NAME_2);

  done();
});
