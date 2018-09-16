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
      // Check for the name since not all elements have values (like <fieldset />)
      if (this.form.elements[i].name) {
        values[this.form.elements[i].name] = this.form.elements[i].value;
        if (this.form.elements[i].validationMessage.length > 0) {
          errors[this.form.elements[i].name] = this.form.elements[
            i
          ].validationMessage;
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
