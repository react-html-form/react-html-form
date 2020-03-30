import React from "react";
import PropTypes from "prop-types";
import { storiesOf } from "@storybook/react";
import Form, { defaultFormState } from "../src";

class KitchenSink extends React.Component {
  constructor(props) {
    super(props);
    this.handleData = this.handleData.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      ...defaultFormState,
      values: {
        email: props.badEmail
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
            email: async input =>
              new Promise(resolve => {
                setTimeout(() => {
                  if (input === this.props.goodEmail) return resolve();
                  if (input === this.props.badEmail)
                    return resolve(
                      `Seriously, ${this.props.badEmail} is taken`
                    );
                  return resolve(
                    `got an async error for ${input}, try '${this.props.goodEmail}'`
                  );
                }, this.props.mockTimeout);
              })
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
            <label htmlFor="name">Customer name:</label>
            <input
              required
              data-errormessage="Name is required and can only include letters"
              pattern="[A-Za-z]+"
              name="name"
              data-testid="name"
              id="name"
              type="text"
            />
            {this.state.blurred.name && this.state.errors.name && (
              <span>{this.state.errors.name}</span>
            )}
          </p>
          {this.state.touched.name && (
            <p>
              <label htmlFor="telephone">Telephone:</label>
              <input
                required
                name="telephone"
                data-testid="telephone"
                id="telephone"
                type="tel"
              />
            </p>
          )}
          <p>
            <label htmlFor="email">E-mail address:</label>
            <input
              required
              name="email"
              data-testid="email"
              id="email"
              type="email"
              onChange={() => {}}
              value={this.state.values.email}
            />
            <small>
              {`(${this.props.badEmail} is not allowed)`}
              <br />
              {this.state.isValidating && "(validating)"}
            </small>
          </p>
          {this.state.errors.email && <p>{this.state.errors.email}</p>}
          <p>
            {" "}
            <label htmlFor="variety">Variety:</label>
            <input list="variety" name="variety" data-testid="variety" />
            <datalist id="variety">
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
            </datalist>
          </p>
          <fieldset>
            <legend>Pizza Size</legend>
            <p>
              <label htmlFor="small">Small</label>
              <input
                id="small"
                type="radio"
                name="size"
                data-testid="size"
                value="small"
              />
            </p>
            <p>
              <label htmlFor="medium">Medium</label>
              <input
                id="medium"
                type="radio"
                name="size"
                data-testid="size"
                value="medium"
              />
            </p>
            <p>
              <label htmlFor="large">Large</label>
              <input
                id="large"
                type="radio"
                name="size"
                data-testid="size"
                value="large"
              />
            </p>
          </fieldset>
          <fieldset>
            <legend>Pizza Toppings</legend>
            <p>
              <label htmlFor="bacon">Bacon</label>
              <input
                type="checkbox"
                name="topping"
                data-testid="topping"
                id="bacon"
                value="bacon"
              />
            </p>
            <p>
              <label htmlFor="extra-cheese">Extra Cheese</label>
              <input
                type="checkbox"
                name="topping"
                data-testid="topping"
                value="extra-cheese"
                id="extra-cheese"
              />
            </p>
            <p>
              <label htmlFor="onion">Onion</label>
              <input
                type="checkbox"
                name="topping"
                data-testid="topping"
                value="onion"
                id="onion"
              />
            </p>
            <p>
              <label htmlFor="mushroom">Mushroom</label>
              <input
                type="checkbox"
                name="topping"
                data-testid="topping"
                value="mushroom"
                id="mushroom"
              />
            </p>
          </fieldset>
          <p>
            <label htmlFor="gluten-free-crust">Gluten-free crust</label>
            <input
              type="checkbox"
              name="gluten-free-crust"
              id="gluten-free-crust"
            />
          </p>
          <p>
            <label htmlFor="handle-value-as-boolean">
              Handle value as Boolean
            </label>
            <input
              data-valueasbool
              name="handle-value-as-boolean"
              id="handle-value-as-boolean"
              type="text"
            />
          </p>
          <p>
            <label htmlFor="breadsticks">Number of breadsticks</label>
            <input
              data-valueasnumber
              type="number"
              name="breadsticks"
              data-testid="breadsticks"
              id="breadsticks"
            />
          </p>
          <p>
            <label htmlFor="drinks">
              Drinks (cmd+click to select multiple)
            </label>
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
          </p>
          <p>
            <label htmlFor="delivery-time">Preferred delivery time:</label>
            <input
              // uncomment the following lines - they work as expected
              // data-valueasnumber
              // data-valueasdate
              type="time"
              min="11:00"
              max="21:00"
              step="900"
              name="delivery-time"
              id="delivery-time"
            />
          </p>
          <p>
            <label htmlFor="delivery-instructions">
              Delivery instructions:
            </label>
            <br />
            <textarea name="delivery-instructions" id="delivery-instructions" />
          </p>
          <p>
            <label htmlFor="coupon">Coupon(s)</label>
            <br />
            <input multiple type="file" name="coupon(s)" id="coupon" />
            <br />
            <small>
              (See console for the <code>FileList</code> object)
            </small>
          </p>
          <p>
            <input type="reset" value="Reset order" />
          </p>
          <p>
            <button
              type="submit"
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

KitchenSink.propTypes = {
  mockTimeout: PropTypes.number.isRequired,
  goodEmail: PropTypes.string.isRequired,
  badEmail: PropTypes.string.isRequired
};

export default KitchenSink;

storiesOf("Form", module).add("KitchenSink", () => (
  <KitchenSink
    mockTimeout={5000}
    goodEmail="good@example.com"
    badEmail="pizza@example.com"
  />
));
