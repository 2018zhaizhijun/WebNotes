'use client';

import AuthorHome from '@/_components/Home/AuthorHome';
import { SimplifiedUser } from 'common/db/prisma';
import { queryParse, sendRequest } from 'common/utils/http';
import { useCallback, useEffect, useState } from 'react';

function AuthorHomePage({ params }: { params: { name: string } }) {
  const [authorInfo, setAuthorInfo] = useState<SimplifiedUser | null>(null);

  const getAuthorInfo = useCallback(() => {
    return sendRequest<SimplifiedUser[]>(
      `/api/user?${queryParse({ name: params.name })}`,
      {
        method: 'GET',
      }
    ).then((json) => {
      if (json?.length > 0) {
        setAuthorInfo(json[0]);
      }
    });
  }, [params.name, setAuthorInfo]);

  useEffect(() => {
    getAuthorInfo();
  }, [getAuthorInfo]);

  return <>{authorInfo && <AuthorHome authorInfo={authorInfo} />}</>;
}

export default AuthorHomePage;
