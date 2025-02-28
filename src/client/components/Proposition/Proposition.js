import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { Icon } from 'antd';
import cn from 'classnames';
import AppendModal from '../../object/AppendModal/AppendModal';
import IconButton from '../IconButton';
import { objectFields } from '../../../common/constants/listOfFields';
import CreateAlbum from '../../object/ObjectGallery/CreateAlbum';
import { isPhotosAlbumExist } from '../../../common/helpers/wObjectHelper';
import './Proposition.less';

class Proposition extends React.Component {
  state = {
    showModal: false,
  };

  handleToggleModal = () => {
    const { fieldName, albums, appendAlbum } = this.props;

    if (fieldName !== objectFields.pageContent) {
      if (fieldName === objectFields.galleryItem && !isPhotosAlbumExist(albums)) {
        appendAlbum();
      }
      this.setState({ showModal: !this.state.showModal });
    }
  };

  render() {
    const {
      intl,
      linkTo,
      fieldName,
      objectID,
      objName,
      selectedField,
      handleSelectField,
    } = this.props;
    const { showModal } = this.state;

    const linkClass = cn({
      'icon-button__text': true,
      'field-selected': selectedField === fieldName,
    });
    let renderModal = null;

    switch (fieldName) {
      case objectFields.galleryAlbum:
        renderModal = <CreateAlbum showModal={showModal} hideModal={this.handleToggleModal} />;
        break;
      default:
        renderModal = (
          <AppendModal
            objName={objName}
            showModal={showModal}
            hideModal={this.handleToggleModal}
            field={fieldName}
          />
        );
    }

    return (
      <React.Fragment>
        <div className="proposition-line">
          <Link
            to={{ pathname: linkTo || `/object/${objectID}/updates/${fieldName}` }}
            data-test={`${fieldName}-plus-button`}
          >
            <IconButton icon={<Icon type="plus-circle" />} onClick={this.handleToggleModal} />
          </Link>
          <div className={linkClass} data-test={`${fieldName}-field-name`}>
            <Link
              to={{ pathname: `/object/${objectID}/updates/${fieldName}` }}
              onClick={handleSelectField(fieldName)}
            >
              {intl.formatMessage({
                id: `object_field_${fieldName}`,
                defaultMessage: fieldName,
              })}
            </Link>
          </div>
        </div>
        {showModal && renderModal}
      </React.Fragment>
    );
  }
}
Proposition.propTypes = {
  objName: PropTypes.string,
  fieldName: PropTypes.string.isRequired,
  objectID: PropTypes.string.isRequired,
  intl: PropTypes.shape().isRequired,
  handleSelectField: PropTypes.func,
  selectedField: PropTypes.string,
  linkTo: PropTypes.string,
  albums: PropTypes.shape(),
  appendAlbum: PropTypes.func,
};

Proposition.defaultProps = {
  fieldName: 'name',
  handleSelectField: () => {},
  selectedField: '',
  linkTo: '',
  objName: '',
  albums: [],
  appendAlbum: () => {},
};

export default injectIntl(Proposition);
