import React, { useCallback, useEffect, useState } from "react";
import type { IHighlight } from "./react-pdf-highlighter";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { Avatar } from "antd";
import { EditOutlined, LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import UserModal from "./UserModal";

interface Props {
  highlights: Array<IHighlight>;
  // resetHighlights: () => void;
  // toggleDocument: () => void;
}

const updateHash = (highlight: IHighlight) => {
  document.location.hash = `highlight-${highlight.id}`;
};

export default function Sidebar({
  highlights,
}: // toggleDocument,
// resetHighlights,
Props) {
  // const [sortedHighlights, setSortedHighlights] = useState<IHighlight[]>(highlights);
  const { data: session, update } = useSession();
  const [open, setOpen] = useState(false);

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

  useEffect(() => {
    if (session) {
      console.log("Logged info:", session);
    }
  }, [session]);

  return (
    <div className="sidebar" style={{ width: "25vw" }}>
      <div className="description" style={{ padding: "1rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>WebNotes</h2>

        <div
          style={{
            marginBottom: "10px",
          }}
        >
          {session ? (
            <div>
              <Avatar
                shape="circle"
                src={session.user?.image || ""}
                style={{ marginRight: "10px" }}
              />
              <text>{session.user?.name || "Anonymous User"}</text>
              <button
                onClick={() => setOpen(true)}
                style={{ marginLeft: "20px" }}
              >
                <EditOutlined />
              </button>
              <UserModal open={open} setOpen={setOpen} onOk={() => update()} />
            </div>
          ) : (
            <button onClick={() => signIn()}>Log in</button>
          )}
        </div>

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
      {/* <div style={{ padding: "1rem" }}>
        <button onClick={toggleDocument}>Toggle PDF document</button>
      </div>
      {highlights.length > 0 ? (
        <div style={{ padding: "1rem" }}>
          <button onClick={resetHighlights}>Reset highlights</button>
        </div>
      ) : null} */}
    </div>
  );
}
