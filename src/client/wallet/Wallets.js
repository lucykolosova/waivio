import React, { useEffect } from 'react';
import { Tabs } from 'antd';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Wallet from '../user/UserWallet';
import Transfer from './Transfer/Transfer';
import WAIVwallet from './WAIVwallet/WAIVwallet';
import { getTokenBalance, setWalletType } from '../../store/walletStore/walletActions';
import {
  getIsPowerUpOrDownVisible,
  getIsTransferVisible,
} from '../../store/walletStore/walletSelectors';
import { getCryptoPriceHistory } from '../../store/appStore/appActions';
import PowerUpOrDown from './PowerUpOrDown/PowerUpOrDown';

const Wallets = props => {
  const query = new URLSearchParams(props.location.search);
  const walletsType = query.get('type');

  useEffect(() => {
    props.setWalletType(walletsType);
    props.getTokenBalance('WAIV', props.match.params.name);
    props.getCryptoPriceHistory();
  }, []);

  const handleOnChange = key => {
    props.setWalletType(key);
    props.history.push(`?type=${key}`);
  };

  return (
    <React.Fragment>
      <Tabs defaultActiveKey={walletsType} onChange={handleOnChange}>
        <Tabs.TabPane tab="WAIV wallet" key="WAIV">
          <WAIVwallet />
        </Tabs.TabPane>
        <Tabs.TabPane tab="HIVE wallet" key="HIVE">
          <Wallet />
        </Tabs.TabPane>
      </Tabs>
      {props.visible && <Transfer history={props.history} />}
      {props.visiblePower && <PowerUpOrDown />}
    </React.Fragment>
  );
};

Wallets.propTypes = {
  setWalletType: PropTypes.func.isRequired,
  getCryptoPriceHistory: PropTypes.func.isRequired,
  getTokenBalance: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
  visiblePower: PropTypes.bool.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func,
  }).isRequired,
  location: PropTypes.shape({
    search: PropTypes.string,
  }).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      name: PropTypes.string,
    }),
  }).isRequired,
};

export default connect(
  state => ({
    visible: getIsTransferVisible(state),
    visiblePower: getIsPowerUpOrDownVisible(state),
  }),
  {
    setWalletType,
    getCryptoPriceHistory,
    getTokenBalance,
  },
)(Wallets);
