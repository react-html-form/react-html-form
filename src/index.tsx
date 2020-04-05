import PropTypes from "prop-types";
import React, { FocusEvent, FormEvent } from "react";
import isEqual from "react-fast-compare";

type FieldValue =
  | boolean
  | number
  | Date
  | string
  | string[]
  | { value: string; files: string[] };

type Dictionary<T> = Record<string, T>;

type FormProps = {
  onBlur: (event: FocusEvent) => void;
  onChange: (event: FormEvent) => void;
  onChangeWithData: (
    event: FormEvent,
    formState: any,
    form: HTMLFormElement
  ) => void;
  onData: (formState: any, form: HTMLFormElement) => void;
  onFocus: (event: FocusEvent) => void;
  onReset: (event: FormEvent) => void;
  onResetWithData: (
    event: FormEvent,
    formState: any,
    form: HTMLFormElement
  ) => void;
  onSubmit: (event: FormEvent) => void;
  onSubmitWithData: (
    event: FormEvent,
    formState: any,
    form: HTMLFormElement
  ) => void;
} & {
  domValidation: boolean;
  validateOnBlur: {
    [name: string]: (value: FieldValue) => string | Promise<string>;
  };
  validateOnChange: {
    [name: string]: (value: FieldValue) => string | Promise<string>;
  };
};

class Form extends React.PureComponent<FormProps> {
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

  submitCount = 0;
  values: Dictionary<FieldValue> = {};
  blurred: Dictionary<boolean> = {};
  dirty: Dictionary<boolean> = {};
  touched: Dictionary<boolean> = {};
  isValidating = false;
  form: HTMLFormElement;

  componentDidMount() {
    const formState = this.getFormState();
    this.values = formState.values;
    this.props.onData(formState, this.form);
  }

