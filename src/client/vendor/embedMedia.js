/**
 * This function is from busyorg source code
 * that was extended to support dtube and 3speak links
 * https://github.com/busyorg/embedjs/blob/dev/lib/embedjs.js
 */

import getUrls from 'get-urls';

import { VIDEO_MATCH_URL } from '../../common/helpers/regexHelpers';

const SteemEmbed = {};

SteemEmbed.getUrls = function(text) {
  let urls = [];
  try {
    urls = getUrls(text);
  } catch (e) {
    console.log(e);
  }
  return urls;
};

SteemEmbed.getAll = function(text, options) {
  const embeds = [];

  if (!options) options = {};
  options.width = options.width || '100%';
  options.height = options.height || '400';
  options.autoplay = 'autoplay' in options ? options.autoplay : true;

  let urls = this.getUrls(text);
  urls.forEach(
    function(url) {
      let embed = this.get(url, options);
      if (embed) {
        embeds.push(this.get(url, options));
      }
    }.bind(this),
  );
  return embeds;
};

SteemEmbed.get = function(url, options) {
  const youtubeId = this.isYoutube(url);
  const dTubeId = this.isDTube(url);
  const threeSpeakId = this.is3Speak(url);
  const twitchChannel = this.isTwitch(url);
  const periscopeId = this.isPeriscope(url);
  const soundcloudId = this.isSoundcloud(url);
  const vimeoId = this.isVimeo(url);
  const bitchuteId = this.isBitchute(url);
  const rumbleId = this.isRumble(url);

  if (youtubeId) {
    return {
      type: 'video',
      url: url,
      provider_name: 'YouTube',
      thumbnail: 'https://img.youtube.com/vi/' + youtubeId + '/0.jpg',
      id: youtubeId,
      embed: this.youtube(url, youtubeId, options),
    };
  } else if (dTubeId) {
    return {
      type: 'video',
      url: url,
      provider_name: 'DTube',
      thumbnail:
        options.thumbnail ||
        'https://waivio.nyc3.digitaloceanspaces.com/1588765219_b21a550e-5fa2-45e1-801c-4325b26fd5bf',
      id: dTubeId,
      embed: this.dTube(url, dTubeId, options),
    };
  } else if (threeSpeakId) {
    const [, permlink] = threeSpeakId.split('/');
    return {
      type: 'video',
      url: url,
      provider_name: '3Speak',
      thumbnail: `https://img.3speakcontent.co/${permlink}/thumbnail.png`,
      id: threeSpeakId,
      embed: this.threeSpeak(url, threeSpeakId, options),
    };
  } else if (twitchChannel) {
    return {
      type: 'video',
      url: url,
      provider_name: 'Twitch',
      id: twitchChannel,
      embed: this.twitch(url, twitchChannel, options),
    };
  } else if (periscopeId) {
    return {
      type: 'video',
      url: url,
      provider_name: 'Periscope',
      id: periscopeId,
      embed: this.periscope(url, periscopeId, options),
    };
  } else if (soundcloudId) {
    return {
      type: 'music',
      url: url,
      provider_name: 'SoundCloud',
      id: soundcloudId,
      embed: this.soundcloud(url, soundcloudId, options),
    };
  } else if (vimeoId) {
    return {
      type: 'music',
      url: url,
      provider_name: 'Vimeo',
      id: vimeoId,
      embed: this.vimeo(url, vimeoId, options),
    };
  } else if (bitchuteId) {
    return {
      type: 'video',
      url: url,
      provider_name: 'BitChute',
      id: bitchuteId,
      embed: this.bitchute(url, bitchuteId, options),
    };
  } else if (rumbleId) {
    return {
      type: 'video',
      url: url,
      provider_name: 'Rumble',
      id: rumbleId,
      embed: this.rumble(url, rumbleId, options),
    };
  }
};

SteemEmbed.isYoutube = function(url) {
  const match = url.match(VIDEO_MATCH_URL.YOUTUBE);
  return match ? match[1] : false;
};

SteemEmbed.youtube = function(url, id, options) {
  let timerMatches = url.match(/[?&]t=([0-9]+h)*([0-9]+m)*([0-9]+s)+/);
  let autoplayValue = options.autoplay ? 1 : 0;
  let srcUrl = '//www.youtube.com/embed/' + id + '?autoplay=' + autoplayValue;
  if (timerMatches && timerMatches[3]) {
    srcUrl +=
      '&start=' +
      ((parseInt(timerMatches[1], 10) || 0) * 3600 +
        (parseInt(timerMatches[2]) || 0) * 60 +
        (parseInt(timerMatches[3]) || 0));
  }
  return (
    '<iframe width="' +
    options.width +
    '" height="' +
    options.height +
    '" src="' +
    srcUrl +
    '" frameborder="0" scrolling="no" allowfullscreen></iframe>'
  );
};

