import React from "react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Form from "../src/index";

/** @FIXME currently broken in implementation */
test("Async Validation Will Execute", async done => {
  const NAME = "e-mail";
  const INVALID_EMAIL = "EMAIL IS NOT VALID";
  const USED_EMAIL = "pizza@gmail.com";
  const logger = jest.fn();
  const validator = jest
    .fn()
    .mockImplementation(value =>
      value === USED_EMAIL ? reject(value) : resolve(value)
    );

  const failOnErrorInData = ({ errors }) => {
    if (errors[NAME]) logger(INVALID_EMAIL);
  };
  const catchAsyncError = value => {
    return validator(value)
      .then(() => "")
      .catch(() => INVALID_EMAIL);
  };

  const { getByLabelText } = render(
    <Form
      domValidation
      onData={failOnErrorInData}
      validateOnChange={{ [NAME]: catchAsyncError }}
    >
      <label htmlFor={NAME}>
        {NAME}
        <input name={NAME} id={NAME} type="text" />
      </label>
    </Form>
  );

  const input: HTMLInputElement = getByLabelText(NAME) as any;
  await userEvent.type(input, USED_EMAIL, { delay: 12 });
  await resolve("", 200); // wait for async call to finish

  // we didn't call any of the api's that fail
  expect(logger).toHaveBeenCalledWith(INVALID_EMAIL);

  done();
});

test("Async Validation Race Conditions", async done => {
  /** @about
   * Tests async validation as you type
   * Validators need to be dropped sequentially such that
   * each new value cancels the previous promise in the sequence.
   *
   * we wouldn't want a laggy network failing a perfectly valid email
   * because pizza@gmail.com is taken but pizza@gmail.com.uk is valid and currently in the text box
   * */
  const NAME = "e-mail";
  const FAIL_ME = "FAIL ME";
  const BAD_EMAIL = "pizza@gmail.co";
  const GOOD_EMAIL = "pizza@gmail.co.uk";
  const logger = jest.fn();
  const validator = jest
    .fn()
    .mockImplementation(value =>
      value === BAD_EMAIL ? reject(`${value} failed`, 130) : resolve(value, 1)
    );

  const failOnErrorInData = ({ errors = {} }) => {
    if (errors[NAME]) logger(FAIL_ME);
  };
  const catchAsyncError = value => {
    return validator(value)
      .then(() => "")
      .catch(() => "ERROR");
  };

  const { getByLabelText } = render(
    <Form
      onData={failOnErrorInData}
      validateOnChange={{ [NAME]: catchAsyncError }}
    >
      <label htmlFor={NAME}>
        {NAME}
        <input name={NAME} id={NAME} type="text" />
      </label>
    </Form>
  );

  const input: HTMLInputElement = getByLabelText(NAME) as any;
  await userEvent.type(input, GOOD_EMAIL, { delay: 12 });
  await resolve("", 200); // wait for async call to finish

  // input is "valid" according to its state
  expect(input).toHaveProperty("validationMessage", "");
  // we didn't call any of the api's that fail
  expect(logger).not.toHaveBeenCalledWith(FAIL_ME);

  done();
});

test.todo("Async Validation in Parellel Sequences");

/********* HELPER FUNCTIONS *********/

function resolve(value, ms = 0) {
  return new Promise(resolve => {
    setTimeout(() => resolve(value), ms);
  });
}

function reject(value, ms = 0) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(value), ms);
  });
}
