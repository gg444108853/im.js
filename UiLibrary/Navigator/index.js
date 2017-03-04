/**
 * <plusmancn@gmail.com> created at 2017
 *
 * Copyright (c) 2017 plusmancn, all rights
 * reserved.
 *
 * @flow
 *
 * 基于 NavigationExperimental 的封装
 */

import React, { Component, PropTypes} from 'react';
import {
    StyleSheet,
    BackAndroid,
    NavigationExperimental
} from 'react-native';

const {
    Header: NavigationHeader,
    CardStack: NavigationCardStack,
    StateUtils: NavigationStateUtils
} = NavigationExperimental;

import StaticContainer from './StaticContainer.js';

class Navigator extends Component {
    state: Object;
    _compoentStack: Array<Object>;
    _renderLeftComponentStack: Array<Function>;

    static propTypes = {
        initialComponent: PropTypes.func.isRequired,
        hackBackAndroid: PropTypes.bool,
        style: PropTypes.object
    };

    static defaultProps = {
        hackBackAndroid: true
    };

    constructor(props: Object) {
        super(props);
        // 导航栈
        this.state = {
            stack: {
                index: 0,
                routes: [
                    {
                        key: '0',
                        title: props.initialComponent.NavigationTitle || ''
                    }
                ]
            }
        };

        // 组件栈
        this._compoentStack = [
            props.initialComponent
        ];

        // Header-RenderLeftComponentStack
        this._renderLeftComponentStack = [
            () => {null;}
        ];
    }

    // 外部开放方法，设置当前 title
    setNavigationTitle = (title: String) => {
        let stack = this.state.stack;

        stack.routes[stack.index].title = title;
        this.setState({
            stack: stack
        });
    }

    // 设置右方组件
    setRenderLeftCompoent = (renderLeftComponent: Function) => {
        let stack = this.state.stack;
        this._renderLeftComponentStack[stack.index] = renderLeftComponent;
    }

    // 进行组件之间通讯
    componentWillMount() {
        // android 回退事件处理
        if (this.props.hackBackAndroid) {
            BackAndroid.addEventListener('hardwareBackPress', this._handleBack);
        }
    }

    componentWillUnmount() {
        // 取消事件监听
        if (this.props.hackBackAndroid) {
            BackAndroid.removeEventListener('hardwareBackPress', this._handleBack);
        }
    }

    push = (compoent: Object, renderLeftComponent: Function = () => {null;}) => {
        this._compoentStack.push(compoent);
        this._renderLeftComponentStack.push(renderLeftComponent);
        let newStack = NavigationStateUtils.push(this.state.stack, {
            key: String(this.state.stack.index + 1),
            title: compoent.NavigationTitle || ''
        });

        this.setState({
            stack: newStack
        });
    }

    pop = () => {
        this._compoentStack.pop();
        this._renderLeftComponentStack.pop();
        let newStack = NavigationStateUtils.pop(this.state.stack);

        this.setState({
            stack: newStack
        });
    }

    // 内部方法
    _handleBack = () => {
        if (this.state.stack.index > 0) {
            this._onNavigateBack();
            return true;
        }

        return false;
    }

    _renderLeftComponent = (sceneProps) => {
        let { scene } = sceneProps;

        // 已经出栈则不进行渲染
        if (scene.index >= this._renderLeftComponentStack.length ) {
            return null;
        }

        return (this._renderLeftComponentStack[scene.index])(sceneProps);
    }

    // 头部渲染
    _renderScene = (sceneProps) => {
        let { scene } = sceneProps;

        // 已经出栈则不进行渲染
        if (scene.index >= this._compoentStack.length ) {
            return null;
        }

        let RenderCompoent = this._compoentStack[scene.index];
        return (
            <StaticContainer
                isActive={scene.isActive}
            >
                <RenderCompoent
                    navigator={this}
                />
            </StaticContainer>
        );
    }

    _onNavigateBack = () => {
        this.pop();
    }

    _renderHeader = (sceneProps) => {
        let { style } = this.props;
        return (
            <NavigationHeader
                {...sceneProps}
                onNavigateBack={this._onNavigateBack}
                renderRightComponent={this._renderLeftComponent}
                style={[styles.navigationHeader, style]}
            />
        );
    }

    render() {
        return (
            <NavigationCardStack
                onNavigateBack={this._onNavigateBack}
                renderHeader={this._renderHeader}
                navigationState={this.state.stack}
                renderScene={this._renderScene}
            />
        );
    }
}

const styles = StyleSheet.create({
    navigationHeader: {
        backgroundColor: '#EFEFF2',
        elevation: 0,
        borderBottomWidth: StyleSheet.hairlineWidth
    }
});

export default Navigator;