import React from "react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Form from "../src/index.tsx";

const NAME = "select";
const BEER = "beer";
const WINE = "wine";
const WHISKEY = "whiskey";
const WATER = "water";
const SODA = "soda";
const TEA = "tea";
const COFFEE = "coffee";

const dataReader = jest.fn();

beforeEach(() => {
  dataReader.mockReset();
});

test("Select Input", done => {
  const handleData = state => {
    try {
      // HANDLE CHANGE
      dataReader(state.values[NAME]);
    } catch (error) {
      // drop it
    }
  };

  const { getByLabelText } = render(
    <Form onData={handleData}>
      <label htmlFor={NAME}>{NAME}</label>
      <select id={NAME} name={NAME} data-testid={NAME} size={9}>
        <optgroup label="alcoholic">
          <option>{BEER}</option>
          <option>{WINE}</option>
          <option>{WHISKEY}</option>
        </optgroup>
        <optgroup label="non-alcoholic">
          <option>{COFFEE}</option>
          <option>{SODA}</option>
          <option>{WATER}</option>
          <option>{TEA}</option>
        </optgroup>
      </select>
    </Form>
  );

  const select = getByLabelText(NAME);

  userEvent.selectOptions(select, [WHISKEY]);
  expect(dataReader).toHaveBeenCalledWith(WHISKEY);

  userEvent.selectOptions(select, [WHISKEY]);
  userEvent.selectOptions(select, [WINE]);
  userEvent.selectOptions(select, [WATER]);
  expect(dataReader).toHaveBeenLastCalledWith(WATER);

  done();
});

test("Select Multiple Input", done => {
  const handleData = state => {
    try {
      // HANDLE CHANGE
      dataReader(state.values[NAME]);
    } catch (error) {
      // drop it
    }
  };

  const { getByLabelText } = render(
    <Form onData={handleData}>
      <label htmlFor={NAME}>{NAME}</label>
      <select multiple id={NAME} name={NAME} data-testid={NAME} size={9}>
        <optgroup label="alcoholic">
          <option>{BEER}</option>
          <option>{WINE}</option>
          <option>{WHISKEY}</option>
        </optgroup>
        <optgroup label="non-alcoholic">
          <option>{COFFEE}</option>
          <option>{SODA}</option>
          <option>{WATER}</option>
          <option>{TEA}</option>
        </optgroup>
      </select>
    </Form>
  );

  const select = getByLabelText(NAME);

  userEvent.selectOptions(select, [WHISKEY]);
  expect(dataReader).toHaveBeenCalledWith(expect.arrayContaining([WHISKEY]));
  expect(dataReader).not.toHaveBeenCalledWith(expect.arrayContaining([BEER]));

  dataReader.mockReset();

  userEvent.selectOptions(select, [WHISKEY, WINE, WATER]);
  expect(dataReader).toHaveBeenCalledWith(
    expect.arrayContaining([WHISKEY, WINE, WATER])
  );

  done();
});
