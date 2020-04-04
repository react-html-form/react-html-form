/* eslint-disable no-console */
import React from "react";
import {
  render,
  fireEvent,
  waitForElement,
  waitForElementToBeRemoved
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import KitchenSink from "../stories";

async function clear(textInput) {
  fireEvent.change(textInput, { target: { value: "" } });
}

beforeEach(() => {
  // since this test uses a storybook story
  // with a ton of console, just stub them all out.
  console.log = jest.fn();
  console.info = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
  // this is called internally after submit
  window.alert = jest.fn();
});

afterEach(() => {
  console.log.mockRestore();
  console.info.mockRestore();
  console.warn.mockRestore();
  console.error.mockRestore();
  window.alert.mockRestore();
});

/** @note want to know coverage is good without this test */
// eslint-disable-next-line
xtest("Kitchen sink form", async done => {
  const GOOD_EMAIL = "good@example.com";
  const BAD_EMAIL = "pizza@badpizza.com";
  const { getByTestId, getByText } = render(
    <KitchenSink
      mockTimeout={300}
      goodEmail={GOOD_EMAIL}
      badEmail={BAD_EMAIL}
    />
  );

  const name = getByTestId(/name/i);
  // const phone = getByTestId(/telephone/i);
  const email = getByTestId(/email/i);
  // const variety = getByTestId(/variety/i);
  // const size = getByTestId(/small/i);
  // const toppings = getByTestId(/bacon/i);
  // const glutenFree = getByTestId(/gluten-free/i);
  // const boolean = getByTestId(/handle-value-as-boolean/i);
  // const breadsticks = getByTestId(/breadsticks/i);
  // const drinks = getByTestId(/drinks/i);
  // const time = getByTestId(/delivery-time/i);
  // const instructions = getByTestId(/instructions/i);
  // const coupons = getByTestId(/coupon/i);
  // const reset = getByTestId(/reset/i);
  // const submit = getByTestId(/submit/i);

  await userEvent.type(name, "JeffC");

  await userEvent.type(email, "test@mctest.face");
  await fireEvent.blur(email);
  await waitForElement(() => getByText(/\(validating\)/i));
  await waitForElementToBeRemoved(() => getByText(/\(validating\)/i));
  await clear(email);

  await userEvent.type(email, BAD_EMAIL);
  await fireEvent.blur(email);
  await waitForElement(() =>
    expect(getByText(`Seriously, ${BAD_EMAIL} is taken`))
  );
  await clear(email);

  await userEvent.type(email, GOOD_EMAIL);
  await fireEvent.blur(email);
  await waitForElement(() => getByText(/\(validating\)/i));
  await waitForElementToBeRemoved(() => getByText(/\(validating\)/i));

  await await done();
});
