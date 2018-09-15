import Form from "../src/index.js";
import React from "react";
import { storiesOf } from "@storybook/react";

class ProofOfConcept extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state = {};
  }

  handleChange(event, { values, errors, hasErrors }) {
    this.setState({
      values,
      errors,
      hasErrors
    });
  }

  render() {
    return (
      <React.Fragment>
        <Form onChange={this.handleChange}>
          <input type="email" name="email" />
        </Form>
        <p>Form state:</p>
        <pre>{JSON.stringify(this.state, null, 2)}</pre>
      </React.Fragment>
    );
  }
}

storiesOf("Form", module).add("proof of concept", () => <ProofOfConcept />);
