import React from 'react';
import { PieChart } from 'react-easy-chart';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import classNames from 'classnames';
import './UserAccuracyChart.less';

const UserAccuracyChart = ({ period, value }) => {
  return (
    <div className="UserAccuracyChart">
      <PieChart
        size={100}
        innerHoleSize={80}
        data={[
          { key: `success${period}`, value: value, color: '#54d2a0' },
          { key: `unsuccess${period}`, value: 100 - value, color: '#d9534f' },
        ]}
      />
      <div
        className={classNames('UserAccuracyChart__value', {
          success: value > 50,
          unsuccess: value < 50,
        })}
      >{`${value}%`}</div>
    </div>
  );
};

UserAccuracyChart.propTypes = {
  period: PropTypes.string.isRequired,
};

export default injectIntl(UserAccuracyChart);
