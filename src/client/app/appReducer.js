import { LOCATION_CHANGE } from 'connected-react-router';
import { get } from 'lodash';
import * as appTypes from './appActions';
import * as postActions from '../post/postActions';
import { GET_USER_METADATA } from '../user/usersActions';

const initialState = {
  isFetching: false,
  isLoaded: false,
  rate: 0,
  trendingTopicsLoading: false,
  trendingTopics: [],
  rewardFund: {},
  bannerClosed: false,
  appUrl: 'https://crypto.investarena.com',
  usedLocale: null,
  translations: {},
  cryptosPriceHistory: {},
  showPostModal: false,
  currentShownPost: {},
  screenSize: 'large',
  isMobile: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_USER_METADATA.SUCCESS:
      if (action.payload && action.payload.settings && action.payload.settings.locale) {
        return { ...state, locale: action.payload.settings.locale };
      }
      return state;
    case appTypes.RATE_REQUEST.SUCCESS:
      return {
        ...state,
        rate: action.payload,
      };
    case postActions.GET_CONTENT.START:
      return {
        ...state,
        isFetching: true,
        isLoaded: false,
      };
    case postActions.GET_CONTENT.SUCCESS:
    case postActions.GET_CONTENT.ERROR:
      return {
        ...state,
        isFetching: false,
        isLoaded: true,
      };
    case appTypes.GET_REWARD_FUND_SUCCESS:
      return {
        ...state,
        rewardFund: {
          ...state.rewardFund,
          ...action.payload,
        },
      };
    case appTypes.GET_TRENDING_TOPICS_START:
      return {
        ...state,
        trendingTopicsLoading: true,
      };
    case appTypes.GET_TRENDING_TOPICS_SUCCESS:
      return {
        ...state,
        trendingTopicsLoading: false,
        trendingTopics: action.payload,
      };
    case appTypes.GET_TRENDING_TOPICS_ERROR:
      return {
        ...state,
        trendingTopicsLoading: false,
        trendingTopics: [],
      };
    case appTypes.CLOSE_BANNER:
      return {
        ...state,
        bannerClosed: true,
      };
    case appTypes.SET_APP_URL:
      return {
        ...state,
        appUrl: action.payload,
      };
    case appTypes.SET_USED_LOCALE:
      return {
        ...state,
        usedLocale: action.payload.id,
        translations: action.payload.translations,
      };
    case appTypes.SET_SCREEN_SIZE:
      return {
        ...state,
        screenSize: action.payload,
      };
    case appTypes.REFRESH_CRYPTO_PRICE_HISTORY:
      return {
        ...state,
        cryptosPriceHistory: {
          ...state.cryptosPriceHistory,
          [action.payload]: null,
        },
      };
    case appTypes.GET_CRYPTO_PRICE_HISTORY.SUCCESS: {
      const { symbol, usdPriceHistory, btcPriceHistory, priceDetails } = action.payload;
      return {
        ...state,
        cryptosPriceHistory: {
          ...state.cryptosPriceHistory,
          [symbol]: {
            usdPriceHistory,
            btcPriceHistory,
            priceDetails,
          },
        },
      };
    }
    case appTypes.SHOW_POST_MODAL:
      return {
        ...state,
        showPostModal: true,
        currentShownPost: action.payload,
      };
    case LOCATION_CHANGE:
    case appTypes.HIDE_POST_MODAL:
      return {
        ...state,
        showPostModal: false,
      };
    // eslint-disable-next-line no-case-declarations
    case appTypes.SET_IS_MOBILE:
      const agents = /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i;
      const isMobile = agents.test(navigator.userAgent);
      return {
        ...state,
        isMobile,
      };
    default:
      return state;
  }
};

export const getRate = state => state.rate;
export const getIsTrendingTopicsLoading = state => state.trendingTopicsLoading;
export const getRewardFund = state => state.rewardFund;
export const getTrendingTopics = state => state.trendingTopics;
export const getIsFetching = state => state.isFetching;
export const getIsBannerClosed = state => state.bannerClosed;
export const getAppUrl = state => state.appUrl;
export const getUsedLocale = state => state.usedLocale;
export const getScreenSize = state => state.screenSize;
export const getTranslations = state => state.translations;
export const getCryptosPriceHistory = state => state.cryptosPriceHistory;
export const getShowPostModal = state => state.showPostModal;
export const getCurrentShownPost = state => state.currentShownPost;
export const getIsMobile = state => state.isMobile;
export const getTranslationByKey = (state, key, defaultMessage = '') => get(getTranslations(state), key, defaultMessage);
