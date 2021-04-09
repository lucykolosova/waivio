import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Loading from '../components/Icon/Loading';
import { getAuthenticatedUser, getAuthenticatedUserName } from '../store/authStore/authSelectors';
import { getUser } from '../store/usersStore/usersSelectors';
import {
  getAccountHistoryFilter,
  getCurrentDisplayedActions,
  getCurrentFilteredActions,
  getLoadingMoreUsersAccountHistory,
  getUserHasMoreAccountHistory,
  getUsersAccountHistory,
} from '../store/walletStore/walletSelectors';

@withRouter
@connect((state, ownProps) => ({
  user: ownProps.isCurrentUser
    ? getAuthenticatedUser(state)
    : getUser(state, ownProps.match.params.name),
  loadingMoreUsersAccountHistory: getLoadingMoreUsersAccountHistory(state),
  currentDisplayedActions: getCurrentDisplayedActions(state),
  currentFilteredActions: getCurrentFilteredActions(state),
  accountHistoryFilter: getAccountHistoryFilter(state),
  usersAccountHistory: getUsersAccountHistory(state),
  userHasMoreActions: getUserHasMoreAccountHistory(
    state,
    ownProps.isCurrentUser
      ? getAuthenticatedUserName(state)
      : getUser(state, ownProps.match.params.name).name,
  ),
}))
class UserActivityActionsLoader extends React.Component {
  static propTypes = {
    currentDisplayedActions: PropTypes.arrayOf(PropTypes.shape()),
    accountHistoryFilter: PropTypes.arrayOf(PropTypes.string),
    userHasMoreActions: PropTypes.bool.isRequired,
    loadingMoreUsersAccountHistory: PropTypes.bool.isRequired,
    usersAccountHistory: PropTypes.shape().isRequired,
    user: PropTypes.shape().isRequired,
  };

  static defaultProps = {
    currentDisplayedActions: [],
    currentFilteredActions: [],
    accountHistoryFilter: [],
  };

  shouldComponentUpdate(nextProps) {
    const currentUsername = nextProps.user.name;
    const actions = nextProps.usersAccountHistory[currentUsername];
    const hasMore =
      nextProps.userHasMoreActions || actions.length !== nextProps.currentDisplayedActions.length;
    const diffActivityFilter = !_.isEqual(
      this.props.accountHistoryFilter,
      nextProps.accountHistoryFilter,
    );

    return nextProps.loadingMoreUsersAccountHistory || !hasMore || diffActivityFilter;
  }

  render() {
    const { loadingMoreUsersAccountHistory } = this.props;

    if (loadingMoreUsersAccountHistory) {
      return (
        <div>
          <div className="UserActivityActions__loader">
            <Loading />
          </div>
        </div>
      );
    }

    return null;
  }
}

export default UserActivityActionsLoader;
