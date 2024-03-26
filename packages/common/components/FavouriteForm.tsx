import { Form, FormInstance, Input } from 'antd';
import React from 'react';
import { withErrorBoundaryCustom } from '../utils/error';

interface FavouriteFormProps {
  form: FormInstance;
  initialValues: FavouriteFormValues;
}

export interface FavouriteFormValues {
  websiteRename: string;
  tag: string;
}

const FavouriteForm: React.FC<FavouriteFormProps> = ({
  form,
  initialValues,
}) => {
  return (
    <Form
      className="favourite-form"
      form={form}
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 18 }}
      layout="horizontal"
      style={{ maxWidth: 600, paddingTop: '14px' }}
      initialValues={initialValues}
    >
      <Form.Item
        label="Name"
        name="websiteRename"
        dependencies={['websiteRename']}
      >
        <Input />
      </Form.Item>
      <Form.Item label="Tag" name="tag" dependencies={['tag']}>
        <Input />
      </Form.Item>
    </Form>
  );
};

export default withErrorBoundaryCustom<FavouriteFormProps>(FavouriteForm);
