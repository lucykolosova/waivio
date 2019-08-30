import { createAsyncActionType } from '../helpers/stateHelpers';
import { getActiveFilters, getTypeName } from '../reducers';
import * as ApiClient from '../../waivioApi/ApiClient';

export const GET_OBJECT_TYPE = createAsyncActionType('@objectType/GET_OBJECT_TYPE');
export const CLEAR_OBJECT_TYPE = '@objectType/CLEAR_OBJECT_TYPE';
export const UPDATE_ACTIVE_FILTERS = '@objectType/UPDATE_ACTIVE_FILTERS';

export const getObjectType = (
  name,
  { limit = 15, skip = 0, sort = 'weight' } = { limit: 15, skip: 0, sort: 'weight' },
) => (dispatch, getState) => {
  const state = getState();
  const activeFilters = getActiveFilters(state);
  dispatch({
    type: GET_OBJECT_TYPE.ACTION,
    payload: ApiClient.getObjectType(name, { limit, skip, filter: activeFilters, sort }),
  });
};

export const clearType = () => dispatch => {
  dispatch({ type: CLEAR_OBJECT_TYPE });
  return Promise.resolve();
};

export const getObjectTypeInitial = name => dispatch => {
  dispatch(clearType()).then(() => {
    dispatch(getObjectType(name));
  });
};

export const setActiveFilters = filters => dispatch => {
  dispatch({
    type: UPDATE_ACTIVE_FILTERS,
    payload: filters,
  });
  return Promise.resolve();
};

export const setFiltersAndLoad = filters => (dispatch, getState) => {
  dispatch(setActiveFilters(filters)).then(() => {
    const typeName = getTypeName(getState());
    if (typeName) dispatch(getObjectType(typeName));
  });
};
