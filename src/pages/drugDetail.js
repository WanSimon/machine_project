import React, {Component} from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import TopBar from '../components/topbar';
import {p2dWidth, p2dHeight} from '../js/utils';
import {store} from '../store/store';
import api from '../js/cloudApi';
class maintain extends Component {
  constructor(props) {
    super(props);

    this.state = {
      drugDetail: {},
    };
  }

  async componentDidMount() {
    console.debug('go to [drugDetail]');
    const productId = store.getState().productId;
    let drugDetail = await api.getProductInfo(productId);
    console.info('----drugDetail------', productId, drugDetail);
    if (drugDetail.productInfo) {
      this.setState({drugDetail: drugDetail.productInfo});
    }
  }

  render() {
    const {drugDetail} = this.state;
    return (
      <View style={{height: '100%', display: 'flex', width: '100%'}}>
        <TopBar
          hideBack={false}
          disableCount={true}
          disableAdminExit={false}
          pageName="药品详情"
          navigation={this.props.navigation}></TopBar>

        <View style={{marginTop: p2dHeight(40), marginLeft: p2dWidth(40)}}>
          <Text style={{fontSize: p2dWidth(50)}}>| 药品详情</Text>
        </View>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            // borderWidth: p2dWidth(4),
            // borderColor: 'green',
            height: '20%',
            justifyContent: 'flex-start',
            width: '100%',
          }}>
          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              // borderWidth: p2dWidth(4),
              // borderColor: 'red',
              height: '100%',
              justifyContent: 'space-around',
              width: '45%',
              marginLeft: '5%',
            }}>
            <View>
              <Text style={{fontSize: p2dWidth(30)}}>
                产品编号:{drugDetail.productNo ? drugDetail.productNo : '无'}
              </Text>
            </View>
            <View>
              <Text style={{fontSize: p2dWidth(30)}}>
                产品分类:
                {drugDetail.productCategoryName
                  ? drugDetail.productCategoryName
                  : '无'}
              </Text>
            </View>
            <View>
              <Text style={{fontSize: p2dWidth(30)}}>
                截止日期:
                {drugDetail.expirationDate ? drugDetail.expirationDate : '无'}
              </Text>
            </View>
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              // borderWidth: p2dWidth(4),
              // borderColor: 'red',
              height: '100%',
              justifyContent: 'space-around',
              width: '50%',
            }}>
            <View>
              <Text style={{fontSize: p2dWidth(30)}}>
                产品名称:{drugDetail.name ? drugDetail.name : '无'}
              </Text>
            </View>

            <View>
              <Text style={{fontSize: p2dWidth(30)}}>
                产品别名:{drugDetail.alias ? drugDetail.alias : '无'}
              </Text>
            </View>
            <View>
              <Text style={{fontSize: p2dWidth(30)}}>
                国际条码:{drugDetail.barCode ? drugDetail.barCode : '无'}
              </Text>
            </View>
            <View>
              <Text style={{fontSize: p2dWidth(30)}}>
                规格:
                {drugDetail.specification ? drugDetail.specification : '无'}
              </Text>
            </View>
          </View>
        </View>

        <View style={{marginTop: p2dHeight(40), marginLeft: p2dWidth(40)}}>
          <Text style={{fontSize: p2dWidth(50)}}>| 产品详情</Text>
        </View>
        <View style={{display: 'flex', height: '40%'}}>
          <View>
            <View style={{marginTop: p2dHeight(40)}}>
              <Text style={{fontSize: p2dWidth(35), marginLeft: p2dWidth(60)}}>
                产品图
              </Text>
            </View>
            <View
              style={{
                marginTop: p2dHeight(40),
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-around',
              }}>
              <View style={{width: p2dWidth(200), height: p2dWidth(200)}}>
                <Image
                  style={{width: '100%', height: '100%'}}
                  source={{
                    uri: $conf.resource_oss + drugDetail.homeThumbUrl,
                  }}></Image>
              </View>
              <View style={{width: p2dWidth(200), height: p2dHeight(200)}}>
                <Image
                  source={{uri: $conf.resource_oss + drugDetail.frontImageUrl}}
                  style={{width: '100%', height: '100%'}}></Image>
              </View>
              <View style={{width: p2dWidth(200), height: p2dHeight(200)}}>
                <Image
                  source={{uri: $conf.resource_oss + drugDetail.backImageUrl}}
                  style={{width: '100%', height: '100%'}}></Image>
              </View>
            </View>
          </View>
          {/* <View style={{display: 'flex', flexDirection: 'row'}}>
            <View style={{flex: 1}}>
              <Text style={{fontSize: p2dWidth(35), marginLeft: p2dWidth(60)}}>
                产品详情
              </Text>
            </View>
            <View style={{flex: 3}}>
              <Text>{drugDetail.productDetail}</Text>
            </View>
          </View> */}
        </View>
      </View>
    );
  }
}

export default maintain;
