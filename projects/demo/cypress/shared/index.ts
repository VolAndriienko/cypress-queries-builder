/// <reference types="cypress" />

//#region import
import urls from '../fixtures/urls.json'

import { build } from '../../src/shared/cypress-queries.builder';
import credentials from '../fixtures/credentials.json';

import { loginButtonClass, logoutButtonClass, registerButtonClass } from '../../src/app/nav/user-login/user-login.consts.json'
import { startNowButtonClass } from '../../src/app/url-checker/url-checker.consts.json'
import { loginConfirmButtonClass, loginEmailInputClass, loginPasswordInputClass } from '../../src/app/nav/login-dialog/login-dialog.consts.json'
import { firstStepConfirmButtonClass, secondStepConfirmButtonClass, stepperHeaderClass, inputs } from '../../src/app/stepper/stepper.consts.json'
const { confirmationCode, email, name, password, surname } = inputs;

import { emails } from './env.settings'
const { inboxWaitSeconds } = emails;

import { mode } from './env.settings'
const { baseURL, removeAccountURL } = mode;

import { startButton } from './env.settings'
const { beforeGetSeconds, maxCheckTimes, timerSeconds } = startButton;

import { stepper } from './env.settings'
const { waitAfterStep1Seconds, waitAfterStep2Seconds } = stepper;

//#endregion import

//#region main
const _ = build(cy, { alwaysFindInBody: true, pathPrefix: '' });
const visit = (url) => _.visit(baseURL + url || '');

const { user } = credentials[0];
const userEmail = (user || '').toLowerCase();

const removeTestAccount = (email = '') => {
  cy.request({
    method: "GET",
    url: removeAccountURL + (email || userEmail),
    headers: {
      "Content-type": "text/html"
    }
  });
}
//#endregion main

const main = {
  _,
  visit,
  removeTestAccount,
  userEmail,
  user
};

//#region stepper
const typeInput = (field: string, text: string) =>
  _.type({ classNames: field, text });

const typeRegister = (text: string, emailText: string) => {
  [name, surname, password].forEach(field => typeInput(field, text));
  typeInput(email, emailText)
}

const clickConfirmFirstStep = () => {
  _.click({ classNames: firstStepConfirmButtonClass });
  cy.wait(1000 * (waitAfterStep1Seconds || 2));
}

const clickConfirstSecondStep = () => {
  return _.click({ classNames: secondStepConfirmButtonClass })
}

const getConfirmSecondStepButton = () => {
  return _.find({ classNames: secondStepConfirmButtonClass })
}

const typeCode = (text: string) => {
  return typeInput(confirmationCode, text);
}

const goStep = (elementNumber: number) => {
  return _.click({ classNames: stepperHeaderClass, elementNumber })
}

const clickStartNow = () => {
  return _.click({ classNames: startNowButtonClass });
}

const getStartNowButton = () => {
  return _.find({ classNames: startNowButtonClass });
}

let isEmailsUpdated = false
const updateEmailsInbox = (force = false) => {
  if (force) {
    isEmailsUpdated = false;
  }

  if (!isEmailsUpdated) {
    const frame = document.createElement("iframe");
    frame.setAttribute("src", 'https://mailsac.com/inbox/' + userEmail);
    frame.style.width = "640px";
    frame.style.height = "480px";
    document.body.appendChild(frame);
    cy.wait(1000 * (inboxWaitSeconds || 5));

    isEmailsUpdated = true;
  }
}

const getStepURL = (callback: (url: string) => void) =>
  cy.request('https://mailsac.com/inbox/' + userEmail)
    .then(response => {
      if (response.isOkStatusCode) {
        const { body } = response;
        // get first step link entry index
        const stepIndex = body.indexOf('/step1');
        // count url length
        const urlLength = `/step1?id=${userEmail}&code=XXXX`.length;
        // copy url
        const url = body.substring(stepIndex, stepIndex + urlLength);

        callback(url);
      }
    });

const typeCodeAndGoToThirdStep = (url) => {
  const code = url.substring(url.length - 4, url.length)
  typeCode(code);
  clickConfirstSecondStep();
  cy.wait(1000 * (waitAfterStep2Seconds || 3));
}

