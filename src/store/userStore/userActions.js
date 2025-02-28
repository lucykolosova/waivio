import moment from 'moment';
import { get } from 'lodash';
import { message } from 'antd';
import { createAsyncActionType } from '../../common/helpers/stateHelpers';
import * as ApiClient from '../../waivioApi/ApiClient';
import { getDetailsBody, rewardPostContainerData } from '../../client/rewards/rewardsHelper';
import { createCommentPermlink } from '../../client/vendor/steemitHelpers';
import { getObjectName } from '../../common/helpers/wObjectHelper';
import { getRate, getRewardFund } from '../appStore/appSelectors';
import { getAuthenticatedUserName, getIsAuthenticated } from '../authStore/authSelectors';
import {
  getFollowingObjectsUpdatesByType,
  getFollowingUpdatesFetched,
  getFollowingUsersUpdates,
} from './userSelectors';
import { getLocale } from '../settingsStore/settingsSelectors';

require('isomorphic-fetch');

// region Followings
export const FOLLOW_USER = '@user/FOLLOW_USER';
export const FOLLOW_USER_START = '@user/FOLLOW_USER_START';
export const FOLLOW_USER_SUCCESS = '@user/FOLLOW_USER_SUCCESS';
export const FOLLOW_USER_ERROR = '@user/FOLLOW_USER_ERROR';

export const followExpert = username => (dispatch, getState, { steemConnectAPI }) => {
  const state = getState();
  const authUser = getAuthenticatedUserName(state);

  if (!getIsAuthenticated(state)) {
    return Promise.reject('User is not authenticated');
  }

  return new Promise((resolve, reject) =>
    steemConnectAPI
      .follow(authUser, username)
      .then(res => resolve(res))
      .catch(error => reject(error)),
  );
};

export const unfollowExpert = username => (dispatch, getState, { steemConnectAPI }) => {
  const state = getState();
  const authUser = getAuthenticatedUserName(state);

  if (!getIsAuthenticated(state)) {
    return Promise.reject('User is not authenticated');
  }

  return new Promise((resolve, reject) =>
    steemConnectAPI
      .unfollow(authUser, username)
      .then(res => resolve(res))
      .catch(error => reject(error)),
  );
};

export const followUser = username => (dispatch, getState, { steemConnectAPI }) => {
  const state = getState();

  if (!getIsAuthenticated(state)) {
    return Promise.reject('User is not authenticated');
  }

  return dispatch({
    type: FOLLOW_USER,
    payload: {
      promise: steemConnectAPI.follow(getAuthenticatedUserName(state), username),
    },
    meta: {
      username,
    },
  });
};

export const UNFOLLOW_USER = createAsyncActionType('@user/UNFOLLOW_USER');

export const unfollowUser = username => (dispatch, getState, { steemConnectAPI }) => {
  const state = getState();

  if (!getIsAuthenticated(state)) {
    return Promise.reject('User is not authenticated');
  }

  return dispatch({
    type: UNFOLLOW_USER.ACTION,
    payload: {
      promise: steemConnectAPI.unfollow(getAuthenticatedUserName(state), username),
    },
    meta: {
      username,
    },
  });
};

export const GET_FOLLOWING = '@user/GET_FOLLOWING';
export const GET_FOLLOWING_START = '@user/GET_FOLLOWING_START';
export const GET_FOLLOWING_SUCCESS = '@user/GET_FOLLOWING_SUCCESS';
export const GET_FOLLOWING_ERROR = '@user/GET_FOLLOWING_ERROR';

export const getFollowing = (username, skip, limit) => (dispatch, getState) => {
  const state = getState();
  const user = getAuthenticatedUserName(state);

  if (!username && !getIsAuthenticated(state)) {
    return dispatch({ type: GET_FOLLOWING_ERROR });
  }

  const targetUsername = username || getAuthenticatedUserName(state);

  return dispatch({
    type: GET_FOLLOWING,
    meta: targetUsername,
    payload: {
      promise: ApiClient.getFollowingsFromAPI(targetUsername, skip, limit, user).then(
        data => data.users,
      ),
    },
  });
};

