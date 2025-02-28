import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { startCase } from 'lodash';
import { injectIntl, FormattedMessage, FormattedNumber } from 'react-intl';
import { message } from 'antd';
import SteemConnect from '../../steemConnectAPI';
import { reload } from '../../../store/authStore/authActions';
import Action from '../../components/Button/Action';
import { getAuthenticatedUser } from '../../../store/authStore/authSelectors';
import '../../components/Sidebar/SidebarContentBlock.less';
import { claimRewards } from '../../../store/walletStore/walletActions';

import './ClaimRewardsBlock.less';

@injectIntl
@connect(
  state => ({
    user: getAuthenticatedUser(state),
  }),
  {
    reload,
    claimRewards,
  },
)
class ClaimRewardsBlock extends Component {
  static propTypes = {
    user: PropTypes.shape(),
    intl: PropTypes.shape().isRequired,
    reload: PropTypes.func.isRequired,
    claimRewards: PropTypes.func.isRequired,
  };

  static defaultProps = {
    user: {},
  };

  state = {
    loading: false,
    rewardClaimed: false,
  };

  componentDidMount() {
    this.props.reload();
  }

  handleClaimRewards = () => {
    const { user } = this.props;
    const {
      name,
      reward_hive_balance: hiveBalance,
      reward_hbd_balance: hbdBalance,
      reward_vesting_balance: vestingBalance,
    } = user;

    this.setState({
      loading: true,
    });

    this.props.claimRewards();

    SteemConnect.claimRewardBalance(name, hiveBalance, hbdBalance, vestingBalance)
      .then(() =>
        this.setState({
          loading: false,
          rewardClaimed: true,
        }),
      )
      .catch(e => {
        this.setState({
          loading: false,
        });

        message.error(e.error_description);
      });
  };

  renderReward = (value, currency, rewardField) => (
    <div className="ClaimRewardsBlock__reward">
      <span className="ClaimRewardsBlock__reward__field">
        <FormattedMessage
          id={rewardField}
          defaultMessage={startCase(rewardField.replace('_', ''))}
        />
      </span>
      <span className="ClaimRewardsBlock__reward__value">
        <FormattedNumber value={value} minimumFractionDigits={3} maximumFractionDigits={3} />
        {` ${currency}`}
      </span>
    </div>
  );

  render() {
    const { user, intl } = this.props;
    const { rewardClaimed } = this.state;
    const rewardHive = parseFloat(user.reward_hive_balance);
    const rewardHbd = parseFloat(user.reward_hbd_balance);
    const rewardHP = parseFloat(user.reward_vesting_hive);
    const userHasRewards = rewardHive > 0 || rewardHbd > 0 || rewardHP > 0;

    const buttonText = rewardClaimed
      ? intl.formatMessage({
          id: 'reward_claimed',
          defaultMessage: 'Reward Claimed',
        })
      : intl.formatMessage({
          id: 'claim_rewards',
          defaultMessage: 'Claim Rewards',
        });

    if (!userHasRewards || rewardClaimed) return null;

    return (
      <div className="SidebarContentBlock ClaimRewardsBlock">
        <h4 className="SidebarContentBlock__title">
          <i className="iconfont icon-ranking SidebarContentBlock__icon" />{' '}
          <FormattedMessage id="rewards" defaultMessage="Rewards" />
        </h4>
        <div className="SidebarContentBlock__content">
          {!rewardClaimed && (
            <div>
              {rewardHive > 0 && this.renderReward(rewardHive, 'HIVE', 'hive')}
              {rewardHbd > 0 && this.renderReward(rewardHbd, 'HBD', 'steem_dollar')}
              {rewardHP > 0 && this.renderReward(rewardHP, 'HP', 'steem_power')}
            </div>
          )}
          <Action
            primary
            big
            disabled={rewardClaimed}
            loading={this.state.loading}
            style={{ width: '100%' }}
            onClick={this.handleClaimRewards}
          >
            {buttonText}
          </Action>
        </div>
      </div>
    );
  }
}

export default ClaimRewardsBlock;
