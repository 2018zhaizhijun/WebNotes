import React, { useCallback, useState } from "react";
import { Form, Input, Modal, Upload, message } from "antd";
import { getBase64, sendRequest } from "../utils/http";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { useSession } from "next-auth/react";
import { UploadFile } from "antd/es/upload";

interface UserModalProps {
  open: boolean;
  onOk: () => void;
  // onCancel: () => void;
  setOpen: (open: boolean) => void;
}

const UserModal: React.FC<UserModalProps> = ({ open, setOpen, onOk }) => {
  const { data: session } = useSession();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([
    {
      uid: "",
      name: "",
      url: session!.user?.image || "",
      status: "done",
    },
  ]);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const updateUserInfo = useCallback(
    async (image: string, name: string) => {
      return sendRequest(
        `/api/user`,
        {
          method: "PUT",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          body: JSON.stringify({
            image,
            name,
          }),
        },
        (json) => {},
        messageApi
      );
    },
    [sendRequest, messageApi]
  );

  const confirmHandler = useCallback(() => {
    setConfirmLoading(true);

    form
      .validateFields()
      .then(async (values) => {
        await updateUserInfo(fileList[0].url || "", values.name);
        await onOk?.();
        setOpen(false);
        setConfirmLoading(false);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  }, [
    setConfirmLoading,
    form,
    updateUserInfo,
    fileList,
    onOk,
    setOpen,
    setConfirmLoading,
  ]);

  //   const handleChange: UploadProps["onChange"] = (info) => {
  //     if (info.file.status === "uploading") {
  //       setLoading(true);
  //       return;
  //     }
  //     if (info.file.status === "done") {
  //       setLoading(false);
  //       // Get this url from response in real world.
  //       //   getBase64(info.file.originFileObj as FileType, (url: string) => {
  //       //     setLoading(false);
  //       //     //   form.setFieldsValue({ image: url });
  //       //     // setFileList([url]);
  //       //   });
  //       return;
  //     }
  //     if (info.file.status === "error") {
  //       message.error("上传失败");
  //     }
  //   };

  //   const uploadButton = (
  //     <button style={{ border: 0, background: "none" }} type="button">
  //       {loading ? <LoadingOutlined /> : <PlusOutlined />}
  //       <div style={{ marginTop: 8 }}>Upload</div>
  //     </button>
  //   );

  //   const beforeUpload = async (file: FileType) => {
  //     const isJpgOrPng =
  //       file.type === "image/jpeg" ||
  //       file.type === "image/png" ||
  //       file.type === "image/jpg";
  //     if (!isJpgOrPng) {
  //       message.error("You can only upload JPG/PNG file!");
  //     }
  //     const isLt2M = file.size / 1024 / 1024 < 2;
  //     if (!isLt2M) {
  //       message.error("Image must smaller than 2MB!");
  //     }
  //     return isJpgOrPng && isLt2M;

  //     // if (isJpgOrPng && isLt2M) {
  //     console.log(file);
  //     return new Promise((resolve, reject) => {
  //       const reader = new FileReader();
  //       reader.onload = () => {
  //         resolve(reader.result);
  //       };
  //       reader.onerror = (error) => reject(error);
  //       reader.readAsDataURL(file);
  //     });
  //     // }
  //     // return false;
  //   };

  return (
    <>
      <Modal
        title="Edit User Info"
        open={open}
        onOk={confirmHandler}
        confirmLoading={confirmLoading}
        onCancel={() => {
          setOpen(false);
        }}
      >
        <Form
          form={form}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 14 }}
          layout="horizontal"
          style={{ maxWidth: 600, paddingTop: "20px" }}
          initialValues={{
            name: session!.user?.name || "Anonymous User",
          }}
        >
          <Form.Item
            label="Avatar"
            name="image"
            // valuePropName="file"
            // 也可以在 getValueFromEvent 函数中将组件值转换为所需的表单值，但是不能为异步函数，因此不适合 base64 的转换
            // getValueFromEvent={normFile}
          >
            <Upload
              //   action="/upload.do"
              listType="picture"
              maxCount={1}
              showUploadList={false}
              accept=".png,.jpg,.jpeg"
              customRequest={async (option: any) => {
                option.file.status = "done";
                const base64 = await getBase64(option.file);
                // option.onSuccess(base64);
                option.file.url = base64;
                setFileList([option.file]);
              }}
              //   beforeUpload={beforeUpload}
              //   onChange={handleChange}
              fileList={fileList}
            >
              <img
                src={fileList[0].url}
                alt="avatar"
                style={{ width: "100%" }}
              />
            </Upload>
          </Form.Item>
          <Form.Item label="Username" name="name">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default UserModal;
