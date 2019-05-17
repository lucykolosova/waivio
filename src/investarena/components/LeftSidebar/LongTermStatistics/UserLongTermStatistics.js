import {Button} from "antd";
import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import './LongTermStatistics.less';
import * as ApiClient from '../../../../waivioApi/ApiClient';
import { getLongTermStatisticsForUser } from '../../../helpers/diffDateTime';

@injectIntl
class UserLongTermStatistics extends React.Component {
  static propTypes = {
    userName: PropTypes.string.isRequired,
    intl: PropTypes.shape().isRequired,
    withCompareButton: PropTypes.bool,
    toggleModalPerformance: PropTypes.func,
  };

  static defaultProps = {
    withCompareButton: false,
    toggleModalPerformance: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      longTermStatistics: {},
      loading: true,
    };
  }

  componentDidMount() {
    this.getUserLongTermStatistics(this.props)
  }

  getUserLongTermStatistics(props){
    ApiClient.getUserLongTermStatistics(props.userName).then(data => {
      if (data && !_.isError(data)) {
        const longTermStatistics = getLongTermStatisticsForUser(data, this.props.intl);
        if (!_.isEmpty(data)) {
          this.setState({ longTermStatistics, loading: false });
        } else {this.setState({ loading: false });}
      } else {
        this.setState({ loading: false });
      }
    });
  }

  render() {
    return !this.state.loading ? (
      <div className="InstrumentLongTermStatistics">
        <div className="InstrumentLongTermStatistics__title">{`Performance`}</div>
        <div>
          {!_.isEmpty(this.state.longTermStatistics) ? (
            <React.Fragment>
              {_.map(this.state.longTermStatistics, period => (
              <div className="PeriodStatisticsLine" key={`${period.price}${period.label}`}>
                <div className="PeriodStatisticsLine__periodName">{period.label}</div>
                <div
                  className={`PeriodStatisticsLine__value-${period.isUp ? 'success' : 'danger'}`}
                >
                  {period.price}
                </div>
              </div>
              ))}
              {this.props.withCompareButton && (
                <React.Fragment>
                  <Button className="button-compare" onClick={this.props.toggleModalPerformance}>
                    {this.props.intl.formatMessage({ id: 'compare', defaultMessage: 'Compare' })}
                  </Button>
                </React.Fragment>
              )}
            </React.Fragment>
          ) : (
            <div>{
              this.props.intl.formatMessage({
              id: 'unavailableStatisticsUser',
              defaultMessage: 'The user has not written posts with forecasts',
            })
              }
            </div>
          )}
        </div>
      </div>
    ) : (
      <div />
    );
  }
}

export default UserLongTermStatistics;
