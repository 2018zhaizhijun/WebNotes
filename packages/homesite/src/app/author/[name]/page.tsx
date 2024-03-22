'use client';

import AuthorHome from '@/components/Home/AuthorHome';
import { SimplifiedUser } from 'common/db/prisma';
import { API_HOST, queryParse, sendRequest } from 'common/utils/http';
import { SessionProvider } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';

function AuthorHomePage({ params }: { params: { name: string } }) {
  const [authorInfo, setAuthorInfo] = useState<SimplifiedUser | null>(null);

  const getAuthorInfo = useCallback(() => {
    return sendRequest<SimplifiedUser[]>(
      `${API_HOST}/api/user?${queryParse({ name: params.name })}`,
      {
        method: 'GET',
      }
    ).then((json) => {
      if (json.length > 0) {
        setAuthorInfo(json[0]);
      }
    });
  }, [params.name, setAuthorInfo]);

  useEffect(() => {
    getAuthorInfo();
  }, [getAuthorInfo]);

  return (
    <SessionProvider>
      {authorInfo && (
        <AuthorHome authorInfo={{ ...authorInfo, id: authorInfo.id }} />
      )}
    </SessionProvider>
  );
}

export default AuthorHomePage;