export const GET_FOLLOWING_OBJECTS = '@user/GET_FOLLOWING_OBJECTS';
export const GET_FOLLOWING_OBJECTS_START = '@user/GET_FOLLOWING_OBJECTS_START';
export const GET_FOLLOWING_OBJECTS_SUCCESS = '@user/GET_FOLLOWING_OBJECTS_SUCCESS';
export const GET_FOLLOWING_OBJECTS_ERROR = '@user/GET_FOLLOWING_OBJECTS_ERROR';

export const getFollowingObjects = username => (dispatch, getState) => {
  const state = getState();
  const skip = 0;
  const limit = state.auth.user.objects_following_count;
  const authUserName = getAuthenticatedUserName(state);
  const locale = getLocale(state);

  if (!username && !getIsAuthenticated(state)) {
    return dispatch({ type: GET_FOLLOWING_ERROR });
  }

  const targetUsername = username || authUserName;

  return dispatch({
    type: GET_FOLLOWING_OBJECTS,
    payload: {
      promise: ApiClient.getAllFollowingObjects(targetUsername, skip, limit, authUserName, locale),
    },
  });
};

export const GET_FOLLOWING_UPDATES = createAsyncActionType('@user/GET_FOLLOWING_UPDATES');
export const getFollowingUpdates = (count = 5) => (dispatch, getState) => {
  const state = getState();
  const locale = getLocale(state);
  const isUpdatesFetched = getFollowingUpdatesFetched(state);
  const userName = getAuthenticatedUserName(state);

  if (!isUpdatesFetched && userName) {
    dispatch({
      type: GET_FOLLOWING_UPDATES.ACTION,
      payload: {
        promise: ApiClient.getFollowingUpdates(locale, userName, count),
      },
    });
  }
};

export const GET_FOLLOWING_OBJECTS_UPDATES = createAsyncActionType(
  '@user/GET_FOLLOWING_OBJECTS_UPDATES',
);
export const getFollowingObjectsUpdatesMore = (objectType, count = 5) => (dispatch, getState) => {
  const state = getState();
  const followingObjects = getFollowingObjectsUpdatesByType(state, objectType);
  const userName = getAuthenticatedUserName(state);

  dispatch({
    type: GET_FOLLOWING_OBJECTS_UPDATES.ACTION,
    payload: {
      promise: ApiClient.getFollowingObjectsUpdates(
        userName,
        objectType,
        count,
        followingObjects.length,
      ),
    },
    meta: {
      objectType,
    },
  });
};

export const GET_FOLLOWING_USERS_UPDATES = createAsyncActionType(
  '@user/GET_FOLLOWING_USERS_UPDATES',
);
export const getFollowingUsersUpdatesMore = (count = 5) => (dispatch, getState) => {
  const state = getState();
  const followingUsers = getFollowingUsersUpdates(state);
  const userName = getAuthenticatedUserName(state);

  dispatch({
    type: GET_FOLLOWING_USERS_UPDATES.ACTION,
    payload: {
      promise: ApiClient.getFollowingUsersUpdates(userName, count, followingUsers.users.length),
    },
  });
};

// endregion

export const GET_RECOMMENDED_OBJECTS = '@user/GET_RECOMMENDED_OBJECTS';
export const GET_RECOMMENDED_OBJECTS_START = '@user/GET_RECOMMENDED_OBJECTS_START';
export const GET_RECOMMENDED_OBJECTS_SUCCESS = '@user/GET_RECOMMENDED_OBJECTS_SUCCESS';
export const GET_RECOMMENDED_OBJECTS_ERROR = '@user/GET_RECOMMENDED_OBJECTS_ERROR';

export const getRecommendedObj = () => (dispatch, getState) => {
  const locale = getLocale(getState());

  return dispatch({
    type: GET_RECOMMENDED_OBJECTS,
    payload: {
      promise: ApiClient.getRecommendedObjects(locale),
    },
  });
};

