import React from "react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Form from "../src/index";

test("Reset Login", async done => {
  const USERNAME = "gutenbaum@example.com";
  const PASSWORD = "S3curep455w0rd";

  function checkValues(_event, { values }, _form) {
    try {
      expect(values.username).toBe("");
      expect(values.password).toBe("");
      done();
    } catch (error) {
      done(error);
    }
  }

  const { getByLabelText, getByText } = render(
    <Form onResetWithData={checkValues}>
      <label htmlFor="username">
        Username:
        <input name="username" id="username" type="text" />
      </label>
      <label htmlFor="password">
        Password:
        <input name="password" id="password" type="password" />
      </label>
      <button type="reset">Reset</button>
      <input type="submit" value="Submit" />
    </Form>
  );

  const username: HTMLInputElement = getByLabelText("Username:");
  const password: HTMLInputElement = getByLabelText("Password:");

  userEvent.type(username, USERNAME);
  userEvent.type(password, PASSWORD);

  expect(username.value).toBe(USERNAME);
  expect(password.value).toBe(PASSWORD);

  userEvent.click(getByText("Reset"));
});

test("Reset Default Selection", async done => {
  function checkValues(_event, { values }, _form) {
    try {
      expect(values.contact).toBe("email");
      done();
    } catch (error) {
      done(error);
    }
  }
  const { getByLabelText, getByText } = render(
    <Form onResetWithData={checkValues}>
      <p>Please select your preferred contact method:</p>
      <div>
        <input
          type="radio"
          id="contactChoice1"
          name="contact"
          value="email"
          defaultChecked
        />
        <label htmlFor="contactChoice1">Email</label>
        <input type="radio" id="contactChoice2" name="contact" value="phone" />
        <label htmlFor="contactChoice2">Phone</label>
        <input type="radio" id="contactChoice3" name="contact" value="mail" />
        <label htmlFor="contactChoice3">Mail</label>
      </div>
      <div>
        <button type="reset">Reset</button>
        <button type="submit">Submit</button>
      </div>
    </Form>
  );

  const email: HTMLInputElement = getByLabelText(/email/i);
  const phone: HTMLInputElement = getByLabelText(/phone/i);
  const mail: HTMLInputElement = getByLabelText(/^mail$/i);

  expect(email.checked).toBeTruthy();
  expect(phone.checked).toBeFalsy();
  expect(mail.checked).toBeFalsy();

  userEvent.click(phone);

  expect(email.checked).toBeFalsy();
  expect(phone.checked).toBeTruthy();
  expect(mail.checked).toBeFalsy();

  userEvent.click(getByText("Reset"));
});
