import PropTypes from "prop-types";
import React from "react";
import isEqual from "react-fast-compare";

class Form extends React.PureComponent {
  constructor(props) {
    super(props);

    this.submitCount = 0;
    this.touched = {};

    this.getFormState = this.getFormState.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    const formState = this.getFormState();
    this.values = formState.values;
    this.props.onData(formState, this.form);
  }

  getFormState() {
    const values = {};
    const errors = {};

    for (let i = 0; i < this.form.elements.length; i += 1) {
      const element = this.form.elements[i];

      // Save the error message
      if (element.validationMessage.length > 0) {
        errors[element.name] = element.validationMessage;
      }

      // Save the value
      if (element.name) {
        // Placeholders for select-multiple
        const elementOptions = element.options;
        const elementValues = [];

        switch (element.type) {
          case "file":
            values[element.name] = {
              value: element.value,
              files: element.files
            };
            break;
          case "checkbox":
            if (!values[element.name]) {
              if (element.checked) {
                values[element.name] =
                  element.value === "on" ? true : element.value;
              } else if (element.indeterminate) {
                values[element.name] = undefined;
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
          case "radio":
            if (element.checked) {
              values[element.name] = element.value;
            } else if (element.indeterminate) {
              values[element.name] = undefined;
            }
            break;
          case "select-multiple":
            for (let j = 0; j < elementOptions.length; j += 1) {
              if (elementOptions[j].selected) {
                elementValues.push(elementOptions[j].value);
              }
            }
            values[element.name] = elementValues;
            if (element.validationMessage.length > 0) {
              errors[element.name] = element.validationMessage;
            }
            break;
          default:
            values[element.name] = element.value;
        }

        // Override our value in case the user has supplied `data-valueasdate` or 'data-valueasnumber` attribute
        // Important, valueAsNumber should always override valueAsDate
        // see https://www.w3.org/TR/2011/WD-html5-20110405/common-input-element-attributes.html
        if (element.hasAttribute("data-valueasdate")) {
          values[element.name] = element.valueAsDate;
        }
        if (element.hasAttribute("data-valueasnumber")) {
          values[element.name] = element.valueAsNumber;
        }
      }
    }

    return {
      values,
      errors,
      touched: this.touched,
      isDirty: !isEqual(values, this.values),
      isValid: this.form.checkValidity(),
      submitCount: this.submitCount
    };
  }

  handleChange(event) {
    const formState = this.getFormState();
    this.touched[event.target.name] = true;

    this.props.onChange(event);
    this.props.onData(formState, this.form);
    this.props.onChangeWithData(event, formState, this.form);
  }

  handleReset(event) {
    // Wrap in setTimeout(0) to wait for internal .reset to finish
    setTimeout(() => {
      this.submitCount = 0;
      this.touched = {};
      const formState = this.getFormState();

      this.props.onReset(event);
      this.props.onData(formState, this.form);
      this.props.onResetWithData(event, formState, this.form);
    }, 0);
  }

  handleSubmit(event) {
    this.submitCount += 1;
    const formState = this.getFormState();

    this.props.onSubmit(event);
    this.props.onData(formState, this.form);
    if (typeof this.props.onSubmitWithData === "function") {
      event.preventDefault();
      this.props.onSubmitWithData(event, formState, this.form);
    }
  }

  render() {
    const {
      onData,
      onChangeWithData,
      onResetWithData,
      onSubmitWithData,
      ...rest
    } = this.props;
    return (
      <form
        {...rest}
        noValidate={!this.props.domValidation}
        onChange={this.handleChange}
        onReset={this.handleReset}
        onSubmit={this.handleSubmit}
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
  onChange: () => {},
  onChangeWithData: () => {},
  onReset: () => {},
  onResetWithData: () => {},
  onSubmit: () => {},
  onSubmitWithData: () => {}
};

Form.propTypes = {
  onChange: PropTypes.func,
  onChangeWithData: PropTypes.func,
  onReset: PropTypes.func,
  onResetWithData: PropTypes.func,
  onSubmit: PropTypes.func,
  onSubmitWithData: PropTypes.func
};

export default Form;
