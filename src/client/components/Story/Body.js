import React from 'react';
import ReactDOMServer from 'react-dom/server';
import PropTypes from 'prop-types';
import { isUndefined, filter, isEmpty, get } from 'lodash';
import classNames from 'classnames';
import sanitizeHtml from 'sanitize-html';
import Remarkable from 'remarkable';
import { injectIntl } from 'react-intl';
import steemEmbed from '../../vendor/embedMedia';
import { jsonParse } from '../../helpers/formatter';
import sanitizeConfig from '../../vendor/SanitizeConfig';
import { imageRegex, dtubeImageRegex, rewriteRegex } from '../../helpers/regexHelpers';
import htmlReady from '../../vendor/steemitHtmlReady';
import improve from '../../helpers/improve';
import PostFeedEmbed from './PostFeedEmbed';
import DetailsBody from '../../rewards/Details/DetailsBody';
import './Body.less';
import { getFieldWithMaxWeight } from '../../object/wObjectHelper';

export const remarkable = new Remarkable({
  html: true,
  breaks: true,
  linkify: false,
  typographer: false,
  quotes: '“”‘’',
});

const getEmbed = link => {
  const embed = steemEmbed.get(link, { width: '100%', height: 400, autoplay: false });

  if (isUndefined(embed)) {
    return {
      provider_name: '',
      thumbnail: '',
      embed: link,
    };
  }

  return embed;
};

// Should return text(html) if returnType is text
// Should return Object(React Compatible) if returnType is Object
export function getHtml(body, jsonMetadata = {}, returnType = 'Object', options = {}) {
  const parsedJsonMetadata = jsonParse(jsonMetadata) || {};
  parsedJsonMetadata.image = parsedJsonMetadata.image || [];
  if (!body) return '';
  let parsedBody = body.replace(/<!--([\s\S]+?)(-->|$)/g, '(html comment removed: $1)');

  parsedBody.replace(imageRegex, img => {
    if (filter(parsedJsonMetadata.image, i => i.indexOf(img) !== -1).length === 0) {
      parsedJsonMetadata.image.push(img);
    }
  });

  parsedBody = improve(parsedBody);
  parsedBody = remarkable.render(parsedBody);

  const htmlReadyOptions = { mutate: true, resolveIframe: returnType === 'text' };
  parsedBody = htmlReady(parsedBody, htmlReadyOptions).html;
  parsedBody = parsedBody.replace(dtubeImageRegex, '');

  if (options.rewriteLinks) {
    parsedBody = parsedBody.replace(rewriteRegex, (match, p1) => `"${p1 || '/'}"`);
  }

  parsedBody = sanitizeHtml(
    parsedBody,
    sanitizeConfig({
      appUrl: options.appUrl,
      secureLinks: options.secureLinks,
    }),
  );
  if (returnType === 'text') {
    return parsedBody;
  }

  const sections = [];

  const splittedBody = parsedBody.split('~~~ embed:');
  for (let i = 0; i < splittedBody.length; i += 1) {
    let section = splittedBody[i];

    const match = section.match(/^([A-Za-z0-9/_-]+) ([A-Za-z0-9]+) (\S+) ~~~/);
    if (match && match.length >= 4) {
      const id = match[1];
      const type = match[2];
      const link = match[3];
      const embed = getEmbed(link);
      sections.push(
        ReactDOMServer.renderToString(<PostFeedEmbed key={`embed-a-${i}`} inPost embed={embed} />),
      );
      section = section.substring(`${id} ${type} ${link} ~~~`.length);
    }
    if (section !== '') {
      sections.push(section);
    }
  }
  // eslint-disable-next-line react/no-danger
  return <div dangerouslySetInnerHTML={{ __html: sections.join('') }} />;
}

const getObjectDetails = metaData => {
  try {
    if (!metaData) return {};
    const parsedJsonMetadata = jsonParse(metaData) || {};
    return get(parsedJsonMetadata, 'waivioRewards.proposition') || {};
  } catch (e) {
    return {};
  }
};

const getProposedWobj = metaData => {
  try {
    if (!metaData) return {};
    const parsedJsonMetadata = jsonParse(metaData) || {};
    return get(parsedJsonMetadata, 'waivioRewards.proposedWobj') || {};
  } catch (e) {
    return {};
  }
};

const Body = props => {
  const options = {
    appUrl: props.appUrl,
    rewriteLinks: props.rewriteLinks,
    secureLinks: props.exitPageSetting,
  };
  const htmlSections = getHtml(props.body, props.json_metadata, 'Object', options);
  const objectDetails = getObjectDetails(props.json_metadata);
  const proposedWobj = getProposedWobj(props.json_metadata);
  const requiredObjectName = getFieldWithMaxWeight(objectDetails.required_object, 'name');

  return (
    <div className={classNames('Body', { 'Body--full': props.full })}>
      {htmlSections}{' '}
      {!isEmpty(objectDetails) && (
        <DetailsBody
          objectDetails={objectDetails}
          intl={props.intl}
          proposedWobj={proposedWobj}
          requiredObjectName={requiredObjectName}
        />
      )}
    </div>
  );
};

Body.propTypes = {
  appUrl: PropTypes.string.isRequired,
  rewriteLinks: PropTypes.bool.isRequired,
  exitPageSetting: PropTypes.bool.isRequired,
  body: PropTypes.string,
  json_metadata: PropTypes.string,
  full: PropTypes.bool,
  intl: PropTypes.shape().isRequired,
};

Body.defaultProps = {
  body: '',
  json_metadata: '',
  full: false,
};

export default injectIntl(Body);
