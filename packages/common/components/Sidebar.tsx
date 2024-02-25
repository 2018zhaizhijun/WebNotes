import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { API_HOST } from "../utils/http";
import { Form, Popconfirm, message } from "antd";
import Icon, {
  CustomIconComponentProps,
} from "@ant-design/icons/lib/components/Icon";
import FavouriteForm, { FavouriteFormValues } from "./FavouriteForm";
import { HighlightType } from "db/prisma-json";
import { FavouriteWebsite, Website } from "db/types";
import { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import { extractInfo } from "../utils/pdf-extractor";
const UserInfo = React.lazy(() => import("./UserInfo"));

interface SidebarProps {
  highlights: HighlightType[];
  url: string;
  pdfDocument: PDFDocumentProxy | null;
}

const updateHash = (highlight: HighlightType) => {
  document.location.hash = `highlight-${highlight.id}`;
};

const FavouriteSvg = () => (
  <svg
    fill="currentColor"
    viewBox="0 0 1024 1024"
    width="0.7em"
    height="0.7em"
    stroke="rgb(119, 119, 119)"
    stroke-width="5em"
    stroke-linejoin="round"
    overflow="visible"
  >
    <path d="M781.186088 616.031873q17.338645 80.573705 30.59761 145.848606 6.119522 27.537849 11.219124 55.075697t9.689243 49.976096 7.649402 38.247012 4.079681 19.888446q3.059761 20.398406-9.179283 27.027888t-27.537849 6.629482q-5.099602 0-14.788845-3.569721t-14.788845-5.609562l-266.199203-155.027888q-72.414343 42.836653-131.569721 76.494024-25.498008 14.278884-50.486056 28.557769t-45.386454 26.517928-35.187251 20.398406-19.888446 10.199203q-10.199203 5.099602-20.908367 3.569721t-19.378486-7.649402-12.749004-14.788845-2.039841-17.848606q1.01992-4.079681 5.099602-19.888446t9.179283-37.737052 11.729084-48.446215 13.768924-54.055777q15.298805-63.23506 34.677291-142.788845-60.175299-52.015936-108.111554-92.812749-20.398406-17.338645-40.286853-34.167331t-35.697211-30.59761-26.007968-22.438247-11.219124-9.689243q-12.239044-11.219124-20.908367-24.988048t-6.629482-28.047809 11.219124-22.438247 20.398406-10.199203l315.155378-28.557769 117.290837-273.338645q6.119522-16.318725 17.338645-28.047809t30.59761-11.729084q10.199203 0 17.848606 4.589641t12.749004 10.709163 8.669323 12.239044 5.609562 10.199203l114.231076 273.338645 315.155378 29.577689q20.398406 5.099602 28.557769 12.239044t8.159363 22.438247q0 14.278884-8.669323 24.988048t-21.928287 26.007968z"></path>
  </svg>
);

const FavouriteIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={FavouriteSvg} {...props} />
);

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
        chrome.runtime.sendMessage(
          {
            action: "UPDATE_FAVOURITE_WEBSITE_INFO",
            isCreate,
            body: JSON.stringify({
              websiteUrl: url,
              websiteRename,
              tag,
            }),
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
      <div className="sidebar" style={{ width: "25vw" }}>
        <div className="description" style={{ padding: "1rem" }}>
          <div style={{ marginBottom: "1rem", fontSize: "1.5rem" }}>
            <span>WebNotes</span>
            {websiteInfo ? (
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

          {document.location.href.startsWith(API_HOST) ? (
            <div
              style={{
                marginBottom: "10px",
              }}
            >
              <Suspense>
                <UserInfo />
              </Suspense>
            </div>
          ) : null}

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
