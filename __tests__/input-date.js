import React from "react";
import { render, fireEvent } from "@testing-library/react";
import Form from "../src/index.tsx";

const NAME = "input";
const dataReader = jest.fn();

beforeEach(() => {
  dataReader.mockReset();
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
