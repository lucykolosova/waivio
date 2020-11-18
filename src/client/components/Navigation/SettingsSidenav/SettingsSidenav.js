import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { currentWebsiteSettings, personalSettings, websiteSettings } from './constants';
import SettingsItem from './SettingsItem';
import { getOwnWebsites, isGuestUser } from '../../../reducers';
import { getOwnWebsite } from '../../../websites/websiteActions';

import '../Sidenav.less';

const SettingsSidenav = ({ match }) => {
  const dispatch = useDispatch();
  const isGuest = useSelector(isGuestUser);
  const ownWebsite = useSelector(getOwnWebsites);
  const [menuCondition, setMenuCondition] = useState({
    personal: true,
    websites: true,
  });

  useEffect(() => {
    if (!isGuest)
      dispatch(getOwnWebsite()).then(({ value }) => {
        const websiteItems = value.reduce((acc, { host }) => {
          acc[host] = host === match.params.site;

          return acc;
        }, {});

        setMenuCondition(prevState => ({ ...prevState, ...websiteItems }));
      });
  }, []);

  const toggleMenuCondition = menuItem => {
    setMenuCondition({
      ...menuCondition,
      [menuItem]: !menuCondition[menuItem],
    });
  };

  console.log(menuCondition);
  return (
    <ul className="Sidenav">
      <SettingsItem
        condition={menuCondition.personal}
        configItem={personalSettings}
        toggleMenuCondition={toggleMenuCondition}
      />
      {!isGuest && (
        <SettingsItem
          condition={menuCondition.websites}
          configItem={websiteSettings}
          toggleMenuCondition={toggleMenuCondition}
        />
      )}
      {ownWebsite.map(({ host }) => (
        <SettingsItem
          key={host}
          condition={menuCondition[host]}
          configItem={{
            tab: {
              name: host,
              id: host,
              defaultMessage: host,
            },
            settings: currentWebsiteSettings(host),
          }}
          toggleMenuCondition={toggleMenuCondition}
        />
      ))}
    </ul>
  );
};

SettingsSidenav.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      site: PropTypes.string,
    }),
  }).isRequired,
};

export default SettingsSidenav;
