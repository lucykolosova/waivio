import React from 'react';
import { injectIntl } from 'react-intl';
import UserStatisticContainer from './UserStatisticContainer/UserStatisticContainer';
import './UserStatistics.less';

const UserStatistics = () => {
  const mockObj = {
    d1: {
      percent: 89,
      pips: 1222,
      counts: { pos: 12, neg: 5 },
    },
    d7: {
      percent: 38,
      pips: 1222,
      counts: { pos: 12, neg: 5 },
    },
    m1: {
      percent: 54,
      pips: 1222,
      counts: { pos: 12, neg: 5 },
    },
    m12: {
      percent: 24,
      pips: 1222,
      counts: { pos: 12, neg: 5 },
    },
  };
  return (
    <div>
      <UserStatisticContainer accuracy={mockObj} contentType={'forecast'} />
    </div>
  );
};

export default injectIntl(UserStatistics);
