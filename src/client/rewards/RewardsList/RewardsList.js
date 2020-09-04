import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { map, isEmpty } from 'lodash';
import { getFollowingSponsorsRewards } from '../rewardsActions';
import Campaign from '../Campaign/Campaign';
import {
  getAuthenticatedUserName,
  getSponsorsRewards,
  getHasMoreFollowingRewards,
  getIsLoading,
} from '../../reducers';
import Loading from '../../components/Icon/Loading';
import ReduxInfiniteScroll from '../../vendor/ReduxInfiniteScroll';
import './RewardsList.less';

const RewardsList = ({
  intl,
  userName,
  getFollowingRewards,
  followingRewards,
  hasMoreFollowingRewards,
  loading,
}) => {
  useEffect(() => {
    if (userName) getFollowingRewards(userName);
  }, [userName]);

  const handleLoadMore = () => {
    if (hasMoreFollowingRewards) {
      getFollowingRewards(userName);
    }
  };
  const content = useMemo(() => {
    if (!isEmpty(followingRewards)) {
      return (
        <React.Fragment>
          <ReduxInfiniteScroll
            elementIsScrollable={false}
            hasMore={hasMoreFollowingRewards}
            loadMore={handleLoadMore}
            loadingMore={loading}
            loader={<Loading />}
          >
            {map(followingRewards, reward => (
              <Campaign
                proposition={reward}
                key={`${reward.required_object.author_permlink}${reward.required_object.createdAt}`}
                filterKey={'all'}
                userName={userName}
              />
            ))}
          </ReduxInfiniteScroll>
        </React.Fragment>
      );
    } else if (isEmpty(followingRewards) && !loading) {
      return (
        <div className="RewardsList__message">
          {intl.formatMessage({
            id: 'no_rewards_posted_by_sponsors_you_are_following',
            defaultMessage: 'No rewards posted by the sponsors you are following',
          })}
        </div>
      );
    }
    return <Loading />;
  }, [followingRewards, loading]);
  return (
    <React.Fragment>
      <div className="RewardsList">
        <span className="RewardsList__title">
          {intl.formatMessage({
            id: 'rewards_from_sponsors_you_are_following',
            defaultMessage: 'Rewards from the sponsors you are following:',
          })}
        </span>
        {content}
      </div>
    </React.Fragment>
  );
};

RewardsList.propTypes = {
  intl: PropTypes.shape().isRequired,
  userName: PropTypes.string,
  getFollowingRewards: PropTypes.func,
  hasMoreFollowingRewards: PropTypes.bool,
  loading: PropTypes.bool,
  followingRewards: PropTypes.arrayOf(PropTypes.shape()),
};

RewardsList.defaultProps = {
  userName: '',
  followingRewards: [],
  hasMoreFollowingRewards: false,
  loading: false,
  getFollowingRewards: () => {},
};

export default connect(
  state => ({
    userName: getAuthenticatedUserName(state),
    followingRewards: getSponsorsRewards(state),
    hasMoreFollowingRewards: getHasMoreFollowingRewards(state),
    loading: getIsLoading(state),
  }),
  {
    getFollowingRewards: getFollowingSponsorsRewards,
  },
)(injectIntl(RewardsList));
