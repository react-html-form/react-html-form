import React from "react";

class Form extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const values = {};
    const errors = {};

    for (let i = 0; i < this.form.elements.length; i += 1) {
      values[this.form.elements[i].name] = this.form.elements[i].value;
      if (this.form.elements[i].validationMessage.length > 0) {
        errors[this.form.elements[i].name] = this.form.elements[
          i
        ].validationMessage;
      }
    }

    const hasErrors =
      Object.keys(errors).length !== 0 && errors.constructor === Object;

    this.props.onChange(event, { values, errors, hasErrors });
  }

  render() {
    return (
      <form
        {...this.props}
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

export default Form;
