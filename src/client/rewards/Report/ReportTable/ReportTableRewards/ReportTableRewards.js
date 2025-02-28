import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { map, filter, get, reduce, round } from 'lodash';
import { useSelector } from 'react-redux';
import ReportTableRewardsRow from '../ReportTableRewards/ReportTableRewardsRow';
import ReportTableRewardsRowTotal from './ReportTableRewardsRowTotal';
import { getSingleReportData } from '../../../../../store/rewardsStore/rewardsSelectors';

import './ReportTableRewards.less';

const ReportTableRewards = ({ intl, currencyInfo }) => {
  const singleReportData = useSelector(getSingleReportData);
  const reportUserName = get(singleReportData, ['user', 'name']);
  const getPayableInDollars = item => get(item, ['details', 'payableInDollars']);
  const filteredHistory = filter(
    singleReportData.histories,
    obj => obj.type === 'review' || obj.type === 'beneficiary_fee',
  ).sort((a, b) => getPayableInDollars(b) - getPayableInDollars(a));
  const totalUSD = Number(
    filteredHistory.reduce((sum, benef) => sum + getPayableInDollars(benef), 0),
  );
  const totalAmount = filteredHistory.reduce((sum, benef) => sum + benef.amount, 0);
  const totalHive = Number(totalAmount);

  const beneficiaries = reduce(
    filteredHistory,
    (acc, obj) => {
      const userName = get(obj, ['userName']);
      const ownHive = userName === reportUserName;

      return [
        ...acc,
        {
          id: get(obj, '_id'),
          account: get(obj, ['userName'], ''),
          weight: round((get(obj, ['amount']) * 100) / totalHive),
          votesAmount: get(obj, ['details', 'votesAmount'], 0),
          amount: get(obj, ['amount'], 0),
          payableInDollars: getPayableInDollars(obj),
          ownHive,
        },
      ];
    },
    [],
  );

  return (
    <React.Fragment>
      <div className="ReportTableRewards__header">
        <span>{intl.formatMessage({ id: 'user_rewards', defaultMessage: 'User rewards:' })}</span>
      </div>
      <table className="ReportTableRewards">
        <thead>
          <tr>
            <th className="ReportTableRewards maxWidth" rowSpan="2">
              {intl.formatMessage({
                id: 'post_beneficiaries',
                defaultMessage: 'Post beneficiaries',
              })}
            </th>
            <th className="ReportTableRewards basicWidth">
              {intl.formatMessage({ id: 'shares', defaultMessage: `Shares` })}
            </th>
            <th className="ReportTableRewards basicWidth">
              {intl.formatMessage({ id: 'hive_power', defaultMessage: `Hive** Power` })}
            </th>
            <th className="ReportTableRewards basicWidth">
              {intl
                .formatMessage({
                  id: 'hive',
                  defaultMessage: 'HIVE',
                })
                .toUpperCase()}
            </th>
            <th className="ReportTableRewards basicWidth">
              {intl.formatMessage({
                id: 'total_hive)',
                defaultMessage: 'Total (HIVE)',
              })}
            </th>
            <th className="ReportTableRewards basicWidth">
              {intl.formatMessage({
                id: 'total_usd',
                defaultMessage: 'Total*',
              })}{' '}
              ({currencyInfo.type})
            </th>
          </tr>
        </thead>
        <tbody>
          {map(beneficiaries, beneficiary => (
            <ReportTableRewardsRow key={beneficiary.id} {...beneficiary} />
          ))}
          <ReportTableRewardsRowTotal totalUSD={totalUSD} totalHive={totalHive} />
        </tbody>
      </table>
    </React.Fragment>
  );
};

ReportTableRewards.propTypes = {
  intl: PropTypes.shape().isRequired,
  currencyInfo: PropTypes.shape({
    type: PropTypes.string,
    rate: PropTypes.number,
  }).isRequired,
};

export default injectIntl(ReportTableRewards);
