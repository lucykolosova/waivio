import React from 'react';
import { connect } from 'react-redux';
import { isEmpty, get } from 'lodash';
import PropTypes from 'prop-types';

import WalletSummaryInfo from '../WalletSummaryInfo/WalletSummaryInfo';
import Loading from '../../components/Icon/Loading';
import {
  getSwapTokensBalanceList,
  getTokensBalanceList,
} from '../../../store/walletStore/walletSelectors';
import { getCryptosPriceHistory } from '../../../store/appStore/appSelectors';
import HiveEngineCurrencyItem from './HiveEngineCurrencyItem/HiveEngineCurrencyItem';

const HiveEngineSummaryInfo = props => {
  const combinedList = !isEmpty(props.tokensList)
    ? [...props.swapList, ...props.tokensList]
    : props.swapList;

  if (isEmpty(combinedList)) return <Loading />;

  const estAccValue = combinedList.reduce((acc, curr) => {
    const stake = curr.stake || 0;
    const balanceInUsd = (Number(curr.balance) + Number(stake)) * curr.rate * props.hiveRate;

    return acc + balanceInUsd;
  }, 0);

  return (
    <WalletSummaryInfo estAccValue={estAccValue}>
      {combinedList.map(token => (
        <HiveEngineCurrencyItem key={token.symbol} token={token} hiveRate={props.hiveRate} />
      ))}
    </WalletSummaryInfo>
  );
};

HiveEngineSummaryInfo.propTypes = {
  currencyInfo: PropTypes.shape({}).isRequired,
  tokensList: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  swapList: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  hiveRate: PropTypes.number.isRequired,
};

export default connect(state => {
  const cryptosPriceHistory = getCryptosPriceHistory(state);

  return {
    tokensList: getTokensBalanceList(state),
    hiveRate: get(cryptosPriceHistory, 'hive.usdPriceHistory.usd', null),
    swapList: getSwapTokensBalanceList(state),
  };
})(HiveEngineSummaryInfo);
