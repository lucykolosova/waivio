import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { injectIntl } from 'react-intl';
import { Button } from 'antd';
import ObjectLightbox from '../components/ObjectLightbox';
import FollowButton from '../widgets/FollowButton';
import { haveAccess, accessTypesArr } from '../helpers/wObjectHelper';
import { getFieldWithMaxWeight } from '../../client/object/wObjectHelper';
import { objectFields } from '../../common/constants/listOfFields';
import Proposition from '../components/Proposition/Proposition';
import ObjectType from './ObjectType';
import ObjectRank from './ObjectRank';
import '../components/ObjectHeader.less';

const WobjHeader = ({ isEditMode, wobject, username, intl, toggleViewEditMode }) => {
  const coverImage = getFieldWithMaxWeight(
    wobject,
    objectFields.background,
    objectFields.background,
  );
  const hasCover = !!coverImage;
  const style = hasCover
    ? { backgroundImage: `url("https://steemitimages.com/2048x512/${coverImage}")` }
    : {};
  const descriptionShort = getFieldWithMaxWeight(wobject, objectFields.title);
  const accessExtend = haveAccess(wobject, username, accessTypesArr[0]);
  const objectName = getFieldWithMaxWeight(wobject, objectFields.name, objectFields.name);
  const canEdit = accessExtend && isEditMode;
  return (
    <div className={classNames('ObjectHeader', { 'ObjectHeader--cover': hasCover })} style={style}>
      <div className="ObjectHeader__container">
        <ObjectLightbox wobject={wobject} size={100} accessExtend={canEdit} />
        <div className="ObjectHeader__user">
          <div className="ObjectHeader__row">
            <div className="ObjectHeader__user__username">
              <div className="ObjectHeader__text" title={objectName}>
                {objectName}
              </div>
              <div className="ObjectHeader__controls">
                <FollowButton following={wobject.author_permlink} followingType="wobject" />
                {accessExtend && (
                  <Button onClick={toggleViewEditMode}>
                    {isEditMode
                      ? intl.formatMessage({ id: 'view', defaultMessage: 'View' })
                      : intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' })}
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className="ObjectHeader__info">
            <ObjectType type={wobject.object_type} />
            <ObjectRank rank={wobject.rank} />
          </div>
          <div className="ObjectHeader__user__username">
            <div className="ObjectHeader__descriptionShort">
              {(canEdit && (
                <Proposition
                  objectID={wobject.author_permlink}
                  fieldName={objectFields.title}
                  objName={objectName}
                />
              )) ||
                descriptionShort}
            </div>
          </div>
          {canEdit && (
            <div className="ObjectHeader__user__addCover">
              <Proposition
                objectID={wobject.author_permlink}
                fieldName={objectFields.background}
                objName={objectName}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

WobjHeader.propTypes = {
  intl: PropTypes.shape(),
  isEditMode: PropTypes.bool,
  wobject: PropTypes.shape(),
  username: PropTypes.string,
  toggleViewEditMode: PropTypes.func,
};

WobjHeader.defaultProps = {
  intl: {},
  isEditMode: false,
  wobject: {},
  username: '',
  toggleViewEditMode: () => {},
};

export default injectIntl(WobjHeader);
