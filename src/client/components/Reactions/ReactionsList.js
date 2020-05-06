import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Scrollbars } from 'react-custom-scrollbars';
import InfiniteSroll from 'react-infinite-scroller';
import { take, isNil } from 'lodash';
import { FormattedNumber } from 'react-intl';
import UserCard from '../UserCard';
import USDDisplay from '../Utils/USDDisplay';
import { checkFollowing } from '../../../waivioApi/ApiClient';
import { followUser, unfollowUser } from '../../user/usersActions';

import './ReactionsList.less';
@connect(null, {
  unfollow: unfollowUser,
  follow: followUser,
})
export default class UserList extends React.Component {
  static propTypes = {
    votes: PropTypes.arrayOf(PropTypes.shape()),
    ratio: PropTypes.number,
    moderatorsList: PropTypes.arrayOf(PropTypes.string),
    adminsList: PropTypes.arrayOf(PropTypes.string),
    name: PropTypes.string,
    unfollow: PropTypes.func,
    follow: PropTypes.func,
  };

  static defaultProps = {
    votes: [],
    ratio: 0,
    moderatorsList: [],
    adminsList: [],
    name: '',
    unfollow: () => {},
    follow: () => {},
  };

  state = {
    page: 1,
    usersList: [],
  };

  componentDidMount() {
    const { votes, moderatorsList, adminsList, name } = this.props;
    checkFollowing(
      name,
      votes.map(vote => vote.voter),
    ).then(res => {
      const mappedList = votes.map(vote => {
        const follow = res.find(r => !isNil(r[vote.voter]));

        return {
          ...vote,
          name: vote.voter,
          admin: adminsList.includes(vote.voter),
          moderator: moderatorsList.includes(vote.voter),
          youFollows: follow[vote.voter],
          pending: false,
        };
      });
      const moderators = mappedList.filter(v => v.moderator);
      const admins = mappedList.filter(v => !v.moderator && v.admin);
      const users = mappedList.filter(v => !v.moderator && !v.admin);

      this.setState({ usersList: [...moderators, ...admins, ...users] });
    });
  }

  paginate = () => this.setState(prevState => ({ page: prevState.page + 1 }));

  followUser = user => {
    const usersList = [...this.state.usersList];
    const findUserIndex = usersList.findIndex(usr => user === usr.name);

    usersList.splice(findUserIndex, 1, {
      ...usersList[findUserIndex],
      pending: true,
    });

    this.setState({
      usersList,
    });
    this.props.follow(user).then(() => {
      usersList.splice(findUserIndex, 1, {
        ...usersList[findUserIndex],
        youFollows: true,
        pending: false,
      });

      this.setState({
        usersList,
      });
    });
  };

  unfollowUser = user => {
    const usersList = [...this.state.usersList];
    const findUserIndex = usersList.findIndex(usr => user === usr.name);

    usersList.splice(findUserIndex, 1, {
      ...usersList[findUserIndex],
      pending: true,
    });

    this.setState({
      usersList,
    });

    this.props.unfollow(user).then(() => {
      usersList.splice(findUserIndex, 1, {
        ...usersList[findUserIndex],
        youFollows: false,
        pending: false,
      });

      this.setState({
        usersList,
      });
    });
  };

  render() {
    const { votes, ratio } = this.props;
    const defaultPageItems = 20;
    const noOfItemsToShow = defaultPageItems * this.state.page;
    const voteValue = vote => (vote.rshares_weight || vote.rshares) * ratio || 0;

    return (
      <Scrollbars autoHide style={{ height: '400px' }}>
        <InfiniteSroll
          pageStart={0}
          loadMore={this.paginate}
          hasMore={votes.length > noOfItemsToShow}
          useWindow={false}
        >
          <div className="ReactionsList__content">
            {take(this.state.usersList, noOfItemsToShow).map(vote => (
              <UserCard
                key={vote.voter}
                user={vote}
                admin={vote.admin}
                moderator={vote.moderator}
                follow={this.followUser}
                unfollow={this.unfollowUser}
                alt={
                  <span>
                    <USDDisplay value={voteValue(vote)} />
                    <span className="ReactionsList__bullet" />
                    <FormattedNumber
                      style="percent" // eslint-disable-line react/style-prop-object
                      value={vote.percent / 10000}
                      maximumFractionDigits={2}
                    />
                  </span>
                }
              />
            ))}
          </div>
        </InfiniteSroll>
      </Scrollbars>
    );
  }
}
