# Cypress Queries Builder

This is library for simplifying writing queries with [Cypress](https://www.cypress.io/).

## Installation
To install with npm, run command:
```
npm i cypress-queries
```


## Initialization
The library provides the set of interfaces and the `build` function,
```
import { build } from 'cypress-queries';
```
Then, builder instance need to be initialized inside cypress context function (`cy` - Cypress instance):

```
describe('Main', () => {
    const _ = build(cy, params);
```
Here, symbol `_` is used as builder instance variable name (to have it as shorter as possible).

With second argument `params` can be passed set of options:

| Option         | Nullable | Type                         | Default Value   | Description                               |
| -------------- |----------|------------------------------|:---------------:|:-----------------------------------------:|
| `mainSelector` | Yes       | `string`                     | `body`          | Selector of main container for each query |
| `findInFrame`  | No       | `boolean`                    | `false`         | Using storybook iframe instead of main container |
| `iframeBody`   | Yes      | `Cypress.Chainable<unknown>` | -               | Using custom iframe instead of storybook |
| `pathPrefix`   | No       | `string`                     | empty string    | Default prefix for visiting pages |
| `hideToolbar`  | Yes      | `() => void`                 | -               | - |
| `toggleMenu`   | Yes      | `() => void`                 | -               | - |
| `hideMenu`     | Yes      | `() => void`                 | -               | - |
| `keydown`      | Yes      | `() => void`                 | -               | - |

The instance of cypress queries builder, allows to run next actions:


## Usage
Builder instance provides next interface


### `visit`      
Same as default Cypress visit, but with improves for storybook and 
it uses predefined `pathPrefix`, if it was used while initialization.

| Input parameters | Type                    | Is nullable | Default value |
|------------------|-------------------------|------------ |---------------|
| `pathPostfix`    | `string`                | Yes         |empty string  |
| `options`        | `Cypress.VisitOptions`  | Yes         | - |

Example:
```
 _.visit('test-route/2');
```

### `testCases`
Helps to have more flexible test cases usage, 
and provide two commands to do so - `add` and `run`:

The main flow is next: 
1. Provide the test cases wrapped with function as input for `add` command.
2. Specify the number or numbers array in the input for `run` command.

>`add` command returns `run` command, so test cases can be "runnned" inline, 
immediately, using call function braces `_.add(...testcases)([1, 2])`

Example usage, both example is doing the same:
```
_.testCases.add([
      () => it('1. Visit first route', () => _.visit('first-route'); ),
      () => it('2. Visit second route', () => _.visit('second-route'); ),
    ]);
_.testCases.run([2]); // so Cypress will execute only second test case
```
or
```
_.testCases.add([
      () => it('1. Visit first route', () => _.visit('first-route'); ),
      () => it('2. Visit second route', () => _.visit('second-route'); ),
    ])([2]) // so Cypress will execute only second test case
```

### `find`
Command returns `Cypress.Chainable` object in order to do further test cases.

Input options extends: [ExecuteOptions](#executeoptions), [FindOptions](#findoptions)

Example usage:
```
// get second element with class "link", but wait 5 seconds before it
const finded = _.find({ classNames: 'link', elementNumber: 2, wait: { before: 5000 } });
finded.click();
```

### `type`
Input options extends: 
[ExecuteOptions](#executeoptions), [DefaultOptions](#defaultoptions), [ChildOptions](#childoptions)

| Input parameters            | Type                                | Is nullable | Description |
|-----------------------------|-------------------------------------|------------ |-------------|
| `text`                      | `string`                            | Yes         | - |
| `keyPress`                  | [KeyPressOptions](#keypressoptions) | Yes         | - |
| `parseSpecialCharSequences` | `boolean`                           | Yes         | - |
| `delay`                     | `number`                            | Yes         | - |
| `force`                     | `boolean`                           | Yes         | - |

#### Example usage
```
_.type({ text: 'test', classNames: ['test-class1', 'test-class2'] });
```

### `clear`
Input options extends: 
[ExecuteOptions](#executeoptions)

#### Example usage:
```
_.clear({ classNames:  'test-class' });

```

### `click`
Command proxy for cypress .click() chain.

Input options extends: 
[ExecuteOptions](#executeoptions), [DefaultOptions](#defaultoptions), [ChildOptions](#childoptions), [TimerOptions](#timeroptions)

| Input parameters | Type      | Is nullable | Description |
|----------------- |-----------|------------ |-------------|
| `force`          | `boolean` | Yes         | - |


### `exist`

Input options extends: [ExecuteOptions](#executeoptions), [DefaultOptions](#defaultoptions), [TimerOptions](#timeroptions)


| Input parameters | Type      | Is nullable | Description |
|----------------- |-----------|------------ |-------------|
| `exist`          | `boolean` | Yes         | - |

#### Example usage
```
_.exist({ exist, classNames: c.selectedItemClass, elementNumber });
```


### `disabled`

Input options extends: [FindOptions](#findoptions)


| Input parameters | Type      | Is nullable | Description |
|----------------- |-----------|------------ |-------------|
| `disabled`          | `boolean` | Yes         | - |

#### Example usage
```
_.disabled({ disabled: true, classNames: c.selectedItemClass, elementNumber });
```


### `contain`

Input options extends: [ExecuteOptions](#executeoptions), [PropertyOptions](#propertyoptions)


| Input parameters | Type      | Is nullable | Description |
|----------------- |-----------|------------ |-------------|
| `expectedValue`  | `string`  | No          | - |
| `contain`        | `boolean` | Yes         | - |

#### Example usage
```
_.contain({ value: true, expectedValue: text, classNames: loginEmailInputClass })
_.contain({ text: true, expectedValue: text, classNames: loginEmailInputClass })
```


### `scrollable`
Input options extends: [ExecuteOptions](#executeoptions), [FindOptions](#findoptions)

| Input parameters    | Type      | Is nullable | Description |
|---------------------|-----------|------------ |-------------|
| `isScrollable`      | `boolean` | Yes         | - |

#### Example usage
```
_.scrollable({ isScrollable, classNames: classificationsScrollContainerClass });
```


### `trigger`
Input options extends: [ExecuteOptions](#executeoptions), [FindOptions](#findoptions)

| Input parameters    | Type      | Is nullable | Description |
|---------------------|-----------|------------ |-------------|
| `triggerName`       | `string`  | No          | - |

#### Example usage
```
_.trigger({ triggerName: 'mouseover', classNames: c.autocompleteInputClass });
```

### `have`
Input options extends: [ExecuteOptions](#executeoptions), [FindOptions](#findoptions)

Have has next suboptions:

#### `have.class`
| Input parameters    | Type      | Is nullable | Description |
|---------------------|-----------|------------ |-------------|
| `have`              | `boolean` | No          | - |
| `className`         | `string`  | No          | - |

##### Example usage
```
_.have.class({ className, have, classNames: 'looking-for' });
```

#### `have.child`
| Input parameters     | Type      | Is nullable | Description |
|----------------------|-----------|------------ |-------------|
| `have`               | `boolean` | No          | - |
| `childClassNames`    | `string`  | Yes         | - |
| `className`          | `string`  | Yes         | - |
| `childElementNumber` | `string`  | Yes         | - |

##### Example usage
```
_.have.child({ childClassNames: 'childe', have: true, selectors, elementNumber });
```

#### `have.length`

| Input parameters    | Type      | Is nullable | Description |
|---------------------|-----------|------------ |-------------|
| `have`              | `boolean` | Yes         | - |
| `expectedLength`    | `number`  | No          | - |

##### Example usage
```
_.have.length({ expectedLength, have: true, classNames: removeIconPath });
```


### `style`
Input options extends: [ExecuteOptions](#executeoptions), [FindOptions](#findoptions)

Have has next suboptions:

#### `style.get`
| Input parameters    | Type      | Is nullable | Description |
|---------------------|-----------|------------ |-------------|
| `styleName`         | `string`  | No          | - |

##### Example usage
```
_.style.get({ styleName: 'width', classNames:  inputClass });
```

#### `style.compare`
Input options extends [CompareOptions](#compareoptions)

| Input parameters     | Type      | Is nullable | Description |
|----------------------|-----------|------------ |-------------|
| `expectedValue`      | `number`  | No          | - |

##### Example usage
```
_.style.compare({ expectedValue, styleName: 'width', classNames: inputClass, equal });
```


### `property`
Input options extends: [ExecuteOptions](#executeoptions), [FindOptions](#findoptions)

Have has next suboptions:

#### `property.get`
Input options extends: [PropertyOptions](#propertyoptions)

##### Example usage
```
_.property.get({ text: true, selectors: ['table', 'td.cell'], elementNumber });
```

#### `property.is`
| Input parameters     | Type      | Is nullable | Description |
|----------------------|-----------|------------ |-------------|
| `is`                 | `boolean` | Yes         | - |
| `expectedValue`      | `number`  | No          | - |

##### Example usage
```
_.property.is({ expectedValue, classNames: 'data', text: true, is: true });
```


## Common Options:

### `ElementOptions`

| Input parameters | Type     | Is nullable | Description |
|----------------- |----------|------------ |-------------|
| `selector`       | `string` | Yes         | - |
| `elementIndex`   | `number` | Yes         | - |


### `ChildOptions`

| Input parameters    | Type     | Is nullable | Description |
|---------------------|----------|------------ |-------------|
| `childSelector`     | `string` | Yes         | - |
| `childElementIndex` | `number` | Yes         | - |

### `DefaultOptions`
Extends: [ElementOptions](#elementoptions)

| Input parameters    | Type      | Is nullable | Description |
|---------------------|-----------|------------ |-------------|
| `findInBody`        | `boolean` | Yes         | - |

### `ExecuteOptions`
Extends: [DefaultOptions](#defaultoptions)

| Input parameters    | Type            | Is nullable | Description |
|---------------------|-----------------|------------ |-------------|
| `classNames`        | `StringOrArray` | Yes         | - |
| `selectors`         | `StringOrArray` | Yes         | - |
| `elementNumber`     | `StringOrArray` | Yes         | - |

### `TimerOptions`
| Input parameters | Sub parameters | Type     | Is nullable | Description |
|------------------|----------------|----------|------------ |-------------|
| `wait`           |                | `string` | Yes         | - |
|                  | after          | `number` | Yes         | - |
|                  | before         | `number` | Yes         | - |
| `timeout`        |                | `number` | Yes         | - |

### `FindOptions`
Extends: [DefaultOptions](#defaultoptions), [ChildOptions](#childoptions), [TimerOptions](#timeroptions)


| Input parameters   | Type                     | Is nullable | Default value |
|--------------------|--------------------------|------------ |---------------|
| `container`        | `Cypress.Chainable<any>` | Yes         | - |
| `skipElementIndex` | `boolean`                | Yes         | - |

### `KeyPressOptions`
| Input parameters   | Type                     | Is nullable | Default value |
|--------------------|--------------------------|------------ |---------------|
| `enter`            | `boolean`                | Yes         | - |
| `downarrow`        | `boolean`                | Yes         | - |
| `uparrow`          | `boolean`                | Yes         | - |
| `esc`              | `boolean`                | Yes         | - |
| `selectall`        | `boolean`                | Yes         | - |
| `backspace`        | `boolean`                | Yes         | - |


### `PropertyOptions`
Extends: [FindOptions](#findoptions)

| Input parameters    | Type      | Is nullable | Description |
|---------------------|-----------|------------ |-------------|
| `text`              | `boolean` | Yes         | - |
| `value`             | `boolean` | Yes         | - |

### `CompareOptions`

| Input parameters    | Type      | Is nullable | Description |
|---------------------|-----------|------------ |-------------|
| `equal`             | `boolean` | Yes         | - |
| `graterThan`        | `boolean` | Yes         | - |
| `contain`           | `boolean` | Yes         | - |
