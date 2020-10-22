import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage, FormattedRelative } from 'react-intl';
import { Link } from 'react-router-dom';
import { epochToUTC } from '../../../helpers/formatter';
import Avatar from '../../Avatar';
import './Notification.less';

const NotificationCampaignReservation = ({ notification, read, onClick }) => {
  const url = ``;

  return (
    <Link
      to={url}
      onClick={onClick}
      className={classNames('Notification', {
        'Notification--unread': !read,
      })}
    >
      <Avatar username={notification.author} size={40} />
      <div className="Notification__text">
        <div className="Notification__text__message">
          <FormattedMessage
            id="notification_campaign_reservation"
            defaultMessage="{author} made a reservation for {campaignName}"
            values={{
              author: <span className="username">{notification.author}</span>,
              campaignName: <span>{notification.campaignName}</span>,
            }}
          />
        </div>
        <div className="Notification__text__date">
          <FormattedRelative value={epochToUTC(notification.timestamp)} />
        </div>
      </div>
    </Link>
  );
};

NotificationCampaignReservation.propTypes = {
  read: PropTypes.bool,
  notification: PropTypes.shape({
    type: PropTypes.string,
    campaignName: PropTypes.string,
    timestamp: PropTypes.number,
    author: PropTypes.string,
  }),
  onClick: PropTypes.func,
};

NotificationCampaignReservation.defaultProps = {
  read: false,
  notification: {},
  onClick: () => {},
};

export default NotificationCampaignReservation;
