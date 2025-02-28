import { get, kebabCase, round, uniqBy } from 'lodash';

import { createAsyncActionType } from '../../common/helpers/stateHelpers';
import {
  getAllCampaingForRequiredObject,
  getAuthorsChildWobjects,
  getCurrentHivePrice,
  searchObjects,
} from '../../waivioApi/ApiClient';
import { getAuthenticatedUserName } from '../authStore/authSelectors';
import { getLocale } from '../settingsStore/settingsSelectors';
import { createPost } from '../editorStore/editorActions';
import { createPostMetadata } from '../../common/helpers/postHelpers';
import { getBeneficiariesUsers } from '../searchStore/searchSelectors';
import { getSelectedDish, getSelectedRestaurant } from './quickRewardsSelectors';
import config from '../../waivioApi/config.json';
import { getObjectName, getObjectType } from '../../common/helpers/wObjectHelper';
import { getDetailsBody } from '../../client/rewards/rewardsHelper';
import { getCurrentHost } from '../appStore/appSelectors';

export const GET_ELIGIBLE_REWARDS = createAsyncActionType('@quickRewards/GET_ELIGIBLE_REWARDS');

export const getEligibleRewardsList = searchString => (dispatch, getState) => {
  const state = getState();
  const locale = getLocale(state);

  return dispatch({
    type: GET_ELIGIBLE_REWARDS.ACTION,
    payload: searchObjects(searchString, 'restaurant', false, 20, locale),
  });
};

export const SELECT_DISH = '@quickRewards/SELECT_DISH';

export const setSelectedDish = rest => ({
  type: SELECT_DISH,
  payload: rest,
});

export const TOGGLE_MODAL = '@quickRewards/TOGGLE_MODAL';

export const toggleModal = open => ({
  type: TOGGLE_MODAL,
  payload: open,
});

export const RESET_RESTAURANT = '@quickRewards/RESET_RESTAURANT';

export const resetRestaurant = () => ({
  type: RESET_RESTAURANT,
});

export const RESET_DISH = '@quickRewards/RESET_DISH';

export const resetDish = () => ({
  type: RESET_DISH,
});

export const SELECT_RESTAURANT = '@quickRewards/SELECT_RESTAURANT';

export const setSelectedRestaurant = rest => ({
  type: SELECT_RESTAURANT,
  payload: rest,
});

export const GET_ELIGIBLE_REWARDS_WITH_RESTAURANT = createAsyncActionType(
  '@quickRewards/GET_ELIGIBLE_REWARDS_WITH_RESTAURANT',
);

export const getEligibleRewardsListWithRestaurant = (selectRest, searchString) => async (
  dispatch,
  getState,
) => {
  const state = getState();
  const name = getAuthenticatedUserName(state);
  const locale = getLocale(state);
  const isReview = Boolean(selectRest.campaigns || selectRest.activeCampaignsCount);

  dispatch({ type: GET_ELIGIBLE_REWARDS_WITH_RESTAURANT.START });

  try {
    const objChild = await getAuthorsChildWobjects(
      selectRest.author_permlink,
      0,
      50,
      locale,
      '',
      name,
      searchString,
    );
    const objCampaings =
      isReview &&
      (await getAllCampaingForRequiredObject({
        requiredObject: selectRest.author_permlink,
        limit: 50,
      }));

    return dispatch({
      type: GET_ELIGIBLE_REWARDS_WITH_RESTAURANT.SUCCESS,
      payload: isReview
        ? uniqBy([...objCampaings.wobjects, ...objChild], 'author_permlink')
        : objChild,
    });
  } catch (e) {
    return dispatch({ type: GET_ELIGIBLE_REWARDS_WITH_RESTAURANT.ERROR });
  }
};

export const CREATE_QUICK_POST = '@quickRewards/CREATE_QUICK_POST';

export const createQuickPost = (userBody, topics, images, reservationPermlink) => async (
  dispatch,
  getState,
) => {
  const state = getState();
  const author = getAuthenticatedUserName(state);
  const beneficiaries = getBeneficiariesUsers(state);
  const restaurant = getSelectedRestaurant(state);
  const dish = getSelectedDish(state);
  const host = getCurrentHost(state);
  const isReview = restaurant.campaigns && dish.propositions;
  const campaignId = isReview ? get(dish, 'propositions[0]._id') : null;
  const imagesLink = images.map(img => `\n<center>![image]( ${img.src})</center>`).join('');
  const topicsLink = topics
    .map(tag => `\n[#${tag}](https://www.waivio.com/object/${tag})`)
    .join('');
  const title = `Review: ${getObjectName(restaurant)}, ${getObjectName(dish)}`;
  const body = `\n[${getObjectName(restaurant)}](${host}/object/${restaurant.author_permlink}),
    \n[${getObjectName(dish)}](${host}/object/${
    dish.author_permlink
  }) ${imagesLink} ${userBody} ${topicsLink}`;
  const postData = {
    title,
    body,
    permlink: kebabCase(title),
    parentPermlink: config[process.env.NODE_ENV].appName,
    parentAuthor: '',
    author,
    jsonMetadata: createPostMetadata(
      body,
      topics,
      {
        reservation_permlink: reservationPermlink,
        wobj: {
          wobjects: [
            {
              object_type: getObjectType(restaurant),
              objectName: getObjectName(restaurant),
              author_permlink: restaurant.author_permlink,
              percent: 50,
            },
            {
              object_type: getObjectType(dish),
              objectName: getObjectName(dish),
              author_permlink: dish.author_permlink,
              percent: 50,
            },
          ],
        },
      },
      null,
      campaignId,
      host,
    ),
  };

  await dispatch(
    createPost(postData, beneficiaries, isReview, get(dish, '.propositions[0]', null)),
  );
  await dispatch({ type: CREATE_QUICK_POST });
};

export const RESERVE_REWARD = createAsyncActionType('@quickRewards/RESERVE_REWARD');

export const reserveProposition = permlink => async (dispatch, getState, { steemConnectAPI }) => {
  const state = getState();
  const username = getAuthenticatedUserName(state);
  const dish = getSelectedDish(state);
  const proposition = dish.propositions[0];
  const proposedWobjName = getObjectName(dish);
  const proposedWobjAuthorPermlink = dish.author_permlink;
  const primaryObject = get(proposition, 'required_object');
  const currencyInfo = await getCurrentHivePrice();
  const amount = round(proposition.reward / currencyInfo.hiveCurrency, 3);
  const detailsBody = getDetailsBody({
    proposition,
    proposedWobjName,
    proposedWobjAuthorPermlink,
    primaryObjectName: proposition.required_object,
  });
  const commentOp = [
    'comment',
    {
      parent_author: proposition.guideName,
      parent_permlink: proposition.activation_permlink,
      author: username,
      permlink,
      title: 'Rewards reservations',
      body: `<p>User ${username} (@${username}) has reserved the rewards of ${amount} HIVE for a period of ${
        proposition.count_reservation_days
      } days to write a review of <a href="/object/${
        dish.author_permlink
      }">${proposedWobjName}</a>, <a href="/object/${
        primaryObject.author_permlink
      }">${getObjectName(primaryObject)}</a></p>${detailsBody}`,
      json_metadata: JSON.stringify({
        app: config.appName,
        waivioRewards: {
          type: 'waivio_assign_campaign',
          approved_object: proposedWobjAuthorPermlink,
          currencyId: currencyInfo.id,
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
          type: RESERVE_REWARD.START,
        }),
      )
      .catch(error => reject(error));
  });
};

export default null;
