/// <reference types="cypress" />
export type ExecutableFunction = (params: any) => Cypress.Chainable<any>;

export type StringOrArray = string | string[];

export interface NameValue {
  name: string;
  value: string;
}

export interface CypressQueriesParams {
  findInFrame: boolean;
  mainSelector?: string;
  pathPrefix: string;
  iframeBody?: Cypress.Chainable<unknown>;
  hideToolbar?: () => void;
  showToolbar?: () => void;
  toggleMenu?: () => void;
  hideMenu?: () => void;
  keydown?: (key: string) => void;
}

export type TestCase = () => void;

export interface ElementOptions {
  selector?: string
  elementIndex?: number;
}

export interface DefaultOptions extends ElementOptions {
  findInBody?: boolean;
}

export interface ExecuteOptions extends DefaultOptions {
  classNames?: StringOrArray | null;
  selectors?: StringOrArray | null;
  elementNumber?: number;
}

export interface ChildOptions {
  childSelector?: string;
  childElementIndex?: number
}

export interface TimerOptions {
  wait?: { before?: number; after?: number; };
  timeout?: number;
}

export interface FindOptions extends DefaultOptions, ChildOptions, TimerOptions {
  container?: Cypress.Chainable<any>;
  skipElementIndex?: boolean;
}

export interface FindInputOptions extends FindOptions, ExecuteOptions { }

export interface KeyPressOptions {
  enter?: boolean;
  downarrow?: boolean;
  uparrow?: boolean;
  esc?: boolean;
  selectall?: boolean;
  backspace?: boolean;
}

export interface TypeOptions extends DefaultOptions, ChildOptions {
  text?: string;
  keyPress?: KeyPressOptions;
  parseSpecialCharSequences?: boolean;
  delay?: number;
  force?: boolean;
}

export interface TypeInputOptions extends TypeOptions, ExecuteOptions { }

export interface ClickOptions extends DefaultOptions, ChildOptions, TimerOptions {
  force?: boolean
}

export interface ClickInputOptions extends ClickOptions, ExecuteOptions { }

export interface ExistOptions extends DefaultOptions, TimerOptions {
  exist: boolean;
}

export interface ExistInputOptions extends ExistOptions, ExecuteOptions { }

export interface HaveClassOptions extends FindOptions {
  className: string;
  have: boolean;
}

export interface HaveClassInputOptions extends HaveClassOptions, ExecuteOptions { }

export interface HaveChildOptions extends FindOptions {
  have: boolean;
  childClassNames?: StringOrArray;
  childSelectors?: StringOrArray;
  childElementNumber?: number;
}

export interface HaveChildInputOptions extends HaveChildOptions, ExecuteOptions { }

export interface HaveLengthOptions extends FindOptions {
  have?: boolean;
  expectedLength: number;
}

export interface HaveLengthInputOptions extends HaveLengthOptions, ExecuteOptions { }

export interface GetStyleOptions extends FindOptions {
  styleName: string;
}

export interface GetStyleInputOptions extends GetStyleOptions, ExecuteOptions { }

export interface CompareOptions {
  equal?: boolean;
  graterThan?: boolean;
  contain?: boolean;
}

export interface StyleCompareOptions extends GetStyleOptions, CompareOptions {
  expectedValue: number;
}

export interface StyleCompareInputOptions extends StyleCompareOptions, ExecuteOptions { }

export interface DisabledOptions extends FindOptions {
  disabled?: boolean;
}

export interface DisabledInputOptions extends DisabledOptions, ExecuteOptions { }

export interface PropertyOptions extends FindOptions {
  text?: boolean;
  value?: boolean;
}

export interface PropertyInputOptions extends PropertyOptions, ExecuteOptions { }

export interface PropertyIsOptions extends PropertyOptions {
  is?: boolean;
  expectedValue: string;
}
export interface PropertyIsInputOptions extends PropertyIsOptions, ExecuteOptions { }

export interface ContainOptions extends FindOptions, PropertyOptions {
  expectedValue: string;
  contain?: boolean;
}

export interface ContainInputOptions extends ContainOptions, ExecuteOptions { }


export interface ScrollableOptions extends FindOptions {
  isScrollable?: boolean;
}

export interface ScrollableInputOptions extends ScrollableOptions, ExecuteOptions { }

export interface TriggerOptions extends FindOptions {
  triggerName: string;
}

export interface TriggerInputOptions extends TriggerOptions, ExecuteOptions { }

export type QueryAction<T> = (options: T) => Cypress.Chainable<any>;
export type RunTestCaseAction = (input?: number | number[]) => void;

export interface BuilderActions {
  visit: (pathPostfix?: string, options?: Cypress.VisitOptions) => void;
  testCases: {
    run: RunTestCaseAction
    add: (testCases: TestCase[]) => RunTestCaseAction;
  },
  find: QueryAction<FindInputOptions>;
  type: QueryAction<TypeInputOptions>;
  clear: QueryAction<ExecuteOptions>;
  click: QueryAction<ClickInputOptions>;
  exist: QueryAction<ExistInputOptions>;
  disabled: QueryAction<DisabledInputOptions>;
  contain: QueryAction<ContainInputOptions>;
  scrollable: QueryAction<ScrollableInputOptions>;
  trigger: QueryAction<TriggerInputOptions>;
  have: {
    class: QueryAction<HaveClassInputOptions>;
    child: QueryAction<HaveChildInputOptions>;
    length: QueryAction<HaveLengthInputOptions>;
  },
  style: {
    get: QueryAction<GetStyleInputOptions>;
    compare: QueryAction<StyleCompareInputOptions>;
  },
  property: {
    get: QueryAction<PropertyInputOptions>;
    is: QueryAction<PropertyIsInputOptions>;
  }

  help: {
    classSelector: (className: string) => string;
    getSelectors: (selectors: StringOrArray) => string;
    getClassNamesSelector: (selectors: StringOrArray) => string;
    getAttributesSelector: (selectors: NameValue[] | NameValue) => string;
    getElementIndex: (elementNumber?: number) => number;
  },

  wrap: {
    toggleMenu: () => void,
    hideToolbar: () => void,
    showToolbar: () => void
  }
}
