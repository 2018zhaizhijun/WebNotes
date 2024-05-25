'use client';

import { SimplifiedUser } from 'common/db/prisma';
import { API_HOST, queryParse, sendRequest } from 'common/utils/http';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

function HomePage() {
  const router = useRouter();
  const { data: session } = useSession();

  const getAuthorInfo = useCallback(() => {
    return sendRequest<SimplifiedUser[]>(
      `${API_HOST}/api/user?${queryParse({ id: session?.user.id })}`,
      {
        method: 'GET',
      }
    ).then((json) => {
      if (json?.length > 0) {
        router.push(`/author/${json[0].name}`);
      }
    });
  }, [session, router]);

  useEffect(() => {
    session && getAuthorInfo();
  }, [session, getAuthorInfo]);

  return <></>;
}

export default HomePage;
