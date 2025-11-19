import React from "react";
import { debounce } from "lodash";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import {
  fetchContacts,
  createContactRequest,
  deleteContactRequest,
  updateContactRequest,
  importContactsRequest,
  resetContactPasswordManually
} from "../../redux/actions";
import { selectContacts, selectContactsLoading, selectProfile } from "../../redux/selectors";
import { Contact, PaginatedForm } from "../../Schema";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { compose } from 'redux'
import {
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Dropdown,
  Form,
  Input,
  Menu,
  Modal,
  Pagination,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Upload,
  message,
} from "antd";
import withRouter from "../../HOC/withRouter";
import { withTranslation } from 'react-i18next';
import i18n from "../../locales/i18n";
import withAuthorization from "../../HOC/withAuthorization";
import { RcFile } from "antd/es/upload";
import { API_URL, FILES_STORE } from "../../redux/network/api";
import { EllipsisOutlined } from '@ant-design/icons';

const { Column } = Table;
const { Option } = Select;

interface IContactState {
  visible: boolean;
  resetVisible: boolean;
  pageNum: number;
  totalCount: number;
  pageCount: number;
  currentPage: number;
  editingContactId: string | null;
  search: string;
  importModelVisible: boolean;
  importLoading: boolean;
  exportLoading: boolean;
  syncLoading: boolean;
  file?: RcFile;
  newPassword?: string;
}

interface IContactProps {
  loading: boolean;
  fetchContacts: (form: PaginatedForm) => Promise<any>;
  createContactRequest: (contact: Contact) => Promise<any>;
  deleteContactRequest: (id: string) => Promise<any>;
  resetContactPasswordManually: (id: string, password: string) => Promise<any>;
  updateContactRequest: (id: string, contact: Contact) => Promise<any>;
  contacts: Contact[];
  profile: any;
  navigate?: (route: string) => void;
}

class ContactPage extends React.Component<IContactProps, IContactState> {
  constructor(props: IContactProps) {
    super(props);
    this.state = {
      visible: false,
      pageNum: 1,
      totalCount: 0,
      pageCount: 10,
      currentPage: 1,
      editingContactId: null,
      search: '',
      importModelVisible: false,
      importLoading: false,
      exportLoading: false,
      syncLoading: false,
      resetVisible: false,
    };
  }

  formRef = React.createRef<any>();

