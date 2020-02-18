import React from "react";
import { storiesOf } from "@storybook/react";
import Form, { defaultFormState } from "../src";

export default class KitchenSink extends React.Component {
  constructor(props) {
    super(props);
    this.handleData = this.handleData.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      ...defaultFormState,
      values: {
        email: "pizza@example.com"
      }
    };
  }

  handleData(data) {
    this.setState(data);
    console.log(data);
  }

  handleSubmit(event, { values, errors, isValid }) {
    this.setState({ values, errors });
    if (!isValid) {
      window.alert("form is invalid");
    } else {
      window.alert("form is valid");
    }
  }

  render() {
    return (
      <>
        <Form
          domValidation={false}
          onData={this.handleData}
          onSubmitWithData={this.handleSubmit}
          validateOnBlur={{
            email: input => {
              return new Promise(resolve => {
                setTimeout(() => {
                  if (input === this.props.goodEmail) return resolve("");
                  if (input === this.props.badEmail)
                    return resolve(`Seriously, ${input} is taken`);
                  return resolve(
                    `got an async error for ${input}, try '${this.props.goodEmail}'`
                  );
                }, this.props.mockTimeout);
              });
            }
          }}
          validateOnChange={{
            email: input => {
              if (input === this.props.badEmail) {
                return `${input} is taken`;
              }
              return undefined;
            }
          }}
        >
          <p>
            <label htmlFor="name">
              Customer name:
              <input
                required
                data-errormessage="Name is required and can only include letters"
                pattern="[A-Za-z]+"
                name="name"
                data-testid="name"
                id="name"
                type="text"
              />
            </label>
            {this.state.blurred.name && this.state.errors.name && (
              <span>{this.state.errors.name}</span>
            )}
          </p>
          {this.state.touched.name && (
            <p>
              <label htmlFor="telephone">
                Telephone:
                <input
                  required
                  name="telephone"
                  data-testid="telephone"
                  id="telephone"
                  type="tel"
                />
              </label>
            </p>
          )}
          <p>
            <label htmlFor="email">
              E-mail address:
              <input
                required
                name="email"
                data-testid="email"
                id="email"
                type="email"
                onChange={() => {}}
                value={this.state.values.email}
              />
            </label>
            {this.state.isValidating && <small>(validating)</small>}
            {this.state.errors.email && (
              <strong>{this.state.errors.email}</strong>
            )}
          </p>
          <p>
            <label htmlFor="variety">
              Variety:
              <input
                list="variety"
                name="variety"
                data-testid="variety"
                id="variety"
              />
              <datalist>
                {/* eslint-disable */}
                <option value="Neapolitan" />
                <option value="Sicilian" />
                <option value="Argentine" />
                <option value="Deep dish" />
                <option value="Stuffed" />
                <option value="Pocket" />
                <option value="Turnover" />
                <option value="Rolled" />
                <option value="On a stick" />
                <option value="Grilled" />
                {/* eslint-enable */}
              </datalist>
            </label>
          </p>
          <fieldset>
            <legend>Pizza Size</legend>
            <p>
              <label htmlFor="small">
                Small
                <input
                  id="small"
                  type="radio"
                  name="size"
                  data-testid="size-small"
                  value="small"
                />
              </label>
            </p>
            <p>
              <label htmlFor="medium">
                Medium
                <input
                  id="medium"
                  type="radio"
                  name="size"
                  data-testid="size-medium"
                  value="medium"
                />
              </label>
            </p>
            <p>
              <label htmlFor="large">
                Large
                <input
                  id="large"
                  type="radio"
                  name="size"
                  data-testid="size-large"
                  value="large"
                />
              </label>
            </p>
          </fieldset>
          <fieldset>
            <legend>Pizza Toppings</legend>
            <p>
              <label htmlFor="bacon">
                Bacon
                <input
                  type="checkbox"
                  name="topping"
                  data-testid="topping-bacon"
                  id="bacon"
                  value="bacon"
                />
              </label>
            </p>
            <p>
              <label htmlFor="extra-cheese">
                Extra Cheese
                <input
                  type="checkbox"
                  name="topping"
                  data-testid="topping-extra-cheese"
                  value="extra-cheese"
                  id="extra-cheese"
                />
              </label>
            </p>
            <p>
              <label htmlFor="onion">
                Onion
                <input
                  type="checkbox"
                  name="topping"
                  data-testid="topping-onion"
                  value="onion"
                  id="onion"
                />
              </label>
            </p>
            <p>
              <label htmlFor="mushroom">
                Mushroom
                <input
                  type="checkbox"
                  name="topping"
                  data-testid="topping-mushroom"
                  value="mushroom"
                  id="mushroom"
                />
              </label>
            </p>
          </fieldset>
          <p>
            <label htmlFor="gluten-free-crust">
              Gluten-free crust
              <input
                type="checkbox"
                name="gluten-free-crust"
                data-testid="gluten-free-crust"
                id="gluten-free-crust"
              />
            </label>
          </p>
          <p>
            <label htmlFor="handle-value-as-boolean">
              Handle value as Boolean
              <input
                data-valueasbool
                name="handle-value-as-boolean"
                data-testid="handle-value-as-boolean"
                id="handle-value-as-boolean"
                type="text"
              />
            </label>
          </p>
          <p>
            <label htmlFor="breadsticks">
              Number of breadsticks
              <input
                data-valueasnumber
                type="number"
                name="breadsticks"
                data-testid="breadsticks"
                id="breadsticks"
              />
            </label>
          </p>
          <p>
            <label htmlFor="drinks">
              Drinks (cmd+click to select multiple)
              <br />
              <select
                multiple
                id="drinks"
                name="drinks"
                data-testid="drinks"
                size={9}
              >
                <optgroup label="alcoholic">
                  <option>Beer</option>
                  <option>Wine</option>
                  <option>Liquor</option>
                </optgroup>
                <optgroup label="non-alcoholic">
                  <option>Water</option>
                  <option>Soda</option>
                  <option>Tea</option>
                  <option>Coffee</option>
                </optgroup>
              </select>
            </label>
          </p>
          <p>
            <label htmlFor="delivery-time">
              Preferred delivery time:
              <input
                // uncomment the following lines - they work as expected
                // data-valueasnumber
                // data-valueasdate
                type="time"
                min="11:00"
                max="21:00"
                step="900"
                name="delivery-time"
                data-testid="delivery-time"
                id="delivery-time"
              />
            </label>
          </p>
          <p>
            <label htmlFor="delivery-instructions">
              Delivery instructions:
              <br />
              <textarea
                name="delivery-instructions"
                data-testid="delivery-instructions"
                id="delivery-instructions"
              />
            </label>
          </p>
          <p>
            <label htmlFor="coupon">
              Coupon(s)
              <br />
              <input
                multiple
                type="file"
                name="coupon(s)"
                data-testid="coupon(s)"
                id="coupon"
              />
              <br />
              <small>
                (See console for the <code>FileList</code> object)
              </small>
            </label>
          </p>
          <p>
            <input type="reset" value="Reset order" data-testid="reset" />
          </p>
          <p>
            <button
              type="submit"
              data-testid="submit"
              value="Order my pizza!"
              disabled={this.state.isValidating}
            >
              Submit order
            </button>
          </p>
          <input
            type="hidden"
            name="hidden"
            data-testid="hidden"
            value={1234567890}
          />
        </Form>
        <p>Form state:</p>
        <pre>{JSON.stringify(this.state, null, 2)}</pre>
      </>
    );
  }
}

storiesOf("Form", module).add("KitchenSink", () => (
  <KitchenSink
    mockTimeout={5000}
    badEmail="pizza@example.com"
    goodEmail="good@example.com"
  />
));
