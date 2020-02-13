import React from "react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Form from "../src/index";

test.skip("Kitchen sink form", async done => {
  // async validation is broken
  const { getByLabelText } = render(
    <Form
      domValidation={false}
      onData={this.handleData}
      onSubmitWithData={this.handleSubmit}
      validateOnBlur={{
        email: async input => {
          try {
            if (input === "good@example.com") {
              await requestSuccessful(`that's good`);
              return undefined;
            } else if (input === "pizza@example.com")
              await requestUnsuccessful(`Seriously, ${input} is taken`);
            else
              await requestUnsuccessful(
                `async error for ${input}, try 'good@example.com'`
              );
          } catch (error) {
            return error.message;
          }
        }
      }}
      validateOnChange={{
        email: input => {
          if (input === "pizza@example.com") {
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
          <input required name="telephone" id="telephone" type="tel" />
        </p>
      )}
      <p>
        <label htmlFor="email">E-mail address:</label>
        <input
          required
          name="email"
          id="email"
          type="email"
          onChange={() => {}}
          value={this.state.values.email}
        />
        <small>
          {this.state.isValidating && "(validating)"} (pizza@example.com is not
          allowed)
        </small>
      </p>
      {this.state.errors.email && <p>{this.state.errors.email}</p>}
      <p>
        {" "}
        <label htmlFor="variety">Variety:</label>
        <input list="variety" name="variety" />
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
          <input id="small" type="radio" name="size" value="small" />
        </p>
        <p>
          <label htmlFor="medium">Medium</label>
          <input id="medium" type="radio" name="size" value="medium" />
        </p>
        <p>
          <label htmlFor="large">Large</label>
          <input id="large" type="radio" name="size" value="large" />
        </p>
      </fieldset>
      <fieldset>
        <legend>Pizza Toppings</legend>
        <p>
          <label htmlFor="bacon">Bacon</label>
          <input type="checkbox" name="topping" id="bacon" value="bacon" />
        </p>
        <p>
          <label htmlFor="extra-cheese">Extra Cheese</label>
          <input
            type="checkbox"
            name="topping"
            value="extra-cheese"
            id="extra-cheese"
          />
        </p>
        <p>
          <label htmlFor="onion">Onion</label>
          <input type="checkbox" name="topping" value="onion" id="onion" />
        </p>
        <p>
          <label htmlFor="mushroom">Mushroom</label>
          <input
            type="checkbox"
            name="topping"
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
        <label htmlFor="handle-value-as-boolean">Handle value as Boolean</label>
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
          id="breadsticks"
        />
      </p>
      <p>
        <label htmlFor="drinks">Drinks (cmd+click to select multiple)</label>
        <br />
        <select multiple id="drinks" name="drinks" size={9}>
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
        <label htmlFor="delivery-instructions">Delivery instructions:</label>
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
      <input type="hidden" name="hidden" value={1234567890} />
    </Form>
  );

  done();
});

/** @region
 * helper functions for async data mocking.
 */

function delay(ms = 0) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

async function requestSuccessful(goodData, ms = 0) {
  await delay(ms);
  return goodData;
}

async function requestUnsuccessful(badData, ms = 0) {
  await delay(ms);
  throw Error(badData);
}
