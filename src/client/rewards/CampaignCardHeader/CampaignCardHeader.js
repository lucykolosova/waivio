import React from 'react';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { get, includes, round } from 'lodash';
import { useSelector } from 'react-redux';

import { getCurrentCurrency } from '../../store/appStore/appSelectors';
import Avatar from '../../components/Avatar';
import { GUIDE_HISTORY, MESSAGES, HISTORY, ASSIGNED } from '../../../common/constants/rewards';
import { getCurrentUSDPrice } from '../rewardsHelper';

import './CampaignCardHeader.less';

const CampaignCardHeader = ({ intl, campaignData, match, isWobjAssigned, wobjPrice }) => {
  const currentUSDPrice = getCurrentUSDPrice();
  const currencyInfo = useSelector(getCurrentCurrency);
  const price = get(campaignData, ['objects', '0', 'reward']) || wobjPrice;
  const isAssigned = get(campaignData, ['objects', '0', ASSIGNED]) || isWobjAssigned;
  const campainReward = get(campaignData, 'reward', 0);
  const isMessages =
    match &&
    (includes(match.url, HISTORY) ||
      includes(match.url, GUIDE_HISTORY) ||
      includes(match.url, MESSAGES));
  const rewardPriceHive = `${
    price ? round(price, 3) : round(campainReward / currentUSDPrice, 3)
  } HIVE`;
  const rewardPriceUsd = `${round(campainReward * currencyInfo.rate, 2)} ${currencyInfo.type}`;
  const rewardPrice = isAssigned || isMessages ? rewardPriceHive : rewardPriceUsd;

  return (
    <React.Fragment>
      <div className="CampaignCardHeader">
        <div className="CampaignCardHeader__name">
          {intl.formatMessage({
            id: 'rewards_details_reward_for_reviews',
            defaultMessage: 'Reward for reviews',
          })}
        </div>
        <div className="CampaignCardHeader__data">
          <span className="CampaignCardHeader__name-earn">
            {intl.formatMessage({
              id: 'rewards_details_earn',
              defaultMessage: 'Earn',
            })}{' '}
          </span>
          <span className="CampaignCardHeader__data-colored">
            <span className="fw6">{rewardPrice}</span>
          </span>
        </div>
      </div>
      <div className="user-info">
        <Link to={`/@${campaignData.guide.name}`}>
          <Avatar username={campaignData.guide.name} size={44} />
        </Link>
        <div className="user-info__content">
          <Link to={`/@${campaignData.guide.name}`} title={campaignData.guide.name}>
            <div className="username">
              {campaignData.guide.alias} (
              {intl.formatMessage({ id: 'sponsor', defaultMessage: 'Sponsor' })})
            </div>
            <div className="username">{`@${campaignData.guide.name}`}</div>
          </Link>
          <div className="total-paid">
            <div className="total-paid__liquid">
              {intl.formatMessage({
                id: 'total_paid_liquid',
                defaultMessage: 'Total paid (liquid)',
              })}
              :
            </div>
            <div className="total-paid__currency">
              {`${round(get(campaignData, 'guide.totalPayed'))} HIVE`}{' '}
              {`(${
                campaignData.guide.liquidHivePercent ? campaignData.guide.liquidHivePercent : 'n/a'
              }%)`}
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

CampaignCardHeader.propTypes = {
  intl: PropTypes.shape().isRequired,
  campaignData: PropTypes.shape().isRequired,
  match: PropTypes.shape(),
  isWobjAssigned: PropTypes.bool,
  wobjPrice: PropTypes.number,
};

CampaignCardHeader.defaultProps = {
  isWobjAssigned: false,
  wobjPrice: 0,
  match: {},
};

export default injectIntl(CampaignCardHeader);
