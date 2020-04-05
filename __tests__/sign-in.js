import React from "react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Form from "../src/index.tsx";

test("Login Test", async done => {
  const USERNAME = "jerry";
  const PASSWORD = "jerry";
  function checkValues(_event, data) {
    expect(data.values.username).toBe(USERNAME);
    expect(data.values.password).toBe(PASSWORD);
    done();
  }

  const { getByLabelText, getByText } = render(
    <Form onSubmitWithData={checkValues}>
      <label htmlFor="username">
        Username:
        <input id="username" name="username" type="text" />
      </label>
      <label htmlFor="password">
        Password:
        <input id="password" name="password" type="password" />
      </label>
      <input type="submit" value="Submit" />
    </Form>
  );

  await userEvent.type(getByLabelText("Username:"), USERNAME);
  await userEvent.type(getByLabelText("Password:"), PASSWORD);
  userEvent.click(getByText("Submit"));
});
