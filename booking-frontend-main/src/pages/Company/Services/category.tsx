import React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import { updateCategoryRequest, deleteCategoryRequest } from "../../../redux/actions";
import {
    selectCategories,
    selectCategoriesLoading,
    selectDeleteCategoryLoading,
    selectUpdateCategoryLoading,
} from "../../../redux/selectors";
import { Category, Service, SortDirection } from "../../../Schema";
import { ThunkDispatch } from "@reduxjs/toolkit";
import {
    Row,
    Col,
    Table,
    Tabs,
    Switch,
    Input,
    Select,
    Button,
    message,
    Popconfirm,
    Modal,
    Divider,
    Upload,
    Space,
    Dropdown,
    Menu,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { Content } from "antd/es/layout/layout";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./index.css";
import { RcFile } from "antd/es/upload";
import { upload } from "../../../utils";
import { FILES_STORE } from "../../../redux/network/api";
import { withTranslation } from 'react-i18next';
import i18n from "../../../locales/i18n";
import { EllipsisOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Column } = Table;
const { Option } = Select;


interface ICategoryState {
    editingTitle: number | null;
    localCategory: Category;
    visible: boolean;
    newService: Service;
    file?: RcFile;
    fileLoading: boolean,
    editingServiceIndex: number | null;
}

interface ICategoryProps {
    loading: boolean;
    category: Category;
    index: number;
    updateCategoryLoading: boolean;
    deleteCategoryLoading: boolean;
    updateCategoryRequest: (id: string, category: Category) => Promise<any>;
    deleteCategoryRequest: (id: string) => Promise<any>;
}

class CategoryPage extends React.Component<ICategoryProps, ICategoryState> {
    constructor(props: ICategoryProps) {
        super(props);
        this.state = {
            editingTitle: null,
            localCategory: props.category,
            visible: false,
            newService: {
                name: '',
                description: '',
                duration: 60,
                price: 0,
                abbreviation_id: Math.floor(1000 + Math.random() * 9000),
                attachment: undefined
            },
            fileLoading: false,
            editingServiceIndex: null
        };
    }

    onUpdateCategory = () => {
        const { localCategory } = this.state;
        const updateCategory = Object.assign({}, localCategory);

        delete updateCategory._id;
        delete updateCategory.createdAt;
        delete updateCategory.updatedAt;


        this.props.updateCategoryRequest(localCategory._id!, updateCategory).then(data => {
            if (data._id) {
                message.success(i18n.t('successfully_updated_the_category'))
            } else {
                message.error(i18n.t('something_went_wrong_please_try_again'))
            }
        })
    };

    onDeleteCategory = () => {
        const { localCategory } = this.state;

        this.props.deleteCategoryRequest(localCategory._id!).then(data => {
            if (data.status && data.status === "success") {
                message.success(i18n.t('successfully_deleted_the_category'))
            } else {
                message.error(i18n.t('something_went_wrong_please_try_again'))
            }
        })
    };

    renderServices = () => {
        const { localCategory, visible, newService, file, fileLoading, editingServiceIndex } = this.state;

        const isEditing = typeof editingServiceIndex === 'number';
        const modelTitle = editingServiceIndex ? i18n.t('edit_service') : i18n.t('new_service');

        const onClose = () => {
            this.setState({
                visible: false,
                newService: {
                    name: '',
                    description: '',
                    duration: 60,
                    price: 0,
                    abbreviation_id: Math.floor(1000 + Math.random() * 9000),
                    attachment: undefined
                },
                editingServiceIndex: null
            })
        }

        const onOpen = () => {
            this.setState({ visible: true })
        }

        const setFile = (file?: RcFile) => {
            this.setState({ file })
        }

        const onSave = async () => {
            if (!newService.name) {
                message.error(i18n.t('please_add_service_name'))
                return;
            }
            if (!newService.description) {
                message.error(i18n.t('please_add_service_description'))
                return;
            }
            if (!newService.duration) {
                message.error(i18n.t('please_add_service_duration'))
                return;
            }
            if (!newService.price) {
                message.error(i18n.t('please_add_service_price'))
                return;
            }
            if (!newService.abbreviation_id) {
                message.error(i18n.t('please_add_service_abbreviation_id'))
                return;
            }

            let url = '';
            if (file) {
                this.setState({ fileLoading: true });
                const res = await upload(file);
                url = res.uri;
            }

            if (isEditing) {
                let updatedServices = localCategory.services;
                updatedServices = localCategory.services.map((service, index) =>
                    index === editingServiceIndex
                        ? { ...newService, attachment: file ? { title: file.name, url } : undefined }
                        : service
                );

                this.setState({
                    localCategory: {
                        ...localCategory,
                        services: [...updatedServices],
                    },
                    newService: {
                        name: '',
                        description: '',
                        duration: 60,
                        price: 0,
                        abbreviation_id: Math.floor(1000 + Math.random() * 9000),
                        attachment: undefined
                    },
                    editingServiceIndex: null,
                    file: undefined,
                    fileLoading: false,
                })

            } else {
                this.setState({
                    localCategory: {
                        ...localCategory,
                        services: [...this.state.localCategory.services, { ...newService, attachment: file ? { title: file.name, url } : undefined }],
                    },
                    newService: {
                        name: '',
                        description: '',
                        duration: 60,
                        price: 0,
                        abbreviation_id: Math.floor(1000 + Math.random() * 9000),
                        attachment: undefined
                    },
                    file: undefined,
                    fileLoading: false,
                })
            }


            onClose();
        }

        const onChange = (key: string, value: any) => {
            this.setState({
                newService: {
                    ...newService,
                    [key]: value
                }
            })
        };

        const onDeleteService = (id: number) => {
            const newServices = [...localCategory.services.slice(0, id), ...localCategory.services.slice(id + 1)];

            this.setState({
                localCategory: {
                    ...localCategory,
                    services: newServices
                }
            })
        };

        const onDeleteAttachment = () => {
            if (isEditing) {
                let updatedServices = localCategory.services;
                updatedServices = localCategory.services.map((service, index) =>
                    index === editingServiceIndex
                        ? { ...newService, attachment: undefined }
                        : service
                );

                this.setState({
                    localCategory: {
                        ...localCategory,
                        services: [...updatedServices]
                    },
                    newService: {
                        ...newService,
                        attachment: undefined
                    }
                })
            }
        };

        const onOpenEdit = (index: number) => {
            const initialValues: Service | undefined = localCategory.services[index];

            if (initialValues)
                this.setState({ visible: true, editingServiceIndex: index, newService: initialValues })
        }

        return (
            <div>
                <Modal
                    title={modelTitle}
                    open={visible}
                    centered
                    okText={i18n.t('save')}
                    cancelText={i18n.t('cancel')}
                    closable={false}
                    onCancel={onClose}
                    onOk={onSave}
                    confirmLoading={fileLoading}
                    width={750}
                >
                    <Divider />
                    <Row className="mb-6">
                        <Col span={8} className="w-full">
                            <span>{i18n.t('performance')}</span>
                        </Col>
                        <Col span={16}>
                            <Input
                                onChange={(e) => {
                                    onChange('name', e.target.value)
                                }}
                                value={newService.name} />
                        </Col>
                    </Row>
                    <Row className="mb-6">
                        <Col span={8} className="w-full">
                            <span>{i18n.t('additional_information')}</span>
                        </Col>
                        <Col span={16}>
                            <TextArea
                                onChange={(e) => {
                                    onChange('description', e.target.value)
                                }}
                                value={newService.description} />
                        </Col>
                    </Row>

                    <Row className="mb-6">
                        <Col span={8} className="w-full">
                            <span>{i18n.t('duration_min')}</span>
                        </Col>
                        <Col span={16}>
                            <Input
                                onChange={(e) => {
                                    onChange('duration', e.target.value)
                                }}
                                type="number"
                                value={newService.duration} />
                        </Col>
                    </Row>

                    <Row className="mb-6">
                        <Col span={8} className="w-full">
                            <span>{i18n.t('price')}</span>
                        </Col>
                        <Col span={16}>
                            <Input
                                onChange={(e) => {
                                    onChange('price', e.target.value)
                                }}
                                type="number"
                                value={newService.price} />
                        </Col>
                    </Row>

                    <Row className="mb-6">
                        <Col span={8} className="w-full">
                            <span>{i18n.t('abbreviation_id')}</span>
                        </Col>
                        <Col span={16}>
                            <Input
                                onChange={(e) => {
                                    onChange('abbreviation_id', e.target.value)
                                }}
                                value={newService.abbreviation_id} />
                        </Col>
                    </Row>

                    <Row >
                        <Col span={8}>
                            <span>{i18n.t('image')}</span>
                        </Col>
                        <Col span={16} className={newService.attachment ? "mb-12" : "mb-8"}>
                            <Upload.Dragger
                                fileList={file ? [file] : []}
                                maxCount={1}
                                multiple={false}
                                onRemove={() => {
                                    setFile(undefined);
                                }}
                                disabled={Boolean(newService.attachment)}
                                beforeUpload={(file) => {
                                    setFile(file);
                                    return false;
                                }}
                            >
                                <Space size={14} align="center" className="m-0">
                                    <p className="upload-hint-label">
                                        {i18n.t('click_or_drag_file_to_this_area_to_upload')}
                                    </p>
                                </Space>
                            </Upload.Dragger>
                            {newService.attachment && <Row className="flex items-center my-2" justify={'space-between'}>
                                <Col className="flex items-center">
                                    <img alt="img" src={FILES_STORE + newService.attachment.url} width={40} height={40} />
                                    <span className="ml-2">{newService.attachment.title}</span>
                                </Col>

                                <Col><DeleteOutlined onClick={() => onDeleteAttachment()} /></Col>
                            </Row>}


                        </Col>
                    </Row>
                </Modal>
                <Table
                    dataSource={localCategory.services}
                    style={{ marginTop: 20 }}
                    rowKey="_id"
                    bordered
                    footer={() => {
                        return (
                            <Button onClick={onOpen}>{i18n.t('new_service')}</Button>
                        )
                    }}
                >
                    <Column title={i18n.t('performance')} dataIndex={"name"} />
                    <Column title={i18n.t('additional_information')} dataIndex={"description"} />
                    <Column title={i18n.t('duration_min')} dataIndex={"duration"} />
                    <Column title={i18n.t('price')} dataIndex={"price"} />
                    <Column title={i18n.t('abbreviation_id')} dataIndex={"abbreviation_id"} />
                    <Column
                        title={i18n.t('action')}
                        key="action"
                        render={(_: any, record: any, index: number) => (
                            <Dropdown
                                menu={{
                                    items: [
                                        {
                                            key: "edit",
                                            label: i18n.t('edit'),
                                            onClick: () => onOpenEdit(index),
                                        },
                                        {
                                            key: "delete",
                                            label: (
                                                <Popconfirm
                                                    title={i18n.t('delete_this_service')}
                                                    description={i18n.t('are_you_sure_you_want_to_delete_this_service')}
                                                    okText={i18n.t('delete_it')}
                                                    cancelText={i18n.t('no')}
                                                    okButtonProps={{
                                                        danger: true,
                                                    }}
                                                    onConfirm={() => onDeleteService(index)}
                                                >
                                                    <span>{i18n.t('delete')}</span>
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
                </Table>
            </div>
        );
    };

    renderAdvancedSettings = () => {
        const { localCategory } = this.state;

        const onAdvancedSettingsChange = (key: string, value: boolean | string) => {
            this.setState({
                localCategory: {
                    ...localCategory,
                    advanced_settings: {
                        ...localCategory.advanced_settings,
                        [key]: value
                    }
                }
            })
        };

        return (
            <div className="w-full">
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>{i18n.t('sort_order')}</span>
                    </Col>
                    <Col span={16}>
                        <Select className="w-full" onChange={(value) => {
                            onAdvancedSettingsChange('sorting_order', value)
                        }} value={localCategory.advanced_settings?.sorting_order}>
                            {[
                                { lable: i18n.t('unsorted'), value: SortDirection.NONE },
                                { lable: i18n.t('ascending'), value: SortDirection.ASC },
                                { lable: i18n.t('descending'), value: SortDirection.DESC },
                            ].map((el) => (
                                <Option key={el.lable} value={el.value}>
                                    {el.lable}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
                <Row className="mb-6" gutter={[16, 16]}>
                    <Col span={8} className="w-full">
                        <span>{i18n.t('show_performance_group_in_summary')}</span>
                    </Col>
                    <Col span={16}>
                        <Switch value={localCategory.advanced_settings?.show_performance_in_summary} onChange={(value) => {
                            onAdvancedSettingsChange('show_performance_in_summary', value)
                        }} />
                    </Col>
                </Row>
                <Row className="mb-6" gutter={[16, 16]}>
                    <Col span={8} className="w-full">
                        <span>{i18n.t('show_service_group_in_e_mail_confirmation_to_appointment_provider')}</span>
                    </Col>
                    <Col span={16}>
                        <Switch value={localCategory.advanced_settings?.show_service_in_email} onChange={(value) => {
                            onAdvancedSettingsChange('show_service_in_email', value)
                        }} />
                    </Col>
                </Row>
                <Row className="mb-6" gutter={[16, 16]}>
                    <Col span={8} className="w-full">
                        <span>{i18n.t('additional_information_Display_type')}</span>
                    </Col>
                    <Col span={16}>
                        <Select onChange={(value) => {
                            onAdvancedSettingsChange('info_display_type', value)
                        }} value={localCategory.advanced_settings?.info_display_type} className="w-full">
                            {[
                                { lable: i18n.t('tooltip'), value: "tooltip" },
                                { lable: i18n.t('text_below_the_service_group_name'), value: "text_below_the_service_group_name" },
                            ].map((el) => (
                                <Option key={el.lable} value={el.value}>
                                    {el.lable}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
                <Row className="mb-6" gutter={[16, 16]}>
                    <Col span={8} className="w-full">
                        <span>{i18n.t('show_performance_group_on')}</span>
                    </Col>
                    <Col span={16}>
                        <Select onChange={(value) => {
                            onAdvancedSettingsChange('show_performance_on', value)
                        }} value={localCategory.advanced_settings?.show_performance_on} className="w-full">
                            {[
                                { lable: i18n.t('page_1'), value: "page_1" },
                                { lable: i18n.t('page_2'), value: "page_2" },
                            ].map((el) => (
                                <Option key={el.lable} value={el.value}>
                                    {el.lable}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
            </div>
        );
    };


    renderGernal = () => {
        const { localCategory } = this.state;

        const onChange = (key: string, value: boolean | string | number) => {
            this.setState({
                localCategory: {
                    ...localCategory,
                    [key]: value
                }
            })
        };

        return (
            <div className="w-full">
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>{i18n.t('name')}</span>
                    </Col>
                    <Col span={16}>
                        <Input
                            onChange={(e) => {
                                onChange('name', e.target.value)
                            }}
                            value={localCategory.name} />
                    </Col>
                </Row>

                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>{i18n.t('category')}</span>
                    </Col>
                    <Col span={16}>
                        <Select onChange={(value) => {
                            onChange('category', value)
                        }}
                            value={localCategory.category} className="w-full">
                            {[
                                { lable: i18n.t('performance_group'), value: "performance_group" },
                                { lable: i18n.t('text_field_free_text_input'), value: "text_field_free_text_input" },
                                { lable: i18n.t('location_select'), value: "location_select" },
                                { lable: i18n.t('selection_number_of_days'), value: "selection_number_of_days" },
                                { lable: i18n.t('selection_number_if_minutes'), value: "selection_number_if_minutes" },
                                { lable: i18n.t('number_search_postcode_customer_number_etc'), value: "number_search_postcode_customer_number_etc" },
                            ].map((el) => (
                                <Option key={el.lable} value={el.value}>
                                    {el.lable}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>{i18n.t('choices')}</span>
                    </Col>
                    <Col span={16}>
                        <Select onChange={(value) => {
                            onChange('choices', value)
                        }}
                            value={localCategory.choices} className="w-full">
                            {[
                                { lable: i18n.t('simple_selection_only_one_entry_can_be_selected'), value: "simple_selection_only_one_entry_can_be_selected" },
                                { lable: i18n.t('multiple_selection_multiple_entries_can_be_selected'), value: "multiple_selection_multiple_entries_can_be_selected" },
                                { lable: i18n.t('selection_list_only_one_entry_can_be_selected'), value: "selection_list_only_one_entry_can_be_selected" },
                            ].map((el) => (
                                <Option key={el.lable} value={el.value}>
                                    {el.lable}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>{i18n.t('selection_is_optional_no_entry_has_to_be_selected')}</span>
                    </Col>
                    <Col span={16}>
                        <Switch onChange={(value) => {
                            onChange('selection_is_optional', value)
                        }}
                            checked={localCategory.selection_is_optional} />
                    </Col>
                </Row>
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>{i18n.t('display_price')}</span>
                    </Col>
                    <Col span={16}>
                        <Switch onChange={(value) => {
                            onChange('show_price', value)
                        }}
                            checked={localCategory.show_price} />
                    </Col>
                </Row>
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>{i18n.t('show_appointment_duration')}</span>
                    </Col>
                    <Col span={16}>
                        <Switch onChange={(value) => {
                            onChange('show_appointment_duration', value)
                        }}
                            checked={localCategory.show_appointment_duration} />
                    </Col>
                </Row>
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>{i18n.t('number_of_columns_in_the_services')}</span>
                    </Col>
                    <Col span={16}>
                        <Select onChange={(value) => {
                            onChange('no_columns_of_services', Number(value))
                        }}
                            value={localCategory.no_columns_of_services} className="w-full">
                            {[
                                "1",
                                "2",
                                "3",
                                "4",
                                "5",
                            ].map((el) => (
                                <Option key={el} value={el}>
                                    {el}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>{i18n.t('full_screen')}</span>
                    </Col>
                    <Col span={16}>
                        <Switch onChange={(value) => {
                            onChange('full_screen', value)
                        }}
                            checked={localCategory.full_screen} />
                    </Col>
                </Row>
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>{i18n.t('service_group_foldable')}</span>
                    </Col>
                    <Col span={16}>
                        <Switch onChange={(value) => {
                            onChange('folded', value)
                        }}
                            checked={localCategory.folded} />
                    </Col>
                </Row>
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>{i18n.t('service_group_can_be_booked_online')}</span>
                    </Col>
                    <Col span={16}>
                        <Switch onChange={(value) => {
                            onChange('online_booking', value)
                        }}
                            checked={localCategory.online_booking} />
                    </Col>
                </Row>
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>{i18n.t('additional_information')}</span>
                    </Col>
                    <Col span={16}>
                        <TextArea onChange={(e) => {
                            onChange('remarks', e.target.value)
                        }}
                            value={localCategory.remarks} />
                    </Col>
                </Row>
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>{i18n.t('id_unique_number')}</span>
                    </Col>
                    <Col span={16}>
                        <Input onChange={(e) => {
                            onChange('unique_id', Number(e.target.value))
                        }}
                            type="number"
                            value={localCategory.unique_id} />
                    </Col>
                </Row>
            </div>
        );
    };

    render() {
        const { updateCategoryLoading, deleteCategoryLoading } = this.props;

        return (
            <div>
                <Row gutter={[16, 16]}>
                    <Content>
                        <Tabs
                            defaultActiveKey="1"
                            items={[
                                {
                                    key: "1",
                                    label: i18n.t('general'),
                                    children: this.renderGernal(),
                                },
                                {
                                    key: "2",
                                    label: i18n.t('services'),
                                    children: this.renderServices(),
                                },
                                {
                                    key: "3",
                                    label: i18n.t('advanced_settings'),
                                    children: this.renderAdvancedSettings(),
                                },
                            ]}
                        />
                    </Content>
                </Row>
                <Row justify={'end'}>
                    <Popconfirm
                        title={i18n.t('delete_this_category')}
                        description={i18n.t('are_you_sure_you_want_to_delete_this_category')}
                        okText={i18n.t('delete_it')}
                        cancelText={i18n.t('no')}
                        okButtonProps={{
                            danger: true,
                        }}
                        onConfirm={this.onDeleteCategory}
                    >
                        <Button loading={deleteCategoryLoading} className="self-end mr-3" type="primary" danger>{i18n.t('delete_category')}</Button>
                    </Popconfirm>
                    <Button onClick={this.onUpdateCategory} loading={updateCategoryLoading} className="self-end" type="primary">{i18n.t('save_changes')}</Button>
                </Row>
            </div>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    categories: selectCategories(state),
    loading: selectCategoriesLoading(state),
    updateCategoryLoading: selectUpdateCategoryLoading(state),
    deleteCategoryLoading: selectDeleteCategoryLoading(state)
});

const mapDispatchToProps = (
    dispatch: ThunkDispatch<RootState, undefined, any>
) => ({
    updateCategoryRequest: (id: string, category: Category) => dispatch(updateCategoryRequest(id, category)),
    deleteCategoryRequest: (id: string) => dispatch(deleteCategoryRequest(id)),
});

// export default compose(
//     withAuthorization,
//   )(connect(mapStateToProps, mapDispatchToProps)(CategoryPage))

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(CategoryPage));
