import { Menu } from 'antd';
import { ItemType } from 'antd/es/menu/hooks/useItems';
import PDF from 'common/components/PDF';
import { HighlightType, SimplifiedUser } from 'common/db/prisma';
import { Website } from 'common/db/types';
import { API_HOST, queryParse, sendRequest } from 'common/utils/http';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import WebsiteHeader from '../Header/WebsiteHeader';
import SidebarButtons from '../SidebarButtons';
import './Home.css';

interface WebsiteHomeProps {
  websiteInfo: Website;
}

type CustomItemType = Exclude<ItemType, null>[];

const WebsiteHome: React.FC<WebsiteHomeProps> = ({ websiteInfo }) => {
  const { data: session } = useSession();
  const [activatedAuthor, setActivatedAuthor] = useState<string>('');
  const [notedAuthors, setNotedAuthors] = useState<SimplifiedUser[]>([]);

  const getNotedAuthors = useCallback(() => {
    return sendRequest<SimplifiedUser[]>(
      `${API_HOST}/api/query/authors?${queryParse({
        url: websiteInfo.url,
      })}`,
      {
        method: 'GET',
      }
    ).then((json) => {
      if (Array.isArray(json)) {
        setNotedAuthors(json);
      }
    });
  }, [websiteInfo, setNotedAuthors]);

  const items = useMemo(() => {
    const items_children: CustomItemType = notedAuthors.map((item) => {
      return { label: item.name, key: `${item.name} ${item.id}` };
    });

    // 若用户也在列表中,则将其置顶
    const index = items_children.findIndex(
      (item) => item.key == session?.user.id
    );
    if (index !== -1) {
      const temp = items_children.splice(index, 1)[0];
      items_children.unshift(temp);
    }

    console.log(items_children);
    setActivatedAuthor(items_children[0]?.key as string);

    const items: CustomItemType = [
      {
        label: 'Noted Authors',
        key: 'Noted Authors',
        type: 'group',
        children: items_children,
      },
    ];

    return items;
  }, [notedAuthors, session?.user.id]);

  useEffect(() => {
    getNotedAuthors();
  }, [getNotedAuthors]);

  return (
    <>
      <WebsiteHeader websiteInfo={websiteInfo} />
      <div className="mainContent">
        {items.length > 0 ? (
          <Menu
            onSelect={(e) => {
              if (e.key !== activatedAuthor) {
                setActivatedAuthor(e.key);
              }
            }}
            mode="inline"
            items={items}
            multiple={false}
            selectedKeys={[activatedAuthor || '']}
          />
        ) : null}
        {activatedAuthor && (
          <PDF
            url={websiteInfo.url}
            authorId={activatedAuthor.split(' ')[1]}
            sidebarPosition="right"
            readOnly={activatedAuthor.split(' ')[1] !== session?.user?.id}
            appendButtons={(highlights: HighlightType[]) => {
              return (
                <SidebarButtons
                  highlights={highlights}
                  homepageUrl={`/author/${activatedAuthor.split(' ')[0]}`}
                  websiteUrl={websiteInfo.url}
                />
              );
            }}
          />
        )}
      </div>
    </>
  );
};

export default WebsiteHome;
