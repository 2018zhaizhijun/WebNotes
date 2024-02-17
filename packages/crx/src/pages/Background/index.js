import { API_HOST, queryParse, sendRequest } from 'common/utils/http';

chrome.runtime.onMessage.addListener(function (request, sender, onSuccess) {
  if (request.action === 'AUTH_CHECK') {
    console.log('running auth check');
    fetch(`${API_HOST}/api/auth/session`, {
      mode: 'cors',
    })
      .then((response) => {
        return response.json();
      })
      .then((session) => {
        console.log(session);
        if (Object.keys(session).length > 0) {
          onSuccess(session);
        } else {
          onSuccess(null);
        }
      })
      .catch((err) => {
        console.error(err);
        onSuccess(null);
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
  } else if (request.action === 'GET_TOKEN') {
    chrome.cookies.get(
      { url: API_HOST, name: '__Secure-next-auth.session-token' },
      function (cookie) {
        if (cookie) {
          onSuccess({ cookie });
        } else {
          onSuccess(null);
        }
      }
    );
    return true;
  } else if (request.action === 'GET_HIGHLIGHTS') {
    sendRequest(
      `${API_HOST}/api/highlight?${queryParse({ url: request.url })}`,
      {
        method: 'GET',
      },
      (json) => {
        onSuccess({ highlights: json });
      },
      request.messageApi
    );
    return true;
  } else if (request.action === 'UPDATE_HIGHLIGHT') {
    sendRequest(
      `${API_HOST}/api/highlight/${request.highlightId}`,
      {
        method: 'PUT',
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
        body: request.body,
      },
      (res) => {
        onSuccess(res);
      },
      request.messageApi
    );
    return true;
  } else if (request.action === 'CREATE_HIGHLIGHT') {
    sendRequest(
      `${API_HOST}/api/highlight`,
      {
        method: 'POST',
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
        body: request.body,
      },
      (res) => {
        onSuccess(res);
      },
      request.messageApi
    );
    return true;
  } else if (request.action === 'DELETE_HIGHLIGHT') {
    sendRequest(
      `${API_HOST}/api/highlight/${request.highlightId}`,
      {
        method: 'DELETE',
      },
      (res) => {
        onSuccess(res);
      },
      request.messageApi
    );
    return true;
  }
});
