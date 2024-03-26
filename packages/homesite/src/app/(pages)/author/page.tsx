'use client';

import { SimplifiedUser } from 'common/db/prisma';
import { API_HOST, sendRequest } from 'common/utils/http';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

function HomePage() {
  const router = useRouter();

  const getAuthorInfo = useCallback(() => {
    return sendRequest<SimplifiedUser[]>(`${API_HOST}/api/user`, {
      method: 'GET',
    }).then((json) => {
      if (json.length > 0) {
        router.push(`/author/${json[0].name}`);
      }
    });
  }, [router]);

  useEffect(() => {
    getAuthorInfo();
  }, [getAuthorInfo]);

  return <></>;
}

export default HomePage;
