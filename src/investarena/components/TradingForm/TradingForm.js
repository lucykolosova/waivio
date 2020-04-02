import React from 'react';
import PropTypes from 'prop-types';
import { message } from 'antd';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import classNames from 'classnames';
import TradeButton from '../TradeButton';
import withTrade from '../HOC/withTrade';
import { getAmountValue } from '../../platform/platformHelper';
import './TradingForm.less';

const TradingForm = ({
  amount,
  totalPrice,
  isAmountValid,
  caller,
  side,
  fees,
  quoteSettings,
  isWalletsExist,
  platformName,
  wallet,
  handleKeyPressInput,
  handleChangeInput,
  createMarketOrder,
}) => {
  const { baseCurrency, termCurrency } = quoteSettings;
  const feeCurrency = side === 'buy' ? baseCurrency : termCurrency;

  const handleTradeButtonClick = () => {
    if (isAmountValid && isWalletsExist) {
      createMarketOrder(side, amount, caller);
    } else if (!isAmountValid) {
      const amountValue = getAmountValue(amount);
      if (amountValue < quoteSettings.minimumQuantity) {
        message.error(`Minimum ${quoteSettings.minimumQuantity} ${baseCurrency}`);
      } else {
        message.error('Available balance is insufficient');
      }
    } else {
      message.error(`You don't have a ${baseCurrency} wallet`);
    }
  };
  return platformName !== 'widgets' ? (
    <div className={`st-trading-form ${side}`}>
      <div className="st-trading-form-header">
        <div className="flex-info-block">
          <i className="iconfont icon-prompt info-icon" />
          <FormattedMessage id="trading_form_available" defaultMessage="Available" />
          :&nbsp;&nbsp;
          <FormattedNumber value={wallet.balance} maximumSignificantDigits={6} />
          {` ${wallet.currency}`}
        </div>
      </div>

      <div className="st-trading-form-amount flex-info-block justify-content-center">
        <FormattedMessage id="trading_form_amount" defaultMessage="Amount" />
        :&nbsp;
        <div className={classNames('st-trading-form-amount__input', { danger: !isAmountValid })}>
          <input type="text" value={amount} onChange={handleChangeInput} onKeyPress={handleKeyPressInput} />
        </div>
        <span>{baseCurrency}</span>
      </div>

      <div className="st-trading-form__button-wrap">
        <TradeButton size="large" type={side} onClick={handleTradeButtonClick}>
          {`${amount} ${baseCurrency} ${side}`}
        </TradeButton>
      </div>

      <div className="st-trading-form-footer">
        <div className="flex-info-block">
          <i className="iconfont icon-prompt info-icon" />
          <FormattedMessage id="trading_form_total" defaultMessage="Total" />
          &nbsp;≈&nbsp;
          <span className="fw5">
            <FormattedNumber value={totalPrice} maximumSignificantDigits={ totalPrice > 1 ? 7 : 4 } />
            {` ${termCurrency}`}
          </span>
        </div>
        <div className="flex-info-block">
          <i className="iconfont icon-prompt info-icon" />
          <FormattedMessage id="trading_form_fee" defaultMessage="Fee" />
          &nbsp;≈&nbsp;
          <span className="fw5">
            <FormattedNumber value={fees.takerFee} maximumSignificantDigits={ fees.takerFee > 1 ? 5 : 4 } />
            {` ${feeCurrency}`}
          </span>
        </div>
      </div>
    </div>
  ) : null;
};

TradingForm.propTypes = {
  /* passed props */
  caller: PropTypes.string.isRequired,
  // quoteSecurity: PropTypes.string.isRequired, // pass to withTrade
  side: PropTypes.oneOf(['buy', 'sell']).isRequired,

  /* withTrade */
  amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  fees: PropTypes.shape({
    makerFee: PropTypes.number,
    takerFee: PropTypes.number,
  }).isRequired,
  totalPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  quoteSettings: PropTypes.shape({
    baseCurrency: PropTypes.string.isRequired,
    termCurrency: PropTypes.string.isRequired,
    minimumQuantity: PropTypes.number,
    maximumQuantity: PropTypes.number,
  }).isRequired,
  isWalletsExist: PropTypes.bool.isRequired,
  isAmountValid: PropTypes.bool.isRequired,
  platformName: PropTypes.string.isRequired,
  wallet: PropTypes.shape({
    id: PropTypes.string,
    value: PropTypes.number,
    name: PropTypes.string,
    balance: PropTypes.number,
    currency: PropTypes.string,
    logoName: PropTypes.string,
    logoUrl: PropTypes.string,
  }).isRequired,
  handleKeyPressInput: PropTypes.func.isRequired,
  handleChangeInput: PropTypes.func.isRequired,
  createMarketOrder: PropTypes.func.isRequired,
};

export default withTrade(TradingForm);
