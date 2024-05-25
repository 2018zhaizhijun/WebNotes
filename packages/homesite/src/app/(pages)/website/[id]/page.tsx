'use client';

import WebsiteHome from '@/_components/Home/WebsiteHome';
import { Website } from 'common/db/types';
import { API_HOST, queryParse, sendRequest } from 'common/utils/http';
import { useCallback, useEffect, useState } from 'react';

function WebsiteHomePage({ params }: { params: { id: number } }) {
  const [websiteInfo, setWebsiteInfo] = useState<Website | null>(null);

  const getWebsiteInfo = useCallback(() => {
    return sendRequest<Website[]>(
      `${API_HOST}/api/website?${queryParse({ id: String(params.id) })}`,
      {
        method: 'GET',
      }
    ).then((json) => {
      if (json?.length > 0) {
        setWebsiteInfo(json[0]);
      }
    });
  }, [params.id, setWebsiteInfo]);

  useEffect(() => {
    if (params.id) {
      getWebsiteInfo();
    }
  }, [params.id, getWebsiteInfo]);

  return <>{websiteInfo && <WebsiteHome websiteInfo={websiteInfo} />}</>;
}

export default WebsiteHomePage;
