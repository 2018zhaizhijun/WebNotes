import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Menu, MenuProps, message } from "antd";
import PDF from "common/components/PDF";
import { Website } from "common/db/types";
import { API_HOST, queryParse, sendRequest } from "common/utils/http";
import { SimplifiedUser } from "common/db/prisma";
import WebsiteHeader from "./WebsiteHeader";
import { useSession } from "next-auth/react";

interface WebsiteHomeProps {
  websiteInfo: Website;
}

const WebsiteHome: React.FC<WebsiteHomeProps> = ({ websiteInfo }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const { data: session, update } = useSession();
  const [activatedAuthorId, setActivatedAuthorId] = useState<string>();
  const [notedAuthors, setNotedAuthors] = useState<SimplifiedUser[]>([]);

  const getNotedAuthors = useCallback(() => {
    return sendRequest<SimplifiedUser[]>(
      `${API_HOST}/api/query/authors?${queryParse({
        url: websiteInfo.url,
      })}`,
      {
        method: "GET",
      },
      messageApi
    ).then((json) => {
      if (Array.isArray(json)) {
        setNotedAuthors(json);
      }
    });
  }, [websiteInfo, sendRequest, setNotedAuthors, messageApi]);

  const items: MenuProps["items"] = useMemo(() => {
    const items_children: MenuProps["items"] = notedAuthors.map((item) => {
      return { label: item.name, key: item.id };
    });

    // 若用户也在列表中,则将其置顶
    let index = items_children.findIndex(
      (item) => item!.key == session?.user.id
    );
    if (index !== -1) {
      let temp = items_children.splice(index, 1)[0];
      items_children.unshift(temp);
    }

    console.log(items_children);
    setActivatedAuthorId(items_children[0]?.key as string);

    const items: MenuProps["items"] = [
      {
        label: "Noted Authors",
        key: "Noted Authors",
        type: "group",
        children: items_children,
      },
    ];

    return items;
  }, [notedAuthors]);

  useEffect(() => {
    getNotedAuthors();
  }, [getNotedAuthors]);

  return (
    <>
      {contextHolder}
      <WebsiteHeader websiteInfo={websiteInfo} />
      <div className="mainContent">
        {items.length > 0 ? (
          <Menu
            onSelect={(e) => {
              setActivatedAuthorId(e.key);
            }}
            style={{ width: 256 }}
            mode="inline"
            items={items}
            multiple={false}
            selectedKeys={[activatedAuthorId || ""]}
          />
        ) : null}
        <PDF
          url={websiteInfo.url}
          authorId={activatedAuthorId}
          sidebarPosition="right"
          readOnly={activatedAuthorId !== session?.user?.id}
        />
      </div>
    </>
  );
};

export default WebsiteHome;
