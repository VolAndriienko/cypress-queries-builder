/// <reference types="cypress" />

const mode: {
  baseURL: string,
  removeAccountURL: string
} = Cypress.env(Cypress.env('mode'));

const startButton: {
  beforeGetSeconds: number,
  timerSeconds: number,
  maxCheckTimes: number,
} = Cypress.env('start-button');

const emails: {
  inboxWaitSeconds: number,
} = Cypress.env('emails');


const stepper: {
  waitAfterStep1Seconds: number,
  waitAfterStep2Seconds: number,
} = Cypress.env('stepper')

//interface EnvSettings {
//  baseURL: string,
//  removeAccountURL: string

//  beforeGetSeconds: number,
//  timerSeconds: number,
//  maxCheckTimes: number,

//  inboxWaitSeconds: number,

//  waitAfterStep1Seconds: number,
//  waitAfterStep2Seconds: number,
//}

//const result: EnvSettings = {
//  baseURL,
//  removeAccountURL,

//  beforeGetSeconds,
//  timerSeconds,
//  maxCheckTimes,

//  inboxWaitSeconds,

//  waitAfterStep1Seconds,
//  waitAfterStep2Seconds,
//};

export {
  mode,
  startButton,
  stepper,
  emails
};