SteemEmbed.isDTube = function(url) {
  const p = /^https:\/\/(emb\.)?d\.tube(\/#!)?(\/v)?\/([^/"]+\/[^/"]+)$/;
  return url.match(p) ? RegExp.$4 : false;
};

SteemEmbed.dTube = function(url, id, options) {
  return (
    '<iframe width="' +
    options.width +
    '" height="' +
    options.height +
    '" src="https://emb.d.tube/#!/' +
    id +
    '" frameborder="0" scrolling="no" allowfullscreen></iframe>'
  );
};

SteemEmbed.is3Speak = function(url) {
  const match = url.match(VIDEO_MATCH_URL.THREE_SPEAK);
  return match ? match[2] : false;
};

SteemEmbed.threeSpeak = function(url, authorPermlink, options) {
  return (
    '<iframe width="' +
    options.width +
    '" height="' +
    options.height +
    '" src="https://3speak.co/embed?v=' +
    authorPermlink +
    '" allowfullscreen></iframe>'
  );
};

SteemEmbed.isTwitch = function(url) {
  let p = /^(?:https?:\/\/)?(?:www\.)?(?:twitch.tv\/)(.*)?$/;
  return url.match(p) ? RegExp.$1 : false;
};

SteemEmbed.twitch = function(url, channel, options) {
  return (
    '<iframe width="' +
    options.width +
    '" height="' +
    options.height +
    '" src="//player.twitch.tv/?channel=' +
    channel +
    '&autoplay=false" frameborder="0" scrolling="no" allowfullscreen></iframe>'
  );
};

SteemEmbed.isPeriscope = function(url) {
  let p = /^(?:https?:\/\/)?(?:www\.)?(?:periscope.tv\/)(.*)?$/;
  let m = url.match(p) ? RegExp.$1.split('/') : [];
  let r = m[1] ? m[1] : false;
  return r;
};

SteemEmbed.periscope = function(url, id, options) {
  return (
    '<iframe width="' +
    options.width +
    '" height="' +
    options.height +
    '" src="//www.periscope.tv/w/' +
    id +
    '" frameborder="0" scrolling="no" allowfullscreen></iframe>'
  );
};

SteemEmbed.isSoundcloud = function(url) {
  let p = /^(?:https?:\/\/)?(?:www\.)?(?:soundcloud.com\/)(.*)?$/;
  return url.match(p) ? RegExp.$1 : false;
};

SteemEmbed.soundcloud = function(url, id, options) {
  return (
    '<iframe width="' +
    options.width +
    '" height="' +
    options.height +
    '" src="//w.soundcloud.com/player/?url=' +
    encodeURIComponent(url + '?visual=true') +
    '" frameborder="0" scrolling="no" allowfullscreen></iframe>'
  );
};

SteemEmbed.isVimeo = function(url) {
  const match = url.match(VIDEO_MATCH_URL.VIMEO);
  return match ? match[3] : false;
};

SteemEmbed.vimeo = function(url, id, options) {
  return (
    '<iframe width="' +
    options.width +
    '" height="' +
    options.height +
    '" src="https://player.vimeo.com/video/' +
    id +
    '" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>'
  );
};

SteemEmbed.isBitchute = function(url) {
  const match = url.match(VIDEO_MATCH_URL.BITCHUTE);
  return match ? match[2] : false;
};

SteemEmbed.bitchute = function(url, id, options) {
  return (
    '<iframe width="' +
    options.width +
    '" height="' +
    options.height +
    '" src="https://www.bitchute.com/embed/' +
    id +
    '" frameborder="0" scrolling="no" allowfullscreen></iframe>'
  );
};

SteemEmbed.isRumble = function(url) {
  let match = url.match(VIDEO_MATCH_URL.RUMBLE);
  return match ? match[1] : false;
};

SteemEmbed.rumble = function(url, id, options) {
  return (
    '<iframe width="' +
    options.width +
    '" height="' +
    options.height +
    '" src="https://rumble.com/embed/' +
    id +
    '" frameborder="0" scrolling="no" allowfullscreen></iframe>'
  );
};

export default SteemEmbed;
