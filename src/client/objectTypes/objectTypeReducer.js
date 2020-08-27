import { get, isEmpty, omit, reduce, filter } from 'lodash';
import * as wobjTypeActions from './objectTypeActions';

const initialState = {
  data: {},
  filteredObjects: [],
  filtersList: {},
  activeFilters: {},
  sort: 'weight',
  map: false,
  fetching: false,
  hasMoreRelatedObjects: true,
  mapWobjects: [],
  updated: false,
};
const objectType = (state = initialState, action) => {
  switch (action.type) {
    case wobjTypeActions.GET_OBJECT_TYPE.START:
      return {
        ...state,
        fetching: true,
      };
    case wobjTypeActions.GET_OBJECT_TYPE.SUCCESS: {
      const {
        related_wobjects: relatedWobjects,
        hasMoreWobjects,
        filters,
        ...data
      } = action.payload;
      const filteredObjects = [
        ...state.filteredObjects,
        ...relatedWobjects.filter(
          wObj =>
            !wObj.status ||
            (wObj.status.title !== 'unavailable' && wObj.status.title !== 'relisted'),
        ),
      ];
      const filtersList = filters ? omit(filters, ['map']) : {};
      const activeFilters = isEmpty(state.activeFilters)
        ? reduce(
            filtersList,
            (result, value, key) => {
              result[key] = []; // eslint-disable-line
              return result;
            },
            {},
          )
        : { ...state.activeFilters };
      const hasMap = !isEmpty(
        filter(relatedWobjects, object => get(object, ['map']) || get(object, ['parent', 'map'])),
      );
      return {
        ...state,
        data,
        filtersList,
        activeFilters,
        map: Boolean((filters && !isEmpty(filters.map)) || hasMap),
        filteredObjects,
        hasMoreRelatedObjects: Boolean(hasMoreWobjects),
        fetching: false,
      };
    }
    case wobjTypeActions.GET_OBJECT_TYPE_MAP.SUCCESS: {
      const { related_wobjects: relatedWobjects, filters, ...data } = action.payload;
      const filteredObjects = relatedWobjects.filter(
        wObj =>
          !wObj.status || (wObj.status.title !== 'unavailable' && wObj.status.title !== 'relisted'),
      );
      return {
        ...state,
        data,
        mapWobjects: filteredObjects,
        map: true,
        updated: true,
      };
    }
    case wobjTypeActions.UPDATE_ACTIVE_FILTERS:
      return {
        ...state,
        filteredObjects: [],
        activeFilters: action.payload,
      };
    case wobjTypeActions.CHANGE_SORTING:
      return {
        ...state,
        filteredObjects: [],
        sort: action.payload,
      };
    case wobjTypeActions.CLEAR_OBJECT_TYPE:
      return initialState;
    case wobjTypeActions.GET_OBJECT_TYPE.ERROR:
    case wobjTypeActions.RESET_UPDATED_STATE:
      return {
        ...state,
        updated: false,
      };
    default:
      return state;
  }
};

export default objectType;

export const getObjectType = state => state.data;
export const getObjectTypeLoading = state => state.fetching;
export const getFilteredObjects = state => state.filteredObjects;
export const getFilteredObjectsMap = state => state.mapWobjects;
export const getUpdatedMapDiscover = state => state.updated;
export const getHasMoreRelatedObjects = state => state.hasMoreRelatedObjects;
export const getAvailableFilters = state => state.filtersList;
export const getActiveFilters = state => state.activeFilters;
export const getTypeName = state => get(state, ['data', 'name'], '');
export const getHasMap = state => state.map;
export const getSorting = state => state.sort;
