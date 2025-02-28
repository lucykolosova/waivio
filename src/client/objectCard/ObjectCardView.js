import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { includes, truncate, get, isEmpty, uniq, round } from 'lodash';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import RatingsWrap from './RatingsWrap/RatingsWrap';
import WeightTag from '../components/WeightTag';
import DEFAULTS from '../object/const/defaultValues';
import {
  getObjectName,
  parseAddress,
  getObjectAvatar,
  hasType,
} from '../../common/helpers/wObjectHelper';
import { getProxyImageURL } from '../../common/helpers/image';
import { getRate } from '../../store/appStore/appSelectors';
import { getAuthenticatedUserName } from '../../store/authStore/authSelectors';
import USDDisplay from '../components/Utils/USDDisplay';
import { defaultCurrency } from '../websites/constants/currencyTypes';

import './ObjectCardView.less';

const ObjectCardView = ({
  intl,
  wObject,
  path,
  passedParent,
  hovered,
  withRewards,
  rewardPrice,
  isReserved,
  closeButton,
  onDelete,
  isPost,
  postAuthor,
}) => {
  const username = useSelector(getAuthenticatedUserName);
  const rate = useSelector(getRate);
  const [tags, setTags] = useState([]);
  const address = parseAddress(wObject, ['postalCode', 'country']);
  const parent = isEmpty(passedParent) ? get(wObject, 'parent', {}) : passedParent;
  const parentLink = get(parent, 'defaultShowLink');
  const objName = getObjectName(wObject);
  const parentName = getObjectName(parent);
  const prise = withRewards ? null : wObject.price;
  const objectCardClassList = classNames('ObjectCardView', {
    'ObjectCardView--hovered': hovered,
  });
  let pathName = wObject.defaultShowLink || `/object/${wObject.author_permlink}`;

  pathName = hasType(wObject, 'page') && path ? path : pathName;

  useEffect(() => {
    const objectTags = get(wObject, 'topTags', []);

    setTags(uniq([wObject.object_type, ...objectTags]));
  }, [wObject.author_permlink, setTags]);

  const avatarLayout = () => {
    let url = getObjectAvatar(wObject) || getObjectAvatar(parent);

    if (url) url = getProxyImageURL(url, 'preview');
    else url = DEFAULTS.AVATAR;

    if (includes(url, 'waivio.')) url = `${url}_medium`;

    return (
      <div
        className="avatar-image"
        style={{
          backgroundImage: `url(${url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
    );
  };

  const description = wObject.description && (
    <div className="ObjectCardView__title" title={wObject.description}>
      {truncate(wObject.description, {
        length: 140,
        separator: ' ',
      })}
    </div>
  );
  const goToObjTitle = wobjName =>
    `${intl.formatMessage({
      id: 'GoTo',
      defaultMessage: 'Go to',
    })} ${wobjName}`;

  return (
    <div className={objectCardClassList} key={wObject.author_permlink}>
      <div className="ObjectCardView__content">
        <div className="ObjectCardView__content-row">
          <Link
            to={pathName}
            title={goToObjTitle(objName)}
            className="ObjectCardView__avatar"
            key={wObject.author_permlink}
          >
            {avatarLayout()}
          </Link>
          <div className="ObjectCardView__info">
            {parentName && (
              <Link
                to={parentLink}
                title={goToObjTitle(parentName)}
                className="ObjectCardView__type"
              >
                {parentName}
              </Link>
            )}
            <div className="ObjectCardView__name">
              <Link
                key={wObject.author_permlink}
                to={pathName}
                className="ObjectCardView__name-truncated"
                title={goToObjTitle(objName)}
              >
                {objName}
              </Link>
              {!isNaN(wObject.weight) && <WeightTag weight={Number(wObject.weight)} />}
            </div>
            {wObject.rating && (
              <RatingsWrap
                ratings={wObject.rating}
                username={isPost ? postAuthor : username}
                wobjId={wObject.id || wObject.author_permlink}
                wobjName={objName}
              />
            )}
            <span className="ObjectCardView__tag-text">
              {prise && (
                <span className="ObjectCardView__price" title={prise}>
                  {prise}
                </span>
              )}
              {tags.map((tag, index) => (
                <span key={tag}>
                  {index === 0 && !prise ? tag : <span>&nbsp;&middot;{` ${tag}`}</span>}
                </span>
              ))}
            </span>
            {address && <div className="ObjectCardView__tag-text">{address}</div>}
            {wObject.title ? (
              <div className="ObjectCardView__title" title={wObject.title}>
                {truncate(wObject.title, {
                  length: 140,
                  separator: ' ',
                })}
              </div>
            ) : (
              description
            )}
          </div>
        </div>
        {withRewards && (
          <div className="ObjectCardView__rewardsInfo">
            {Boolean(wObject.price) && (
              <span title={wObject.price} className="ObjectCardView__rewardsPrice">
                PRICE: {wObject.price} |{' '}
              </span>
            )}
            <span className="ObjectCardView__earnWrap">
              <b>
                {intl.formatMessage({
                  id: 'you_earn',
                  defaultMessage: 'YOU EARN',
                })}
                :
              </b>{' '}
              {isReserved ? (
                <React.Fragment>
                  <b className="ObjectCardView__priceColor">{round(rewardPrice / rate, 3)}</b> HIVE
                </React.Fragment>
              ) : (
                <USDDisplay
                  value={rewardPrice}
                  currencyDisplay="symbol"
                  style={{ color: '#f97b38', fontWeight: 'bolder' }}
                />
              )}
            </span>
          </div>
        )}
      </div>
      {closeButton && (
        <span role="presentation" onClick={onDelete} className="iconfont icon-delete" />
      )}
    </div>
  );
};

ObjectCardView.propTypes = {
  intl: PropTypes.shape().isRequired,
  wObject: PropTypes.shape(),
  passedParent: PropTypes.oneOfType([PropTypes.string, PropTypes.shape()]),
  path: PropTypes.string,
  hovered: PropTypes.bool,
  withRewards: PropTypes.bool,
  isReserved: PropTypes.bool,
  rewardPrice: PropTypes.number,
  options: PropTypes.shape({
    pathNameAvatar: PropTypes.oneOfType([PropTypes.string, PropTypes.shape()]),
  }),
  closeButton: PropTypes.bool,
  isPost: PropTypes.bool,
  postAuthor: PropTypes.string,
  onDelete: PropTypes.func,
};

ObjectCardView.defaultProps = {
  options: {},
  wObject: {},
  path: '',
  postAuthor: '',
  passedParent: {},
  withRewards: false,
  isReserved: false,
  isPost: false,
  rewardPrice: 0,
  currency: defaultCurrency,
  hovered: false,
  closeButton: false,
  onDelete: null,
};
export default injectIntl(ObjectCardView);
