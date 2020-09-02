import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedRelative } from 'react-intl';
import { Link } from 'react-router-dom';
import BTooltip from '../components/BTooltip';
import Avatar from '../components/Avatar';
import { epochToUTC } from '../helpers/formatter';
import { selectCurrectFillOrderValue } from './WalletHelper';

const WalletFillOrderTransferred = ({
  transactionDetails,
  timestamp,
  currentPays,
  openPays,
  exchanger,
  currentUsername,
}) => {
  const url = `/@${exchanger}`;
  const currentOrderValue = selectCurrectFillOrderValue(
    transactionDetails,
    currentPays,
    openPays,
    currentUsername,
  );
  return (
    <React.Fragment>
      <div className="UserWalletTransactions__transaction">
        <div className="UserWalletTransactions__avatar">
          <Avatar username={exchanger} size={40} />
        </div>
        <div className="UserWalletTransactions__content">
          <div className="UserWalletTransactions__content-recipient">
            <div>
              <FormattedMessage
                id="exchange_with"
                defaultMessage="Exchange with {exchanger}"
                values={{
                  exchanger: (
                    <Link to={url}>
                      <span className="username">{exchanger}</span>
                    </Link>
                  ),
                }}
              />
            </div>
            <span className="UserWalletTransactions__transfer">
              {'- '}
              {currentOrderValue.transfer}
              &ensp;
              <span className="UserWalletTransactions__received">
                {'+ '}
                {currentOrderValue.received}
              </span>
            </span>
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
    </React.Fragment>
  );
};

WalletFillOrderTransferred.propTypes = {
  transactionDetails: PropTypes.shape().isRequired,
  timestamp: PropTypes.number,
  currentPays: PropTypes.element,
  openPays: PropTypes.element,
  exchanger: PropTypes.string,
  currentUsername: PropTypes.string,
};

WalletFillOrderTransferred.defaultProps = {
  timestamp: 0,
  currentPays: <span />,
  openPays: <span />,
  exchanger: '',
  currentUsername: '',
};

export default WalletFillOrderTransferred;
