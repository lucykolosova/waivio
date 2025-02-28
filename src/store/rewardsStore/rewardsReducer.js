import { uniqWith, isEqual, get } from 'lodash';
import {
  SET_DATA_FOR_GLOBAL_REPORT,
  SET_DATA_FOR_SINGLE_REPORT,
  GET_REWARDS_GENERAL_COUNTS,
  GET_FOLLOWING_SPONSORS_REWARDS,
  CLEAR_FOLLOWING_SPONSORS_REWARDS,
  GET_FRAUD_SUSPICION,
  GET_REWARDS_HISTORY,
  GET_MORE_REWARDS_HISTORY,
  SET_TOGGLE_FLAG,
  REMOVE_TOGGLE_FLAG,
  CHECK_EXPIRED_PAYMENTS,
  GET_MATCH_BOTS,
  CLEAR_MATCH_BOTS,
} from './rewardsActions';
import { GET_RESERVED_COMMENTS_SUCCESS } from '../commentsStore/commentsActions';

const initialState = {
  singleReportData: {},
  globalReportData: {},
  tabType: '',
  hasReceivables: '',
  countTookPartCampaigns: 0,
  createdCampaignsCount: 0,
  reservedComments: {},
  followingRewards: [],
  hasMoreFollowingRewards: false,
  loading: false,
  fraudSuspicionData: [],
  hasMoreFraudSuspicionData: false,
  isLoadingRewardsHistory: false,
  campaignNames: [],
  historyCampaigns: [],
  historySponsors: [],
  hasMoreHistory: false,
  isOpenWriteReviewModal: false,
  expiredPayment: false,
  matchBots: [],
};

const rewardsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_DATA_FOR_SINGLE_REPORT.ACTION:
      return {
        ...state,
        singleReportData: action.payload,
      };
    case SET_DATA_FOR_GLOBAL_REPORT.ACTION:
      return {
        ...state,
        globalReportData: action.payload,
      };
    case GET_REWARDS_GENERAL_COUNTS.SUCCESS: {
      return {
        ...state,
        tabType: action.payload.tabType,
        hasReceivables: action.payload.has_receivable,
        countTookPartCampaigns: action.payload.count_took_part_campaigns,
        createdCampaignsCount: action.payload.count_campaigns,
      };
    }
    case GET_RESERVED_COMMENTS_SUCCESS: {
      return {
        ...state,
        reservedComments: action.payload.content,
      };
    }
    case GET_FOLLOWING_SPONSORS_REWARDS.START: {
      return {
        ...state,
        loading: true,
      };
    }
    case GET_FOLLOWING_SPONSORS_REWARDS.SUCCESS: {
      const { campaigns, hasMore } = action.payload;

      return {
        ...state,
        loading: false,
        followingRewards: state.followingRewards.concat(campaigns),
        hasMoreFollowingRewards: hasMore,
      };
    }
    case CLEAR_FOLLOWING_SPONSORS_REWARDS.ACTION: {
      return {
        ...state,
        followingRewards: [],
      };
    }
    case GET_FRAUD_SUSPICION.START: {
      return {
        ...state,
        loading: true,
      };
    }
    case GET_FRAUD_SUSPICION.SUCCESS: {
      const { campaigns, hasMore } = action.payload;

      return {
        ...state,
        loading: false,
        fraudSuspicionData: hasMore ? state.fraudSuspicionData.concat(campaigns) : campaigns,
        hasMoreFraudSuspicionData: hasMore,
      };
    }
    case GET_REWARDS_HISTORY.START: {
      return {
        ...state,
        isLoadingRewardsHistory: true,
      };
    }
    case GET_REWARDS_HISTORY.SUCCESS: {
      return {
        ...state,
        isLoadingRewardsHistory: false,
        campaignNames: action.payload.campaigns_names,
        historyCampaigns: action.payload.campaigns,
        historySponsors: action.payload.sponsors,
        hasMoreHistory: action.payload.hasMore,
      };
    }
    case GET_REWARDS_HISTORY.ERROR: {
      return {
        ...state,
        isLoadingRewardsHistory: false,
      };
    }
    case GET_MORE_REWARDS_HISTORY.START: {
      return {
        ...state,
        isLoadingRewardsHistory: true,
      };
    }
    case GET_MORE_REWARDS_HISTORY.SUCCESS: {
      const currentRewardsHistory = get(state, 'historyCampaigns', []);
      const currentHistorySponsors = get(state, 'sponsors', []);

      return {
        ...state,
        isLoadingRewardsHistory: false,
        historyCampaigns: uniqWith(currentRewardsHistory.concat(action.payload.campaigns), isEqual),
        campaignNames: action.payload.campaigns_names,
        historySponsors: uniqWith(currentHistorySponsors.concat(action.payload.sponsors), isEqual),
        hasMoreHistory: action.payload.hasMore,
      };
    }
    case GET_MORE_REWARDS_HISTORY.ERROR: {
      return {
        ...state,
        isLoadingRewardsHistory: false,
      };
    }
    case SET_TOGGLE_FLAG: {
      return {
        ...state,
        isOpenWriteReviewModal: true,
      };
    }
    case REMOVE_TOGGLE_FLAG: {
      return {
        ...state,
        isOpenWriteReviewModal: false,
      };
    }
    case CHECK_EXPIRED_PAYMENTS.SUCCESS: {
      return {
        ...state,
        expiredPayment: action.payload,
      };
    }
    case GET_MATCH_BOTS.SUCCESS: {
      return {
        ...state,
        matchBots: action.payload,
      };
    }
    case CLEAR_MATCH_BOTS:
    case GET_MATCH_BOTS.ERROR: {
      return {
        ...state,
        matchBots: [],
      };
    }
    default:
      return state;
  }
};

export default rewardsReducer;
