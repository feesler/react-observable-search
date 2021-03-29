import { ofType } from 'redux-observable';
import { ajax } from 'rxjs/ajax';
import { of } from 'rxjs';
import {
  map,
  tap,
  retry,
  debounceTime,
  switchMap,
  catchError,
} from 'rxjs/operators';
import { CHANGE_SEARCH_FIELD, SEARCH_SKILLS_REQUEST } from '../actions/actionTypes';
import {
  searchSkillsRequest,
  searchSkillsSuccess,
  searchSkillsFailure,
  resetSkills,
} from '../actions/actionCreators';

export const changeSearchEpic = (action$) => action$.pipe(
  ofType(CHANGE_SEARCH_FIELD),
  map(o => o.payload.search.trim()),
  debounceTime(100),
  map(o => searchSkillsRequest(o))
);

export const searchSkillsEpic = (action$) => action$.pipe(
  ofType(SEARCH_SKILLS_REQUEST),
  map(o => o.payload.search),
  tap(o => console.log(o)),
  switchMap(o => {
    if (o === '') {
      return of(resetSkills());
    } else {
      const params = new URLSearchParams({ q: o });
      return ajax.getJSON(`${process.env.REACT_APP_SEARCH_URL}?${params}`).pipe(
        retry(3),
        map(o => searchSkillsSuccess(o)),
        catchError(e => of(searchSkillsFailure(e))),
      );
    }
  })
);
