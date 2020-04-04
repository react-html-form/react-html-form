import PropTypes from "prop-types";
import React from "react";
import isEqual from "react-fast-compare";

class Form extends React.PureComponent {
  static defaultProps = {
    domValidation: false,
    onBlur: () => {},
    onChange: () => {},
    onChangeWithData: () => {},
    onData: () => {},
    onFocus: () => {},
    onReset: () => {},
    onResetWithData: () => {},
    onSubmit: () => {},
    onSubmitWithData: () => {},
    validateOnBlur: {},
    validateOnChange: {}
  };

  static propTypes = {
    children: PropTypes.node.isRequired,
    domValidation: PropTypes.bool,
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    onChangeWithData: PropTypes.func,
    onData: PropTypes.func,
    onFocus: PropTypes.func,
    onReset: PropTypes.func,
    onResetWithData: PropTypes.func,
    onSubmit: PropTypes.func,
    onSubmitWithData: PropTypes.func,
    validateOnBlur: PropTypes.object, // eslint-disable-line
    validateOnChange: PropTypes.object // eslint-disable-line
  };

  constructor(props) {
    super(props);

    this.submitCount = 0;
    this.blurred = {};
    this.dirty = {};
    this.touched = {};

    this.getFormState = this.getFormState.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    const formState = this.getFormState();
    this.values = formState.values;
    this.props.onData(formState, this.form);
  }

  getFormState({ resetting, submitting } = {}) {
    const values = {};
    const errors = {};

    // Iterate in reverse order so we can focus the first element with an error
    for (let i = this.form.elements.length - 1; i >= 0; i -= 1) {
      const element = this.form.elements[i];

      // Reset to a blank state
      element.setCustomValidity("");

      // Save the value
      if (element.name) {
        // Placeholders for select-multiple
        const elementOptions = element.options;
        const elementValues = [];

        // Piggy back off this for-loop when calling onReset
        if (resetting) {
          // Set the value to the original value when the component was mounted
          if (this.values[element.name]) {
            element.defaultValue = this.values[element.name];
            element.checkValidity(); // recheck the validity, order here is important
          }

          // If the input wasn't there when we rendered the component
          // we remove it from the values object
          if (
            !Object.prototype.hasOwnProperty.call(this.values, element.name)
          ) {
            delete values[element.name];
          }
        }

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
          if ("valueAsDate" in element) {
            values[element.name] = element.valueAsDate;
          } else {
            values[element.name] = new Date(element.value);
          }
        }
        if (element.hasAttribute("data-valueasbool")) {
          values[element.name] = (value => {
            // Look for string values that if executed in eval would be falsey
            if (typeof value === "string") {
              const trimmed = value.trim();
              if (
                trimmed === "false" ||
                trimmed === "" ||
                trimmed === "0" ||
                trimmed === "undefined" ||
                trimmed === "null"
              ) {
                return false;
              }
              return true;
            }

            return !!value;
          })(element.value);
        }
        if (element.hasAttribute("data-valueasnumber")) {
          values[element.name] = element.valueAsNumber;
        }
      }

      // Save the error message
      // Important error checking comes after setting the defaultValue above when resetting
      if (element.validationMessage.length > 0) {
        if (!this.props.domValidation && submitting) {
          element.focus();
        }
        errors[element.name] = element.validationMessage;
        if (element.hasAttribute("data-errormessage")) {
          errors[element.name] = element.getAttribute("data-errormessage");
          if (this.props.domValidation) {
            element.setCustomValidity(errors[element.name]);
          }
        }
      }

      // Perform any custom validation
      if (this.props.validateOnChange[element.name]) {
        const errorMessage = this.props.validateOnChange[element.name](
          values[element.name]
        );
        if (errorMessage) {
          if (this.props.domValidation) {
            element.setCustomValidity(errorMessage);
          } else if (submitting) {
            element.focus();
          }
          errors[element.name] = errorMessage;
        } else {
          element.setCustomValidity("");
        }
      }
    }

    let isDirty;
    if (!this.values) {
      isDirty = false; // not dirty on first load
    } else {
      isDirty = resetting ? false : !isEqual(values, this.values);
    }

    return {
      values,
      errors,
      dirty: this.dirty,
      touched: this.touched,
      isValidating: this.isValidating,
      isDirty,
      isValid:
        Object.keys(errors).length === 0 && errors.constructor === Object,
      submitCount: this.submitCount
    };
  }

  async handleBlur(event) {
    event.persist();
    this.props.onBlur(event);

    // Let the user know what’s been blurred
    if (event.target.name) {
      this.blurred[event.target.name] = true;
      this.props.onData({ blurred: this.blurred });
    }

    // Perfom custom validation
    const errors = {};
    this.isValidating = true;
    this.props.onData({
      isValidating: this.isValidating
    });
    if (this.props.validateOnBlur[event.target.name]) {
      const errorMessage = await this.props.validateOnBlur[event.target.name](
        event.target.value
      );
      if (errorMessage) {
        event.target.setCustomValidity(errorMessage);
        errors[event.target.name] = errorMessage;
        this.props.onData({ errors });
      } else {
        event.target.setCustomValidity("");
        errors[event.target.name] = undefined;
        this.props.onData({ errors });
      }
    }
    this.isValidating = false;
    this.props.onData({
      isValidating: this.isValidating
    });
  }

  handleChange(event) {
    const formState = this.getFormState();
    if (event.target.name) {
      this.dirty[event.target.name] = true;
    }

    this.props.onChange(event);
    this.props.onData(formState, this.form);
    this.props.onChangeWithData(event, formState, this.form);
  }

  handleFocus(event) {
    if (event.target.name) {
      this.touched[event.target.name] = true;
    }

    this.props.onFocus(event);
    this.props.onData({ touched: this.touched }, this.form);
  }

  handleReset(event) {
    // Wrap in setTimeout(0) to wait for internal .reset to finish
    setTimeout(() => {
      this.submitCount = 0;
      this.blurred = {};
      this.dirty = {};
      this.touched = {};
      const formState = this.getFormState({ resetting: true });

      this.props.onReset(event);
      this.props.onData(formState, this.form);
      this.props.onResetWithData(event, formState, this.form);
    }, 0);
  }

  handleSubmit(event) {
    this.submitCount += 1;
    const formState = this.getFormState({ submitting: true });

    this.props.onSubmit(event);
    this.props.onData(formState, this.form);
    if (typeof this.props.onSubmitWithData === "function") {
      event.preventDefault();
      this.props.onSubmitWithData(event, formState, this.form);
    }
  }

  render() {
    const {
      domValidation,
      onData,
      onChangeWithData,
      onResetWithData,
      onSubmitWithData,
      validateOnBlur,
      validateOnChange,
      ...rest
    } = this.props;
    return (
      <form
        {...rest}
        noValidate={!this.props.domValidation}
        onBlur={this.handleBlur}
        onChange={this.handleChange}
        onFocus={this.handleFocus}
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

export default Form;

export const defaultFormState = {
  values: {},
  errors: {},
  dirty: {},
  touched: {},
  blurred: {},
  isDirty: false,
  isValid: undefined,
  isValidating: false,
  submitCount: 0
};
