import { orderBy } from 'lodash';
import { connect } from 'react-redux';
import LastDrafts from '../../components/Sidebar/LastDrafts';
import { getIsLoaded } from '../../store/authStore/authSelectors';
import { getDraftPosts, getIsEditorSaving } from '../../store/editorStore/editorSelectors';

const mapStateToProps = state => {
  const sortedDrafts = orderBy(getDraftPosts(state), draft => new Date(draft.lastUpdated), [
    'desc',
  ]);

  return {
    loaded: getIsLoaded(state),
    drafts: sortedDrafts.slice(0, 4),
  };
};

export default connect(mapStateToProps)(LastDrafts);
