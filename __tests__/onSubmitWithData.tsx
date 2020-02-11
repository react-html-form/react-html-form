import React from "react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Form from "../src/index";

test("Submit Login", async done => {
  const USERNAME = "jerry";
  const PASSWORD = "jerry";

  function checkValues(_event, { values }, _form) {
    try {
      expect(values.username).toBe(USERNAME);
      expect(values.password).toBe(PASSWORD);
      done();
    } catch (error) {
      done(error);
    }
  }

  const { getByLabelText, getByText } = render(
    <Form onSubmitWithData={checkValues}>
      <label htmlFor="username">
        Username:
        <input name="username" id="username" type="text" />
      </label>
      <label htmlFor="password">
        Password:
        <input name="password" id="password" type="password" />
      </label>
      <input type="submit" value="Submit" />
    </Form>
  );

  const username: HTMLInputElement = getByLabelText("Username:");
  const password: HTMLInputElement = getByLabelText("Password:");

  userEvent.type(username, USERNAME);
  userEvent.type(password, PASSWORD);
  userEvent.click(getByText("Submit"));
});
