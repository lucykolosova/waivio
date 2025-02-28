import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';
import { Input, Button } from 'antd';
import { FormattedMessage } from 'react-intl';

import BlockToolbar from './blocktoolbar';
import InlineToolbar from './inlinetoolbar';

import { getSelection, getSelectionRect } from '../util/index';
import { getCurrentBlock } from '../model/index';
import { Entity, HYPERLINK } from '../util/constants';
import './toolbar.less';

export default class Toolbar extends React.Component {
  static propTypes = {
    editorEnabled: PropTypes.bool,
    editorState: PropTypes.shape(),
    toggleBlockType: PropTypes.func,
    toggleInlineStyle: PropTypes.func,
    inlineButtons: PropTypes.arrayOf(PropTypes.object),
    blockButtons: PropTypes.arrayOf(PropTypes.object),
    editorNode: PropTypes.shape(),
    setLink: PropTypes.func,
    focus: PropTypes.func,
    intl: PropTypes.shape(),
  };

  static defaultProps = {
    editorEnabled: false,
    editorState: {},
    toggleBlockType: () => {},
    toggleInlineStyle: () => {},
    blockButtons: BLOCK_BUTTONS,
    inlineButtons: INLINE_BUTTONS,
    editorNode: {},
    setLink: () => {},
    focus: () => {},
    intl: {},
  };

  constructor(props) {
    super(props);
    this.state = {
      showURLInput: false,
      urlInputValue: '',
    };

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onChange = this.onChange.bind(this);
    this.handleLinkInput = this.handleLinkInput.bind(this);
    this.hideLinkInput = this.hideLinkInput.bind(this);
  }

  componentWillReceiveProps(newProps) {
    const { editorState } = newProps;

    if (!newProps.editorEnabled) {
      return;
    }
    const selectionState = editorState.getSelection();

    if (selectionState.isCollapsed()) {
      if (this.state.showURLInput) {
        this.setState({
          showURLInput: false,
          urlInputValue: '',
        });
      }
    }
    const isFirstLine = this.isFirstBlockSelected(editorState);

    if (isFirstLine !== this.state.isFirstLine) {
      this.setState({ isFirstLine });
    }
  }

  // shouldComponentUpdate(newProps, newState) {
  //   console.log(newState, this.state);
  //   if (newState.showURLInput !== this.state.showURLInput && newState.urlInputValue !== this.state.urlInputValue) {
  //     return true;
  //   }
  //   return false;
  // }

  componentDidUpdate() {
    if (!this.props.editorEnabled || this.state.showURLInput) {
      return;
    }
    const selectionState = this.props.editorState.getSelection();

    if (selectionState.isCollapsed()) {
      return;
    }
    // eslint-disable-next-line no-undef
    const nativeSelection = getSelection(window);

    if (!nativeSelection.rangeCount) {
      return;
    }
    const selectionBoundary = getSelectionRect(nativeSelection);

    // eslint-disable-next-line react/no-find-dom-node
    const toolbarNode = ReactDOM.findDOMNode(this);
    const toolbarBoundary = toolbarNode.getBoundingClientRect();

    // eslint-disable-next-line react/no-find-dom-node
    const parent = ReactDOM.findDOMNode(this.props.editorNode);
    const parentBoundary = parent.getBoundingClientRect();

    /*
     * Main logic for setting the toolbar position.
     */
    toolbarNode.style.top = `${selectionBoundary.bottom - parentBoundary.top + 4}px`;
    toolbarNode.style.width = `${toolbarBoundary.width}px`;

    // The left side of the tooltip should be:
    // center of selection relative to parent - half width of toolbar
    const selectionCenter =
      selectionBoundary.left + selectionBoundary.width / 2 - parentBoundary.left;
    let left = selectionCenter - toolbarBoundary.width / 2;
    const screenLeft = parentBoundary.left + left;

    if (screenLeft < 0) {
      // If the toolbar would be off-screen
      // move it as far left as it can without going off-screen
      left = -parentBoundary.left;
    }
    toolbarNode.style.left = `${left}px`;
  }

  onKeyDown(e) {
    if (e.which === 13) {
      e.preventDefault();
      e.stopPropagation();
      this.setLink();
    } else if (e.which === 27) {
      this.hideLinkInput();
    }
  }

  setLink = () => {
    this.props.setLink(this.state.urlInputValue);
    this.hideLinkInput();
  };

  onChange(e) {
    this.setState({
      urlInputValue: e.target.value,
    });
  }

