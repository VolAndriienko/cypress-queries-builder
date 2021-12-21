/// <reference types="cypress" />

// this need in order to skip importing as a module
import '@angular/compiler';
import * as t from './cypress-queries-builder.types';

//#region help
const cypressSelectAllTextQuery = '{selectall}';

const classSelector = (className: string): string => `.${className}`;

const attributeSelector = ({ name, value }: t.NameValue): string => `[${name}=${value}]`;

const getAttributesSelector = (input: t.NameValue[] | t.NameValue): string => Array.isArray(input)
  ? input.map(data => attributeSelector(data)).join('') : attributeSelector(input);

const getClassNamesSelector = (classNames: t.StringOrArray): string => Array.isArray(classNames) ?
  classNames.map(className => classSelector(className)).join(' ') : classSelector(classNames);

const getElementIndex = (elementNumber?: number): number => elementNumber !== undefined && Number.isInteger(elementNumber) ? elementNumber - 1 : 0;

const getSelectors = (selectors: t.StringOrArray): string => Array.isArray(selectors) ? selectors.join(' ') : selectors;

const stringValue = (value?: string) => value || '';

const specialChars = {
  enter: (is?: boolean) => is ? '{enter}' : '',
  uparrow: (is?: boolean) => is ? '{uparrow}' : '',
  downarrow: (is?: boolean) => is ? '{downarrow}' : '',
  esc: (is?: boolean) => is ? '{esc}' : '',
  selectall: (is?: boolean) => is ? cypressSelectAllTextQuery : '',
  backspace: (is?: boolean) => is ? '{backspace}' : '',
};

const getSelector = ({ classNames, selectors, selector }: t.ExecuteOptions) =>
  classNames ? getClassNamesSelector(classNames) : selectors ? getSelectors(selectors) : selector;

const createSpecialCharsInput = ({ enter, downarrow, uparrow, esc, selectall, backspace }: t.KeyPressOptions) =>
  [
    specialChars.enter(enter),
    specialChars.uparrow(uparrow),
    specialChars.downarrow(downarrow),
    specialChars.esc(esc),
    specialChars.selectall(selectall),
    specialChars.backspace(backspace)
  ].join('');
//#endregion

//#region common
const existance = (exist: boolean) => exist ? 'exist' : 'not.exist';
const havingClass = (have: boolean) => have ? 'have.class' : 'not.have.class';
const isDisalbed = (disabled: boolean) => disabled ? 'be.disabled' : 'not.be.disabled';
//#endregion
const defaultSelector = 'body';

