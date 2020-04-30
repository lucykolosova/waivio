import uuidv4 from 'uuid/v4';
import _, { fromPairs, get, isEmpty } from 'lodash';
import { getHtml } from '../components/Story/Body';
import { extractImageTags, extractLinks } from './parser';
import { botNameRegex, categoryRegex } from './regexHelpers';
import { jsonParse } from './formatter';
import DMCA from '../../common/constants/dmca.json';
import whiteListedApps from './apps';
import { rewardsValues } from '../../common/constants/rewards';
import {
  APP_NAME,
  INVESTARENA_META_FIELD_NAME,
  WAIVIO_META_FIELD_NAME,
  WAIVIO_PARENT_PERMLINK,
} from '../../common/constants/waivio';
import { baseUrl } from '../../waivioApi/routes';
import { invArena } from '../../investarena/configApi/apiResources';

const appVersion = require('../../../package.json').version;

export const forecastPostMessage = '> This post contains';

export const guestCommentMessage = ' This message was written by guest';

export const isPostDeleted = post => post.title === 'deleted' && post.body === 'deleted';

export const isPostTaggedNSFW = post => {
  if (post.parent_permlink === 'nsfw') return true;

  const postJSONMetaData = _.attempt(JSON.parse, post.json_metadata);

  if (_.isError(postJSONMetaData)) return false;

  return _.includes(postJSONMetaData.tags, 'nsfw');
};

export function dropCategory(url) {
  return url ? url.replace(categoryRegex, '') : null;
}

export const replaceBotWithGuestName = (url, guestInfo) =>
  url && guestInfo && guestInfo.userId ? url.replace(botNameRegex, `@${guestInfo.userId}`) : url;

/**
 * Gets app data from a post.
 * Only Returns app info from apps whitelisted in apps.json
 * @param post
 * @returns An empty object if app is not valid otherwise an object with {appName: String, version: String}
 */
export function getAppData(post) {
  try {
    const jsonMetadata = jsonParse(post.json_metadata);
    const appDetails = _.get(jsonMetadata, 'app', '');
    const appData = _.split(appDetails, '/');
    const appKey = _.get(appData, 0, '');
    const version = _.get(appData, 1, '');

    if (whiteListedApps[appKey]) {
      return {
        appName: whiteListedApps[appKey],
        version,
      };
    }
    return {};
  } catch (error) {
    return {};
  }
}

export const isBannedPost = post => {
  const bannedAuthors = _.get(DMCA, 'authors', []);
  const bannedPosts = _.get(DMCA, 'posts', []);
  const postURL = `${post.author}/${post.permlink}`;

  return _.includes(bannedAuthors, post.author) || _.includes(bannedPosts, postURL);
};

export function getContentImages(content, parsed = false) {
  const parsedBody = parsed ? content : getHtml(content, {}, 'text');

  return extractImageTags(parsedBody).map(tag =>
    _.unescape(tag.src.replace('https://images.hive.blog/0x0/', '')),
  );
}

export function createPostMetadata(body, tags, oldMetadata = {}, appData) {
  let metaData = {
    community: APP_NAME,
    app: `${APP_NAME}/${appVersion}`,
    format: 'markdown',
  };

  metaData = {
    ...oldMetadata,
    ...metaData,
  };

  const users = [];
  const userRegex = /@([a-zA-Z.0-9-]+)/g;
  let matches;

  // eslint-disable-next-line no-cond-assign
  while ((matches = userRegex.exec(body))) {
    if (users.indexOf(matches[1]) === -1) {
      users.push(matches[1]);
    }
  }

  const parsedBody = getHtml(body, {}, 'text');

  const images = getContentImages(parsedBody, true);
  const links = extractLinks(parsedBody);

  metaData.tags = tags.map(tag => tag.toLowerCase());
  metaData.users = users;
  metaData.links = links.slice(0, 10);
  metaData.image = images;
  if (appData && appData.waivioData) {
    metaData[WAIVIO_META_FIELD_NAME] = appData.waivioData;
  }
  if (appData && appData.forecast && appData.forecast.quoteSecurity && appData.forecast.recommend) {
    metaData[INVESTARENA_META_FIELD_NAME] = appData.forecast;
  }

  return metaData;
}

export function attachPostInfo(postData, permlink) {
  const { jsonMetadata, author, body } = postData;
  let additionalMsg = '';
  const forecast = jsonMetadata[INVESTARENA_META_FIELD_NAME];
  if (forecast && forecast.wobjData) {
    const { author_permlink: objectPermlink, name } = forecast.wobjData;
    additionalMsg += `\n${forecastPostMessage} [forecast](${invArena.baseUrl}@${author}/${permlink}) for [${name}](${invArena.baseUrl}object/${objectPermlink})`;
  }
  return body + additionalMsg;
}

