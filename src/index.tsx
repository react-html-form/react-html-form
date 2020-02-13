import PropTypes from "prop-types";
import React, { ChangeEvent, FocusEvent, FormEvent } from "react";
import isEqual from "react-fast-compare";

type FormProps = React.PropsWithChildren<{
  domValidation: boolean;
  validateOnBlur: Dictionary<(v: string) => Promise<string>>;
  validateOnChange: Dictionary<(v: string) => Promise<string>>;

  onBlur: FocusEventHandler;
  onChange: ChangeEventHandler;
  onFocus: FocusEventHandler;
  onReset: FormEventHandler;
  onSubmit: FormEventHandler;

  onData: DataEventHandler;
  onChangeWithData: ChangeEventHandlerWithData;
  onResetWithData: FormEventHandlerWithData;
  onSubmitWithData: FormEventHandlerWithData;
}>;

type FormState = FormData;

class Form extends React.PureComponent<FormProps, FormState> {
  form: HTMLFormElement = null;

  isValidating = false;
  submitCount = 0;

  values: Dictionary<string> = {};
  blurred: Dictionary<boolean> = {};
  dirty: Dictionary<boolean> = {};
  touched: Dictionary<boolean> = {};

  state = {
    values: {},
    errors: {},
    blurred: {},
    dirty: {},
    touched: {},
    isValidating: false,
    isDirty: false,
    isValid: false,
    submitCount: 0
  };

  static propTypes = {
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

  static defaultProps = {
    domValidation: false,
    onBlur: () => {},
    onChange: () => {},
    onData: () => {},
    onFocus: () => {},
    onReset: () => {},
    onSubmit: () => {},
    onChangeWithData: () => {},
    onResetWithData: () => {},
    onSubmitWithData: () => {},
    validateOnBlur: {},
    validateOnChange: {}
  };

  componentDidMount() {
    const formState = this.getFormState();
    this.values = formState.values;
    this.props.onData(formState, this.form);
  }

  getFormState = ({
    resetting,
    submitting
  }: { resetting?: boolean; submitting?: boolean } = {}): FormState => {
    const values: Dictionary<any> = {};
    const errors: Dictionary<string> = {};

    // Iterate in reverse order so we can focus the first element with an error
    for (let i = this.form.elements.length - 1; i >= 0; i -= 1) {
      // Using any because form.elements is typed as an array-like collection of Element
      // but in reality there's a predefined set of possibile element types
      // https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/elements#Value
      const element: any = this.form.elements[i];

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
          values[element.name] = element.valueAsDate;
        }
        if (element.hasAttribute("data-valueasbool")) {
          values[element.name] = (value => {
            if (typeof value === "string") {
              value = value.trim();
              return value === "false" ||
                value === "" ||
                value === "0" ||
                value === "undefined" ||
                value === "null"
                ? false
                : true;
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
      if ("function" === typeof this.props.validateOnChange[element.name]) {
        const validate = this.props.validateOnChange[element.name];

        const errorMessage = validate(values[element.name]);
        if (errorMessage instanceof Promise) {
          /**@FIXME
           * there needs to be a system for handling async loading
           * some type of pub-sub? */
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
      blurred: this.blurred,
      isValidating: this.isValidating,
      isDirty,
      isValid:
        Object.keys(errors).length === 0 && errors.constructor === Object,
      submitCount: this.submitCount
    };
  };

  handleBlur: FocusEventHandler = async event => {
    event.persist();
    this.props.onBlur(event);

    const target: any = event.target;

    // Let the user know what’s been blurred
    if (target.name) {
      this.blurred[target.name] = true;
      this.props.onData({ blurred: this.blurred }, this.form);
    }

    // Perfom custom validation
    const errors: Dictionary<string> = {};
    this.isValidating = true;
    this.props.onData(
      {
        isValidating: this.isValidating
      },
      this.form
    );
    if ("function" === typeof this.props.validateOnBlur[target.name]) {
      const validate = this.props.validateOnBlur[target.name];
      const errorMessage = validate(target.value);

      if (errorMessage instanceof Promise) {
        /**@FIXME
         * there needs to be a system for handling async loading
         * some type of pub-sub? */
      } else if (errorMessage) {
        target.setCustomValidity(errorMessage);
        errors[target.name] = errorMessage;
        this.props.onData({ errors }, this.form);
      } else {
        target.setCustomValidity("");
        errors[target.name] = undefined;
        this.props.onData({ errors }, this.form);
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

  handleChange: ChangeEventHandler = event => {
    const target: HTMLFormControl = event.target as any;
    const formState = this.getFormState();
    if (target.name) {
      this.dirty[target.name] = true;
    }

    this.props.onChange(event);
    this.props.onData(formState, this.form);
    this.props.onChangeWithData(event, formState, this.form);
  };

  handleFocus: FocusEventHandler = event => {
    // Only thing focusable on a form is a FormControl
    const target: HTMLFormControl = event.target as any;
    if (target.name) {
      this.touched[target.name] = true;
    }

    this.props.onFocus(event);
    this.props.onData({ touched: this.touched }, this.form);
  };

  handleReset: FormEventHandler = event => {
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

  handleSubmit: FormEventHandler = event => {
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

type NamedFields = { [name: string]: HTMLFormControl };
type FormFields<Fields extends NamedFields, Type> = {
  [name in keyof Fields]: Type;
};

interface FormData<Elements extends NamedFields = {}> {
  values: Elements;
  errors: FormFields<Elements, string>;
  dirty: FormFields<Elements, boolean>;
  touched: FormFields<Elements, boolean>;
  blurred: FormFields<Elements, boolean>; // Do we need this one?

  isDirty: boolean;
  isValid: boolean;
  isValidating: boolean;

  submitCount: number;
}

type FocusEventHandler = (event: FocusEvent<HTMLFormElement>) => void;
type ChangeEventHandler = (event: ChangeEvent<HTMLFormElement>) => void;
type FormEventHandler = (event: FormEvent<HTMLFormElement>) => void;
type DataEventHandler = (
  data: Partial<FormData>,
  form: HTMLFormElement
) => void;
type ChangeEventHandlerWithData = (
  event: ChangeEvent<HTMLFormElement>,
  data: FormData,
  form: HTMLFormElement
) => void;
type FormEventHandlerWithData = (
  event: FormEvent<HTMLFormElement>,
  data: FormData,
  form: HTMLFormElement
) => void;