export const GET_NOTIFICATIONS = createAsyncActionType('@user/GET_NOTIFICATIONS');

export const getNotifications = username => (dispatch, getState, { busyAPI }) => {
  const state = getState();

  dispatch({ type: GET_NOTIFICATIONS.START });

  if (!username && !getIsAuthenticated(state)) {
    return dispatch({ type: GET_NOTIFICATIONS.ERROR });
  }

  const targetUsername = username || getAuthenticatedUserName(state);

  busyAPI.instance.sendAsync('get_notifications', [targetUsername]);
  busyAPI.instance.subscribe((response, mess) => {
    if (mess.type === 'get_notifications' && mess.result) {
      return dispatch({
        type: GET_NOTIFICATIONS.SUCCESS,
        meta: targetUsername,
        payload: mess.result,
      });
    }

    return null;
  });

  return null;
};

export const GET_USER_LOCATION = createAsyncActionType('@user/GET_USER_LOCATION');

export const getCoordinates = () => ({
  type: GET_USER_LOCATION.ACTION,
  payload: ApiClient.getUserCoordinatesByIpAdress(),
});

// region Campaigns
export const SET_PENDING_UPDATE = createAsyncActionType('@user/SET_PANDING_UPDATE');

export const assignProposition = ({
  companyAuthor,
  companyPermlink,
  resPermlink,
  objPermlink,
  appName,
  primaryObjectName,
  amount,
  proposition,
  proposedWobj,
  userName,
  currencyId,
}) => (dispatch, getState, { steemConnectAPI }) => {
  const username = getAuthenticatedUserName(getState());
  const proposedWobjName = getObjectName(proposedWobj);
  const proposedWobjAuthorPermlink = proposedWobj.author_permlink;
  const primaryObjectPermlink = get(proposition, ['required_object', 'author_permlink']);
  const detailsBody = getDetailsBody({
    proposition,
    proposedWobjName,
    proposedWobjAuthorPermlink,
    primaryObjectName,
  });
  const commentOp = [
    'comment',
    {
      parent_author: companyAuthor,
      parent_permlink: companyPermlink,
      author: username,
      permlink: resPermlink,
      title: 'Rewards reservations',
      body: `<p>User ${userName} (@${username}) has reserved the rewards of ${amount} HIVE for a period of ${proposition.count_reservation_days} days to write a review of <a href="/object/${proposedWobj.author_permlink}">${proposedWobjName}</a>, <a href="/object/${primaryObjectPermlink}">${primaryObjectName}</a></p>${detailsBody}`,
      json_metadata: JSON.stringify({
        app: appName,
        waivioRewards: {
          type: 'waivio_assign_campaign',
          approved_object: objPermlink,
          currencyId,
        },
      }),
    },
  ];

  return new Promise((resolve, reject) => {
    steemConnectAPI
      .broadcast([commentOp])
      .then(() => resolve('SUCCESS'))
      .then(() =>
        dispatch({
          type: SET_PENDING_UPDATE.START,
        }),
      )
      .catch(error => reject(error));
  });
};

export const rejectReview = ({
  companyAuthor,
  username,
  reservationPermlink,
  objPermlink,
  appName,
  guideName,
}) => (dispatch, getState, { steemConnectAPI }) => {
  const commentOp = [
    'comment',
    {
      parent_author: username,
      parent_permlink: reservationPermlink,
      author: companyAuthor,
      permlink: createCommentPermlink(username, reservationPermlink),
      title: 'Reject review',
      body: `Sponsor ${guideName} (@${guideName}) has rejected the review `,
      json_metadata: JSON.stringify({
        app: appName,
        waivioRewards: {
          type: 'reject_reservation_by_guide',
          approved_object: objPermlink,
        },
      }),
    },
  ];

  return new Promise((resolve, reject) => {
    steemConnectAPI
      .broadcast([commentOp])
      .then(() => resolve('SUCCESS'))
      .then(() =>
        dispatch({
          type: SET_PENDING_UPDATE.START,
        }),
      )
      .catch(error => reject(error));
  });
};

