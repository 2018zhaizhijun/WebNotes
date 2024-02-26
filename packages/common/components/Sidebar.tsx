import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { API_HOST } from "../utils/http";
import { Form, Popconfirm, message } from "antd";
import FavouriteForm, { FavouriteFormValues } from "./FavouriteForm";
import { HighlightType } from "db/prisma";
import { FavouriteWebsite, Website } from "db/types";
import { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import { extractInfo } from "../utils/pdf-extractor";
import FavouriteIcon from "./FavouriteIcon";
const UserInfo = React.lazy(() => import("./UserInfo"));

interface SidebarProps {
  highlights: HighlightType[];
  url: string;
  pdfDocument: PDFDocumentProxy | null;
}

const updateHash = (highlight: HighlightType) => {
  document.location.hash = `highlight-${highlight.id}`;
};

const Sidebar: React.FC<SidebarProps> = ({ highlights, url, pdfDocument }) => {
  // const [sortedHighlights, setSortedHighlights] = useState<HighlightType[]>(highlights);
  const [websiteInfo, setWebsiteInfo] = useState<Website | null>(null);
  const [favouriteInfo, setFavouriteInfo] = useState<FavouriteWebsite | null>(
    null
  );
  const [messageApi, contextHolder] = message.useMessage();

  const [form] = Form.useForm<FavouriteFormValues>();

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
        { action: "GET_FAVOURITE_WEBSITE_INFO", url, messageApi },
        function (result: FavouriteWebsite[]) {
          console.log(result);
          if (result.length > 0) {
            setFavouriteInfo(result[0]);
          }
        }
      );
    }
  }, [setFavouriteInfo, messageApi, url]);

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
            messageApi,
          },
          function (result) {
            console.log(result);
            getFavouriteInfo();
          }
        );
      }
    },
    [getFavouriteInfo, messageApi, url]
  );

  const deleteFavouriteInfo = useCallback(() => {
    if (!document.location.href.startsWith(API_HOST)) {
      chrome.runtime.sendMessage(
        { action: "DELETE_FAVOURITE_WEBSITE_INFO", url, messageApi },
        function (result) {
          console.log(result);
          setFavouriteInfo(null);
        }
      );
    }
  }, [setFavouriteInfo, messageApi, url]);

  const getWebsiteInfo = useCallback(
    (onEmpty?: () => void) => {
      if (!document.location.href.startsWith(API_HOST)) {
        chrome.runtime.sendMessage(
          { action: "GET_WEBSITE_INFO", url, messageApi },
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
    [setWebsiteInfo, getFavouriteInfo, messageApi, url]
  );

  const createWebsiteInfo = useCallback(async () => {
    if (!document.location.href.startsWith(API_HOST)) {
      const pdfInfo = await extractInfo(pdfDocument!);
      chrome.runtime.sendMessage(
        {
          action: "CREATE_WEBSITE_INFO",
          body: JSON.stringify({ url, ...pdfInfo }),
          messageApi,
        },
        function (result) {
          console.log(result);
          getWebsiteInfo();
        }
      );
    }
  }, [getWebsiteInfo, messageApi, url, pdfDocument]);

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
      {contextHolder}
      <div className="sidebar" style={{ width: "25%" }}>
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
      </div>
    </>
  );
};

export default Sidebar;
