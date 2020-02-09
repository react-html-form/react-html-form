type HTMLFormControl =
  | RadioNodeList
  | HTMLButtonElement
  | HTMLFieldSetElement
  | HTMLInputElement
  | HTMLObjectElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

interface HTMLFormControlsCollection extends HTMLCollectionBase {
  readonly length: number;

  namedItem(name: string): HTMLFormControl | null;

  item(index: number): HTMLFormControl;

  [index: number]: HTMLFormControl;
}
