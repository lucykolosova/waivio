import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import PropTypes from 'prop-types';

import {
  getSelectedDish,
  getSelectedRestaurant,
} from '../../../../../store/quickRewards/quickRewardsSelectors';
import { getObjectName, parseWobjectField } from '../../../../../common/helpers/wObjectHelper';
import ImageSetter from '../../../../components/ImageSetter/ImageSetter';
import TagsSelector from '../../../../components/TagsSelector/TagsSelector';

import './SecondScreen.less';

const ModalSecondScreen = props => {
  const requirements = get(props, 'selectedDish.propositions[0].requirements', null);

  useEffect(() => {
    const address = parseWobjectField(props.selectedRestaurant, 'address');

    if (address && address.city && !props.topics.includes(address.city)) {
      props.setTopic([...props.topics, address.city]);
    }
  }, []);

  const handleBodyChange = e => props.setBody(e.target.value);
  const handleImageLoaded = img => props.setImages(img);
  const handleTopicsChange = topic => props.setTopic(topic);

  return (
    <div className="SecondScreen">
      {requirements && (
        <p className="SecondScreen__text">
          Add minimum {requirements.minPhotos} original photos of{' '}
          <a href={props.selectedDish.defaultShowLink}>{getObjectName(props.selectedDish)}</a>
        </p>
      )}
      <ImageSetter onImageLoaded={handleImageLoaded} isMultiple imagesList={props.images} />
      <h4 className="SecondScreen__text">Did you like the presentation? The taste?</h4>
      <textarea value={props.body} onChange={handleBodyChange} className="SecondScreen__textarea" />
      <TagsSelector
        label={'Hashtags'}
        placeholder={'Add hashtags (without #) here'}
        tags={props.topics}
        onChange={handleTopicsChange}
      />
    </div>
  );
};

ModalSecondScreen.propTypes = {
  selectedDish: PropTypes.shape().isRequired,
  selectedRestaurant: PropTypes.shape().isRequired,
  images: PropTypes.shape().isRequired,
  topics: PropTypes.arrayOf().isRequired,
  setBody: PropTypes.func.isRequired,
  setImages: PropTypes.func.isRequired,
  setTopic: PropTypes.func.isRequired,
  body: PropTypes.string.isRequired,
};

export default connect(state => ({
  selectedRestaurant: getSelectedRestaurant(state),
  selectedDish: getSelectedDish(state),
}))(ModalSecondScreen);
