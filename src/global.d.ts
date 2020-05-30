import "";

/** @note
 * We need to override HTMLFormControlsCollection because it does not treat
 * HTMLFormElement.elements as if they were a limited set */
declare global {
  interface HTMLFormControlsCollection extends HTMLCollectionBase {
    readonly length: number;

    namedItem(name: string): HTMLFormControl | null;

    item(index: number): HTMLFormControl;

    [index: number]: HTMLFormControl;
  }

  type HTMLFormControl = { name?: Attr["name"] } & (
    | HTMLButtonElement
    | HTMLFieldSetElement
    | HTMLInputElement
    | HTMLObjectElement
    | HTMLSelectElement
    | HTMLTextAreaElement
  );
}