  handleLinkInput(e, direct = false) {
    if (direct !== true) {
      e.preventDefault();
      e.stopPropagation();
    }
    const { editorState } = this.props;
    const selection = editorState.getSelection();

    if (selection.isCollapsed()) {
      this.props.focus();

      return;
    }
    const currentBlock = getCurrentBlock(editorState);
    let selectedEntity = '';
    let linkFound = false;

    currentBlock.findEntityRanges(
      character => {
        const entityKey = character.getEntity();

        selectedEntity = entityKey;

        return (
          entityKey !== null &&
          editorState
            .getCurrentContent()
            .getEntity(entityKey)
            .getType() === Entity.LINK
        );
      },
      (start, end) => {
        let selStart = selection.getAnchorOffset();
        let selEnd = selection.getFocusOffset();

        if (selection.getIsBackward()) {
          selStart = selection.getFocusOffset();
          selEnd = selection.getAnchorOffset();
        }
        if (start === selStart && end === selEnd) {
          linkFound = true;
          const { url } = editorState
            .getCurrentContent()
            .getEntity(selectedEntity)
            .getData();

          this.setState(
            {
              showURLInput: true,
              urlInputValue: url,
            },
            () => {
              setTimeout(() => {
                this.urlinput.focus();
                this.urlinput.select();
              }, 0);
            },
          );
        }
      },
    );
    if (!linkFound) {
      this.setState(
        {
          showURLInput: true,
        },
        () => {
          setTimeout(() => {
            this.urlinput.focus();
          }, 0);
        },
      );
    }
  }

  hideLinkInput(e = null) {
    if (e !== null) {
      e.preventDefault();
      e.stopPropagation();
    }
    this.setState(
      {
        showURLInput: false,
        urlInputValue: '',
      },
      this.props.focus,
    );
  }

  isFirstBlockSelected = editorState => {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    const firstBlock = contentState.getFirstBlock();
    const selectionStartBlock = contentState.getBlockForKey(selectionState.getStartKey());
    const selectionEndBlock = contentState.getBlockForKey(selectionState.getEndKey());

    return selectionStartBlock === firstBlock || selectionEndBlock === firstBlock;
  };

  render() {
    const { editorState, editorEnabled, inlineButtons, intl } = this.props;
    const { showURLInput, urlInputValue } = this.state;
    const isEmptyUrlInput = isEmpty(urlInputValue);
    let isOpen = true;

    if (!editorEnabled || editorState.getSelection().isCollapsed()) {
      isOpen = false;
    }
    if (showURLInput) {
      let className = `md-editor-toolbar${isOpen ? ' md-editor-toolbar--isopen' : ''}`;

      className += ' md-editor-toolbar--linkinput';

      return (
        <div className={className} style={{ left: 0, width: '97%' }}>
          <div
            className="md-RichEditor-controls md-RichEditor-show-link-input"
            style={{ display: 'flex' }}
          >
            <Input
              ref={node => {
                this.urlinput = node;
              }}
              className="md-url-input"
              onKeyDown={this.onKeyDown}
              onChange={this.onChange}
              placeholder={intl.formatMessage({
                id: 'toolbar_link',
                defaultMessage: 'Paste link and press Enter',
              })}
              value={urlInputValue}
            />
            <Button
              type="primary"
              htmlType="submit"
              onClick={this.setLink}
              className="md-url-button"
              style={{ display: 'block' }}
              disabled={isEmptyUrlInput}
            >
              <FormattedMessage id="enter" defaultMessage="Enter" />
            </Button>
          </div>
        </div>
      );
    }
    let hasHyperLink = false;
    let hyperlinkLabel = '#';
    let hyperlinkDescription = 'Add a link';

    for (let cnt = 0; cnt < inlineButtons.length; cnt += 1) {
      if (inlineButtons[cnt].style === HYPERLINK) {
        hasHyperLink = true;
        if (inlineButtons[cnt].label) {
          hyperlinkLabel = inlineButtons[cnt].label;
        }
        if (inlineButtons[cnt].description) {
          hyperlinkDescription = inlineButtons[cnt].description;
        }
        break;
      }
    }

    return (
      <div className={`md-editor-toolbar${isOpen ? ' md-editor-toolbar--isopen' : ''}`}>
        {this.props.blockButtons.length > 0 ? (
          <BlockToolbar
            editorState={editorState}
            onToggle={this.props.toggleBlockType}
            buttons={this.props.blockButtons}
          />
        ) : null}
        {this.props.inlineButtons.length > 0 ? (
          <InlineToolbar
            editorState={editorState}
            onToggle={this.props.toggleInlineStyle}
            buttons={this.props.inlineButtons}
          />
        ) : null}
        {hasHyperLink && (
          <div className="md-RichEditor-controls">
            <span
              className="md-RichEditor-styleButton md-RichEditor-linkButton hint--top"
              role="presentation"
              onClick={this.handleLinkInput}
              aria-label={hyperlinkDescription}
            >
              {hyperlinkLabel}
            </span>
          </div>
        )}
      </div>
    );
  }
}

