/// <reference types="cypress" />

import { build } from 'cypress-queries-builder';

context('Actions', () => {
  const _ = build(cy);

  const commands = [
    'ng generate component xyz',
    'ng add @angular/material',
    'ng add @angular/pwa',
    'ng add _____',
    'ng test',
    'ng build'
  ]

  describe('Main', () => {
    _.testCases.add([
      () => it('1. Visit and click', () => {
        _.visit('');
        commands.forEach((command, index) => {
          _.click({ classNames: ['card-container', 'card-small'], elementIndex: index });

          _.property.is({
            expectedValue: command,
            selector: 'pre',
            is: true,
            text: true
          });
        })
      }),
    ])([])
  });
});
