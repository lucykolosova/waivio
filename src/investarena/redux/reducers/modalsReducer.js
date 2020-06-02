import _ from 'lodash';
import { TOGGLE_MODAL } from '../actions/modalsActions';
import { LOGOUT } from '../../../client/auth/authActions';

const initialState = { modals: [], modalsInfo: {}, activeModal: false };

function toggleModal(state, action) {
  if (state.modals.includes(action.payload.type)) {
    return {
      ...state,
      modals: _.remove(state.modals, action.payload.type),
      modalsInfo: _.omit(state.modalsInfo, [action.payload.type]),
      activeModal: false,
    };
  }

  return {
    ...state,
    modals: [...state.modals, action.payload.type],
    modalsInfo: { ...state.modalsInfo, [action.payload.type]: action.payload.modalInfo },
    activeModal: true,
  };
}

export default function(state = initialState, action) {
  switch (action.type) {
    case TOGGLE_MODAL:
      return toggleModal(state, action);
    case LOGOUT:
      return initialState;
    default:
      return state;
  }
}

export const activeModal = state => state.activeModal;
