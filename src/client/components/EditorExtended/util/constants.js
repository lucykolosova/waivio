/*
Some of the constants which are used throughout this project instead of
directly using string.
*/

export const Block = {
  UNSTYLED: 'unstyled',
  PARAGRAPH: 'unstyled',
  OL: 'ordered-list-item',
  UL: 'unordered-list-item',
  H1: 'header-one',
  H2: 'header-two',
  H3: 'header-three',
  H4: 'header-four',
  H5: 'header-five',
  H6: 'header-six',
  CODE: 'code-block',
  BLOCKQUOTE: 'blockquote',
  PULLQUOTE: 'pullquote',
  ATOMIC: 'atomic',
  BLOCKQUOTE_CAPTION: 'block-quote-caption',
  CAPTION: 'caption',
  TODO: 'todo',
  IMAGE: 'atomic:image',
  BREAK: 'atomic:break',
  STORY_TITLE: 'story-title',
};

export const Inline = {
  BOLD: 'BOLD',
  CODE: 'CODE',
  ITALIC: 'ITALIC',
  STRIKETHROUGH: 'STRIKETHROUGH',
  UNDERLINE: 'UNDERLINE',
  HIGHLIGHT: 'HIGHLIGHT',
};

export const Entity = {
  LINK: 'LINK',
  OBJECT: 'OBJECT',
  IMAGE: 'IMAGE',
};

export const HYPERLINK = 'hyperlink';
export const HANDLED = 'handled';
export const NOT_HANDLED = 'not_handled';

export const KEY_COMMANDS = {
  addNewBlock: () => 'add-new-block',
  changeType: (type = '') => `changetype:${type}`,
  showLinkInput: () => 'showlinkinput',
  showSearchBlock: 'showSearchBlock',
  space: 'space',
  unlink: () => 'unlink',
  toggleInline: (type = '') => `toggleinline:${type}`,
  deleteBlock: () => 'delete-block',
  backspace: 'backspace',
  enter: 'split-block',
  delete: () => 'delete',
};

export const ATOMIC_TYPES = {
  SEPARATOR: 'separator',
  IMAGE: 'image',
  VIDEO: 'video',
};

export default {
  Block,
  Inline,
  Entity,
};
