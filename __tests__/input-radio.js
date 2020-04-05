import React from "react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Form from "../src/index.tsx";

const NAME = "contact";

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

test("Radio Input Group", async done => {
  const OPT_EMAIL = "Email";
  const OPT_PHONE = "Phone";
  const OPT_MAIL = "Mail";

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
      <label htmlFor={`${NAME}-${OPT_EMAIL}`}>
        <input
          type="radio"
          id={`${NAME}-${OPT_EMAIL}`}
          name={NAME}
          value={OPT_EMAIL}
        />
        {OPT_EMAIL}
      </label>

      <label htmlFor={`${NAME}-${OPT_PHONE}`}>
        <input
          type="radio"
          id={`${NAME}-${OPT_PHONE}`}
          name={NAME}
          value={OPT_PHONE}
        />
        {OPT_PHONE}
      </label>

      <label htmlFor={`${NAME}-${OPT_MAIL}`}>
        <input
          type="radio"
          id={`${NAME}-${OPT_MAIL}`}
          name={NAME}
          value={OPT_MAIL}
        />
        {OPT_MAIL}
      </label>
    </Form>
  );

  const optionEmail = getByLabelText(OPT_EMAIL);
  const optionPhone = getByLabelText(OPT_PHONE);
  const optionMail = getByLabelText(OPT_MAIL);

  // DEFAULT VAULE
  expect(optionEmail.checked).toBe(false);
  expect(optionPhone.checked).toBe(false);
  expect(optionMail.checked).toBe(false);

  await userEvent.click(optionEmail);
  expect(dataReader).toHaveBeenCalledWith(OPT_EMAIL);

  await userEvent.click(optionPhone);
  expect(dataReader).toHaveBeenCalledWith(OPT_PHONE);

  await userEvent.click(optionMail);
  expect(dataReader).toHaveBeenCalledWith(OPT_MAIL);

  done();
});
