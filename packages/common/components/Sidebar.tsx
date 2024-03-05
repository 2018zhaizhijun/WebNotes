import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { API_HOST, sendRequest } from "../utils/http";
import { Affix, Form, Popconfirm } from "antd";
import FavouriteForm, { FavouriteFormValues } from "./FavouriteForm";
import { HighlightType } from "db/prisma";
import { FavouriteWebsite, Website } from "db/types";
import { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import { extractInfo } from "../utils/pdf";
import FavouriteIcon from "./FavouriteIcon";
const UserInfo = React.lazy(() => import("./UserInfo"));

interface SidebarProps {
  highlights: HighlightType[];
  url: string;
  pdfDocument: PDFDocumentProxy | null;
  appendButtons?: (highlights: HighlightType[]) => React.ReactNode;
}

const updateHash = (highlight: HighlightType) => {
  document.location.hash = `highlight-${highlight.id}`;
};

const Sidebar: React.FC<SidebarProps> = ({
  highlights,
  url,
  pdfDocument,
  appendButtons,
}) => {
  // const [sortedHighlights, setSortedHighlights] = useState<HighlightType[]>(highlights);
  const [websiteInfo, setWebsiteInfo] = useState<Website | null>(null);
  const [favouriteInfo, setFavouriteInfo] = useState<FavouriteWebsite | null>(
    null
  );

  const [form] = Form.useForm<FavouriteFormValues>();
  const [container, setContainer] = React.useState<HTMLDivElement | null>(null);

  // const isFavourite = useMemo(()=>{
  //   return Array.isArray(favouriteInfo)
  // }, [favouriteInfo])

  // useEffect(()=>{
  //   let sorted = highlights.sort((a, b) => {
  //     if (a.position.pageNumber == b.position.pageNumber) {
  //       return a.position.boundingRect.y1 - b.position.boundingRect.y1;
  //     }
  //     else {
  //       return a.position.pageNumber - b.position.pageNumber;
  //     }
  //   })
  //   setSortedHighlights(sorted);
  // }, [highlights])

  const getFavouriteInfo = useCallback(() => {
    if (!document.location.href.startsWith(API_HOST)) {
      chrome.runtime.sendMessage(
        { action: "GET_FAVOURITE_WEBSITE_INFO", url },
        function (result: FavouriteWebsite[]) {
          console.log(result);
          if (result.length > 0) {
            setFavouriteInfo(result[0]);
          }
        }
      );
    }
  }, [setFavouriteInfo, url]);

  const updateFavouriteInfo = useCallback(
    (websiteRename: string, tag: string, isCreate: boolean = false) => {
      if (!document.location.href.startsWith(API_HOST)) {
        const params = isCreate
          ? {
              action: "CREATE_FAVOURITE_WEBSITE_INFO",
              body: JSON.stringify({
                websiteUrl: url,
                websiteRename,
                tag,
              }),
            }
          : {
              action: "UPDATE_FAVOURITE_WEBSITE_INFO",
              url,
              body: JSON.stringify({
                websiteRename,
                tag,
              }),
            };

        chrome.runtime.sendMessage(
          {
            ...params,
          },
          function (result) {
            console.log(result);
            getFavouriteInfo();
          }
        );
      }
    },
    [getFavouriteInfo, url]
  );

  const deleteFavouriteInfo = useCallback(() => {
    if (!document.location.href.startsWith(API_HOST)) {
      chrome.runtime.sendMessage(
        { action: "DELETE_FAVOURITE_WEBSITE_INFO", url },
        function (result) {
          console.log(result);
          setFavouriteInfo(null);
        }
      );
    }
  }, [setFavouriteInfo, url]);

  const getWebsiteInfo = useCallback(
    (onEmpty?: () => void) => {
      if (!document.location.href.startsWith(API_HOST)) {
        chrome.runtime.sendMessage(
          { action: "GET_WEBSITE_INFO", url },
          function (result: Website[]) {
            console.log(result);
            if (result.length > 0) {
              setWebsiteInfo(result[0]);
              getFavouriteInfo();
            } else {
              onEmpty?.();
            }
          }
        );
      }
    },
    [setWebsiteInfo, getFavouriteInfo, url]
  );

  const createWebsiteInfo = useCallback(async () => {
    if (!document.location.href.startsWith(API_HOST)) {
      const pdfInfo = await extractInfo(pdfDocument!);
      chrome.runtime.sendMessage(
        {
          action: "CREATE_WEBSITE_INFO",
          body: JSON.stringify({ url, ...pdfInfo }),
        },
        function (result) {
          console.log(result);
          getWebsiteInfo();
        }
      );
    }
  }, [getWebsiteInfo, url, pdfDocument]);

  useEffect(() => {
    if (url && pdfDocument) {
      getWebsiteInfo(() => {
        createWebsiteInfo();
      });
    }
  }, [getWebsiteInfo, createWebsiteInfo, url, pdfDocument]);

  const confirmHandler = useCallback(() => {
    form
      .validateFields()
      .then((values) => {
        updateFavouriteInfo(values.websiteRename, values.tag, !favouriteInfo);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  }, [form, updateFavouriteInfo, favouriteInfo]);

  const initialValues = useMemo(() => {
    if (websiteInfo) {
      return {
        websiteRename: websiteInfo.title || websiteInfo.url,
        tag: "default",
      };
    }
    return {};
  }, [websiteInfo]);

  return (
    <>
      <div className="sidebar" style={{ width: "25%" }} ref={setContainer}>
        <div className="description" style={{ padding: "1rem" }}>
          <div style={{ marginBottom: "1rem", fontSize: "1.3rem" }}>
            <span>WebNotes</span>
            {!document.location.href.startsWith(API_HOST) && websiteInfo ? (
              <Popconfirm
                icon={null}
                title="Favourite the website"
                description={
                  <FavouriteForm
                    form={form}
                    initialValues={{
                      websiteRename:
                        favouriteInfo?.websiteRename ||
                        initialValues.websiteRename!,
                      tag: favouriteInfo?.tag || initialValues.tag!,
                    }}
                  />
                }
                onConfirm={confirmHandler}
                onCancel={() => {
                  if (favouriteInfo) {
                    deleteFavouriteInfo();
                    form.setFieldsValue(initialValues);
                  }
                }}
                okText="Confirm"
                cancelText="Delete"
              >
                <FavouriteIcon
                  style={{
                    cursor: "pointer",
                    color: favouriteInfo ? undefined : "transparent",
                    marginLeft: "20px",
                    padding: "6px",
                  }}
                />
              </Popconfirm>
            ) : null}
          </div>

          {/* {document.location.href.startsWith(API_HOST) ? (
            <div
              style={{
                marginBottom: "10px",
              }}
            >
              <Suspense>
                <UserInfo />
              </Suspense>
            </div>
          ) : null} */}

          <div>
            <small>
              To create area highlight hold ⌥ Option key (Alt), then click and
              drag.
            </small>
          </div>
        </div>

        <ul className="sidebar__highlights">
          {highlights.map((highlight, index) => (
            <li
              key={index}
              className="sidebar__highlight"
              onClick={() => {
                updateHash(highlight);
              }}
            >
              <div>
                <strong>{highlight.comment?.text}</strong>
                {highlight.content.text ? (
                  <blockquote style={{ marginTop: "0.5rem" }}>
                    {`${highlight.content.text.slice(0, 90).trim()}…`}
                  </blockquote>
                ) : null}
                {highlight.content.image ? (
                  <div
                    className="highlight__image"
                    style={{ marginTop: "0.5rem" }}
                  >
                    <img src={highlight.content.image} alt={"Screenshot"} />
                  </div>
                ) : null}
              </div>
              <div className="highlight__location">
                Page {highlight.position.pageNumber}
              </div>
            </li>
          ))}
        </ul>

        <Affix offsetBottom={0} target={() => container}>
          {appendButtons?.(highlights)}
        </Affix>
      </div>
    </>
  );
};

export default Sidebar;
