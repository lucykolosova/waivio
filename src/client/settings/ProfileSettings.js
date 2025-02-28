import React from 'react';
import PropTypes from 'prop-types';
import { isEmpty, get, throttle } from 'lodash';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Form, Input, Avatar, Button, Modal, message } from 'antd';
import moment from 'moment';
import SteemConnectAPI from '../steemConnectAPI';
import { updateProfile, reload } from '../../store/authStore/authActions';
import { getMetadata } from '../../common/helpers/postingMetadata';
import { ACCOUNT_UPDATE } from '../../common/constants/accountHistory';
import socialProfiles from '../../common/helpers/socialProfiles';
import withEditor from '../components/Editor/withEditor';
import EditorInput from '../components/Editor/EditorInput';
import { remarkable } from '../components/Story/Body';
import BodyContainer from '../containers/Story/BodyContainer';
import Action from '../components/Button/Action';
import requiresLogin from '../auth/requiresLogin';
import ImageSetter from '../components/ImageSetter/ImageSetter';
import { getGuestAvatarUrl } from '../../waivioApi/ApiClient';
import { getAvatarURL } from '../components/Avatar';
import {
  getAuthenticatedUser,
  getIsReloading,
  isGuestUser,
} from '../../store/authStore/authSelectors';

import './Settings.less';

const FormItem = Form.Item;

function mapPropsToFields(props) {
  const metadata = getMetadata(props.user);

  const profile = metadata.profile || {};

  return Object.keys(profile).reduce(
    (a, b) => ({
      ...a,
      [b]: Form.createFormField({
        value: profile[b],
      }),
    }),
    {},
  );
}

@requiresLogin
@injectIntl
@connect(
  state => ({
    user: getAuthenticatedUser(state),
    reloading: getIsReloading(state),
    isGuest: isGuestUser(state),
  }),
  {
    updateProfile,
    reload,
  },
)
@Form.create({
  mapPropsToFields,
})
@withEditor
export default class ProfileSettings extends React.Component {
  static propTypes = {
    intl: PropTypes.shape().isRequired,
    form: PropTypes.shape().isRequired,
    userName: PropTypes.string,
    onImageUpload: PropTypes.func,
    onImageInvalid: PropTypes.func,
    isGuest: PropTypes.bool,
    updateProfile: PropTypes.func,
    user: PropTypes.shape(),
    history: PropTypes.shape(),
    reload: PropTypes.func,
  };

  static defaultProps = {
    onImageUpload: () => {},
    onImageInvalid: () => {},
    userName: '',
    user: {},
    history: {},
    isGuest: false,
    updateProfile: () => {},
    reload: () => {},
  };

  constructor(props) {
    super(props);

    const metadata = getMetadata(props.user);

    this.state = {
      bodyHTML: '',
      profileData: get(metadata, ['profile'], {}),
      profilePicture: `${getAvatarURL(props.userName)}?${moment(
        this.props.user.updatedAt || this.props.user.last_account_update,
      ).unix()}`,
      coverPicture: get(metadata, ['profile', 'cover_image'], ''),
      isModal: false,
      isLoadingImage: false,
      avatarImage: [],
      coverImage: [],
      isCover: false,
      isAvatar: false,
      lastAccountUpdate: moment(props.user.updatedAt).unix(),
      isLoading: false,
    };

    this.handleSignatureChange = this.handleSignatureChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.renderBody = this.renderBody.bind(this);
  }

  handleSignatureChange(body) {
    throttle(this.renderBody, 200, { leading: false, trailing: true })(body);
  }

  setSettingsFields = () => {
    // eslint-disable-next-line no-shadow
    const { form, isGuest, userName, user, updateProfile, intl, reload } = this.props;
    const { avatarImage, coverImage, profileData } = this.state;
    const isChangedAvatar = !!avatarImage.length;
    const isChangedCover = !!coverImage.length;

    if (!form.isFieldsTouched() && !isChangedAvatar && !isChangedCover) return;

    form.validateFields((err, values) => {
      if (!err) {
        const cleanValues = Object.keys(values)
          .filter(
            field =>
              form.isFieldTouched(field) ||
              (field === 'profile_image' && isChangedAvatar) ||
              (field === 'cover_image' && isChangedCover),
          )
          .reduce(
            (a, b) => ({
              ...a,
              [b]: values[b] || '',
            }),
            {},
          );

        if (isGuest) {
          updateProfile(userName, cleanValues)
            .then(data => {
              if (isChangedAvatar || isChangedCover || data.value.isProfileUpdated) {
                message.success(
                  intl.formatMessage({
                    id: 'profile_updated',
                    defaultMessage: 'Profile updated',
                  }),
                );

                this.props.history.push(`/@${user.name}`);
              }
            })
            .catch(e => message.error(e.message));
        } else {
          const profileDateEncoded = [
            ACCOUNT_UPDATE,
            {
              account: userName,
              extensions: [],
              json_metadata: '',
              posting_json_metadata: JSON.stringify({
                profile: { ...profileData, ...cleanValues, version: 2 },
              }),
            },
          ];

          SteemConnectAPI.broadcast([profileDateEncoded])
            .then(() => {
              reload();

              setTimeout(() => {
                message.success(
                  intl.formatMessage({
                    id: 'profile_updated',
                    defaultMessage: 'Profile updated',
                  }),
                );
                this.props.history.push(`/@${user.name}`);
              }, 2000);
            })
            .catch(e => {
              this.setState({ isLoading: false });
              message.error(e.message);
            });
        }
      }
    });
  };

