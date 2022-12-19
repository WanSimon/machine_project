import React, {Component} from 'react';
import {Text, View, ScrollView, TouchableOpacity} from 'react-native';

import {p2dWidth, p2dHeight} from '../js/utils';
import {Table, Row, TableWrapper, Cell} from 'react-native-table-component';
import api from '../js/cloudApi';
import {store} from '../store/store';
import {updateProductId} from '../action';
import {drugWidthArr, drugHead} from '../js/common';

class Stock extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  async secondDetail(rowData) {
    let productId = rowData[0].split(',')[1];

    console.info('-----drug-----', productId);

    let action = updateProductId(productId);
    store.dispatch(action);
    this.props.navigation.navigate('drugDetail');
  }

  render() {
    const secondDetail = (rowData, index) => (
      <TouchableOpacity
        style={{width: '100%'}}
        onPress={() => this.secondDetail(rowData)}>
        <Text
          style={{
            fontSize: p2dWidth(30),
            color: $conf.theme,
            textAlign: 'center',
          }}>
          查看
        </Text>
      </TouchableOpacity>
    );
    return (
      <View
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          marginTop: p2dHeight(50),
          height: p2dHeight(800),
          marginLeft: p2dWidth(10),
        }}>
        <ScrollView>
          <Table
            borderStyle={{
              borderColor: '#C1C1C1',
              borderWidth: p2dWidth(2),
            }}>
            <Row
              data={drugHead}
              height={p2dHeight(60)}
              widthArr={drugWidthArr}
              textStyle={{
                fontSize: p2dWidth(30),
                width: '100%',
                textAlign: 'center',
              }}></Row>

            {this.props.drugData.map((rowData, index) => (
              <TableWrapper
                key={index}
                style={{
                  flexDirection: 'row',
                }}>
                {rowData.map((cellData, cellIndex) => {
                  if ([1, 3, 4, 5].includes(cellIndex)) {
                    return (
                      <Cell
                        key={cellIndex}
                        data={cellData}
                        height={p2dHeight(60)}
                        textStyle={{
                          fontSize: p2dWidth(30),
                          textAlign: 'center',
                        }}
                        width={p2dWidth(150)}></Cell>
                    );
                  }
                  if (cellIndex === 0) {
                    return (
                      <Cell
                        key={cellIndex}
                        data={cellData.split(',')[0]}
                        height={p2dHeight(60)}
                        textStyle={{
                          fontSize: p2dWidth(30),
                          textAlign: 'center',
                        }}
                        width={p2dWidth(80)}></Cell>
                    );
                  }
                  if (cellIndex === 2) {
                    return (
                      <Cell
                        key={cellIndex}
                        data={cellData}
                        height={p2dHeight(60)}
                        textStyle={{
                          fontSize: p2dWidth(30),
                          textAlign: 'center',
                        }}
                        width={p2dWidth(300)}></Cell>
                    );
                  }

                  if (cellIndex === 6) {
                    return (
                      <Cell
                        key={cellIndex}
                        data={secondDetail(rowData, index)}
                        height={p2dHeight(60)}
                        textStyle={{
                          fontSize: p2dWidth(30),
                          textAlign: 'center',
                        }}
                        width={p2dWidth(80)}></Cell>
                    );
                  }
                })}
              </TableWrapper>
            ))}
          </Table>
        </ScrollView>
      </View>
    );
  }
}

export default Stock;
