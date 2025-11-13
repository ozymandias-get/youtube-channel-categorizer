const axios = require('axios');

// Get user's YouTube channels
async function getUserYouTubeChannels(accessToken) {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
      params: {
        part: 'snippet,contentDetails',
        mine: true,
        access_token: accessToken,
        maxResults: 50
      }
    });
    
    return response.data.items.map(channel => ({
      id: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description,
      thumbnail: channel.snippet.thumbnails.default.url,
      subscriberCount: channel.statistics?.subscriberCount || 0,
      videoCount: channel.statistics?.videoCount || 0,
      viewCount: channel.statistics?.viewCount || 0
    }));
  } catch (error) {
    console.error('Error fetching YouTube channels:', error);
    return [];
  }
}

// Get channel uploads playlist
async function getChannelUploads(channelId, accessToken) {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
      params: {
        part: 'contentDetails',
        id: channelId,
        access_token: accessToken
      }
    });
    
    return response.data.items[0]?.contentDetails?.relatedPlaylists?.uploads;
  } catch (error) {
    console.error('Error fetching uploads playlist:', error);
    return null;
  }
}

// Get recent videos from channel
async function getRecentVideos(playlistId, accessToken, maxResults = 10) {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
      params: {
        part: 'snippet',
        playlistId: playlistId,
        access_token: accessToken,
        maxResults: maxResults,
        order: 'date'
      }
    });
    
    return response.data.items.map(item => ({
      videoId: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      publishedAt: item.snippet.publishedAt,
      thumbnail: item.snippet.thumbnails.default.url
    }));
  } catch (error) {
    console.error('Error fetching recent videos:', error);
    return [];
  }
}

module.exports = {
  getUserYouTubeChannels,
  getChannelUploads,
  getRecentVideos
};
