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

      // Save the error message
      if (element.validationMessage.length > 0) {
        errors[element.name] = element.validationMessage;
      }

      // Save the value
      switch (element.type) {
        case "fieldset":
          // no-op
          break;
        case "radio":
          if (element.checked) {
            values[element.name] = element.value;
          }
          break;
        case "checkbox":
          if (!values[element.name]) {
            if (element.checked) {
              values[element.name] =
                element.value === "on" ? true : element.value;
            } else {
              values[element.name] = false;
            }
          } else {
            // Convert to an array of values since we're probably in a fieldset
            // (Or at least, the user has declared multiple checkboxes with the same name)
            if (!Array.isArray(values[element.name])) {
              values[element.name] = new Array(values[element.name]);
            }
            if (element.checked) {
              values[element.name].push(element.value);
            }
          }
          break;
        default:
          values[element.name] = element.value;
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
