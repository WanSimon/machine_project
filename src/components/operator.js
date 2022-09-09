import React, {Component} from 'react';
import {
  BackHandler,
  Modal,
  StyleSheet,
  Alert,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  Image,
} from 'react-native';
import {p2dWidth} from '../js/utils';

class Operator extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modalVisible: false,
      txtValue: '',
      opacityValue: new Animated.Value(0),
    };
  }
  showError() {
    Animated.sequence([
      Animated.timing(this.state.opacityValue, {
        toValue: 1,
        duration: 500,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(this.state.opacityValue, {
        toValue: 0,
        duration: 2500,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
  }
  showModal() {
    this.setState({
      modalVisible: true,
    });
  }
  confirm() {
    if (this.state.txtValue === '115599') {
      if (this.props.callback) {
        this.props.callback();
      } else {
        BackHandler.exitApp();
      }
    } else {
      //Alert.alert('提示', '密码错误');
      this.showError();
    }
  }
  cancel() {
    this.setState({
      modalVisible: false,
    });
  }
  render() {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={this.state.modalVisible}>
        <View style={customStyle.modalContainer}>
          <View style={customStyle.modalContent}>
            <View style={customStyle.modalForm}>
              <Text style={customStyle.label}>请输入维护密码</Text>
              <TextInput
                returnKeyType="go"
                secureTextEntry={true}
                password={true}
                placeholder="请输入维护密码"
                keyboardType="number-pad"
                onChangeText={(text) => {
                  this.setState({txtValue: text});
                }}
                style={customStyle.textInputStyle}
              />
              <Animated.View
                style={{
                  width: '100%',
                  marginTop: 10,
                  opacity: this.state.opacityValue,
                }}>
                <Text style={{color: '#FF0000'}}>请输入正确的维护密码</Text>
              </Animated.View>
            </View>
            <View style={customStyle.actionContent}>
              <TouchableOpacity
                style={customStyle.button}
                onPress={() => this.cancel()}>
                <Text style={customStyle.buttonLabel}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={customStyle.button}
                onPress={() => this.confirm()}>
                <Text style={customStyle.buttonLabel}>确定</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

const customStyle = StyleSheet.create({
  modalContainer: {
    position: 'relative',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: '100%',
    height: '100%',
  },
  modalContent: {
    position: 'absolute',
    left: '25%',
    right: '25%',
    top: '40%',
    backgroundColor: 'white',
    maxWidth: p2dWidth(800),
    marginRight: 'auto',
    marginLeft: 'auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 8,
  },
  modalForm: {
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
  },
  textInputStyle: {
    width: '100%',
    marginTop: 20,
    borderColor: '#909399',
    borderWidth: 1,
    borderStyle: 'solid',
    textAlign: 'left',
    fontSize: 14,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 8,
  },
  actionContent: {
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 20,
  },
  button: {
    width: '40%',
    backgroundColor: '#3CA6FF',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    paddingTop: 10,
    paddingBottom: 10,
  },
  buttonLabel: {
    color: '#FFFFFF',
    letterSpacing: 10,
  },
});

export default Operator;
