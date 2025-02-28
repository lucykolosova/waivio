import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Icon } from 'antd';
import './Loading.less';

const Loading = ({ center }) => (
  <div className={classNames('Loading', { 'Loading--center': center })}>
    <Icon className="Loading__icon" type="loading" />
  </div>
);

Loading.propTypes = {
  center: PropTypes.bool,
};

Loading.defaultProps = {
  center: true,
};

export default Loading;
