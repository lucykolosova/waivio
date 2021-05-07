import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { injectIntl } from 'react-intl';
import EditPost from './EditPost';
import requiresLogin from '../../auth/requiresLogin';
import { isGuestUser } from '../../store/authStore/authSelectors';
import { getSuitableLanguage } from '../../store/reducers';
import {
  getEditor,
  getDraftPosts,
  getCurrentDraft,
  getIsEditorSaving,
  getIsEditorLoading,
  getIsImageUploading,
  getFilteredObjectCards,
} from '../../store/editorStore/editorSelectors';
import { getBeneficiariesUsers } from '../../store/searchStore/searchSelectors';
import { getIsWaivio } from '../../store/appStore/appSelectors';
import {
  buildPost,
  saveDraft,
  createPost,
  setEditorState,
  reviewCheckInfo,
  handleObjectSelect,
  setUpdatedEditorData,
  firstParseLinkedObjects,
} from '../../store/editorStore/editorActions';

const mapStateToProps = (state, props) => {
  const draftId = new URLSearchParams(props.location.search).get('draft');

  return {
    draftId,
    locale: getSuitableLanguage(state),
    draftPosts: getDraftPosts(state),
    publishing: getIsEditorLoading(state),
    saving: getIsEditorSaving(state),
    imageLoading: getIsImageUploading(state),
    isGuest: isGuestUser(state),
    beneficiaries: getBeneficiariesUsers(state),
    isWaivio: getIsWaivio(state),
    editor: getEditor(state),
    currDraft: getCurrentDraft(state, { draftId }),
    filteredObjectsCards: getFilteredObjectCards(state),
  };
};

const mapDispatchToProps = (dispatch, props) => {
  const draftId = new URLSearchParams(props.location.search).get('draft');

  return {
    setEditorState: editorState => dispatch(setEditorState(editorState)),
    firstParseLinkedObjects: draft => dispatch(firstParseLinkedObjects(draft)),
    createPost: (postData, beneficiaries, isReview, campaign, intl) =>
      dispatch(createPost(postData, beneficiaries, isReview, campaign, intl)),
    saveDraft: data => dispatch(saveDraft(draftId, props.intl, data)),
    getReviewCheckInfo: (data, needReviewTitle) => dispatch(reviewCheckInfo(data, needReviewTitle)),
    setUpdatedEditorData: data => dispatch(setUpdatedEditorData(data)),
    buildPost: () => dispatch(buildPost(draftId)),
    handleObjectSelect: object => dispatch(handleObjectSelect(object)),
  };
};

export default requiresLogin(
  withRouter(connect(mapStateToProps, mapDispatchToProps)(injectIntl(EditPost))),
);
