import React from "react";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import {
  fetchContactAppointments,
  updateAppointmentRequest,
  deleteAppointmentRequest,
} from "../../redux/actions";
import {
  selectContactAppointments,
  selectContactAppointmentsLoading,
  selectDeleteAppointmentLoading,
  selectUpdateAppointmentLoading,
} from "../../redux/selectors";
import { Appointment, ExtendedAppointment, Service } from "../../Schema";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { compose } from "redux";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Dropdown,
  Form,
  Input,
  List,
  Menu,
  Modal,
  Popconfirm,
  Row,
  Select,
  Spin,
  Table,
  message,
} from "antd";
import dayjs from "dayjs";

import withRouter, { RouteParams } from "../../HOC/withRouter";
import { FILES_STORE } from "../../redux/network/api";
import { download } from "../../utils";
import { withTranslation } from 'react-i18next';
import i18n from "../../locales/i18n";
import { EllipsisOutlined } from '@ant-design/icons';

const { Column } = Table;
const { Option } = Select;

interface IAppointmentsState {
  visible: boolean;
  editingAppointmentId: string | null;
  attachmentModelId: string | null;
}

interface IAppointmentsProps {
  loading: boolean;
  appointments: ExtendedAppointment[];
  updateAppointmentLoading: boolean;
  deleteAppointmentLoading: boolean;
  fetchContactAppointments: (contactId: string) => Promise<any>;
  updateAppointmentRequest: (
    id: string,
    appointment: Appointment
  ) => Promise<any>;
  deleteAppointmentRequest: (id: string) => Promise<any>;
  params?: RouteParams;
  navigate?: (route: string) => void;
}

class AppointmentsPage extends React.Component<
  IAppointmentsProps,
  IAppointmentsState
