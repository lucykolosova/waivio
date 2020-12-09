import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { AutoComplete, Icon, Input } from 'antd';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { map, isEmpty, debounce } from 'lodash';
import classNames from 'classnames';

import {
  getAutoCompleteSearchResults,
  getIsStartSearchAutoComplete,
  getSearchObjectsResults,
  getWebsiteSearchType,
  searchObjectTypesResults,
} from '../../reducers';
import {
  resetSearchAutoCompete,
  searchAutoComplete,
  searchUsersAutoCompete,
  searchWebsiteObjectsAutoCompete,
  setWebsiteSearchType,
} from '../searchActions';
import { getTranformSearchCountData } from '../helpers';
import { listObjectTypeOfDining } from '../../../common/constants/listOfObjectTypes';
import UserSearchItem from '../SearchItems/UserSearchItem';
import { getObjectName } from '../../helpers/wObjectHelper';
import ObjectSearchItem from '../SearchItems/ObjectSearchItem';
import Loading from '../../components/Icon/Loading';

import './WebsiteSearch.less';

const WebsiteSearch = props => {
  const [searchString, setSearchString] = useState('');
  const isAllResult = props.searchType === 'All';
  const searchCountTabs = getTranformSearchCountData(
    props.autoCompleteSearchResults,
    listObjectTypeOfDining,
  );

  const itemsClassList = key =>
    classNames('WebsiteSearch__search-type', {
      'WebsiteSearch__search-type--active': props.searchType === key,
    });

  const currentSearchMethod = value => {
    switch (props.searchType) {
      case 'user':
        return props.searchUsersAutoCompete(value);
      case 'All':
        return props.searchAutoComplete(value);
      default:
        return props.searchWebsiteObjectsAutoCompete(value);
    }
  };

  useEffect(() => {
    if (searchString) currentSearchMethod(searchString);
  }, [props.searchType]);

  const compareSearchResult = () => {
    const { users, wobjects } = props.autoCompleteSearchResults;
    let result = [];

    if (isAllResult) {
      if (searchString) {
        result = [
          <AutoComplete.Option key={'loading'}>
            <Loading />
          </AutoComplete.Option>,
        ];
      }

      if (!isEmpty(props.autoCompleteSearchResults)) {
        result = [
          <AutoComplete.OptGroup
            key={'searchType'}
            className={'WebsiteSearch__search-type-wrapper'}
          >
            {map(searchCountTabs, option => (
              <AutoComplete.Option
                key={`${option.name}`}
                value={`#${option.name}`}
                className={itemsClassList(option.name)}
                onClick={() => props.setWebsiteSearchType(option.name)}
              >
                {`${option.name}(${option.count})`}
              </AutoComplete.Option>
            ))}
          </AutoComplete.OptGroup>,
        ];
      }

      if (!isEmpty(wobjects)) {
        result = [
          ...result,
          <AutoComplete.OptGroup
            key="wobjectsTitle"
            label={
              <span>
                {props.intl.formatMessage({
                  id: 'wobjects_search_title',
                  defaultMessage: 'Objects',
                })}{' '}
              </span>
            }
          >
            {map(wobjects, option => (
              <AutoComplete.Option
                marker={'wobj'}
                key={`wobj${getObjectName(option)}`}
                value={`wobj${option.defaultShowLink}`}
                className="Topnav__search-autocomplete"
              >
                <ObjectSearchItem wobj={option} isWebsite />
              </AutoComplete.Option>
            ))}
          </AutoComplete.OptGroup>,
        ];
      }

      if (!isEmpty(users)) {
        result = [
          ...result,
          <AutoComplete.OptGroup
            key="usersTitle"
            label={
              <span>
                {props.intl.formatMessage({
                  id: 'users_search_title',
                  defaultMessage: 'Users',
                })}{' '}
              </span>
            }
          >
            {map(users, option => (
              <AutoComplete.Option
                marker={'user'}
                key={`user${option.account}`}
                value={`user${option.account}`}
                className="Topnav__search-autocomplete"
              >
                <UserSearchItem user={option} />
              </AutoComplete.Option>
            ))}
          </AutoComplete.OptGroup>,
        ];
      }
    }

    return result;
  };

  const handleSearchAutocomplete = useCallback(
    debounce(value => currentSearchMethod(value), 300),
    [props.searchType],
  );

  const handleSearch = value => {
    if (value) {
      handleSearchAutocomplete(value);
    } else props.resetSearchAutoCompete();

    setSearchString(value);
  };

  const handleResetAutocomplete = () => {
    setSearchString('');
    props.resetSearchAutoCompete();
  };

  return (
    <div>
      <AutoComplete
        className="WebsiteSearch"
        onSearch={handleSearch}
        value={searchString}
        dropdownClassName={'WebsiteSearch__dropdown'}
        dataSource={compareSearchResult()}
      >
        <Input.Search
          size="large"
          placeholder={props.intl.formatMessage({
            id: 'find_restaurants_and_dishes',
            defaultMessage: 'Find restaurants and dishes',
          })}
        />
      </AutoComplete>
      {!!searchString.length && (
        <Icon
          type="close"
          onClick={handleResetAutocomplete}
          style={{ position: 'relative', left: '-20px', cursor: 'pointer', zIndex: 5 }}
        />
      )}
    </div>
  );
};

WebsiteSearch.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func,
  }).isRequired,
  searchAutoComplete: PropTypes.func.isRequired,
  resetSearchAutoCompete: PropTypes.func.isRequired,
  setWebsiteSearchType: PropTypes.func.isRequired,
  searchWebsiteObjectsAutoCompete: PropTypes.func.isRequired,
  searchUsersAutoCompete: PropTypes.func.isRequired,
  searchType: PropTypes.string.isRequired,
  autoCompleteSearchResults: PropTypes.shape({
    users: PropTypes.arrayOf,
    wobjects: PropTypes.arrayOf,
  }).isRequired,
};

export default connect(
  state => ({
    autoCompleteSearchResults: getAutoCompleteSearchResults(state),
    searchByObject: getSearchObjectsResults(state),
    searchByObjectType: searchObjectTypesResults(state),
    isStartSearchAutoComplete: getIsStartSearchAutoComplete(state),
    searchType: getWebsiteSearchType(state),
  }),
  {
    searchAutoComplete,
    resetSearchAutoCompete,
    setWebsiteSearchType,
    searchWebsiteObjectsAutoCompete,
    searchUsersAutoCompete,
  },
)(injectIntl(WebsiteSearch));