export const reinstateReward = ({ companyAuthor, username, reservationPermlink, appName }) => (
  dispatch,
  getState,
  { steemConnectAPI },
) => {
  const commentOp = [
    'comment',
    {
      parent_author: username,
      parent_permlink: reservationPermlink,
      author: companyAuthor,
      permlink: createCommentPermlink(username, reservationPermlink),
      title: 'Reinstate reward',
      body: `Sponsor ${companyAuthor} (@${companyAuthor}) has reinstated the reward `,
      json_metadata: JSON.stringify({
        app: appName,
        waivioRewards: {
          type: 'restore_reservation_by_guide',
        },
      }),
    },
  ];

  return new Promise((resolve, reject) => {
    steemConnectAPI
      .broadcast([commentOp])
      .then(() => {
        resolve('SUCCESS');

        return dispatch({
          type: SET_PENDING_UPDATE.START,
        });
      })
      .catch(error => reject(error));
  });
};

export const changeReward = ({
  companyAuthor,
  companyPermlink,
  username,
  reservationPermlink,
  appName,
  amount,
}) => (dispatch, getState, { steemConnectAPI }) => {
  const userName = getAuthenticatedUserName(getState());
  const body =
    username !== userName
      ? `Sponsor ${userName} (@${userName}) has increased the reward by ${amount} HIVE`
      : `User ${userName} (@${userName}) has decreased the reward by ${amount} HIVE`;
  const title = username !== userName ? 'Increase reward' : 'Decrease reward';
  const waivioRewards =
    username !== userName
      ? {
          type: 'waivio_raise_review_reward',
          riseAmount: amount,
          activationPermlink: companyPermlink,
        }
      : {
          type: 'waivio_reduce_review_reward',
          reduceAmount: amount,
          activationPermlink: companyPermlink,
        };

  const author = username !== userName ? companyAuthor : userName;

  const commentOp = [
    'comment',
    {
      parent_author: username,
      parent_permlink: reservationPermlink,
      author,
      permlink: createCommentPermlink(username, reservationPermlink),
      title,
      body,
      json_metadata: JSON.stringify({
        app: appName,
        waivioRewards,
      }),
    },
  ];

  return new Promise((resolve, reject) => {
    steemConnectAPI
      .broadcast([commentOp])
      .then(() => resolve('SUCCESS'))
      .then(() =>
        dispatch({
          type: SET_PENDING_UPDATE.START,
        }),
      )
      .catch(error => reject(error));
  });
};

export const pendingUpdateSuccess = () => dispatch =>
  dispatch({
    type: SET_PENDING_UPDATE.SUCCESS,
  });

