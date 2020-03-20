import { sortBy } from 'lodash';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Dropdown, Icon, Menu } from 'antd';
import {
  getPlatformNameState,
  getUserWalletState,
} from '../../../../investarena/redux/selectors/platformSelectors';
import CurrencyItem from '../../../wallet/CurrencyItem/CurrencyItem';
import { getUserStatistics } from '../../../../investarena/redux/actions/platformActions';
import './BrokerBalance.less';
import Loading from '../../Icon/Loading';

const BrokerBalance = ({ beaxyBalance, platformName, getStatistics }) => {
  const [initFirstCurrency, setInitFirstCurrency] = useState({});
  const [initSecondCurrency, setInitSecondCurrency] = useState({});
  const storageFirstItem = localStorage.getItem('firstCurrency');
  const storageSecondCurrency = localStorage.getItem('secondCurrency');
  useEffect(() => {
    if (beaxyBalance && !!beaxyBalance.length) {
      if (!storageFirstItem) {
        setInitFirstCurrency(beaxyBalance[0]);
      } else {
        setInitFirstCurrency(JSON.parse(storageFirstItem));
      }
      if (!storageSecondCurrency) {
        setInitSecondCurrency(beaxyBalance[1] ? beaxyBalance[1] : {});
      } else {
        setInitSecondCurrency(JSON.parse(storageSecondCurrency));
      }
    }
    if (platformName === 'beaxy' && !beaxyBalance.length) getStatistics();
  }, [beaxyBalance]);

  const setFirstCurrency = item => {
    localStorage.setItem('firstCurrency', JSON.stringify(item));
    setInitFirstCurrency(item);
  };

  const setSecondCurrency = item => {
    localStorage.setItem('secondCurrency', JSON.stringify(item));
    setInitSecondCurrency(item);
  };

  function currenciesMenu(setCurrency) {
    const filteredBalance = beaxyBalance.filter(
      item =>
        item.currency !== initFirstCurrency.currency &&
        item.currency !== initSecondCurrency.currency,
    );
    const sortedBalance = sortBy(filteredBalance, 'value').reverse();
    return (
      <Menu>
        {sortedBalance.map(item => (
          <Menu.Item key={`${item.id}`} onClick={() => setCurrency(item)}>
            <CurrencyItem item={item} isSmall />
          </Menu.Item>
        ))}
      </Menu>
    );
  }

  return (
    <div className="BrokerBalance">
      {beaxyBalance.length ? (
        <React.Fragment>
          <Dropdown
            overlayClassName="BrokerBalance__dropdown"
            placement="bottomCenter"
            overlay={currenciesMenu(setFirstCurrency)}
            trigger={['click']}
          >
            <div>
              <CurrencyItem item={initFirstCurrency} isSmall />
              <Icon type="down" />
            </div>
          </Dropdown>
          <Dropdown
            overlayClassName="BrokerBalance__dropdown"
            placement="bottomCenter"
            overlay={currenciesMenu(setSecondCurrency)}
            trigger={['click']}
          >
            <div>
              <CurrencyItem item={initSecondCurrency} isSmall />
              <Icon type="down" />
            </div>
          </Dropdown>
        </React.Fragment>
      ) : (
        <Loading />
      )}
    </div>
  );
};

BrokerBalance.propTypes = {
  beaxyBalance: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  platformName: PropTypes.string.isRequired,
  getStatistics: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  platformName: getPlatformNameState(state),
  beaxyBalance: getUserWalletState(state),
});

const mapDispatchToProps = dispatch => ({
  getStatistics: () => dispatch(getUserStatistics()),
});

export default connect(mapStateToProps, mapDispatchToProps)(BrokerBalance);
