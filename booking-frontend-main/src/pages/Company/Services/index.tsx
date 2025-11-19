import React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import { fetchCategories, createCategoryRequest } from "../../../redux/actions";
import { selectCategories, selectCategoriesLoading } from "../../../redux/selectors";
import { Category as CategoryType, DisplayStatus, SortDirection } from "../../../Schema";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { Button, Collapse, Popconfirm, message } from "antd";
import "react-big-calendar/lib/css/react-big-calendar.css";
import withAuthorization from "../../../HOC/withAuthorization";
import './index.css'
import Category from './category';
import { withTranslation } from 'react-i18next';
import i18n from "../../../locales/i18n";


interface ICalendarState {
    editingTitle: number | null;
    activeKey: string[]
}

interface ICalendarProps {
    loading: boolean;
    fetchCategories: () => Promise<any>;
    createCategoryRequest: (category: CategoryType) => Promise<any>;
    categories: CategoryType[];
}

class ServicesPage extends React.Component<ICalendarProps, ICalendarState> {
    constructor(props: ICalendarProps) {
        super(props);
        this.state = {
            editingTitle: null,
            activeKey: ["0"]
        };
    }

    componentDidMount() {
        this.props.fetchCategories();
    }

    getHeader = (category: CategoryType, index: number) => (
        <span className="font-bold text-lg">{category.name}</span>
    );

    onChangeActiveKey = (key: string | string[]) => {
        if (typeof key === 'string') {
            this.setState({ activeKey: [key] })
        } else {
            this.setState({ activeKey: key })
        }

    }

    onCreateCategory = () => {
        const newCategory: CategoryType = {
            name: i18n.t('new_category'),
            category: i18n.t('performance_group'),
            choices: i18n.t('simple_selection_only_one_entry_can_be_selected'),
            selection_is_optional: false,
            show_price: false,
            show_appointment_duration: false,
            no_columns_of_services: 3,
            full_screen: false,
            folded: false,
            online_booking: false,
            remarks: "",
            unique_id: Math.floor(1000 + Math.random() * 9000),
            display_status: DisplayStatus.SHOW,
            advanced_settings: {
                sorting_order: SortDirection.NONE,
            },
            services: []
        };
        this.props.createCategoryRequest(newCategory).then(data => {
            if (data._id) {
                message.success(i18n.t('successfully_created_the_category'));
                this.setState({ activeKey: [`${this.props.categories.length - 1}`] })
            } else {
                message.error(i18n.t('something_went_wrong_please_try_again'));
            }
        })
    }


    render() {
        const { loading, categories } = this.props;
        const { activeKey } = this.state;

        if (loading) {
            return <div>{i18n.t('loading')}...</div>;
        }

        return (
            <div className="w-full">
                <Popconfirm
                    title={i18n.t('create_new_category')}
                    description={i18n.t('are_you_sure_you_want_to_create_new_category')}
                    okText={i18n.t('create_it')}
                    cancelText={i18n.t('no')}
                    onConfirm={this.onCreateCategory}
                >
                    <Button loading={false} className="mb-3" type="primary">{i18n.t('new_category')}</Button>
                </Popconfirm>
                <Collapse 
                    accordion 
                    activeKey={activeKey} 
                    onChange={this.onChangeActiveKey} 
                    defaultActiveKey={["0"]}
                    items={categories.map((el, index) => ({
                        key: `${index}`,
                        label: this.getHeader(el, index),
                        children: <Category category={el} index={index} />
                    }))}
                />
            </div>
        );
    }
}


const mapStateToProps = (state: RootState) => ({
    categories: selectCategories(state),
    loading: selectCategoriesLoading(state),
});

const mapDispatchToProps = (
    dispatch: ThunkDispatch<RootState, undefined, any>
) => ({
    fetchCategories: () => dispatch(fetchCategories()),
    createCategoryRequest: (category: CategoryType) => dispatch(createCategoryRequest(category)),
});


export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(withAuthorization(ServicesPage)))