/**
 *
 * @param markdownContent: string
 * @param titleKey - string (optional)
 * @param bodyKey - string (optional)
 * @returns Object with post's title and body - {postBody: string, postTitle: string}
 */
export function splitPostContent(
  markdownContent,
  { titleKey, bodyKey } = { titleKey: 'postTitle', bodyKey: 'postBody' },
) {
  // eslint-disable-next-line no-control-regex
  const regExp = new RegExp('^(.*)\n');
  const postTitle = regExp.exec(markdownContent);
  const postBody = postTitle && markdownContent.replace(regExp, '');
  return {
    [titleKey]: postTitle ? postTitle[0].trim() : '',
    [bodyKey]: postBody || '',
  };
}

export function getObjectUrl(objPermlink) {
  if (!objPermlink) return '';
  return `${baseUrl}/object/${objPermlink}`;
}

export function getInitialState(props) {
  let state = {
    campaign: props.campaignId ? { id: props.campaignId } : null,
    draftId: uuidv4(),
    parentPermlink: WAIVIO_PARENT_PERMLINK,
    draftContent: {
      title: '',
      body: props.initObjects
        ? props.initObjects.reduce((acc, curr) => {
            const matches = curr.match(/^\[(.+)\]\((\S+)\)/);
            if (matches[1] && matches[2]) {
              return `${acc}[${matches[1]}](${getObjectUrl(matches[2])})\n`;
            }
            return acc;
          }, '')
        : '',
    },
    content: '',
    topics: [],
    linkedObjects: [],
    objPercentage: {},
    settings: {
      reward: rewardsValues.half,
      beneficiary: true,
      upvote: props.upvoteSetting,
    },
    isUpdating: false,
    permlink: null,
    originalBody: null,
    forecastValues: { isValid: true },
    expForecast: null,
  };
  const { draftPosts, draftId } = props;
  const draftPost = draftPosts.find(d => d.draftId === draftId);
  if (draftId && draftPost) {
    const draftObjects = get(draftPost, ['jsonMetadata', WAIVIO_META_FIELD_NAME, 'wobjects'], []);
    const tags = get(draftPost, ['jsonMetadata', 'tags'], []);
    const forecastValues = get(draftPost, ['jsonMetadata', INVESTARENA_META_FIELD_NAME], null);
    state = {
      campaign: draftPost.campaignId ? { id: draftPost.campaignId } : null,
      draftId: props.draftId,
      parentPermlink: draftPost.parentPermlink || WAIVIO_PARENT_PERMLINK,
      draftContent: {
        title: get(draftPost, 'title', ''),
        body: get(draftPost, 'body', ''),
      },
      content: '',
      topics: typeof tags === 'string' ? [tags] : tags,
      linkedObjects: [],
      objPercentage: fromPairs(
        draftObjects.map(obj => [obj.author_permlink, { percent: obj.percent }]),
      ),
      settings: {
        reward: draftPost.reward,
        beneficiary: draftPost.beneficiary,
        upvote: draftPost.upvote,
      },
      isUpdating: Boolean(draftPost.isUpdating),
      forecastValues: forecastValues
        ? { ...forecastValues, selectForecast: 'Custom', isValid: true }
        : { isValid: true },
      expForecast: !isEmpty(draftPost.exp_forecast) ? draftPost.exp_forecast : null,
      permlink: draftPost.permlink || null,
      originalBody: draftPost.originalBody || null,
    };
  }
  return state;
}

export function isContentValid(markdownContent) {
  const { postTitle, postBody } = splitPostContent(markdownContent);
  return Boolean(postTitle && postBody.trim());
}

export function validatePost(mdPostContent, objPercentage, forecast) {
  const errors = [];
  if (!(mdPostContent && isContentValid(mdPostContent))) {
    errors.push({
      intlId: 'post_validation_incomplete_content',
      message: 'The post should contain the title and content',
    });
  }
  if (isEmpty(objPercentage)) {
    errors.push({
      intlId: 'post_validation_object_not_found',
      message: 'The post must contain at least one topic',
    });
  }
  if (forecast && !forecast.isValid) {
    errors.push({
      intlId: 'post_validation_invalid_forecast',
      message: 'Fill in the required fields',
    });
  }
  return { errors, hasError: Boolean(errors.length) };
}