function build(cy: Cypress.cy, inputParams?: Partial<t.CypressQueriesParams>): t.BuilderActions {
    const params: Partial<t.CypressQueriesParams> = {
        findInFrame: false,
        pathPrefix: '',
        ...inputParams
    };

  //#region storybook
  const mainSelector = () => params.mainSelector || defaultSelector

  const getIframeBody = () => params.iframeBody ||
    cy.get('#storybook-preview-iframe').its('0.contentDocument').should('exist')
      .its('body').should('not.be.undefined').then(cy.wrap);


  const keydown = params.keydown || ((key: string) => cy.get(defaultSelector).trigger('keydown', { key }));
  const toggleMenu = params.toggleMenu || (() => keydown('s'));

  const hideToolbar = params.hideToolbar || (() => cy.get('#storybook-panel-root').then($panel => {
    if ($panel && $panel.length && $panel[0].parentElement) {
      const container = $panel[0].parentElement.previousSibling as HTMLElement;
      container.style.height = '100%';
    }
  }));

  const showToolbar = params.showToolbar || (() => cy.get('#storybook-panel-root').then($panel => {
    if ($panel && $panel.length && $panel[0].parentElement) {
      const container = $panel[0].parentElement.previousSibling as HTMLElement;
      container.style.height = '50%';
    }
  }));

  const hideMenu = params.hideMenu || (() => cy.get(defaultSelector).then((body) => {
    if (body[0].querySelector('.sidebar-container')) {
      toggleMenu();
    }
    hideToolbar();
  }));
  //#endregion storybook

  //#region common
  const getQueryContainer = (findInBody?: boolean) =>
    findInBody || !params.findInFrame ? cy.get(mainSelector()) : getIframeBody();

  const visit = (pathPostfix?: string, options?: Cypress.VisitOptions) => {
    cy.visit(stringValue(params.pathPrefix) + stringValue(pathPostfix || ''), options || {}).wait(2000);
    if (params.findInFrame) {
      hideMenu();
      cy.get(defaultSelector).click();
    }
  };

  let allTestCases: t.TestCase[] = [];

  const runTestCases = (input?: number | number[]) => {
    const runTestCases: number[] = input && Number.isInteger(input) ?
      [+input] :
      Array.isArray(input) && input.length ?
        input :
        [];

    if (runTestCases.length) {
      runTestCases.forEach(testCaseNumber =>
        testCaseNumber < allTestCases.length ? allTestCases[testCaseNumber]() : void (0));
    } else {
      allTestCases.forEach(testCase => testCase());
    }
  };

  const addTestCases = (testCases: t.TestCase[]) => {
    allTestCases = [
      () => 'I am here for starting running test cases from 1st number (I am zero case)',
      ...testCases
    ];
    return runTestCases;
  };

  function execute<T extends t.ExecuteOptions>(options: T, selectFunction: t.ExecutableFunction) {
    options.selector = options.selector || getSelector(options);
    options.elementIndex = options.elementIndex !== undefined ? options.elementIndex : getElementIndex(options.elementNumber);
    return selectFunction(options || {});
  }
  //#endregion

  const findBy = (options: t.FindOptions): Cypress.Chainable<any> => {
    const {
      selector,
      container,
      elementIndex,
      findInBody,
      timeout = 4000,
      wait: { after, before } = {},
      childElementIndex,
      childSelector,
      skipElementIndex = false
    } = options;

    const isChildQuery = !!childSelector;

    let queryContainer = container || isChildQuery ?
      findBy({ findInBody, selector, elementIndex }) :
      getQueryContainer(findInBody);

    const executableSelector = isChildQuery ? childSelector : selector;
    const executableElementIndex = (isChildQuery ? childElementIndex : elementIndex) || 0;

    if (!executableSelector) {
      throw new Error('Selector is not provided');
    }

    if (before) {
      queryContainer = queryContainer.wait(before);
    }

    let result = queryContainer.find(executableSelector, { timeout });
    if (elementIndex !== undefined && !skipElementIndex) {
      result = result.eq(executableElementIndex);
    }

    if (after) {
      result = result.wait(after);
    }

    return result;
  };
  const find = (options: t.FindInputOptions) => execute(options, findBy);
  const typeBy = (options: t.TypeOptions) => {
    const { keyPress = {}, text, parseSpecialCharSequences = true, delay = 0, force = false } = options;
    const specialCharsInput = parseSpecialCharSequences ? createSpecialCharsInput(keyPress) : '';

    return find(options).
      type(cypressSelectAllTextQuery, { force }).
      type((text || '') + specialCharsInput, { parseSpecialCharSequences, delay, force });
  };
  const clearBy = (options: t.ExecuteOptions) => {
    return find(options).clear();
  };
  const clickBy = (options: t.ClickOptions) => {
    return find(options).click({ force: !!options.force });
  };
  const elementIsNotExist = (container: Cypress.Chainable<any>, selector: string, elementIndex: number) => {
    return container.then($containerArray => {
      const elementsArray = $containerArray as HTMLElement[];
      if (elementsArray && elementsArray.length) {
        expect(elementsArray[0].querySelectorAll(selector).length).to.be.below(elementIndex + 1);
      }
    });
  };
  const existBy = (options: t.ExistOptions) => {
    const { elementIndex, selector, exist, findInBody } = options;
    // special case
    if (elementIndex !== undefined && !exist && selector) {
      return elementIsNotExist(getQueryContainer(findInBody), selector, elementIndex);
    } else {
      return find(options).should(existance(exist));
    }
  };
  const haveClassBy = (options: t.HaveClassOptions,) => {
    const { have = true, className } = options;
    return find(options).should(havingClass(have), className);
  };
  const haveChildBy = (options: t.HaveChildOptions) => {
    const { childSelector, childClassNames, childSelectors, childElementIndex, childElementNumber, have = true } = options;

    const executableChildSelector = childSelector || getSelector({ classNames: childClassNames, selectors: childSelectors }) || '';
    const executableChildElementIndex = childElementIndex !== undefined ? childElementIndex : getElementIndex(childElementNumber) || 0;

    if (!executableChildSelector) {
      throw new Error('Child selector is not provided');
    }

    if (executableChildElementIndex === 0 && !have) {
      return elementIsNotExist(find(options), executableChildSelector, executableChildElementIndex);
    } else {
      return find(options).find(executableChildSelector).eq(executableChildElementIndex).should(existance(have));
    }
  };
  const haveLengthBy = (options: t.HaveLengthOptions) => {
    const { have = true, expectedLength } = options;
    return find({ ...options, skipElementIndex: true }).should(($elements: any) => {
      let result = expect($elements).to;
      if (!have) {
        result = result.not;
      }
      return result.have.length(expectedLength);
    });
  };
  const getStyleBy = (options: t.GetStyleOptions) => {
    return find(options).invoke(options.styleName);
  };
  const compareStyleBy = (options: t.StyleCompareOptions) => {
    const result = getStyleBy(options);
    const { graterThan, equal = true, expectedValue } = options;

    if (graterThan) {
      return result.
        should('be.greaterThan', expectedValue);
    }

    if (equal) {
      return result.
        should('be.lessThan', expectedValue + 1).
        should('be.at.least', expectedValue - 1);
    } else {
      return result.
        should('not.eq', expectedValue);
    }
  };
  const disabledBy = (options: t.DisabledOptions) => {
    const { disabled = true } = options;
    return find(options).should(isDisalbed(disabled));
  };
  const propertyBy = (options: t.PropertyOptions) => {
    const { text = false, value = false } = options;
    const property = text ? 'text' : value ? 'val' : '';

    if (!property) {
      throw new Error('Please select what contain option (text or value) you want to use');
    }

    return find(options).invoke(property);
  };
  const containBy = (options: t.ContainOptions) => {
    const { expectedValue, contain = true } = options;
    return propertyBy(options).
      then(actualValue => {
        if (expectedValue) {
          let result = expect(actualValue.toLowerCase()).to.be;
          if (!contain) {
            result = result.not;
          }
          return result.contain(expectedValue.toLowerCase());
        } else {
          return expect(actualValue).to.be.empty;
        }
      });
  };
  const propertyIsBy = (options: t.PropertyIsOptions) => {
    const { expectedValue, is } = options;
    return containBy({ ...options, contain: is, expectedValue });
  };
  const scrollableBy = (options: t.ScrollableOptions) => {
    const { isScrollable = true } = options;
    return find(options).then(elArray => {
      let result = expect(elArray[0].clientHeight);
      if (isScrollable) {
        result = result.not;
      }
      return result.to.be.eq(elArray[0].scrollHeight);
    });
  };
  const triggerBy = (options: t.TriggerOptions) => {
    return find(options).trigger(options.triggerName);
  };

  return {
    visit,
    testCases: {
      add: addTestCases,
      run: runTestCases
    },
    find,
    type: (options: t.TypeInputOptions) => execute(options, typeBy),
    clear: (options: t.ExecuteOptions) => execute(options, clearBy),
    click: (options: t.ClickInputOptions) => execute(options, clickBy),
    exist: (options: t.ExistInputOptions) => execute(options, existBy),
    have: {
      class: (options: t.HaveClassInputOptions) => execute(options, haveClassBy),
      child: (options: t.HaveChildInputOptions) => execute(options, haveChildBy),
      length: (options: t.HaveLengthInputOptions) => execute(options, haveLengthBy)
    },
    style: {
      get: (options: t.GetStyleInputOptions) => execute(options, getStyleBy),
      compare: (options: t.StyleCompareInputOptions) => execute(options, compareStyleBy)
    },
    disabled: (options: t.DisabledInputOptions) => execute(options, disabledBy),
    property: {
      get: (options: t.PropertyInputOptions) => execute(options, propertyBy),
      is: (options: t.PropertyIsInputOptions) => execute(options, propertyIsBy)
    },
    contain: (options: t.ContainInputOptions) => execute(options, containBy),
    scrollable: (options: t.ScrollableInputOptions) => execute(options, scrollableBy),
    trigger: (options: t.TriggerInputOptions) => execute(options, triggerBy),

    help: {
      classSelector,
      getSelectors,
      getClassNamesSelector,
      getAttributesSelector,
      getElementIndex
    },
    wrap: {
      toggleMenu,
      hideToolbar,
      showToolbar
    }
  };
}

export {
  build
};
