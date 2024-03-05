import { highlightKeywords } from "@/lib/utils";
import { Avatar, Tag } from "antd";
import { SimplifiedUser } from "common/db/prisma";
import { useRouter } from "next/navigation";
import React from "react";

const UserDisplay: React.FC<{ user: SimplifiedUser; keyword?: string }> = ({
  user,
  keyword,
}) => {
  const router = useRouter();

  return (
    <Tag
      onClick={() => router.push(`/author/${user.name}`)}
      style={{ cursor: "pointer" }}
      color="gold"
    >
      <Avatar src={user.image} />
      <span
        style={{
          display: "inline-block",
          padding: "10px 6px 12px 8px",
        }}
      >
        {keyword ? highlightKeywords(user.name || "", keyword) : user.name}
      </span>
    </Tag>
  );
};

export default UserDisplay;
