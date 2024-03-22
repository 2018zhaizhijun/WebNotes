import React, { useCallback, useState } from 'react';
import { Form, Image, Input, Modal, Upload } from 'antd';
import { API_HOST, getBase64, queryParse, sendRequest } from '../utils/http';
import { UploadFile } from 'antd/es/upload';
import { Session } from 'next-auth';
import { SimplifiedUser } from 'db/prisma';
import { RuleObject } from 'antd/es/form';

interface UserModalProps {
  open: boolean;
  onOk: () => void;
  // onCancel: () => void;
  setOpen: (open: boolean) => void;
  session: Session;
}

interface UserFormValues {
  name: string;
}

const UserModal: React.FC<UserModalProps> = ({
  open,
  setOpen,
  onOk,
  session,
}) => {
  //   const { data: session } = useSession();
  const [form] = Form.useForm<UserFormValues>();
  const [fileList, setFileList] = useState<UploadFile[]>([
    {
      uid: '',
      name: '',
      url: session.user?.image || '',
      status: 'done',
    },
  ]);
  const [confirmLoading, setConfirmLoading] = useState(false);
  // const [loading, setLoading] = useState(false);

  const userNameValidator = useCallback(
    (rule: RuleObject, value: string, callback: (error?: string) => void) => {
      if (!value || value === session.user?.name) {
        callback();
      }
      if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
        callback("User name can only contain letters, numbers, '-' and '_' ");
      }
      sendRequest<SimplifiedUser[]>(
        `${API_HOST}/api/user?${queryParse({ name: value })}`,
        {
          method: 'GET',
        }
      ).then((json) => {
        if (json.length > 0) {
          callback('User name already exists');
        }
        callback();
      });
    },
    [session]
  );

  const updateUserInfo = useCallback(
    async (image: string, name: string, onOk: () => void) => {
      return sendRequest(`${API_HOST}/api/user`, {
        method: 'PUT',
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({
          image,
          name,
        }),
      }).then(() => {
        onOk?.();
      });
    },
    []
  );

  const confirmHandler = useCallback(() => {
    setConfirmLoading(true);

    form
      .validateFields()
      .then(async (values) => {
        await updateUserInfo(fileList[0].url || '', values.name, onOk);
        // await onOk?.();
        setOpen(false);
        setConfirmLoading(false);
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
        setConfirmLoading(false);
      });
  }, [form, updateUserInfo, fileList, onOk, setOpen, setConfirmLoading]);

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
          style={{ maxWidth: 600, paddingTop: '20px' }}
          initialValues={{
            name: session.user?.name || 'Anonymous User',
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
              customRequest={async (options: any) => {
                options.file.status = 'done';
                const base64 = await getBase64(options.file);
                // option.onSuccess(base64);
                options.file.url = base64;
                setFileList([options.file]);
              }}
              //   beforeUpload={beforeUpload}
              //   onChange={handleChange}
              fileList={fileList}
            >
              <Image
                src={fileList[0].url}
                alt="avatar"
                style={{ width: '100%' }}
              />
            </Upload>
          </Form.Item>
          <Form.Item
            label="Username"
            name="name"
            rules={[{ required: true }, { validator: userNameValidator }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default UserModal;