export const declineProposition = ({
  companyAuthor,
  companyPermlink,
  unreservationPermlink,
  reservationPermlink,
  requiredObjectName,
  type,
}) => (dispatch, getState, { steemConnectAPI }) => {
  const username = getAuthenticatedUserName(getState());
  const commentOp = [
    'comment',
    {
      parent_author: companyAuthor,
      parent_permlink: companyPermlink,
      author: username,
      permlink: unreservationPermlink,
      title: 'Cancelled reservation',
      body: `User <a href="https://www.waivio.com/@${username}">${username}</a> cancelled reservation for <a href="https://www.waivio.com/@${companyAuthor}/${companyPermlink}">${requiredObjectName} rewards campaign</a>`,
      json_metadata: JSON.stringify({
        waivioRewards: {
          type: type || 'waivio_reject_object_campaign',
          reservation_permlink: reservationPermlink,
        },
      }),
    },
  ];

  return new Promise((resolve, reject) => {
    steemConnectAPI
      .broadcast([commentOp])
      .then(() => resolve('SUCCESS'))
      .then(() =>
        dispatch({
          type: SET_PENDING_UPDATE.START,
        }),
      )
      .catch(error => reject(error));
  });
};
export const activateCampaign = (company, campaignPermlink) => (
  dispatch,
  getState,
  { steemConnectAPI },
) => {
  const state = getState();
  const username = getAuthenticatedUserName(state);
  const rate = getRate(state);
  const rewardFund = getRewardFund(state);
  const recentClaims = rewardFund.recent_claims;
  const rewardBalance = rewardFund.reward_balance.replace(' HIVE', '');
  const proposedWobjName = getObjectName(company.requiredObject);
  const proposedAuthorPermlink = company.requiredObject.author_permlink;
  const primaryObjectName = getObjectName(company.requiredObject);
  const processingFees = company.commissionAgreement * 100;
  const expiryDate = moment(company.expired_at).format('YYYY-MM-DD');
  const alias = get(company, ['guide', 'alias']);
  const detailsBody = getDetailsBody({
    proposition: company,
    proposedWobjName,
    proposedAuthorPermlink,
    primaryObjectName,
    rate,
    recentClaims,
    rewardBalance,
  });
  const commentOp = [
    'comment',
    {
      parent_author: rewardPostContainerData.author,
      parent_permlink: rewardPostContainerData.permlink,
      author: username,
      permlink: campaignPermlink,
      title: 'Activate rewards campaign',
      body: `${alias} (@${username}) has activated rewards campaign for <a href="/object/${company.requiredObject.author_permlink}">${primaryObjectName}</a> (${company.requiredObject.object_type}) with the target reward of $ ${company.reward} USD.  ${detailsBody} Campaign expiry date: ${expiryDate}. Processing fees: ${processingFees}% of the total amount of rewards (Campaign server @waivio.campaigns offers 50% commissions to index services for reservations). `,
      json_metadata: JSON.stringify({
        waivioRewards: { type: 'waivio_activate_campaign', campaign_id: company._id },
      }),
    },
  ];

  return new Promise((resolve, reject) => {
    steemConnectAPI
      .broadcast([commentOp])
      .then(() => resolve('SUCCESS'))
      .catch(error => reject({ ...error }));
  });
};

export const inactivateCampaign = (company, inactivatePermlink) => (
  dispatch,
  getState,
  { steemConnectAPI },
) => {
  const username = getAuthenticatedUserName(getState());
  const commentOp = [
    'comment',
    {
      parent_author: username,
      parent_permlink: company.activation_permlink,
      author: username,
      permlink: inactivatePermlink,
      title: 'unactivate object for rewards',
      body: `Campaign ${company.name} was inactivated by ${username} `,
      json_metadata: JSON.stringify({
        waivioRewards: {
          type: 'waivio_stop_campaign',
          campaign_id: company._id,
          stoppedAt: moment().utc(),
        },
      }),
    },
  ];

  return new Promise((resolve, reject) => {
    steemConnectAPI
      .broadcast([commentOp])
      .then(() => resolve('SUCCESS'))
      .catch(error => reject(error));
  });
};
// endregion
export const BELL_USER_NOTIFICATION = createAsyncActionType('@auth/BELL_USER_NOTIFICATION');

export const bellNotifications = (follower, following) => (
  dispatch,
  getState,
  { steemConnectAPI },
) => {
  const state = getState();
  const subscribe = !get(state, ['users', 'users', following, 'bell']);

  dispatch({
    type: BELL_USER_NOTIFICATION.START,
    payload: { following },
  });
  steemConnectAPI
    .bellNotifications(follower, following, subscribe)
    .then(res => {
      if (res.message) {
        message.error(res.message);

        return dispatch({
          type: BELL_USER_NOTIFICATION.ERROR,
          payload: { following },
        });
      }

      return dispatch({
        type: BELL_USER_NOTIFICATION.SUCCESS,
        payload: { following, subscribe },
      });
    })
    .catch(err => {
      message.error(err.message);

      return dispatch({
        type: BELL_USER_NOTIFICATION.ERROR,
        payload: { following },
      });
    });
};
