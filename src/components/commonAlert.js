import React, {Component} from 'react';
import {Text, View, Image, ScrollView, TouchableOpacity} from 'react-native';
import {p2dHeight, p2dWidth, parseCent} from '../js/utils';

import AwesomeAlert from 'react-native-awesome-alerts';

/*
  @author @WanSimon
  @props @showAlert title confirmText navigation
  @description 公共的弹框组件
*/
class CommonAlert extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showAlert: false,
    };
  }
  componentDidMount() {
    if (this.props.showAlert) {
      this.setState({
        showAlert: true,
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.showAlert !== this.props.showAlert) {
      this.setState({
        showAlert: this.props.showAlert,
      });
    }
  }

  showAlert() {
    this.setState({
      showAlert: true,
    });
  }

  hideAlert() {
    if (this.props.setAlert) {
      this.props.setAlert(false);
    }
    this.setState({
      showAlert: false,
    });
    if (this.props.navigate) {
      this.props.navigate();
    }
  }

  render() {
    const {showAlert} = this.state;
    return (
      <AwesomeAlert
        show={showAlert}
        showProgress={false}
        title={this.props.title}
        // message="I have a message for you!"
        closeOnTouchOutside={true}
        closeOnHardwareBackPress={false}
        showCancelButton={false}
        showConfirmButton={true}
        // cancelText="No, cancel"
        confirmText={this.props.confirmText || '确定'}
        confirmButtonColor="#DD6B55"
        titleStyle={{
          fontSize: p2dWidth(35),
          // borderWidth: 2,
          // borderColor: 'yellow',
          textAlign: 'center',
          // marginTop: p2dHeight(50),
          marginTop: p2dHeight(20),
          height: p2dHeight(100),
          // lineHeight: p2dHeight(400),
        }}
        // alertContainerStyle={{//最大的
        //   backgroundColor: 'red',
        //   color: 'black',
        //   borderColor: 'black',
        //   borderWidth: 2,
        // }}
        overlayStyle={{
          //灰影
          height: '100%',
        }}
        confirmButtonTextStyle={{
          fontSize: p2dWidth(30),
          color: 'white',
          lineHeight: p2dHeight(55),
          textAlign: 'center',
        }}
        confirmButtonStyle={{
          backgroundColor: $conf.theme,
          width: p2dWidth(120),
          height: p2dHeight(60),
          marginTop: p2dHeight(50),
        }}
        contentContainerStyle={{
          // borderColor: 'red',
          // borderWidth: 2,
          marginTop: -p2dHeight(300),
          width: p2dWidth(500),
          height: p2dHeight(300),
        }}
        onConfirmPressed={() => {
          this.hideAlert();
        }}
      />
    );
  }
}

export default CommonAlert;
