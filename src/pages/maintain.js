import React, {Component} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import TopBar from '../components/topbar';
import {p2dWidth, p2dHeight} from '../js/utils';

class maintain extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <View
        style={{
          display: 'flex',
          alignItems: 'center',
        }}>
        <TopBar
          //   count={this.state.count}
          // count={150}
          pageName="维护模式"
          hideBack={false}
          disableCount={true}
          disableAdminExit={false}
          navigation={this.props.navigation}
        />
        <View
          style={{
            width: p2dWidth(500),
            height: p2dHeight(200),
            borderColor: $conf.theme,
            borderWidth: p2dWidth(2),
            borderRadius: p2dWidth(10),
            marginTop: p2dHeight(120),
          }}>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate('setting')}>
            <Text
              style={{
                textAlign: 'center',
                lineHeight: p2dHeight(200),
                color: $conf.theme,
                fontSize: p2dWidth(50),
                fontWeight: 'bold',
              }}>
              设备测试
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            width: p2dWidth(500),
            height: p2dHeight(200),
            borderColor: $conf.theme,
            borderWidth: p2dWidth(2),
            borderRadius: p2dWidth(10),
            marginTop: p2dHeight(120),
          }}>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate('repertory')}>
            <Text
              style={{
                textAlign: 'center',
                lineHeight: p2dHeight(200),
                color: $conf.theme,
                fontSize: p2dWidth(50),
                fontWeight: 'bold',
              }}>
              查看库存
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            width: p2dWidth(500),
            height: p2dHeight(200),
            borderColor: $conf.theme,
            borderWidth: p2dWidth(2),
            borderRadius: p2dWidth(10),
            marginTop: p2dHeight(120),
          }}>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate('channel')}>
            <Text
              style={{
                textAlign: 'center',
                lineHeight: p2dHeight(200),
                color: $conf.theme,
                fontSize: p2dWidth(50),
                fontWeight: 'bold',
              }}>
              查看货道
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

export default maintain;
