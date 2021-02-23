import React from 'react';
import PropTypes from 'prop-types';
import url from 'url';
import { connect, batch } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { withRouter } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import { ConfigProvider, Layout } from 'antd';
import enUS from 'antd/es/locale/en_US';
import ruRU from 'antd/es/locale/ru_RU';
import ukUA from 'antd/es/locale/uk_UA';
import { findLanguage, getRequestLocale, loadLanguage } from './translations';
import {
  getAuthenticatedUser,
  getAuthenticatedUserName,
  getIsAuthenticated,
  getLocale,
  getUsedLocale,
  getTranslations,
  getNightmode,
  getIsOpenWalletTable,
  getIsAuthFetching,
} from './reducers';
import {
  login,
  busyLogin,
  getAuthGuestBalance as dispatchGetAuthGuestBalance,
} from './auth/authActions';
import { getNotifications } from './user/userActions';
import { getRate, getRewardFund, setUsedLocale, setAppUrl } from './app/appActions';
import NotificationPopup from './notifications/NotificationPopup';
import BBackTop from './components/BBackTop';
import { guestUserRegex } from './helpers/regexHelpers';
import ErrorBoundary from './widgets/ErrorBoundary';
import Loading from './components/Icon/Loading';
import { handleRefAuthUser } from './rewards/ReferralProgram/ReferralActions';
import WebsiteHeader from './websites/WebsiteLayoutComponents/Header/WebsiteHeader';
import { getWebsiteObjWithCoordinates } from './websites/websiteActions';

export const AppSharedContext = React.createContext({ usedLocale: 'en-US', isGuestUser: false });

@withRouter
@connect(
  state => ({
    user: getAuthenticatedUser(state),
    username: getAuthenticatedUserName(state),
    isAuthenticated: getIsAuthenticated(state),
    usedLocale: getUsedLocale(state),
    translations: getTranslations(state),
    locale: getLocale(state),
    nightmode: getNightmode(state),
    isOpenWalletTable: getIsOpenWalletTable(state),
    loadingFetching: getIsAuthFetching(state),
  }),
  {
    login,
    getNotifications,
    getRate,
    getRewardFund,
    busyLogin,
    setUsedLocale,
    dispatchGetAuthGuestBalance,
    handleRefAuthUser,
    getWebsiteObjWithCoordinates,
  },
)
class WebsiteWrapper extends React.PureComponent {
  static propTypes = {
    route: PropTypes.shape().isRequired,
    locale: PropTypes.string.isRequired,
    usedLocale: PropTypes.string,
    translations: PropTypes.shape(),
    username: PropTypes.string,
    login: PropTypes.func,
    getRewardFund: PropTypes.func,
    getRate: PropTypes.func,
    getNotifications: PropTypes.func,
    setUsedLocale: PropTypes.func,
    busyLogin: PropTypes.func,
    nightmode: PropTypes.bool,
    dispatchGetAuthGuestBalance: PropTypes.func,
    isOpenWalletTable: PropTypes.bool,
    loadingFetching: PropTypes.bool,
  };

  static defaultProps = {
    usedLocale: null,
    translations: {},
    username: '',
    login: () => {},
    logout: () => {},
    getRewardFund: () => {},
    getRate: () => {},
    getTrendingTopics: () => {},
    getNotifications: () => {},
    setUsedLocale: () => {},
    busyLogin: () => {},
    nightmode: false,
    dispatchGetAuthGuestBalance: () => {},
    isOpenWalletTable: false,
    loadingFetching: true,
    location: {},
    handleRefAuthUser: () => {},
  };

  static fetchData({ store, req }) {
    const appUrl = url.format({
      protocol: req.protocol,
      host: req.get('host'),
    });
    const state = store.getState();
    let activeLocale = getLocale(state);
    if (activeLocale === 'auto') {
      activeLocale = req.cookies.language || getRequestLocale(req.get('Accept-Language'));
    }
    const lang = loadLanguage(activeLocale);

    store.dispatch(login());
    store.dispatch(getWebsiteObjWithCoordinates());

    return Promise.all([store.dispatch(setAppUrl(appUrl)), store.dispatch(setUsedLocale(lang))]);
  }

  constructor(props) {
    super(props);

    this.loadLocale = this.loadLocale.bind(this);
  }

  state = {
    prevtLocationPath: '',
  };

  componentDidMount() {
    this.props.login().then(() => {
      batch(() => {
        this.props.getNotifications();
        this.props.busyLogin();
        this.props.getRewardFund();
        this.props.dispatchGetAuthGuestBalance();
        this.props.getRate();
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.locale !== nextProps.locale) this.loadLocale(nextProps.locale);
  }

  componentDidUpdate() {
    if (this.props.nightmode) document.body.classList.add('nightmode');
    else document.body.classList.remove('nightmode');
  }

  async loadLocale(locale) {
    const lang = await loadLanguage(locale);

    this.props.setUsedLocale(lang);
  }

  getAntdLocale = language => {
    switch (language.id) {
      case 'ru-RU':
        return ruRU;
      case 'uk-UA':
        return ukUA;
      default:
        return enUS;
    }
  };

  render() {
    const { usedLocale, translations, username, isOpenWalletTable, loadingFetching } = this.props;
    const language = findLanguage(usedLocale);
    const antdLocale = this.getAntdLocale(language);

    return (
      <IntlProvider key={language.id} locale={language.localeData} messages={translations}>
        <ConfigProvider locale={antdLocale}>
          <AppSharedContext.Provider
            value={{
              usedLocale,
              isGuestUser: username && guestUserRegex.test(username),
            }}
          >
            <Layout data-dir={language && language.rtl ? 'rtl' : 'ltr'}>
              <Layout.Header style={{ position: 'fixed', width: '100%', zIndex: 1050 }}>
                <WebsiteHeader />
              </Layout.Header>
              <div className="content">
                {loadingFetching ? <Loading /> : renderRoutes(this.props.route.routes)}
                <NotificationPopup />
                <BBackTop className={isOpenWalletTable ? 'WalletTable__bright' : 'primary-modal'} />
              </div>
            </Layout>
          </AppSharedContext.Provider>
        </ConfigProvider>
      </IntlProvider>
    );
  }
}

export default ErrorBoundary(WebsiteWrapper);
