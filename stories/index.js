import React from "react";
import { storiesOf } from "@storybook/react";
import Form from "../src";

class ProofOfConcept extends React.Component {
  constructor(props) {
    super(props);
    this.handleData = this.handleData.bind(this);
    this.state = {};
  }

  handleData(data) {
    this.setState(data);
  }

  render() {
    return (
      <React.Fragment>
        <Form onData={this.handleData}>
          <p>
            <label htmlFor="name">Customer name:</label>
            <input name="name" id="name" type="text" />
          </p>
          <p>
            <label htmlFor="telephone">Telephone:</label>
            <input name="telephone" id="telephone" type="tel" />
          </p>
          <p>
            <label htmlFor="email">E-mail address:</label>
            <input name="email" id="email" type="email" />
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
            <label htmlFor="delivery-time">Preferred delivery time:</label>
            <input
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
            <button type="submit">Submit order</button>
          </p>
        </Form>
        <p>Form state:</p>
        <pre>{JSON.stringify(this.state, null, 2)}</pre>
      </React.Fragment>
    );
  }
}

storiesOf("Form", module).add("proof of concept", () => <ProofOfConcept />);
