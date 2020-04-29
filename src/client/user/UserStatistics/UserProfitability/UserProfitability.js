import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { getAccuracyChartLoaded } from '../../../reducers';
import SkeletonCustom from '../../../components/Skeleton/SkeletonCustom';
import { noDataPlaceholder } from '../UserAccuracyContainer/UserAccuracyContainer';
import './UserProfitability.less';

const UserProfitability = ({ statisticsData, isChart }) => {
  const noData =
    statisticsData.successful_pips === 0 &&
    statisticsData.failed_pips === 0 &&
    statisticsData.neutral_count === 0;
  const nautral = statisticsData.neutral_count;
  const failed = statisticsData.failed_count;
  const successful = statisticsData.successful_count;

  const displayPips = () => {
    if (noData) {
      return <div className="no-data-wrapper">{noDataPlaceholder}</div>;
    } else if (nautral > 0 && successful === 0 && failed === 0) {
      return (
        <React.Fragment>
          <div className="neutral_pips">{`${statisticsData.pips}`}</div>
          <div className="neutral_pips__pips">pips</div>
        </React.Fragment>
      );
    }
    return (
      <div
        className={classNames('UserProfitability', {
          success: statisticsData.pips > 0,
          unsuccess: statisticsData.pips < 0,
        })}
      >
        {isChart ? (
          <React.Fragment>
            <div className="UserProfitability">
              <div className="UserProfitability__value">{`${statisticsData.pips}`}</div>
            </div>
            <div className="UserProfitability__profit">pips</div>
          </React.Fragment>
        ) : (
          <SkeletonCustom
            className="UserProfitability__loader"
            isLoading={!isChart}
            randomWidth
            rows={2}
            width={50}
          />
        )}
      </div>
    );
  };
  return displayPips();
};
UserProfitability.propTypes = {
  statisticsData: PropTypes.shape().isRequired,
  isChart: PropTypes.bool.isRequired,
};

export default connect(state => ({
  isChart: getAccuracyChartLoaded(state),
}))(UserProfitability);
