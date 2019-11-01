import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';
import { prepareInstrumentsData } from '../usersHelper';
import UserStatistics from './UserStatistics';
import api from '../../../investarena/configApi/apiResources';

const UserStatisticsContainer = ({ match }) => {
  const [statAccuracyData, setStatAccuracyData] = useState({});
  const [sortOptions, setSortOptions] = useState({});
  const [statInstrumentsData, setStatInstrumentsData] = useState([]);
  const quotes = useSelector(state => state.quotesSettings);

  const parseOption = () => {
    const parsedOptions = {};
    if (!isEmpty(sortOptions)) {
      parsedOptions.sortDirection = sortOptions.isActive ? -1 : 1;
      parsedOptions.sortBy = sortOptions.currentItem;
    }
    return parsedOptions;
  };

  const parsedInstrumentsData =
    quotes && !isEmpty(statInstrumentsData)
      ? prepareInstrumentsData(quotes, statInstrumentsData)
      : [];

  useEffect(() => {
    const instrumentsSortOptions = parseOption();
    api.statistics
      .getUserInstrumentStatistics(match.params.name, instrumentsSortOptions)
      .then(response => setStatInstrumentsData(response.data));
  }, [sortOptions]);

  useEffect(() => {
    api.statistics
      .getUserStatistics(match.params.name)
      .then(response => setStatAccuracyData(response.data));
  }, []);

  return (
    <React.Fragment>
      {!isEmpty(statAccuracyData) && !!statInstrumentsData.length && (
        <UserStatistics
          accuracy={statAccuracyData}
          forecasts={parsedInstrumentsData}
          setSortOptions={setSortOptions}
        />
      )}
    </React.Fragment>
  );
};

UserStatisticsContainer.propTypes = {
  match: PropTypes.shape().isRequired,
};

export default UserStatisticsContainer;
