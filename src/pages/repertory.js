import React, {Component} from 'react';
import {TouchableOpacity, View, Text, StyleSheet} from 'react-native';
import TopBar from '../components/topbar';
import {p2dHeight, p2dWidth} from '../js/utils';
import {store} from '../store/store';
import api from '../js/cloudApi';
import Repertory from '../components/repertory';
import Stock from '../components/stock';

class repertory extends Component {
  constructor() {
    super();
    this.state = {
      tab: 'channel',
      tableData: [],
      drugData: [[1, 2, 3, 4, 5, 6, 7]],
      equipmentGroupInfo: {},
      mobile: '',
      shouldUpdate: '',
      equipmentId: '',
    };
  }

  async componentDidMount() {
    console.debug('go to page 【repertory】', this.props.navigation.history);

    const equipmentId =
      store.getState().equipmentInfo.equipmentProductInfo.equipmentId;

    console.info('repertory page equipmentId------', equipmentId);
    this.setState({equipmentId});
    const equipmentInfo = store.getState().equipmentInfo;
    this.setState({
      equipmentGroupInfo: {
        type: equipmentInfo.equipmentTypeInfo.type,
        groupName: equipmentInfo.equipmentGroupInfo.name,
        name: equipmentInfo.name,
      },
    });

    this.getDrugStock();

    this.getChannel();

    this.shouldUpdate();

    this.didFocus = this.props.navigation.addListener('didFocus', (payload) => {
      let lastState = payload.lastState.routeName;
      if (lastState === 'repertory') {
        this.getChannel();
      }
    });
  }

  switchTab(tab) {
    this.setState({
      tab,
    });
  }

  // componentDidUpdate(prevProps) {
  //   if (this.props.needUpdated === true) {
  //     console.info(
  //       '==================first--------------',
  //       this.props.needUpdated,
  //     );
  //     this.getChannel();
  //   }
  // }

  async getDrugStock() {
    const equipmentId =
      store.getState().equipmentInfo.equipmentProductInfo.equipmentId;

    let drugStock = await api.getEProductStocks({equipmentId});
    let secondNo = 1;
    let formattedDrugStock = [];

    drugStock.equipmentProductStockList.forEach((stock) => {
      let temp = [];
      temp.push(secondNo + ',' + stock.productId);
      temp.push(stock.no);
      temp.push(stock.productName);
      temp.push(stock.realStock);
      temp.push(stock.upperLimit);
      temp.push(stock.lockStock);
      temp.push('查看');
      formattedDrugStock.push(temp);
      secondNo++;
    });
    this.setState({drugData: formattedDrugStock});
  }

  async getChannel() {
    const equipmentId =
      store.getState().equipmentInfo.equipmentProductInfo.equipmentId;
    let channel = await api.getEDrugStocks(equipmentId);

    let formattedDrugList = [];
    let no = 1;

    console.info('-----channel-----', channel.slotProductListInfo);

    channel.slotProductListInfo.forEach((drug) => {
      let temp = [];
      temp.push(no);
      temp.push(drug.slotNo);
      if (drug.type === null) {
        temp.push('无');
      } else {
        temp.push(drug.type === 1 ? '格子柜' : '推板');
      }
      temp.push(drug.productName === null ? '无' : drug.productName);
      temp.push(drug.realStock);
      temp.push(drug.upperLimit);
      temp.push(drug.lockStock);
      temp.push(drug.batchNumber === null ? '无' : drug.batchNumber);
      temp.push(drug.productId);
      temp.push('management');
      formattedDrugList.push(temp);
      no++;
    });
    this.setState({tableData: formattedDrugList});
    console.info('-------------repertory page------------', formattedDrugList);
  }

  async shouldUpdate() {
    this.timer = setInterval(async () => {
      if (['repertory', 'replenishment'].includes(this.state.shouldUpdate)) {
        this.getChannel();
        this.setState({shouldUpdate: ''});
        console.info('updated repertory');
      }
    }, 3000);
  }

  async secondDetail(rowData) {
    let drugStock = await api.getEProductStocks({equipmentId});
    let productId = '';
    let drug = drugStock.equipmentProductStockList.find((drug) => {
      if (drug.no === rowData[1]) {
        return drug;
      }
    });
    productId = drug.productId;
    let action = updateProductId(productId);
    store.dispatch(action);
    this.props.navigation.navigate('drugDetail');
  }

