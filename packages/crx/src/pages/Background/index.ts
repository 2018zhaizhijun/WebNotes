import { HighlightType } from 'common/db/prisma-json';
import { Website, FavouriteWebsite } from 'common/db/types';
import { API_HOST, queryParse, sendRequest } from 'common/utils/http';
import { DeleteResult, InsertResult, UpdateResult } from 'kysely';
import { Session } from 'next-auth';

chrome.runtime.onMessage.addListener(function (request, sender, onSuccess) {
  if (request.action === 'AUTH_CHECK') {
    console.log('running auth check');
    sendRequest<Session>(
      `${API_HOST}/api/auth/session`,
      {
        mode: 'cors',
      },
      request.messageApi
    ).then((session) => {
      console.log(session);
      if (session.user) {
        onSuccess(session);
      } else {
        onSuccess(null);
      }
    });

    return true; // Will respond asynchronously.
  } else if (request.action === 'LOG_OUT') {
    console.log('running auth check');

    var cookiesToDelete = [
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
      `${API_HOST}/api/highlight?${queryParse({ url: request.url })}`,
      {
        method: 'GET',
      },
      request.messageApi
    ).then((json) => {
      onSuccess(json);
    });
    return true;
  } else if (request.action === 'UPDATE_HIGHLIGHT') {
    sendRequest<UpdateResult>(
      `${API_HOST}/api/highlight/${request.highlightId}`,
      {
        method: 'PUT',
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
        body: request.body,
      },
      request.messageApi
    ).then((res) => {
      onSuccess(res);
    });
    return true;
  } else if (request.action === 'CREATE_HIGHLIGHT') {
    sendRequest<InsertResult>(
      `${API_HOST}/api/highlight`,
      {
        method: 'POST',
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
        body: request.body,
      },
      request.messageApi
    ).then((res) => {
      onSuccess(res);
    });
    return true;
  } else if (request.action === 'DELETE_HIGHLIGHT') {
    sendRequest<DeleteResult>(
      `${API_HOST}/api/highlight/${request.highlightId}`,
      {
        method: 'DELETE',
      },
      request.messageApi
    ).then((res) => {
      onSuccess(res);
    });
    return true;
  } else if (request.action === 'GET_WEBSITE_INFO') {
    // 查询Website表中是否有该网站
    sendRequest<Website[]>(
      `${API_HOST}/api/website?${queryParse({ url: request.url })}`,
      {
        method: 'GET',
      },
      request.messageApi
    ).then((json) => {
      onSuccess(json);
    });
    return true;
  } else if (request.action === 'CREATE_WEBSITE_INFO') {
    sendRequest<InsertResult>(
      `${API_HOST}/api/website`,
      {
        method: 'POST',
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
        body: request.body,
      },
      request.messageApi
    ).then((res) => {
      onSuccess(res);
    });
    return true;
  } else if (request.action === 'GET_FAVOURITE_WEBSITE_INFO') {
    sendRequest<FavouriteWebsite[]>(
      `${API_HOST}/api/favourite/website?${queryParse({
        url: request.url,
      })}`,
      {
        method: 'GET',
      },
      request.messageApi
    ).then((json) => {
      onSuccess(json);
    });
    return true;
  } else if (request.action === 'UPDATE_FAVOURITE_WEBSITE_INFO') {
    sendRequest<InsertResult | UpdateResult>(
      `${API_HOST}/api/favourite/website?${queryParse({
        url: request.url,
      })}`,
      {
        method: request.isCreate ? 'POST' : 'PUT',
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
        body: request.body,
      },
      request.messageApi
    ).then((res) => {
      onSuccess(res);
    });
    return true;
  } else if (request.action === 'DELETE_FAVOURITE_WEBSITE_INFO') {
    sendRequest<DeleteResult>(
      `${API_HOST}/api/favourite/website?${queryParse({
        url: request.url,
      })}`,
      {
        method: 'DELETE',
      },
      request.messageApi
    ).then((res) => {
      onSuccess(res);
    });
    return true;
  }
});
