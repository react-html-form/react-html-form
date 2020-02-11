import React from "react";
import { render, waitForDomChange } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Form from "../src/index";

test("Login Test", async done => {
  const USERNAME = "jerry";
  const PASSWORD = "jerry";
  function checkValues(_event, data, _form) {
    expect(data.username).toBe(USERNAME);
    expect(data.password).toBe(PASSWORD);
    done();
  }

  const { getByLabelText, getByText } = render(
    <Form onSubmitWithData={checkValues}>
      <label htmlFor="username">
        Username:
        <input id="username" type="text" />
      </label>
      <label htmlFor="password">
        Password:
        <input id="password" type="password" />
      </label>
      <input type="submit" value="Submit" />
    </Form>
  );

  await userEvent.type(getByLabelText("Username:"), USERNAME);
  await userEvent.type(getByLabelText("Password:"), PASSWORD);
  userEvent.click(getByText("Submit"));
});
