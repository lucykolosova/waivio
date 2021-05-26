import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Form } from 'antd';
import { injectIntl } from 'react-intl';
import { round, map, isEmpty } from 'lodash';
import moment from 'moment';
import { Link } from 'react-router-dom';

import { openWalletTable, closeWalletTable } from '../../store/walletStore/walletActions';
import TableFilter from './TableFilter';
import {
  getCurrentDeposits,
  getCurrentWithdrawals,
  getTotalVestingFundSteem,
  getTotalVestingShares,
} from '../../store/walletStore/walletSelectors';
import { getLocale } from '../../store/settingsStore/settingsSelectors';
import {
  getUserTableTransactions,
  getMoreTableUserTransactionHistory,
} from '../../store/advancedReports/advancedActions';
import compareTransferBody from './common/helpers';
import {
  getTransactions,
  getTransactionsHasMore,
  getTransfersLoading,
} from '../../store/advancedReports/advancedSelectors';
import DynamicTbl from '../../components/Tools/DynamicTable/DynamicTable';
import { configReportsWebsitesTableHeader } from './common/tableConfig';
import Loading from '../../components/Icon/Loading';

import './WalletTable.less';

@Form.create()
@injectIntl
@connect(
  state => ({
    totalVestingShares: getTotalVestingShares(state),
    totalVestingFundSteem: getTotalVestingFundSteem(state),
    hasMore: getTransactionsHasMore(state),
    locale: getLocale(state),
    deposits: getCurrentDeposits(state),
    withdrawals: getCurrentWithdrawals(state),
    transactionsList: getTransactions(state),
    loading: getTransfersLoading(state),
  }),
  {
    openTable: openWalletTable,
    closeTable: closeWalletTable,
    getUserTableTransactions,
    getMoreTableUserTransactionHistory,
  },
)
class WalletTableRes extends React.Component {
  static propTypes = {
    intl: PropTypes.shape({
      formatMessage: PropTypes.func.isRequired,
    }).isRequired,
    match: PropTypes.shape({
      params: PropTypes.shape({
        name: PropTypes.string,
      }),
    }).isRequired,
    totalVestingShares: PropTypes.string.isRequired,
    totalVestingFundSteem: PropTypes.string.isRequired,
    openTable: PropTypes.func.isRequired,
    closeTable: PropTypes.func.isRequired,
    hasMore: PropTypes.bool,
    form: PropTypes.shape({
      setFieldsValue: PropTypes.func,
      validateFieldsAndScroll: PropTypes.func,
      getFieldDecorator: PropTypes.func,
    }).isRequired,
    locale: PropTypes.string.isRequired,
    deposits: PropTypes.number,
    withdrawals: PropTypes.number,
    getUserTableTransactions: PropTypes.func.isRequired,
    getMoreTableUserTransactionHistory: PropTypes.func.isRequired,
    transactionsList: PropTypes.arrayOf(PropTypes.shape({})),
    loading: PropTypes.bool,
  };

  static defaultProps = {
    hasMore: false,
    deposits: 0,
    withdrawals: 0,
    transactionsList: [],
    loading: false,
  };

  state = {
    isEmptyPeriod: true,
    filterAccounts: [this.props.match.params.name],
  };

  componentDidMount() {
    const { filterAccounts } = this.state;

    this.props.openTable();
    this.props.form.setFieldsValue({ filterAccounts });
    this.props.getUserTableTransactions(filterAccounts);
  }

  componentWillUnmount() {
    this.props.closeTable();
  }

  handleSubmit = () => {
    const { startDate, endDate, filterAccounts } = this.state;

    return this.props.getUserTableTransactions(filterAccounts, startDate, endDate);
  };

  handleOnClick = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll(err => !err && this.handleSubmit());
  };

  deleteUserFromFilterAccounts = user => {
    this.setState(
      preState => ({
        filterAccounts: preState.filterAccounts.filter(acc => acc !== user),
      }),
      () => this.props.form.setFieldsValue({ filterAccounts: this.state.filterAccounts }),
    );
  };

  handleSelectUserFilterAccounts = user =>
    this.setState(preState => ({
      filterAccounts: [...preState.filterAccounts, user.account],
    }));

  handleLoadMore = () => {
    const { startDate, endDate, filterAccounts } = this.state;

    this.props.getMoreTableUserTransactionHistory({
      filterAccounts,
      startDate,
      endDate,
    });
  };

  render() {
    const { match, intl, locale, form, transactionsList } = this.props;
    const mappedList = map(transactionsList, transaction =>
      compareTransferBody(
        transaction,
        this.props.totalVestingShares,
        this.props.totalVestingFundSteem,
      ),
    );

    return (
      <React.Fragment>
        <Link to={`/@${match.params.name}/transfers`} className="WalletTable__back-btn">
          {intl.formatMessage({
            id: 'table_back',
            defaultMessage: 'Back',
          })}
        </Link>
        <h3>
          {intl.formatMessage({
            id: 'table_view',
            defaultMessage: 'Advanced reports',
          })}
        </h3>
        <TableFilter
          intl={intl}
          filterUsersList={this.state.filterAccounts}
          locale={locale}
          getFieldDecorator={form.getFieldDecorator}
          handleOnClick={this.handleOnClick}
          handleSelectUser={this.handleSelectUserFilterAccounts}
          isloadingTableTransactions={this.props.loading}
          deleteUser={this.deleteUserFromFilterAccounts}
          changeEndDate={value => {
            const date = moment(value);
            const isToday =
              date.startOf('day').unix() ===
              moment()
                .startOf('day')
                .unix();
            const endDate = isToday ? moment().unix() : date.endOf('day').unix();

            this.setState({ endDate });
          }}
          changeStartDate={value =>
            this.setState({
              startDate: moment(value)
                .startOf('day')
                .unix(),
            })
          }
        />
        <div className="WalletTable__total">
          {intl.formatMessage({
            id: 'total',
            defaultMessage: 'TOTAL',
          })}
          :{' '}
          {intl.formatMessage({
            id: 'Deposits',
            defaultMessage: 'Deposits',
          })}
          : <b>${round(this.props.deposits, 3)}</b>.{' '}
          {intl.formatMessage({
            id: 'Withdrawals',
            defaultMessage: 'Withdrawals',
          })}
          : <b>${round(this.props.withdrawals, 3)}</b>.
        </div>
        {this.props.loading && isEmpty(mappedList) ? (
          <Loading />
        ) : (
          <DynamicTbl
            infinity
            header={configReportsWebsitesTableHeader}
            bodyConfig={mappedList}
            showMore={this.props.hasMore}
            handleShowMore={this.handleLoadMore}
            emptyTitle={intl.formatMessage({
              id: 'empty_table_transaction_list',
              defaultMessage: `You did not have any transactions during this period`,
            })}
          />
        )}
      </React.Fragment>
    );
  }
}

export default WalletTableRes;