> {
  constructor(props: IAppointmentsProps) {
    super(props);
    this.state = {
      visible: false,
      editingAppointmentId: null,
      attachmentModelId: null,
    };
  }

  formRef = React.createRef<any>();

  fetchData = () => {
    if (this.props.params) {
      const params = this.props.params;
      const { contactId } = params;

      this.props.fetchContactAppointments(contactId);
    }
  };

  componentDidMount() {
    this.fetchData();
  }

  onOpen = (id: string | null = null) => {
    this.setState({ visible: true, editingAppointmentId: id });
  };

  onOpenAttachmentModel = (id: string | null = null) => {
    this.setState({ attachmentModelId: id });
  };

  onDeleteAppointment = (id: string) => {
    this.props.deleteAppointmentRequest(id).then((data) => {
      if (data.status && data.status === "success") {
        message.success(i18n.t('successfully_deleted_the_appointment'));
      } else {
        message.error(i18n.t('something_went_wrong_please_try_again'));
      }
    });
  };

  renderAttachmentsModal = () => {
    const { attachmentModelId } = this.state;
    const { appointments } = this.props;

    if (!attachmentModelId) {
      return null;
    }

    const attachments = appointments.filter(el => el._id === attachmentModelId)[0].attachments;


    return (
      <Modal
        title={i18n.t('attachments')}
        open={Boolean(attachmentModelId)}
        centered
        closable={true}
        footer={() => null}
        onCancel={() => this.onOpenAttachmentModel(null)}
        width={800}
      >
        <Divider />
        <List
          dataSource={attachments}
          renderItem={(item) => (
            <List.Item>
              <Row>
                <Col span={24}>
                  <div className="flex flex-col">
                    <img src={FILES_STORE + item.url} width={'100%'} alt="download-icon" className="object-contain" height={250} />
                    <Button
                      className="self-start"
                      type="link"
                      onClick={() => download(item.title)}
                    >
                      {i18n.t('download')}
                    </Button>
                  </div>
                </Col>
              </Row>
            </List.Item>
          )}
        />
      </Modal>
    );
  }

  renderUpdateAppointmentModal = () => {
    const { visible, editingAppointmentId } = this.state;
    const initialValues = this.props.appointments.find(
      (c) => c._id === editingAppointmentId
    );



    const onClose = () => {
      this.setState({ visible: false });
    };

    const onFinish = (appointment: Appointment) => {
      const { editingAppointmentId } = this.state;
      const { _id, createdAt, updatedAt, service, ...propsToUpdate } = initialValues!


      this.props
        .updateAppointmentRequest(editingAppointmentId!, { ...propsToUpdate, ...appointment })
        .then((data) => {
          if (data._id) {
            message.success(i18n.t('successfully_updated_the_appointment'));
            this.setState({ visible: false, editingAppointmentId: null });
          } else {
            message.error(i18n.t('something_went_wrong_please_try_again'));
          }
        });
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from(
      { length: currentYear - 2003 },
      (_, index) => currentYear - index
    ).map(String);

    return (
      <Modal
        title={i18n.t('edit_appointment_details')}
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
            <Col span={24}>
              <Form.Item
                label={i18n.t('device_model')}
                name="model"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label={i18n.t('brand_of_device')} name="brand_of_device">
                <Select>
                  {[i18n.t('baxi'), i18n.t('buderus'), i18n.t('de_dietrich'), i18n.t('to_give'), i18n.t('junkers'),
                  i18n.t('praiseworthy'), i18n.t('nordgas'), i18n.t('orange'), i18n.t('rapido'),
                  i18n.t('saunier_duval'), i18n.t('vaillant'), i18n.t('viessmann'), i18n.t('wolf'), i18n.t('other')].map((salutation) => (
                    <Option key={salutation} value={salutation}>
                      {salutation}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={i18n.t('year')}
                name="year"
                rules={[
                  {
                    required: true,
                    message: i18n.t('please_select_a_year'),
                  },
                ]}
              >
                <Select placeholder={i18n.t('select_a_year')}>
                  {[i18n.t('last_year'), i18n.t('i_dont_know_anymore')]
                    .concat(years)
                    .map((year) => (
                      <Option key={year} value={year}>
                        {year}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label={i18n.t('notes')} name="remarks">
                <Input.TextArea />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={i18n.t('has_maintenance_agreement')}
            name="has_maintenance_agreement"
            rules={[{ required: true }]}
          >
            <Select>
              {[
                { lable: i18n.t('no'), value: false },
                {
                  lable: i18n.t('Yes_the_prices_according_to_the_maintenance_agreement_apply'),
                  value: true,
                },
              ].map((el) => (
                <Option key={el.lable} value={el.value}>
                  {el.lable}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="exhaust_gas_measurement" valuePropName="checked">
            <Checkbox>{i18n.t('exhaust_gas_measurement')}</Checkbox>
          </Form.Item>
          <Form.Item name="has_bgas_before" valuePropName="checked">
            <Checkbox>{i18n.t('has_bgas_before')}</Checkbox>
          </Form.Item>

          <Row gutter={16} justify={"end"}>
            <Button className="mr-3" onClick={onClose}>{i18n.t('cancel')}</Button>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                {i18n.t('submit')}
              </Button>
            </Form.Item>
          </Row>
        </Form>
      </Modal>
    );
  };

  render() {
    const { loading, appointments, deleteAppointmentLoading } = this.props;

    return (
      <>
        {this.renderUpdateAppointmentModal()}
        {this.renderAttachmentsModal()}
        <Card
          title={i18n.t('appointments')}
          extra={
            <Button
              onClick={() => {
                if (this.props.navigate) {
                  this.props.navigate("/contact");
                }
              }}
              type="link"
            >
              {i18n.t('go_back_to_contacts')}
            </Button>
          }
        >
          <Spin spinning={loading}>
            <Table
              dataSource={appointments}
              style={{ marginTop: 20 }}
              rowKey="_id"
              pagination={false}
              scroll={{ x: true }}
            >
              <Column
                title={i18n.t('services')}
                dataIndex={"service"}
                render={(service: Service, record: ExtendedAppointment) => {
                  return <span>{service?.name || record?.imported_service_name || '--'}</span>;
                }}
              />
              <Column
                title={i18n.t('duration')}
                dataIndex={"service"}
                render={(service: Service, record: ExtendedAppointment) => {
                  return <span>{service?.duration || record.imported_service_duration || '--'} {service?.duration ? i18n.t('mins') : ''}</span>;
                }}
              />
              <Column
                title={i18n.t('price')}
                dataIndex={"service"}
                render={(service: Service, record: ExtendedAppointment) => {
                  return <span>{service?.price || record?.imported_service_price || '--'} {service?.price ? i18n.t('eur') : ''}</span>;
                }}
              />
              <Column
                title={i18n.t('date')}
                render={(_: any, record: ExtendedAppointment) => {
                  return (
                    <span>{dayjs(record.start_date).format("YYYY-MM-DD")}</span>
                  );
                }}
              />
              <Column
                title={i18n.t('time')}
                render={(_: any, record: ExtendedAppointment) => {
                  const startDateTime = dayjs(record.start_date);
                  const endDateTime = dayjs(record.end_date);

                  const offsetMinutes = startDateTime.utcOffset();

                  const formattedTime =
                    startDateTime.subtract(offsetMinutes, 'minute').format("HH:mm A") +
                    " - " +
                    endDateTime.subtract(offsetMinutes, 'minute').format("HH:mm A");

                  return <span>{formattedTime}</span>;
                }}
              />
              <Column title={i18n.t('brand')} dataIndex={"brand_of_device"} />
              <Column title={i18n.t('model')} dataIndex={"model"} />
              <Column title={i18n.t('invoice_number')} dataIndex={"invoice_number"} />
              <Column title={i18n.t('contract_number')} dataIndex={"contract_number"} />
              <Column
                title={i18n.t('action')}
                key="action"
                render={(_: any, record: Appointment) => (
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: "edit",
                          label: i18n.t('edit'),
                          onClick: () => this.onOpen(record._id),
                        },
                        {
                          key: "delete",
                          label: (
                            <Popconfirm
                              title={i18n.t('delete_this_appointment')}
                              description={i18n.t('are_you_sure_you_want_to_delete_this_appointment')}
                              okText={i18n.t('delete_it')}
                              cancelText={i18n.t('no')}
                              okButtonProps={{
                                danger: true,
                              }}
                              onConfirm={() => this.onDeleteAppointment(record._id!)}
                            >
                              <Button type="link" loading={deleteAppointmentLoading}>
                                {i18n.t('delete')}
                              </Button>
                            </Popconfirm>
                          ),
                        },
                      ],
                    }}
                    placement="bottomRight"
                    trigger={['click']}
                  >
                    <Button>
                      <EllipsisOutlined />
                    </Button>
                  </Dropdown>
                )}
              />
              <Column
                title="attachments"
                key="attachments"
                render={(_: any, record: Appointment) => (
                  <Row>
                    {record.attachments?.length ? <Button
                      className="self-end mr-3"
                      type="link"
                      onClick={() => this.onOpenAttachmentModel(record._id)}
                    >
                      {i18n.t('view')}
                    </Button> : null}
                  </Row>
                )}
              />
            </Table>
          </Spin>
        </Card>
      </>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  appointments: selectContactAppointments(state),
  loading: selectContactAppointmentsLoading(state),
  updateAppointmentLoading: selectUpdateAppointmentLoading(state),
  deleteAppointmentLoading: selectDeleteAppointmentLoading(state),
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<RootState, undefined, any>
) => ({
  fetchContactAppointments: (contactId: string) =>
    dispatch(fetchContactAppointments(contactId)),
  updateAppointmentRequest: (id: string, appointment: Appointment) =>
    dispatch(updateAppointmentRequest(id, appointment)),
  deleteAppointmentRequest: (id: string) =>
    dispatch(deleteAppointmentRequest(id)),
});

export default compose(withRouter)(
  connect(mapStateToProps, mapDispatchToProps)(withTranslation()(AppointmentsPage))
);
