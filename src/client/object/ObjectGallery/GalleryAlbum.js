import { max, get } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Card } from 'antd';
import { getImagePath } from '../../../common/helpers/image';
import DEFAULTS from '../../object/const/defaultValues';
import './GalleryAlbum.less';

const GalleryAlbum = ({ album }) => {
  const filterItems = album.items;
  const albumItem = max(filterItems, item => item.weight);
  const getRelatedAlbumCount = item => get(item, 'count');
  const getAlbumCount = filterItems ? filterItems.length : 0;
  const albumCount = getRelatedAlbumCount(album) ? getRelatedAlbumCount(album) : getAlbumCount;
  const imagePath = albumItem
    ? getImagePath(album, albumItem.body, 'preview')
    : DEFAULTS.ALBUM_COVER;

  return (
    <div className="GalleryAlbum">
      <Card hoverable cover={<img alt="example" src={imagePath} className="GalleryAlbum__image" />}>
        <Card.Meta title={`${album.body} (${albumCount})`} />
      </Card>
    </div>
  );
};

GalleryAlbum.propTypes = {
  album: PropTypes.shape().isRequired,
};

export default GalleryAlbum;
