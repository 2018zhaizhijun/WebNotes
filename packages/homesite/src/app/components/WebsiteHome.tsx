import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Menu, MenuProps } from "antd";
import PDF from "common/components/PDF";
import { Website } from "common/db/types";
import { API_HOST, queryParse, sendRequest } from "common/utils/http";
import { HighlightType, SimplifiedUser } from "common/db/prisma";
import WebsiteHeader from "./WebsiteHeader";
import { useSession } from "next-auth/react";
import SidebarButtons from "./SidebarButtons";

interface WebsiteHomeProps {
  websiteInfo: Website;
}

const WebsiteHome: React.FC<WebsiteHomeProps> = ({ websiteInfo }) => {
  const { data: session, update } = useSession();
  const [activatedAuthor, setActivatedAuthor] = useState<string>("");
  const [notedAuthors, setNotedAuthors] = useState<SimplifiedUser[]>([]);

  const getNotedAuthors = useCallback(() => {
    return sendRequest<SimplifiedUser[]>(
      `${API_HOST}/api/query/authors?${queryParse({
        url: websiteInfo.url,
      })}`,
      {
        method: "GET",
      }
    ).then((json) => {
      if (Array.isArray(json)) {
        setNotedAuthors(json);
      }
    });
  }, [websiteInfo, sendRequest, setNotedAuthors]);

  const items: MenuProps["items"] = useMemo(() => {
    const items_children: MenuProps["items"] = notedAuthors.map((item) => {
      return { label: item.name, key: `${item.name} ${item.id}` };
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
    setActivatedAuthor(items_children[0]?.key as string);

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
      <WebsiteHeader websiteInfo={websiteInfo} />
      <div className="mainContent">
        {items.length > 0 ? (
          <Menu
            onSelect={(e) => {
              if (e.key !== activatedAuthor) {
                setActivatedAuthor(e.key);
              }
            }}
            style={{ width: 256 }}
            mode="inline"
            items={items}
            multiple={false}
            selectedKeys={[activatedAuthor || ""]}
          />
        ) : null}
        {activatedAuthor && (
          <PDF
            url={websiteInfo.url}
            authorId={activatedAuthor.split(" ")[1]}
            sidebarPosition="right"
            readOnly={activatedAuthor.split(" ")[1] !== session?.user?.id}
            appendButtons={(highlights: HighlightType[]) => {
              return (
                <SidebarButtons
                  highlights={highlights}
                  homepageUrl={`/author/${activatedAuthor.split(" ")[0]}`}
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
