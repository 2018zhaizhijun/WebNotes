import { Button } from 'antd';
import { HighlightType } from 'common/db/prisma';
import { sendRequest } from 'common/utils/http';
import { useRouter } from 'next/navigation';
import React, { useCallback } from 'react';

interface SidebarButtonsProps {
  highlights: HighlightType[];
  homepageUrl: string;
  websiteUrl: string;
}

const SidebarButtons: React.FC<SidebarButtonsProps> = ({
  highlights,
  homepageUrl,
  websiteUrl,
}) => {
  const router = useRouter();

  const copyHighlights = useCallback(
    (highlights: HighlightType[]) => {
      sendRequest(`/api/highlights`, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
        body: highlights,
      }).then(async () => {
        window.open(websiteUrl, '_blank');
      });
    },
    [websiteUrl]
  );

  return (
    <div style={{ padding: '10px 0' }}>
      <Button type="text" onClick={() => router.push(homepageUrl)}>
        Visit Homepage
      </Button>
      <Button type="text" onClick={() => copyHighlights(highlights)}>
        Copy Notes
      </Button>
      <Button type="text" onClick={() => window.open(websiteUrl, '_blank')}>
        Open in New Tab
      </Button>
    </div>
  );
};

export default SidebarButtons;
