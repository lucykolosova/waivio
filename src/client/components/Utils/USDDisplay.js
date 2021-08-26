import React from 'react';
import PropTypes from 'prop-types';
import { FormattedNumber } from 'react-intl';
import { useSelector } from 'react-redux';
import { round } from 'lodash';

import { getCurrentCurrency } from '../../../store/appStore/appSelectors';
import { currencyPrefix } from '../../websites/constants/currencyTypes';

const USDDisplay = ({ value, currencyDisplay, style }) => {
  const currencyInfo = useSelector(getCurrentCurrency);
  const negative = value < 0;
  const absValue = Math.abs(value);
  const precision = absValue > 0.01 || absValue === 0 ? 2 : 3;
  const sum = round(absValue * currencyInfo.rate, precision).toFixed(precision);
  const formattedCurrency = num => {
    switch (currencyDisplay) {
      case 'code':
        return (
          <React.Fragment>
            <FormattedNumber value={num} locale={'en-IN'} /> {currencyInfo.type}
          </React.Fragment>
        );
      case 'symbol':
        return (
          <React.Fragment>
            {currencyPrefix[currencyInfo.type]} <FormattedNumber value={num} locale={'en-IN'} />
          </React.Fragment>
        );
      default:
        return num;
    }
  };

  return (
    <span style={style} title={sum}>
      {negative && '-'}
      {formattedCurrency(sum)}
    </span>
  );
};

USDDisplay.propTypes = {
  value: PropTypes.number,
  currencyDisplay: PropTypes.string,
  style: PropTypes.shape({}),
};

USDDisplay.defaultProps = {
  value: 0,
  currencyDisplay: 'code',
  style: {},
};

export default USDDisplay;