  getFormState = ({
    resetting,
    submitting
  }: { resetting?: boolean; submitting?: boolean } = {}) => {
    const values: Dictionary<FieldValue> = {};
    const errors: Dictionary<string> = {};

    // Iterate in reverse order so we can focus the first element with an error
    for (let i = this.form.elements.length - 1; i >= 0; i -= 1) {
      const element = this.form.elements[i];

      // button's don't have values we can use
      if (element instanceof HTMLButtonElement) continue;

      // element's without name's cannot be stored
      if (!element.name) continue;

      // Reset to a blank state
      element.setCustomValidity("");

      // Piggy back off this for-loop when calling onReset
      if (resetting) {
        // Set the value to the original value when the component was mounted
        if (this.values[element.name]) {
          /** @fixme this should be behind a guard for HTMLInputElement */
          (element as HTMLInputElement).defaultValue = this.values[
            element.name
          ] as string;
          element.checkValidity(); // recheck the validity, order here is important
        }

        // If the input wasn't there when we rendered the component
        // we remove it from the values object
        if (!Object.prototype.hasOwnProperty.call(this.values, element.name)) {
          delete values[element.name];
        }
      }

      switch (element.type) {
        case "file":
          values[element.name] = {
            value: (element as HTMLInputElement).value,
            files: [].concat((element as HTMLInputElement).files)
          };
          break;
        case "checkbox":
          if (!values[element.name]) {
            if ((element as HTMLInputElement).checked) {
              values[element.name] =
                (element as HTMLInputElement).value === "on"
                  ? true
                  : (element as HTMLInputElement).value;
            } else if ((element as HTMLInputElement).indeterminate) {
              values[element.name] = undefined;
            } else {
              values[element.name] = false;
            }
          } else {
            // Convert to an array of values since we're probably in a fieldset
            // (Or at least, the user has declared multiple checkboxes with the same name)
            if (!Array.isArray(values[element.name])) {
              values[element.name] = [].concat(
                values[element.name] as string[]
              );
            }

            if ((element as HTMLInputElement).checked) {
              (values[element.name] as string[]).push(
                (element as HTMLInputElement).value
              );
            }
          }
          break;
        case "radio":
          if ((element as HTMLInputElement).checked) {
            values[element.name] = (element as HTMLInputElement).value;
          } else if ((element as HTMLInputElement).indeterminate) {
            values[element.name] = undefined;
          }
          break;
        case "select-multiple":
          // Placeholders for select-multiple
          const elementOptions = (element as HTMLSelectElement).options;
          const elementValues = [];
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
          values[element.name] = (element as any).value;
      }

      // Override our value in case the user has supplied `data-valueasdate` or 'data-valueasnumber` attribute
      // Important, valueAsNumber should always override valueAsDate
      // see https://www.w3.org/TR/2011/WD-html5-20110405/common-input-element-attributes.html
      if (
        element instanceof HTMLInputElement &&
        element.hasAttribute("data-valueasdate")
      ) {
        if ("valueAsDate" in element) {
          values[element.name] = element.valueAsDate;
        } else {
          values[element.name] = new Date(element.value);
        }
      }

      if (
        element instanceof HTMLInputElement &&
        element.hasAttribute("data-valueasbool")
      ) {
        values[element.name] = (value => {
          /** @fixme I don't think it's possible to have a non-string value */
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
      if (
        element instanceof HTMLInputElement &&
        element.hasAttribute("data-valueasnumber")
      ) {
        values[element.name] = element.valueAsNumber;
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
        if (errorMessage instanceof Promise) {
          if (this.props.domValidation) {
            errorMessage.then(message => {
              element.setCustomValidity(message);
              errors[element.name] = message;
            });
          } else if (submitting) {
            errorMessage.then(message => {
              element.focus();
              errors[element.name] = message;
            });
          }
        } else if (errorMessage) {
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
  };

  handleBlur = async (event: FocusEvent) => {
    const target = event.target as HTMLFormControl;
    if (!("name" in target)) return;

    this.props.onBlur(event);

    // Let the user know what’s been blurred
    if (target.name) {
      this.blurred[target.name] = true;
      this.props.onData({ blurred: this.blurred }, this.form);
    }

    // Perfom custom validation
    this.isValidating = true;
    this.props.onData({ isValidating: this.isValidating }, this.form);

    if (this.props.validateOnBlur[target.name]) {
      event.persist();
      const errorMessage = this.props.validateOnBlur[target.name](
        (target as HTMLInputElement).value
      );

      if (errorMessage instanceof Promise) {
        errorMessage.then(message => {
          const errors: Dictionary<string> = {};
          target.setCustomValidity(message);
          errors[target.name] = message;
          this.props.onData({ errors }, this.form);
        });
      } else if (errorMessage) {
        const errors: Dictionary<string> = {};
        target.setCustomValidity(errorMessage);
        errors[target.name] = errorMessage;
        this.props.onData({ errors }, this.form);
      } else {
        target.setCustomValidity("");
        this.props.onData({ errors: {} }, this.form);
      }
    }
    this.isValidating = false;
    this.props.onData(
      {
        isValidating: this.isValidating
      },
      this.form
    );
  };

  handleChange = (event: FormEvent) => {
    const target = event.target as HTMLFormControl;
    if (!("name" in target)) return;

    const formState = this.getFormState();

    this.dirty[target.name] = true;

    this.props.onChange(event);
    this.props.onData(formState, this.form);
    this.props.onChangeWithData(event, formState, this.form);
  };

  handleFocus = (event: FocusEvent) => {
    const target = event.target as HTMLFormControl;
    if (!("name" in target)) return;

    this.touched[target.name] = true;

    this.props.onFocus(event);
    this.props.onData({ touched: this.touched }, this.form);
  };

  handleReset = (event: FormEvent) => {
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
  };

  handleSubmit = (event: FormEvent) => {
    this.submitCount += 1;
    const formState = this.getFormState({ submitting: true });

    this.props.onSubmit(event);
    this.props.onData(formState, this.form);
    if (typeof this.props.onSubmitWithData === "function") {
      event.preventDefault();
      this.props.onSubmitWithData(event, formState, this.form);
    }
  };

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
  isValid: false,
  isValidating: false,
  submitCount: 0
};
