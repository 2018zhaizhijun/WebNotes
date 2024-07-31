import { HighlightType, StrokeType } from 'common/db/prisma';
import { FavouriteWebsite, Website } from 'common/db/types';
import { API_HOST, queryParse, sendRequest } from 'common/utils/http';
import { Session } from 'next-auth';

chrome.runtime.onMessage.addListener(function (request, sender, onSuccess) {
  if (request.action === 'AUTH_CHECK') {
    console.log('running auth check');
    sendRequest<Session>(`/api/auth/session`, {
      mode: 'cors',
    }).then((session) => {
      console.log(session);
      if (session.user) {
        onSuccess(session);
      } else {
        onSuccess(null);
      }
    });

    return true; // Will respond asynchronously.
  } else if (request.action === 'LOG_OUT') {
    console.log('log out');

    const cookiesToDelete = [
      { url: API_HOST, name: '__Host-next-auth.csrf-token' },
      { url: API_HOST, name: '__Secure-next-auth.session-token' },
      { url: API_HOST, name: '__Secure-next-auth.callback-url' },
    ];

    cookiesToDelete.forEach(function (cookieDetails) {
      chrome.cookies.remove(cookieDetails, function (deletedCookie) {
        console.log('Cookie has been deleted:', deletedCookie);
      });
    });

    onSuccess(null);
    return true;
  } else if (request.action === 'GET_HIGHLIGHTS') {
    sendRequest<HighlightType[]>(
      `/api/highlights?${queryParse({
        url: request.url,
        authorId: request.authorId,
      })}`,
      {
        method: 'GET',
      }
    ).then((json) => {
      onSuccess(json);
    });
    return true;
  } else if (request.action === 'UPDATE_HIGHLIGHT') {
    sendRequest(`/api/highlights/${request.highlightId}`, {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
      body: request.body,
    }).then((res) => {
      onSuccess(res);
    });
    return true;
  } else if (request.action === 'CREATE_HIGHLIGHT') {
    sendRequest(`/api/highlights`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
      body: request.body,
    }).then((res) => {
      onSuccess(res);
    });
    return true;
  } else if (request.action === 'DELETE_HIGHLIGHT') {
    sendRequest(`/api/highlights/${request.highlightId}`, {
      method: 'DELETE',
    }).then((res) => {
      onSuccess(res);
    });
    return true;
  } else if (request.action === 'GET_WEBSITE_INFO') {
    // 查询Website表中是否有该网站
    sendRequest<Website[]>(`/api/website?${queryParse({ url: request.url })}`, {
      method: 'GET',
    }).then((json) => {
      onSuccess(json);
    });
    return true;
  } else if (request.action === 'CREATE_WEBSITE_INFO') {
    sendRequest(`/api/website`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
      body: request.body,
    }).then((res) => {
      onSuccess(res);
    });
    return true;
  } else if (request.action === 'GET_FAVOURITE_WEBSITE_INFO') {
    sendRequest<FavouriteWebsite[]>(
      `/api/favourite/websites?${queryParse({
        url: request.url,
      })}`,
      {
        method: 'GET',
      }
    ).then((json) => {
      onSuccess(json);
    });
    return true;
  } else if (request.action === 'CREATE_FAVOURITE_WEBSITE_INFO') {
    sendRequest(`/api/favourite/websites`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
      body: request.body,
    }).then((res) => {
      onSuccess(res);
    });
    return true;
  } else if (request.action === 'UPDATE_FAVOURITE_WEBSITE_INFO') {
    sendRequest(
      `/api/favourite/websites?${queryParse({
        url: request.url,
      })}`,
      {
        method: 'PUT',
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
        body: request.body,
      }
    ).then((res) => {
      onSuccess(res);
    });
    return true;
  } else if (request.action === 'DELETE_FAVOURITE_WEBSITE_INFO') {
    sendRequest(
      `/api/favourite/websites?${queryParse({
        url: request.url,
      })}`,
      {
        method: 'DELETE',
      }
    ).then((res) => {
      onSuccess(res);
    });
    return true;
  } else if (request.action === 'GET_STROKES') {
    sendRequest<StrokeType[]>(
      `/api/strokes?${queryParse({
        url: request.url,
        authorId: request.authorId,
      })}`,
      {
        method: 'GET',
      }
    ).then((json) => {
      onSuccess(json);
    });
    return true;
  } else if (request.action === 'CREATE_STROKE') {
    sendRequest(`/api/strokes`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
      body: request.body,
    }).then((res) => {
      onSuccess(res);
    });
    return true;
  } else if (request.action === 'DELETE_STROKE') {
    sendRequest(`/api/strokes/${request.strokeId}`, {
      method: 'DELETE',
    }).then((res) => {
      onSuccess(res);
    });
    return true;
  }
});
