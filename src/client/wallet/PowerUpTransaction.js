import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FormattedMessage, FormattedRelative } from 'react-intl';
import BTooltip from '../components/BTooltip';
import { epochToUTC } from '../helpers/formatter';

const PowerUpTransaction = ({ timestamp, amount, to, from }) => (
  <div className="UserWalletTransactions__transaction">
    <div className="UserWalletTransactions__icon-container">
      <i className="iconfont icon-flashlight_fill UserWalletTransactions__icon" />
    </div>
    <div className="UserWalletTransactions__content">
      <div className="UserWalletTransactions__content-recipient">
        <div>
          {to === from ? (
            <FormattedMessage id="powered_up" defaultMessage="Powered up " />
          ) : (
            <FormattedMessage
              id="powered_up_to"
              defaultMessage="Powered up {to} "
              values={{
                to: (
                  <Link to={`/@${to}`}>
                    <span className="username">{to}</span>
                  </Link>
                ),
              }}
            />
          )}
        </div>
        <span className="UserWalletTransactions__payout">{amount}</span>
      </div>
      <span className="UserWalletTransactions__timestamp">
        <BTooltip
          title={
            <span>
              <FormattedRelative value={epochToUTC(timestamp)} />
            </span>
          }
        >
          <span>
            <FormattedRelative value={epochToUTC(timestamp)} />
          </span>
        </BTooltip>
      </span>
    </div>
  </div>
);

PowerUpTransaction.propTypes = {
  timestamp: PropTypes.string.isRequired,
  amount: PropTypes.element.isRequired,
  to: PropTypes.string.isRequired,
  from: PropTypes.string.isRequired,
};

export default PowerUpTransaction;
