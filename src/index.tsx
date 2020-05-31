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

type Validator = (value: FieldValue) => string | Promise<string>;

type Dictionary<T> = Record<string, T>;

type Data = {
  values: Dictionary<FieldValue>;
  errors: Dictionary<string>;
  blurred: Dictionary<boolean>;
  touched: Dictionary<boolean>;
  dirty: Dictionary<boolean>;
  isValidating: boolean;
  isDirty: boolean;
  isValid: boolean;
  submitCount: number;
};

type FormProps = {
  onBlur: (event: FocusEvent) => void;
  onChange: (event: FormEvent) => void;
  onChangeWithData: (
    event: FormEvent,
    formState: any,
    form: HTMLFormElement
  ) => void;
  onData: (formState: Data, form: HTMLFormElement) => void;
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
  validateOnBlur: Dictionary<undefined | Validator>;
  validateOnChange: Dictionary<undefined | Validator>;
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

  private form: HTMLFormElement = null;
  private values: Data["values"] = {};
  private errors: Data["errors"] = {};
  private blurred: Data["blurred"] = {};
  private touched: Data["touched"] = {};
  private dirty: Data["dirty"] = {};
  private isValidating: Data["isValidating"] = false;
  private isDirty: Data["isDirty"] = false;
  private isValid: Data["isValid"] = true;
  private submitCount: Data["submitCount"] = 0;

  componentDidMount() {
    const formState = this.getFormState();
    this.values = formState.values;
    this.props.onData(formState, this.form);
  }

  getFormState = ({
    resetting,
    submitting
  }: { resetting?: boolean; submitting?: boolean } = {}): Data => {
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
          delete this.values[element.name];
        }
      }

      switch (element.type) {
        case "file":
          this.values[element.name] = {
            value: (element as HTMLInputElement).value,
            files: [].concat((element as HTMLInputElement).files)
          };
          break;
        case "checkbox":
          if (!this.values[element.name]) {
            if ((element as HTMLInputElement).checked) {
              this.values[element.name] =
                (element as HTMLInputElement).value === "on"
                  ? true
                  : (element as HTMLInputElement).value;
            } else if ((element as HTMLInputElement).indeterminate) {
              this.values[element.name] = undefined;
            } else {
              this.values[element.name] = false;
            }
          } else {
            // Convert to an array of values since we're probably in a fieldset
            // (Or at least, the user has declared multiple checkboxes with the same name)
            if (!Array.isArray(this.values[element.name])) {
              this.values[element.name] = [].concat(
                this.values[element.name] as string[]
              );
            }

            if ((element as HTMLInputElement).checked) {
              (this.values[element.name] as string[]).push(
                (element as HTMLInputElement).value
              );
            }
          }
          break;
        case "radio":
          if ((element as HTMLInputElement).checked) {
            this.values[element.name] = (element as HTMLInputElement).value;
          } else if ((element as HTMLInputElement).indeterminate) {
            this.values[element.name] = undefined;
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
          this.values[element.name] = elementValues;
          if (element.validationMessage.length > 0) {
            this.errors[element.name] = element.validationMessage;
          }
          break;
        default:
          this.values[element.name] = (element as any).value;
      }

      // Override our value in case the user has supplied `data-valueasdate` or 'data-valueasnumber` attribute
      // Important, valueAsNumber should always override valueAsDate
      // see https://www.w3.org/TR/2011/WD-html5-20110405/common-input-element-attributes.html
      if (
        element instanceof HTMLInputElement &&
        element.hasAttribute("data-valueasdate")
      ) {
        if ("valueAsDate" in element) {
          this.values[element.name] = element.valueAsDate;
        } else {
          this.values[element.name] = new Date(element.value);
        }
      }

      if (
        element instanceof HTMLInputElement &&
        element.hasAttribute("data-valueasbool")
      ) {
        this.values[element.name] = (value => {
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

      /** @fixme
       * @test @todo to ensure new elements don't sneak in
       * @see __tests__/compatibility/sneaky-field.js
       */
      if (
        element instanceof HTMLInputElement &&
        element.hasAttribute("data-valueasnumber")
      ) {
        this.values[element.name] = element.valueAsNumber;
      }

      // Save the error message
      // Important error checking comes after setting the defaultValue above when resetting
      if (element.validationMessage.length > 0) {
        if (!this.props.domValidation && submitting) {
          element.focus();
        }
        this.errors[element.name] = element.validationMessage;
        if (element.hasAttribute("data-errormessage")) {
          this.errors[element.name] = element.getAttribute("data-errormessage");
          if (this.props.domValidation) {
            element.setCustomValidity(this.errors[element.name]);
          }
        }
      }

      // Perform any custom validation
      if (this.props.validateOnChange[element.name]) {
        const errorMessage = this.props.validateOnChange[element.name](
          this.values[element.name]
        );
        if (errorMessage instanceof Promise) {
          if (this.props.domValidation) {
            errorMessage.then(message => {
              element.setCustomValidity(message);
              this.errors[element.name] = message;
            });
          } else if (submitting) {
            errorMessage.then(message => {
              element.focus();
              this.errors[element.name] = message;
            });
          }
        } else if (errorMessage) {
          if (this.props.domValidation) {
            element.setCustomValidity(errorMessage);
          } else if (submitting) {
            element.focus();
          }
          this.errors[element.name] = errorMessage;
        } else {
          element.setCustomValidity("");
        }
      }
    }

    let isDirty;
    if (!this.values) {
      isDirty = false; // not dirty on first load
    } else {
      isDirty = resetting ? false : !isEqual(this.values, this.values);
    }

    return {
      values: this.values,
      errors: this.errors,
      blurred: this.blurred,
      dirty: this.dirty,
      touched: this.touched,
      isValidating: this.isValidating,
      isDirty,
      isValid:
        Object.keys(this.errors).length === 0 &&
        this.errors.constructor === Object,
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
      this.props.onData(this.getFormState(), this.form);
    }

    if (this.props.validateOnBlur[target.name]) {
      this.isValidating = true;
      event.persist();
      const errorMessage = this.props.validateOnBlur[target.name](
        (target as HTMLInputElement).value
      );

      if (errorMessage instanceof Promise) {
        this.props.onData(this.getFormState(), this.form);
        errorMessage.then(message => {
          target.setCustomValidity(message);
          this.errors[target.name] = message;
          this.isValidating = false;
          this.props.onData(this.getFormState(), this.form);
        });
      } else if (errorMessage) {
        target.setCustomValidity(errorMessage);
        this.errors[target.name] = errorMessage;
        this.isValidating = false;
        this.props.onData(this.getFormState(), this.form);
      } else {
        target.setCustomValidity("");
        this.isValidating = false;
        this.props.onData(this.getFormState(), this.form);
      }
    }
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
    this.props.onData(this.getFormState(), this.form);
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

/**
 * @todo
 * handlers to be used on a per-input level
 *
  handleTextInput = (field: HTMLInputElement, validator?: Validator) => {};
  handleFileInput = (field: HTMLInputElement, validator?: Validator) => {
    field.setCustomValidity("");

    this.values[field.name] = {
      value: field.value,
      files: Array.from(field.files).map(file => file.name)
    };

    if (validator)
      pact(validator(field.value)).then((message: string) => {
        field.setCustomValidity(message);
      });
  };
  handleRadioInput = (field: HTMLInputElement, validator?: Validator) => {};
  handleCheckboxInput = (field: HTMLInputElement, validator?: Validator) => {};
  handleSelectMultipe = (field: HTMLInputElement, validator?: Validator) => {};
  handleUnknown = (field: HTMLInputElement, validateOnBlur?: Validator) => {};
*/
/** handles non-promises synchronously * /
function pact<T>(promising: Promise<T> | T): any {
  if (promising instanceof Promise) return promising;
  else return { then: (cb: (t: T) => any) => cb(promising) };
}
*/
