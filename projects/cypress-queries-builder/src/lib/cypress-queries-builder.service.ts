import { Injectable } from '@angular/core';
import { build } from './cypress-queries.builder';

@Injectable({
  providedIn: 'root'
})
export class CypressQueriesBuilderService {

  constructor() { }

  getBuilder() {
    return build;
  }
}