  handleSubmit(e) {
    e.preventDefault();
    const { isGuest, userName, intl } = this.props;
    const { avatarImage } = this.state;

    this.setState({ isLoading: true });

    if (isGuest && !isEmpty(avatarImage)) {
      getGuestAvatarUrl(userName, avatarImage[0].src, intl)
        .then(data => {
          this.props.form.setFieldsValue({
            profile_image: data.image,
          });
        })
        .then(() => this.setSettingsFields());
    } else this.setSettingsFields();
  }

  onOpenChangeAvatarModal = () => {
    this.setState({ isModal: !this.state.isModal, isAvatar: !this.state.isAvatar });
  };

  onOpenChangeCoverModal = () => {
    this.setState({ isModal: !this.state.isModal, isCover: !this.state.isCover });
  };

  onOkAvatarModal = () => {
    const { avatarImage } = this.state;

    this.setState({
      isModal: !this.state.isModal,
      isAvatar: !this.state.isAvatar,
      profilePicture: avatarImage[0].src,
    });
    this.props.form.setFieldsValue({
      profile_image: avatarImage[0].src,
    });
  };

  onOkCoverModal = () => {
    const { coverImage } = this.state;

    this.setState({
      isModal: !this.state.isModal,
      isCover: !this.state.isCover,
      coverPicture: coverImage[0].src,
    });
    this.props.form.setFieldsValue({
      cover_image: coverImage[0].src,
    });
  };

  renderBody(body) {
    this.setState({
      bodyHTML: remarkable.render(body),
    });
  }

  onLoadingImage = value => this.setState({ isLoadingImage: value });

  getAvatar = image => {
    this.setState({ avatarImage: image });
  };

  getCover = image => {
    this.setState({ coverImage: image });
  };