let counterCheckStartNow = 0;
const runAfterStartNowAvailable = (callack: () => void) => {
  console.log('Checked times: ', counterCheckStartNow);
  counterCheckStartNow++;
  cy.wait(1000 * (beforeGetSeconds || 1));
  getStartNowButton().then(button => {
    const isDisabled = button[0].disabled;
    console.log('Status: ', isDisabled ? 'disabled' : 'enabled');

    if (isDisabled && counterCheckStartNow < (maxCheckTimes || 20)) {
      cy.wait(1000 * (timerSeconds || 6));
      runAfterStartNowAvailable(callack);
    } else {
      if (isDisabled) {
        throw Error("Start now button leaved disabled.")
      }
      callack();
    }
  });
}

//#endregion
const stepperPage = {
  typeRegister,
  clickConfirmFirstStep,
  clickConfirstSecondStep,
  getConfirmSecondStepButton,
  typeCode,
  goStep,
  clickStartNow,
  updateEmailsInbox,
  getStepURL,
  typeCodeAndGoToThirdStep,
  runAfterStartNowAvailable
};

//#region auth

const existLogout = (exist: boolean) => {
  return _.exist({ classNames: logoutButtonClass, exist });
}

const clickLogout = () => {
  cy.wait(2000);
  _.click({ classNames: logoutButtonClass });
  cy.wait(2000);
}

const checkLogout = (existsCallback: () => void, notExistsCallback: () => void = () => { }) => {
  cy.get("body").then($body => {
    if ($body.find(_.help.classSelector(logoutButtonClass)).length > 0) {
      existsCallback();
    } else {
      notExistsCallback();
    }
  });
}

const haveLoginText = (text: string, have: boolean = true) => {
  return _.contain({ value: have, expectedValue: text, classNames: loginEmailInputClass })
}

const typeLogin = (text: string) => {
  return _.type({ classNames: loginEmailInputClass, text });
}

const typePassword = (text: string) => {
  return _.type({ classNames: loginPasswordInputClass, text });
}

const clickConfirmLogin = () => {
  return _.click({ classNames: loginConfirmButtonClass });
}

const exitLoginForm = () =>
  _.click({ classNames: 'cdk-overlay-backdrop', force: true });

const clickLogin = () => {
  return _.click({ classNames: loginButtonClass });
}

const clickRegister = () => {
  return _.click({ classNames: registerButtonClass });
}

const register = (callback: () => void) => {
  removeTestAccount();
  typeRegister(user, userEmail);
  clickConfirmFirstStep();
  updateEmailsInbox(true);
  getStepURL((url: string) => {
    typeCodeAndGoToThirdStep(url);
    runAfterStartNowAvailable(() =>
      runAfterStartNowAvailable(callback))
  });
}

interface LoginParams {
  email?: string;
  password?: string;
  visitMainPage?: boolean;
}

const login = ({ email, password, visitMainPage }: LoginParams = {}) => {
  cy.intercept({ method: 'GET', url: '**/auth/**', }).as('testLogin');

  if (visitMainPage) {
    visit(urls.main);
  }

  clickLogin();
  typeLogin(email || userEmail);
  typePassword(user || password);
  clickConfirmLogin();
  cy.wait('@testLogin');

}

const loginOrRegisterAndThenLogin = (callback: () => void, loginParams: LoginParams = {}) => {
  // login first time
  login(loginParams);

  //cy.wait(1000);

  checkLogout(
    // if logout button exists continue
    () => callback(),
    // if logout button doesn't exist - register/login and then continue
    () => {
      // throw Error('I am here for testing')
      exitLoginForm();
      clickRegister();
      register(() => login(loginParams));
    }
  );
}

//#endregion auth

const auth = {
  existLogout,
  clickLogout,
  haveLoginText,
  typeLogin,
  typePassword,
  clickConfirmLogin,
  clickLogin,

  login,
  loginOrRegisterAndThenLogin
};

export {
  main,
  stepperPage,
  auth
}
