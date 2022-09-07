import React, { Component } from 'react';
import { Text, View, Image, TextInput, TouchableOpacity } from 'react-native';

import {p2dWidth} from '../js/utils'

class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText:''
    }
  }
  render() {
    return (
      <View style={{
        margin:p2dWidth(20),
        width:p2dWidth(1040),
        height:p2dWidth(80),
        borderWidth:p2dWidth(4),
        borderColor:$conf.theme,
        borderRadius:p2dWidth(40),
        position:'relative'
      }}>
        <Image
          style={{
            position:'absolute',
            left:p2dWidth(20),
            top:p2dWidth(13),
            width:p2dWidth(50),
            height:p2dWidth(50)
          }}
          source={require('../assets/search.png')}
        />
        <TextInput
          placeholder="请输入您要查找的药品名"
          style={{
            position:'absolute',
            top:p2dWidth(-12),
            left:p2dWidth(80),
            height:p2dWidth(100),
            width:p2dWidth(800),
            fontSize:p2dWidth(28),
          }}
          onChangeText = {(text)=>{
            this.setState({searchText:text});
          }}/>
        <TouchableOpacity
          style={{
            position:'absolute',
            top:p2dWidth(-4),
            right:0,
            width:p2dWidth(150),
            height:p2dWidth(80),
            backgroundColor:$conf.theme,
            borderBottomRightRadius:p2dWidth(40),
            borderTopRightRadius:p2dWidth(40),
            display: 'flex',
            justifyContent:'center',
            alignItems:'center'
          }}
          onPress={()=>this.props.search(this.state.searchText)}
        >
           <Text style={{
             fontSize:p2dWidth(32),
             fontWeight:'bold',
             color:"#fff"
           }}
           >查询</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

export default Search;