  render() {
    const { intl, form } = this.props;
    const {
      bodyHTML,
      isModal,
      isLoadingImage,
      avatarImage,
      coverImage,
      isAvatar,
      lastAccountUpdate,
      profilePicture,
      coverPicture,
    } = this.state;
    const { getFieldDecorator } = form;
    const socialInputs = socialProfiles.map(profile => (
      <FormItem key={profile.id}>
        {getFieldDecorator(profile.id, {
          rules: [
            {
              message: intl.formatMessage({
                id: 'profile_social_profile_incorrect',
                defaultMessage:
                  "This doesn't seem to be valid username. Only alphanumeric characters, hyphens, underscores and dots are allowed.",
              }),
              pattern: /^[0-9A-Za-z-_.]+$/,
            },
          ],
        })(
          <Input
            size="large"
            prefix={
              <i
                className={`Settings__prefix-icon iconfont icon-${profile.icon}`}
                style={{
                  color: profile.color,
                }}
              />
            }
            placeholder={profile.name}
          />,
        )}
      </FormItem>
    ));

    return (
      <div>
        <div className="center">
          <h1>
            <FormattedMessage id="edit_profile" defaultMessage="Edit Profile" />
          </h1>
          <Form onSubmit={this.handleSubmit}>
            <div className="Settings">
              <div className="Settings__section">
                <h3>
                  <FormattedMessage id="profile_name" defaultMessage="Name" />
                </h3>
                <div className="Settings__section__inputs">
                  <FormItem>
                    {getFieldDecorator('name')(
                      <Input
                        size="large"
                        placeholder={intl.formatMessage({
                          id: 'profile_name_placeholder',
                          defaultMessage: 'Name to display on your profile',
                        })}
                      />,
                    )}
                  </FormItem>
                </div>
              </div>
              <div className="Settings__section">
                <h3>
                  <FormattedMessage id="profile_about" defaultMessage="About me" />
                </h3>
                <div className="Settings__section__inputs">
                  <FormItem>
                    {getFieldDecorator('about')(
                      <Input.TextArea
                        autoSize={{ minRows: 2, maxRows: 6 }}
                        placeholder={intl.formatMessage({
                          id: 'profile_about_placeholder',
                          defaultMessage: 'Few words about you',
                        })}
                      />,
                    )}
                  </FormItem>
                </div>
              </div>
              <div className="Settings__section">
                <h3>
                  <FormattedMessage id="profile_location" defaultMessage="Location" />
                  <FormattedMessage id="public_field" defaultMessage=" (public)" />
                </h3>
                <div className="Settings__section__inputs">
                  <FormItem>
                    {getFieldDecorator('location')(
                      <Input
                        size="large"
                        placeholder={intl.formatMessage({
                          id: 'profile_location_placeholder',
                          defaultMessage: 'Your location',
                        })}
                      />,
                    )}
                  </FormItem>
                </div>
              </div>
              <div className="Settings__section">
                <h3>
                  <FormattedMessage id="profile_email" defaultMessage="Email" />
                  <FormattedMessage id="public_field" defaultMessage=" (public)" />
                </h3>
                <div className="Settings__section__inputs">
                  <FormItem>
                    {getFieldDecorator('email')(
                      <Input
                        size="large"
                        placeholder={intl.formatMessage({
                          id: 'profile_email_placeholder',
                          defaultMessage: 'Your email',
                        })}
                      />,
                    )}
                  </FormItem>
                </div>
              </div>
              <div className="Settings__section">
                <h3>
                  <FormattedMessage id="profile_website" defaultMessage="Website" />
                  <FormattedMessage id="public_field" defaultMessage=" (public)" />
                </h3>
                <div className="Settings__section__inputs">
                  <FormItem>
                    {getFieldDecorator('website')(
                      <Input
                        size="large"
                        placeholder={intl.formatMessage({
                          id: 'profile_website_placeholder',
                          defaultMessage: 'Your website URL',
                        })}
                      />,
                    )}
                  </FormItem>
                </div>
              </div>
              <div className="Settings__section">
                <h3>
                  <FormattedMessage id="profile_picture" defaultMessage="Profile picture" />
                </h3>
                <div className="Settings__section__inputs">
                  <FormItem>
                    {getFieldDecorator('profile_image')(
                      <div className="Settings__profile-image">
                        <Avatar
                          size="large"
                          icon="user"
                          src={`${profilePicture}?${lastAccountUpdate}`}
                        />
                        <Button type="primary" onClick={this.onOpenChangeAvatarModal}>
                          {intl.formatMessage({
                            id: 'profile_change_avatar',
                            defaultMessage: 'Change avatar',
                          })}
                        </Button>
                      </div>,
                    )}
                  </FormItem>
                </div>
              </div>
              <div className="Settings__section">
                <h3>
                  <FormattedMessage id="profile_cover" defaultMessage="Cover picture" />
                </h3>
                <div className="Settings__section__inputs">
                  <FormItem>
                    {getFieldDecorator('cover_image')(
                      <div className="Settings__profile-image">
                        <Avatar size="large" shape="square" icon="picture" src={coverPicture} />
                        <Button type="primary" onClick={this.onOpenChangeCoverModal}>
                          {intl.formatMessage({
                            id: 'profile_change_cover',
                            defaultMessage: 'Change cover',
                          })}
                        </Button>
                      </div>,
                    )}
                  </FormItem>
                </div>
              </div>
              <div className="Settings__section">
                <h3>
                  <FormattedMessage id="profile_social_profiles" defaultMessage="Social profiles" />
                </h3>
                <div className="Settings__section__inputs">{socialInputs}</div>
              </div>
              <div className="Settings__section">
                <h3>
                  <FormattedMessage id="profile_signature" defaultMessage="Signature" />
                </h3>
                <div className="Settings__section__inputs">
                  {getFieldDecorator('signature', {
                    initialValue: '',
                  })(
                    <EditorInput
                      rows={6}
                      onChange={this.handleSignatureChange}
                      onImageUpload={this.props.onImageUpload}
                      onImageInvalid={this.props.onImageInvalid}
                      inputId={'profile-inputfile'}
                    />,
                  )}
                  {bodyHTML && (
                    <Form.Item label={<FormattedMessage id="preview" defaultMessage="Preview" />}>
                      <BodyContainer full body={bodyHTML} />
                    </Form.Item>
                  )}
                </div>
              </div>
              <Action
                primary
                big
                type="submit"
                disabled={!form.isFieldsTouched() && !avatarImage.length && !coverImage.length}
                loading={this.state.isLoading}
              >
                <FormattedMessage id="save" defaultMessage="Save" />
              </Action>
            </div>
          </Form>
        </div>
        <Modal
          wrapClassName="Settings__modal"
          title={
            isAvatar
              ? intl.formatMessage({
                  id: 'profile_change_avatar',
                  defaultMessage: 'Change avatar',
                })
              : intl.formatMessage({
                  id: 'profile_change_cover',
                  defaultMessage: 'Change cover',
                })
          }
          closable
          onCancel={isAvatar ? this.onOpenChangeAvatarModal : this.onOpenChangeCoverModal}
          onOk={isAvatar ? this.onOkAvatarModal : this.onOkCoverModal}
          okButtonProps={{ disabled: isLoadingImage }}
          cancelButtonProps={{ disabled: isLoadingImage }}
          visible={isModal}
        >
          {isModal && (
            <ImageSetter
              onImageLoaded={isAvatar ? this.getAvatar : this.getCover}
              onLoadingImage={this.onLoadingImage}
              isRequired
              isMultiple={false}
            />
          )}
        </Modal>
      </div>
    );
  }
}
