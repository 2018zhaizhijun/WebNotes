import React, { useCallback, useEffect, useMemo, useState } from "react";
import AuthorHeader from "./AuthorHeader";
import { Menu, MenuProps } from "antd";
import PDF from "common/components/PDF";
import { Website } from "common/db/types";
import { API_HOST, queryParse, sendRequest } from "common/utils/http";
import { groupBy } from "@/lib/utils";
import FavouriteIcon from "common/components/FavouriteIcon";
import { HighlightType, SimplifiedUser } from "common/db/prisma";
import { useSession } from "next-auth/react";
import SidebarButtons from "./SidebarButtons";

interface AuthorHomeProps {
  authorInfo: SimplifiedUser;
}

type NotedWebsitesType = {
  result_highlight: Website[];
  result_favourite: Array<Website & { rename: string; tag: string }>;
};

const AuthorHome: React.FC<AuthorHomeProps> = ({ authorInfo }) => {
  const { data: session, update } = useSession();
  const [activatedUrl, setActivatedUrl] = useState<string>();
  const [notedWebsites, setNotedWebsites] = useState<NotedWebsitesType>({
    result_highlight: [],
    result_favourite: [],
  });

  const getNotedWebsites = useCallback(() => {
    return sendRequest<NotedWebsitesType>(
      `${API_HOST}/api/query/websites?${queryParse({
        authorId: authorInfo.id,
      })}`,
      {
        method: "GET",
      }
    ).then((json) => {
      if (json.result_highlight || json.result_favourite) {
        setNotedWebsites(json);
      }
    });
  }, [authorInfo, sendRequest, setNotedWebsites]);

  const items: MenuProps["items"] = useMemo(() => {
    const result_favourite = groupBy(notedWebsites.result_favourite, "tag");
    const favourite_items: MenuProps["items"] = Object.keys(
      result_favourite
    ).map((key) => {
      return {
        label: key,
        key: key,
        icon: <FavouriteIcon />,
        children: result_favourite[key].map(
          (item: NotedWebsitesType["result_favourite"][number]) => {
            return { label: item.rename, key: `${item.url} ${item.id}` };
          }
        ),
      };
    });

    const highlight_items: MenuProps["items"] =
      notedWebsites.result_highlight.length > 0
        ? [
            {
              label: "Highlighted",
              key: "Highlighted",
              type: "group",
              children: notedWebsites.result_highlight.map((item) => {
                return { label: item.title, key: `${item.url} ${item.id}` };
              }),
            },
          ]
        : [];

    const items = favourite_items.concat(highlight_items);

    console.log(items);
    setActivatedUrl(items[0]?.children?.[0].key || items[0]?.key);

    return items;
  }, [notedWebsites]);

  useEffect(() => {
    // if (!name) {
    //   session?.user.name
    //     ? redirect("/author/" + session?.user.name)
    //     : redirect("/login");
    // }
    getNotedWebsites();
  }, [getNotedWebsites]);

  return (
    <>
      <AuthorHeader authorInfo={authorInfo} />
      <div className="mainContent">
        {items.length > 0 ? (
          <Menu
            onSelect={(e) => {
              if (e.key !== activatedUrl) {
                setActivatedUrl(e.key);
              }
            }}
            style={{ width: 256 }}
            defaultOpenKeys={[
              items[0]?.children ? (items[0]?.key as string) : "",
            ]}
            mode="inline"
            items={items}
            multiple={false}
            selectedKeys={[activatedUrl || ""]}
          />
        ) : null}
        {activatedUrl && (
          <PDF
            url={activatedUrl.split(" ")[0]}
            authorId={authorInfo.id}
            sidebarPosition="right"
            readOnly={authorInfo.id !== session?.user?.id}
            appendButtons={(highlights: HighlightType[]) => {
              return (
                <SidebarButtons
                  highlights={highlights}
                  homepageUrl={`/website/${activatedUrl.split(" ")[1]}`}
                  websiteUrl={activatedUrl.split(" ")[0]}
                />
              );
            }}
          />
        )}
      </div>
    </>
  );
};

export default AuthorHome;