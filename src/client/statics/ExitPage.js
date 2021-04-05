import React from 'react';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import 'url-search-params-polyfill';
import { FormattedMessage } from 'react-intl';
import ActionLink from '../components/Button/ActionLink';
import ActionButton from '../components/Button/Action';
import './ExitPage.less';

export default class ExitPage extends React.Component {
  static propTypes = {
    location: PropTypes.shape().isRequired,
  };

  closeWindow = () => {
    if (typeof window !== 'undefined') {
      window.close();
    }
  };

  handleCurrentUrl = url => {
    const splitedRedirectUrl = url.split('/');

    splitedRedirectUrl.splice(0, 3);

    return splitedRedirectUrl.join('/');
  };

  render() {
    const { location } = this.props;
    const saveLocation = window.location.hostname === 'waivio' || 'waiviodev.com';

    const url = decodeURIComponent(new URLSearchParams(location.search).get('url'));
    const redirectUrl = this.handleCurrentUrl(url);

    if (!url) return <div />;

    return !saveLocation ? (
      <div className="ExitPage container">
        <h1 className="ExitPage__title">
          <FormattedMessage id="page_exit" defaultMessage="Hold on!" />
        </h1>
        <p className="ExitPage__content">
          <FormattedMessage
            id="page_exit_message"
            defaultMessage="Warning: this link might be unsafe, please double check the link before you proceed."
          />
        </p>
        <pre>{url}</pre>
        <div className="ExitPage__buttons">
          <ActionLink className="ExitPage__buttons__button" primary href={url}>
            <FormattedMessage id="page_exit_go" defaultMessage="Visit this website" />
          </ActionLink>
          <ActionButton big className="ExitPage__buttons__button" onClick={this.closeWindow}>
            <FormattedMessage id="go_back" defaultMessage="Go back" />
          </ActionButton>
        </div>
      </div>
    ) : (
      <Redirect to={redirectUrl} />
    );
  }
}
