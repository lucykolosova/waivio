import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { renderRoutes } from 'react-router-config';
import { Helmet } from 'react-helmet';
import _ from 'lodash';
import {
  getIsAuthenticated,
  getAuthenticatedUser,
  getIsUserFailed,
  getIsUserLoaded,
  getAuthenticatedUserName,
  getObject as getObjectState,
} from '../reducers';
import { getObjectInfo } from './wobjectsActions';
import { resetGallery } from '../object/ObjectGallery/galleryActions';
import Error404 from '../statics/Error404';
import WobjHero from './WobjHero';
import LeftObjectProfileSidebar from '../app/Sidebar/LeftObjectProfileSidebar';
import RightObjectSidebar from '../app/Sidebar/RightObjectSidebar';
import Affix from '../components/Utils/Affix';
import ScrollToTopOnMount from '../components/Utils/ScrollToTopOnMount';
import { getFieldWithMaxWeight } from './wObjectHelper';
import { objectFields } from '../../common/constants/listOfFields';

@withRouter
@connect(
  (state, ownProps) => ({
    authenticated: getIsAuthenticated(state),
    authenticatedUser: getAuthenticatedUser(state),
    authenticatedUserName: getAuthenticatedUserName(state),
    loaded: getIsUserLoaded(state, ownProps.match.params.name),
    failed: getIsUserFailed(state, ownProps.match.params.name),
    wobject: getObjectState(state),
  }),
  {
    getObjectInfo,
    resetGallery,
  },
)
export default class Wobj extends React.Component {
  static propTypes = {
    route: PropTypes.shape().isRequired,
    authenticatedUserName: PropTypes.string.isRequired,
    authenticated: PropTypes.bool.isRequired,
    match: PropTypes.shape().isRequired,
    history: PropTypes.shape().isRequired,
    failed: PropTypes.bool,
    getObjectInfo: PropTypes.func,
    resetGallery: PropTypes.func.isRequired,
    wobject: PropTypes.shape(),
  };

  static defaultProps = {
    authenticatedUserName: '',
    loaded: false,
    failed: false,
    getObjectInfo: () => {},
    wobject: {},
  };

  state = {
    isEditMode: false,
  };

  componentDidMount() {
    this.props.getObjectInfo(this.props.match.params.name, this.props.authenticatedUserName);
  }

  componentWillReceiveProps(nextProps) {
    const { history } = this.props;
    if (
      nextProps.wobject.object_type &&
      nextProps.wobject.object_type.toLowerCase() === 'list' &&
      !this.props.match.params[0] &&
      !nextProps.match.params[0]
    ) {
      history.push(`${history.location.pathname}/list`);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.name !== this.props.match.params.name) {
      this.props.getObjectInfo(this.props.match.params.name, this.props.authenticatedUserName);
    }
  }

  componentWillUnmount() {
    this.props.resetGallery();
  }

  toggleViewEditMode = () => this.setState(prevState => ({ isEditMode: !prevState.isEditMode }));

  render() {
    const { isEditMode } = this.state;
    const { authenticated, failed, authenticatedUserName: userName, match } = this.props;
    if (failed) return <Error404 />;

    const objectName = getFieldWithMaxWeight(this.props.wobject, objectFields.name);
    const busyHost = global.postOrigin || 'https://waiviodev.com';
    const desc = `Posts by ${objectName}`;
    const image = getFieldWithMaxWeight(this.props.wobject, objectFields.avatar);
    const canonicalUrl = `${busyHost}/object/${this.props.wobject.author_permlink}`;
    const url = `${busyHost}/object/${this.props.wobject.author_permlink}`;
    const displayedObjectName = objectName || '';
    const title = `Object - ${objectName || this.props.wobject.default_name || ''}`;

    return (
      <div className="main-panel">
        <Helmet>
          <title>{title}</title>
          <link rel="canonical" href={canonicalUrl} />
          <meta property="description" content={desc} />

          <meta property="og:title" content={title} />
          <meta property="og:type" content="article" />
          <meta property="og:url" content={url} />
          <meta property="og:image" content={image} />
          <meta property="og:description" content={desc} />
          <meta property="og:site_name" content="Waivio" />

          <meta property="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
          <meta property="twitter:site" content={'@steemit'} />
          <meta property="twitter:title" content={title} />
          <meta property="twitter:description" content={desc} />
          <meta
            property="twitter:image"
            content={
              image ||
              'https://cdn.steemitimages.com/DQmVRiHgKNWhWpDXSmD7ZK4G48mYkLMPcoNT8VzgXNWZ8aN/image.png'
            }
          />
        </Helmet>
        <ScrollToTopOnMount />
        <WobjHero
          isEditMode={isEditMode}
          authenticated={authenticated}
          isFetching={_.isEmpty(this.props.wobject)}
          wobject={this.props.wobject}
          username={displayedObjectName}
          onFollowClick={this.handleFollowClick}
          toggleViewEditMode={this.toggleViewEditMode}
        />
        <div className="shifted">
          <div className="feed-layout container">
            <Affix className="leftContainer leftContainer__user" stickPosition={110}>
              <div className="left">
                <LeftObjectProfileSidebar
                  isEditMode={isEditMode}
                  wobject={this.props.wobject}
                  userName={userName}
                />
              </div>
            </Affix>
            <Affix className="rightContainer" stickPosition={110}>
              <div className="right">
                <RightObjectSidebar username={userName} wobject={this.props.wobject} />
              </div>
            </Affix>
            <div className="center">
              {renderRoutes(this.props.route.routes, { isEditMode, wobject: this.props.wobject, userName, match })}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