  fetchData = () => {
    const { pageNum, pageCount, search } = this.state;

    this.props.fetchContacts({ page: pageNum, limit: pageCount, search }).then((data) => {
      if (data?.metaData?.totalItems) {
        this.setState({
          totalCount: data.metaData.totalItems,
          pageNum: data.metaData.currentPage,
          pageCount: data.metaData.itemsPerPage,
          currentPage: data.metaData.currentPage,
        });
      }
    });
  };

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps: IContactProps, prevState: IContactState) {
    const { totalCount, pageNum, pageCount } = this.state;

    if (
      prevState.totalCount !== totalCount ||
      prevState.pageNum !== pageNum ||
      prevState.pageCount !== pageCount
    ) {
      this.fetchData();
    }
  }
  debounceSearch = debounce((value: string) => {
    this.fetchData();
  }, 1000);
  onSearch = (value: string) => {
    this.setState({ pageNum: 1, search: value });
    this.debounceSearch(value);
  }

  onOpen = (contactId: string | null = null) => {
    this.setState({ visible: true, editingContactId: contactId });
  };

  onOpenResetPassword = (contactId: string) => {
    this.setState({ resetVisible: true, editingContactId: contactId });
  };

  onOpenImportModel = () => {
    this.setState({ importModelVisible: true });
  };

  onExportContacts = () => {
    this.setState({ exportLoading: true });
    window.open(`${API_URL}/files/export-contacts-file`, '_blank');
    this.setState({ exportLoading: false });
  }

  onSyncContacts = () => {
    this.setState({ syncLoading: true });
    fetch(`${API_URL}/contacts-sync`, {
      method: 'POST',
    }).then(res => res.json()).then((data) => {
      if (data.status && data.status === "success") {
        message.success(i18n.t('successfully_synced_the_contacts'));
      }
    }).catch((err) => {
      message.error(i18n.t('something_went_wrong_please_try_again'));
    }).finally(() => {
      this.setState({ syncLoading: false });
    });
  };

  handlePageChange = (value: number) => {
    this.setState({ pageNum: value });
  };

  handlePageSizeChange = (_: number, value: number) => {
    this.setState({ pageNum: 1, pageCount: value });
  };

  onDeleteContact = (id: string) => {
    this.props.deleteContactRequest(id).then((data) => {
      if (data.status && data.status === "success") {
        message.success(i18n.t('successfully_deleted_the_contact'));
      } else {
        message.error(i18n.t('something_went_wrong_please_try_again'));
      }
    });
  };

  onArchiveContact = (id: string, contact: Contact) => {
    const { _id, createdAt, updatedAt, ...rest } = contact;
    this.props.updateContactRequest(id, { ...rest, archived: !contact.archived }).then((data) => {
      if (data._id) {
        message.success(i18n.t('successfully_updated_the_contact'));
      } else {
        message.error(i18n.t('something_went_wrong_please_try_again'));
      }
    });
  }

  renderNewContactModal = () => {
    const { visible, editingContactId } = this.state;

    const isEditing = !!editingContactId;
    const modalTitle = isEditing ? i18n.t('edit_contact') : i18n.t('new_contact');

    const initialValues = isEditing
      ? this.props.contacts.find((c) => c._id === editingContactId)
      : undefined;

    const onClose = () => {
      this.setState({ visible: false });
    };

    const onFinish = (contact: Contact) => {
      const { editingContactId } = this.state;

      if (isEditing && editingContactId) {
        this.props
          .updateContactRequest(editingContactId, contact)
          .then((data) => {
            if (data._id) {
              message.success(i18n.t('successfully_updated_the_contact'));
              this.setState({ visible: false, editingContactId: null });
            } else {
              if (data && data.errorValidation && data.errorValidation.fields && data.errorValidation.fields.email) {
                message.error(data.errorValidation.fields.email)
              }
              else if (data && data.errorValidation && data.errorValidation.fields && data.errorValidation.fields.password) {
                message.error(data.errorValidation.fields.password)
              } else {
                message.error(i18n.t('something_went_wrong_please_try_again'))
              }
            }
          });
      } else {
        this.props.createContactRequest(contact).then((data) => {
          if (data._id) {
            message.success(i18n.t('successfully_created_the_contact'));
            this.setState({ visible: false });
          } else {
            message.error(i18n.t('something_went_wrong_please_try_again'));
          }
        });
      }
    };


    return (
      <Modal
        title={modalTitle}
        open={visible}
        centered
        closable={false}
        footer={() => null}
        width={800}
      >
        <Divider />

        <Form
          ref={this.formRef}
          name="contactForm"
          layout="vertical"
          onFinish={onFinish}
          initialValues={initialValues}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label={i18n.t('salutation')}
                name="salutation"
                rules={[{ required: true }]}
              >
                <Select>
                  {[
                    { lable: i18n.t('mr'), value: i18n.t('mr') },
                    { lable: i18n.t('mrs'), value: i18n.t('mrs') },
                    { lable: i18n.t('company'), value: i18n.t('company') },
                  ].map((el) => (
                    <Option key={el.lable} value={el.value}>
                      {el.lable}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={i18n.t('first_name')}
                name="first_name"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={i18n.t('last_name')}
                name="last_name"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label={i18n.t('address')}
                name="address"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={i18n.t('zip_code')}
                name="zip_code"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={i18n.t('location')}
                name="location"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label={i18n.t('district')}
                name="district"
                rules={[{ required: false, type: 'number', min: 1, max: 23 }]}
              >
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={i18n.t('telephone')}
                name="telephone"
                rules={[{ required: true }]}
              >
                <Input type="tel" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={i18n.t('phone_numbber_2')}
                name="phone_numbber_2"
              >
                <Input type="tel" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label={i18n.t('phone_numbber_3')}
                name="phone_numbber_3"
              >
                <Input type="tel" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={i18n.t('email')}
                name="email"
                rules={[{ required: true, type: 'email' }]}
              >
                <Input type="email" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={i18n.t('password')}
                name="password"
                rules={[{ required: !isEditing }]}
              >
                <Input.Password />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label={i18n.t('email')}
                name="email"
                rules={[{ required: true, type: 'email' }]}
              >
                <Input type="email" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={i18n.t('password')}
                name="password"
                rules={[{ required: !isEditing }]}
              >
                <Input.Password />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={i18n.t('title')}
                name="title"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

	          <Row gutter={16}>
	            <Col span={8}>
	              <Form.Item
	                label={i18n.t('title')}
	                name="title"
	              >
	                <Input />
	              </Form.Item>
	            </Col>
	            <Col span={8}>
	              <Form.Item
	                label={i18n.t('contract_link')}
	                name="contract_link"
	              >
	                <Input />
	              </Form.Item>
	            </Col>
	            <Col span={8}>
	              <Form.Item
	                label={i18n.t('sign_url')}
	                name="sign_url"
	              >
	                <Input />
	              </Form.Item>
	            </Col>
	          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label={i18n.t('remarks')}
                name="remarks"
              >
                <Input.TextArea />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="newsletter"
                valuePropName="checked"
              >
                <Checkbox>{i18n.t('newsletter')}</Checkbox>
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Row justify="end">
            <Space>
              <Button onClick={onClose}>{i18n.t('cancel')}</Button>
              <Button type="primary" htmlType="submit">
                {isEditing ? i18n.t('save') : i18n.t('create')}
              </Button>
            </Space>
          </Row>
        </Form>
      </Modal>
    );
  };

  renderResetPasswordModal = () => {
    const { resetVisible, editingContactId } = this.state;

    const onClose = () => {
      this.setState({ resetVisible: false });
    };

    const onFinish = () => {
      const { editingContactId, newPassword } = this.state;

      if (editingContactId && newPassword) {
        this.props.resetContactPasswordManually(editingContactId, newPassword).then((data) => {
          if (data.status && data.status === 'success') {
            message.success(i18n.t('successfully_reset_the_password'));
            this.setState({ resetVisible: false, editingContactId: null, newPassword: '' });
          } else {
            message.error(i18n.t('something_went_wrong_please_try_again'));
          }
        });
      }
    };

    return (
      <Modal
        title={i18n.t('reset_password')}
        open={resetVisible}
        onCancel={onClose}
        onOk={onFinish}
      >
        <Input.Password
          placeholder={i18n.t('new_password')}
          onChange={(e) => this.setState({ newPassword: e.target.value })}
        />
      </Modal>
    );
  }

  renderImportModal = () => {
    const { importModelVisible, importLoading, file } = this.state;

    const onClose = () => {
      this.setState({ importModelVisible: false });
    };

    const onImport = () => {
      if (file) {
        this.setState({ importLoading: true });
        const formData = new FormData();
        formData.append('file', file);

        fetch(`${API_URL}/files/import-contacts-file`, {
          method: 'POST',
          body: formData,
        }).then(res => res.json()).then((data) => {
          if (data.status && data.status === 'success') {
            message.success(i18n.t('successfully_imported_the_contacts'));
            this.fetchData();
          } else {
            message.error(i18n.t('something_went_wrong_please_try_again'));
          }
        }).catch((err) => {
          message.error(i18n.t('something_went_wrong_please_try_again'));
        }).finally(() => {
          this.setState({ importLoading: false, importModelVisible: false });
        });
      }
    };

    return (
      <Modal
        title={i18n.t('import_contacts')}
        open={importModelVisible}
        onCancel={onClose}
        onOk={onImport}
        confirmLoading={importLoading}
      >
        <Upload
          beforeUpload={(file) => {
            this.setState({ file });
            return false;
          }}
          maxCount={1}
        >
          <Button>{i18n.t('select_file')}</Button>
        </Upload>
      </Modal>
    );
  }

  render() {
    const { contacts, loading, profile } = this.props;
    const { pageNum, pageCount, totalCount, search, exportLoading, syncLoading } = this.state;

    return (
      <Card>
        <Row justify="space-between" align="middle">
          <Col span={12}>
            <Input.Search
              placeholder={i18n.t('search_contacts')}
              onSearch={this.onSearch}
              onChange={(e) => this.onSearch(e.target.value)}
              value={search}
              style={{ width: 300 }}
            />
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Space>
              <Button type="primary" onClick={() => this.onOpen()}>
                {i18n.t('new_contact')}
              </Button>
              <Button onClick={this.onOpenImportModel}>{i18n.t('import')}</Button>
              <Button onClick={this.onExportContacts} loading={exportLoading}>{i18n.t('export')}</Button>
              {profile && profile.role === 'admin' && (
                <Button onClick={this.onSyncContacts} loading={syncLoading}>{i18n.t('sync_with_kalender')}</Button>
              )}
            </Space>
          </Col>
        </Row>

        <Divider />

        <Spin spinning={loading}>
          <Table dataSource={contacts} rowKey="_id" pagination={false}>
            <Column title={i18n.t('salutation')} dataIndex="salutation" key="salutation" />
            <Column title={i18n.t('first_name')} dataIndex="first_name" key="first_name" />
            <Column title={i18n.t('last_name')} dataIndex="last_name" key="last_name" />
            <Column title={i18n.t('address')} dataIndex="address" key="address" />
            <Column title={i18n.t('zip_code')} dataIndex="zip_code" key="zip_code" />
            <Column title={i18n.t('location')} dataIndex="location" key="location" />
            <Column title={i18n.t('telephone')} dataIndex="telephone" key="telephone" />
            <Column title={i18n.t('email')} dataIndex="email" key="email" />
            <Column
              title={i18n.t('actions')}
              key="actions"
              render={(_, record: Contact) => (
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: "edit",
                        label: i18n.t('edit'),
                        onClick: () => record._id && this.onOpen(record._id),
                      },
                      {
                        key: "reset-password",
                        label: i18n.t('reset_password'),
                        onClick: () => record._id && this.onOpenResetPassword(record._id),
                      },
                      {
                        key: "archive",
                        label: record.archived ? i18n.t('unarchive') : i18n.t('archive'),
                        onClick: () => record._id && this.onArchiveContact(record._id, record),
                      },
                      {
                        key: "delete",
                        label: (
                          <Popconfirm
                            title={i18n.t('are_you_sure_you_want_to_delete_this_contact')}
                            onConfirm={() => record._id && this.onDeleteContact(record._id)}
                          >
                            {i18n.t('delete')}
                          </Popconfirm>
                        ),
                      },
                    ],
                  }}
                >
                  <Button type="text" icon={<EllipsisOutlined />} />
                </Dropdown>
              )}
            />
          </Table>
        </Spin>

        <Divider />

        <Pagination
          current={pageNum}
          pageSize={pageCount}
          total={totalCount}
          onChange={this.handlePageChange}
          onShowSizeChange={this.handlePageSizeChange}
          showSizeChanger
        />

        {this.renderNewContactModal()}
        {this.renderResetPasswordModal()}
        {this.renderImportModal()}
      </Card>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  contacts: selectContacts(state),
  loading: selectContactsLoading(state),
  profile: selectProfile(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, any>) => ({
  fetchContacts: (form: PaginatedForm) => dispatch(fetchContacts(form)),
  createContactRequest: (contact: Contact) => dispatch(createContactRequest(contact)),
  deleteContactRequest: (id: string) => dispatch(deleteContactRequest(id)),
  updateContactRequest: (id: string, contact: Contact) => dispatch(updateContactRequest(id, contact)),
  importContactsRequest: (file: any) => dispatch(importContactsRequest(file)),
  resetContactPasswordManually: (id: string, password: string) => dispatch(resetContactPasswordManually(id, password)),
});

export default compose(
  withRouter,
  withAuthorization,
  connect(mapStateToProps, mapDispatchToProps),
  withTranslation(),
)(ContactPage);