  componentWillUnmount() {
    console.debug('will leave [repertory]');
    this.didFocus.remove();
    clearInterval(this.timer);
  }

  render() {
    const state = this.state;

    return (
      <View
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
        }}>
        <TopBar
          hideBack={false}
          pageName="库存详情"
          navigation={this.props.navigation}
          disableAdminExit={false}
          disableCount={true}
        />
        <View
          style={{
            position: 'absolute',
            left: p2dWidth(200),
            top: p2dHeight(400),
            height: p2dHeight(40),
            width: p2dWidth(200),
          }}>
          <Text>{this.state.mobile}</Text>
        </View>
        <View
          style={{
            // borderColor: 'green',
            // borderWidth: 1,
            height: p2dHeight(60),
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginTop: p2dHeight(50),
          }}>
          <View>
            <Text
              style={{
                fontSize: p2dWidth(30),
                marginLeft: p2dWidth(10),
                fontWeight: 'bold',
              }}>
              | 设备信息
            </Text>
          </View>
          <View>
            <Text style={{fontSize: p2dWidth(25), marginLeft: p2dWidth(20)}}>
              设备型号:{this.state.equipmentGroupInfo.type}
            </Text>
          </View>
          {/* <Text></Text> */}
          <View>
            <Text style={{fontSize: p2dWidth(25), marginLeft: p2dWidth(20)}}>
              设备群组:{this.state.equipmentGroupInfo.groupName}
            </Text>
          </View>
          <View>
            <Text style={{fontSize: p2dWidth(25), marginLeft: p2dWidth(20)}}>
              设备名称:{this.state.equipmentGroupInfo.name}
            </Text>
          </View>
        </View>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            // borderColor: 'red',
            // borderWidth: 3,
            marginTop: p2dHeight(50),
            justifyContent: 'center',
          }}>
          <TouchableOpacity
            style={{
              borderColor: 'rgba(206,208,209,0.7)',
              borderWidth: p2dWidth(2),
              borderStyle: 'solid',
              width: p2dWidth(400),
              height: p2dHeight(80),
              backgroundColor:
                this.state.tab === 'channel' ? 'rgba(0,191,206,0.7)' : '#fff',
            }}
            onPress={() => {
              this.switchTab('channel');
            }}>
            <Text
              style={{
                textAlign: 'center',
                fontSize: p2dWidth(36),
                lineHeight: p2dHeight(80),
                color:
                  this.state.tab === 'channel'
                    ? '#FFFFFF'
                    : 'rgba(0,191,206,0.7)',
              }}>
              货道库存
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              borderColor: 'rgba(206,208,209,0.7)',
              borderWidth: p2dWidth(2),
              borderStyle: 'solid',
              width: p2dWidth(400),
              height: p2dHeight(80),
              backgroundColor:
                this.state.tab === 'drug' ? 'rgba(0,191,206,0.7)' : '#fff',
            }}
            onPress={() => {
              this.getDrugStock();
              this.switchTab('drug');
            }}>
            <Text
              style={{
                textAlign: 'center',
                fontSize: p2dWidth(36),
                lineHeight: p2dHeight(80),
                color:
                  this.state.tab === 'drug' ? '#FFFFFF' : 'rgba(0,191,206,0.7)',
              }}>
              商品库存
            </Text>
          </TouchableOpacity>
        </View>

        {this.state.tab !== 'channel' ? (
          <Stock
            navigation={this.props.navigation}
            drugData={this.state.drugData}></Stock>
        ) : (
          <Repertory
            navigation={this.props.navigation}
            shouldUpdate={(v) => this.setState({shouldUpdate: v})}
            tableData={this.state.tableData}></Repertory>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  cell: {fontSize: p2dWidth(20), textAlign: 'center'},
  container: {flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff'},
  head: {},
  row: {flexDirection: 'row', backgroundColor: '#FFF1C1'},
  btn: {
    width: p2dWidth(40),
    height: 18,
    backgroundColor: '#78B7BB',
    borderRadius: 2,
  },
  btnText: {
    textAlign: 'center',
    color: '#fff',
    width: p2dWidth(40),
    fontSize: p2dWidth(20),
  },
});

export default repertory;
