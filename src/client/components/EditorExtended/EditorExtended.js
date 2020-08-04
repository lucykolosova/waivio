import React from 'react';
import PropTypes from 'prop-types';
import { CompositeDecorator, convertToRaw, EditorState } from 'draft-js';
import { forEach, get, has, keyBy, isEqual, isEmpty } from 'lodash';
import { Input } from 'antd';
import {
  Editor as MediumDraftEditor,
  createEditorState,
  fromMarkdown,
  Entity,
  findLinkEntities,
} from './index';
import ImageSideButton from './components/sides/ImageSideButton';
import VideoSideButton from './components/sides/VideoSideButton';
import SeparatorButton from './components/sides/SeparatorSideButton';
import ObjectSideButton from './components/sides/ObjectSideButton';
import { getObjectsByIds } from '../../../waivioApi/ApiClient';
import { getClientWObj } from '../../adapters';
import ObjectLink, { findObjEntities } from './components/entities/objectlink';
import Link from './components/entities/link';

const SIDE_BUTTONS = [
  {
    title: 'Image',
    component: ImageSideButton,
  },
  {
    title: 'Video',
    component: VideoSideButton,
  },
  {
    title: 'Object',
    component: ObjectSideButton,
  },
  {
    title: 'Separator',
    component: SeparatorButton,
  },
];

const defaultDecorators = new CompositeDecorator([
  {
    strategy: findObjEntities,
    component: ObjectLink,
  },
  {
    strategy: findLinkEntities,
    component: Link,
  },
]);

class Editor extends React.Component {
  static propTypes = {
    // passed props:
    enabled: PropTypes.bool.isRequired,
    initialContent: PropTypes.shape({
      title: PropTypes.string,
      body: PropTypes.string,
    }).isRequired,
    locale: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    intl: PropTypes.shape(),
    currDraft: PropTypes.shape(),
  };
  static defaultProps = {
    intl: {},
    currDraft: {},
    onChange: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      isMounted: false,
      editorEnabled: false,
      editorState: EditorState.createEmpty(defaultDecorators),
      titleValue: '',
    };

    this.onChange = editorState => {
      this.setState({ editorState });
    };
    this.refsEditor = React.createRef();
  }

  componentDidMount() {
    this.setState({ isMounted: true, titleValue: this.props.initialContent.title }); // eslint-disable-line
    this.restoreObjects(fromMarkdown(this.props.initialContent)).then(() =>
      this.setFocusAfterMount(),
    );
  }

  componentWillReceiveProps(nextProps) {
    console.log('props: ', this.props.initialContent.title);
    console.log('nextProps: ', nextProps.initialContent.title);
    console.log('currDraft: ', this.props.currDraft);

    if (this.props.currDraft.title === nextProps.initialContent.title) {
      this.setState({ titleValue: this.props.currDraft.title });
    }

    if (!isEqual(this.props.initialContent, nextProps.initialContent)) {
      this.setState({ editorEnabled: false });
      const rawContent = fromMarkdown(nextProps.initialContent);
      this.handleContentChange(createEditorState(rawContent));
      this.restoreObjects(rawContent).then(() => this.setFocusAfterMount());
    }
  }

  setFocusAfterMount = () => {
    setTimeout(() => this.refsEditor.current.focus(), 0);
    this.setState({ editorEnabled: true });
  };

  restoreObjects = async rawContent => {
    const objectIds = Object.values(rawContent.entityMap)
      .filter(entity => entity.type === Entity.OBJECT && has(entity, 'data.object.id'))
      .map(entity => get(entity, 'data.object.id', ''));

    if (objectIds.length) {
      const response = await getObjectsByIds({
        authorPermlinks: objectIds,
        locale: this.props.locale,
        requiredFields: ['rating'],
      });
      const loadObjects = keyBy(response.wobjects, 'author_permlink');
      const entityMap = {};
      forEach(rawContent.entityMap, (value, key) => {
        const loadedObject =
          value.type === Entity.OBJECT && loadObjects[get(value, 'data.object.id')];
        entityMap[key] = {
          ...value,
          data: loadedObject
            ? { ...value.data, object: getClientWObj(loadedObject, this.props.locale) }
            : { ...value.data },
        };
      });
      const rawContentUpdated = {
        blocks: [...rawContent.blocks],
        entityMap,
      };

      this.handleContentChange(createEditorState(rawContentUpdated));
    }
    // eslint-disable-next-line no-unused-expressions
    !isEmpty(rawContent.blocks) && this.handleContentChange(createEditorState(rawContent));
  };

  handleContentChange = editorState => {
    this.onChange(editorState);
    this.props.onChange(convertToRaw(editorState.getCurrentContent()), this.state.titleValue);
  };

  getValueFromTitle = event => this.setState({ titleValue: event.target.value });

  render() {
    const { editorState, isMounted, editorEnabled, titleValue } = this.state;
    return (
      <React.Fragment>
        <Input.TextArea
          maxLength={255}
          autoSize
          className="md-RichEditor-title"
          value={titleValue}
          placeholder={this.props.intl.formatMessage({ id: 'title', defaultMessage: 'Title' })}
          onChange={this.getValueFromTitle}
        />
        <div className="waiv-editor">
          {isMounted ? (
            <MediumDraftEditor
              ref={this.refsEditor}
              placeholder={this.props.intl.formatMessage({
                id: 'story_placeholder',
                defaultMessage: 'Write your story...',
              })}
              editorEnabled={editorEnabled && this.props.enabled}
              editorState={editorState}
              beforeInput={this.handleBeforeInput}
              onChange={this.handleContentChange}
              sideButtons={SIDE_BUTTONS}
              intl={this.props.intl}
              titleValue={this.state.titleValue}
            />
          ) : null}
        </div>
      </React.Fragment>
    );
  }
}

export default Editor;