export const BLOCK_BUTTONS = [
  {
    label: 'H2',
    style: 'header-two',
    icon: 'header',
    description: 'Heading 2',
  },
  {
    label: 'H3',
    style: 'header-three',
    icon: 'header',
    description: 'Heading 3',
  },
  {
    label: (
      <svg width="10.83" height="10" viewBox="0 0 13 12">
        <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
          <g transform="translate(-357.000000, -255.000000)" fill="#FFFFFF">
            <g transform="translate(260.000000, 165.000000)">
              <g transform="translate(0.000000, 75.000000)">
                <g transform="translate(19.000000, 0.000000)">
                  <path d="M90.500768,15 L91,15.56 C88.9631235,17.0533408 87.9447005,18.666658 87.9447005,20.4 C87.9447005,21.8800074 88.75012,23.1466614 90.3609831,24.2 L87.5453149,27 C85.9211388,25.7866606 85.109063,24.346675 85.109063,22.68 C85.109063,20.3199882 86.90628,17.7600138 90.500768,15 Z M83.3917051,15 L83.890937,15.56 C81.8540605,17.0533408 80.8356375,18.666658 80.8356375,20.4 C80.8356375,21.8800074 81.6344006,23.1466614 83.2319508,24.2 L80.4362519,27 C78.8120759,25.7866606 78,24.346675 78,22.68 C78,20.3199882 79.7972171,17.7600138 83.3917051,15 Z" />
                </g>
              </g>
            </g>
          </g>
        </g>
      </svg>
    ),
    style: 'blockquote',
    description: 'Blockquote',
  },
];

export const INLINE_BUTTONS = [
  {
    label: 'B',
    style: 'BOLD',
    icon: 'bold',
    description: 'Bold',
  },
  {
    label: 'I',
    style: 'ITALIC',
    icon: 'italic',
    description: 'Italic',
  },
  {
    label: (
      <svg width="20" height="15" viewBox="0 0 14 14">
        <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
          <g transform="translate(-468.000000, -254.000000)" stroke="#FFFFFF">
            <g transform="translate(260.000000, 165.000000)">
              <g transform="translate(0.000000, 75.000000)">
                <g transform="translate(19.000000, 0.000000)">
                  <g transform="translate(196.424621, 21.424621) rotate(45.000000) translate(-196.424621, -21.424621) translate(193.424621, 13.924621)">
                    <path d="M0.5,5.69098301 L0.5,2 C0.5,1.82069363 0.550664909,1.51670417 0.697213595,1.2236068 C0.927818928,0.762396132 1.32141313,0.5 2,0.5 L4,0.5 C4.67858687,0.5 5.07218107,0.762396132 5.3027864,1.2236068 C5.44933509,1.51670417 5.5,1.82069363 5.5,2 L5.5,6 C5.5,6.67858687 5.23760387,7.07218107 4.7763932,7.3027864 C4.53586606,7.42304998 4.28800365,7.47874077 4.1077327,7.49484936 L0.5,5.69098301 Z" />
                    <path
                      d="M0.5,12.690983 L0.5,9 C0.5,8.82069363 0.550664909,8.51670417 0.697213595,8.2236068 C0.927818928,7.76239613 1.32141313,7.5 2,7.5 L4,7.5 C4.67858687,7.5 5.07218107,7.76239613 5.3027864,8.2236068 C5.44933509,8.51670417 5.5,8.82069363 5.5,9 L5.5,13 C5.5,13.6785869 5.23760387,14.0721811 4.7763932,14.3027864 C4.53586606,14.42305 4.28800365,14.4787408 4.1077327,14.4948494 L0.5,12.690983 Z"
                      transform="translate(3.000000, 11.000000) scale(-1, -1) translate(-3.000000, -11.000000) "
                    />
                  </g>
                </g>
              </g>
            </g>
          </g>
        </g>
      </svg>
    ),
    style: HYPERLINK,
    icon: 'link',
    description: 'Add a link',
  },
];
