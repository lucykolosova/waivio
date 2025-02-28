import store from 'store';
import { createAction } from 'redux-actions';
import { reblogPost } from '../postsStore/postActions';

export const REBLOG_POST = '@reblog/REBLOG_POST';
export const REBLOG_POST_START = '@reblog/REBLOG_POST_START';
export const REBLOG_POST_SUCCESS = '@reblog/REBLOG_POST_SUCCESS';
export const REBLOG_POST_ERROR = '@reblog/REBLOG_POST_ERROR';

export const GET_REBLOGGED_LIST = '@reblog/GET_REBLOGGED_LIST';
const getRebloggedListAction = createAction(GET_REBLOGGED_LIST);

const storePostId = postId => {
  const reblogged = store.get('reblogged') || [];
  const newReblogged = [...reblogged, postId];

  store.set('reblogged', newReblogged);

  return newReblogged;
};

export const reblog = postId => (dispatch, getState, { steemConnectAPI }) => {
  const { auth, posts } = getState();
  const post = posts.list[postId];
  const author = post.guestInfo ? post.root_author : post.author;

  dispatch({
    type: REBLOG_POST,
    payload: {
      promise: steemConnectAPI.reblog(auth.user.name, author, post.permlink).then(result => {
        const list = storePostId(postId);

        dispatch(getRebloggedListAction(list));
        dispatch(reblogPost(postId, auth.user.name));

        if (window.gtag) window.gtag('event', 'reblog');

        return result;
      }),
    },
    meta: { postId },
  });
};

export const getRebloggedList = () => dispatch => {
  const list = store.get('reblogged') || [];

  dispatch(getRebloggedListAction(list));
};
