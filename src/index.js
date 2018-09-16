import PropTypes from "prop-types";
import React from "react";

class Form extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.props.onChange(event);
    const values = {};
    const errors = {};

    for (let i = 0; i < this.form.elements.length; i += 1) {
      const element = this.form.elements[i];

      // Check for the name since not all form.elements have name's (like <fieldset />)
      // Otherwise, this would result in empty string keys: `{ name: "example", "": ""}`
      if (this.form.elements[i].name) {
        switch (element.type) {
          case "radio":
            if (element.checked) {
              values[element.name] = element.value;
            }
            if (element.validationMessage.length > 0) {
              errors[element.name] = element.validationMessage;
            }
            break;
          default:
            values[element.name] = element.value;
            if (element.validationMessage.length > 0) {
              errors[element.name] = this.form.elements[i].validationMessage;
            }
        }
      }
    }

    const hasErrors =
      Object.keys(errors).length !== 0 && errors.constructor === Object;

    this.props.onData({ values, errors, hasErrors });
  }

  render() {
    const { onData, ...rest } = this.props;
    return (
      <form
        {...rest}
        onChange={this.handleChange}
        ref={c => {
          this.form = c;
        }}
      >
        {this.props.children}
      </form>
    );
  }
}

Form.defaultProps = {
  onChange: () => {}
};

Form.propTypes = {
  onChange: PropTypes.func
};

export default Form;
