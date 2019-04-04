import React, {Component} from 'react';
import {StyleSheet,Image, Text, View ,TextInput , Button} from 'react-native';
import {Dimensions} from 'react-native';
import {BoxShadow} from 'react-native-shadow'
import UserService from './service/UserService'
import UserDataModel from './viewModel/UserDataModel'
import apiHelper from './common/apiHelper'
import { TouchableOpacity } from 'react-native-gesture-handler';
import { white } from 'ansi-colors';
global.btnStyleFlag = false  //控制按钮的样式
global.deviceWidth = Dimensions.get('window').width
global.deviceHeight = Dimensions.get('window').height
export default class HomePage extends Component{
    constructor(props)
    {
      super(props);
      this.state = {
        Username : "",
        Password : "",
      }
    }
   
    static navigationOptions = {
      header : null,
      title : '首页',
    };
    //根据输入的内容处理按钮样式
    HandleBtnStyle(){
      if(this.state.Username != ""&&this.state.Password != ""){
        this.btnStyleFlag = true
      }else{
        this.btnStyleFlag = false
      }
      return this.btnStyleFlag ? styles.LoginBtnContainer : ''
    }

     //点击登陆页面确定按钮接收api数据，处理用户操作
    async _PressLoginButton(){
      if(this.state.Username != ""&&this.state.Password != ""){
        let User = {
          'u_name':this.state.Username,
          'u_password':this.state.Password
        }
        await UserService.loadUser(User)    //给API发送登陆用户的请求(即根据输入的账号密码加载用户信息的请求)
        var API = apiHelper.getAPI()       //获得API的返回值（包含status,msg,result）
        if(API.status == 200){
          if (API.result_kind == "User"){      
            this.props.navigation.navigate('MainPage',{            //登录成功跳转至首页
              userInfo:UserDataModel.addUser(API.reuslt.User)       //将用户信息传至首页
            })
          } 
          else{                              //输入的用户名或密码错误
            alert(API.reuslt.msg)
          }
        }
        else if (API.status == 404){
          alert(API.reuslt.msg)
          //跳转错误页面
        }
        else if (API.status == 500){
          alert(API.reuslt.msg)
          //跳转错误页面
        }     
      }
      else{
           alert("请填写完整的信息！")
        }
      }


    // 点击注册按钮后清除页面的数据
     _PressRegisterButton(){
      this.refs["UsernameInput"].clear()
      this.refs["PasswordInput"].clear()
      this.setState({
        Username:"",
        Password:""
      })
      this.props.navigation.navigate('RegisterPage')
    }
    render(){
      const shadowConfig  = {
        width:(deviceWidth)- 20 - 20,
        height:45,
        color:'#FF8C00',
        border:1,
        radius:25,
        opacity:1,
        x:0,
        y:0,
      }
      return (
        <View style={styles.HomePageContainer}>
            <View style ={styles.titleContainer}>
              <Image source={require('./images/Title_icon.jpeg')} style={styles.imgs} />
            </View>
            <View style={styles.loginContainer}>
              <View style = {styles.UsernameAndPasswordContainer}>
                  <TextInput ref="UsernameInput" style = {styles.Input} 
                    placeholder="请输入用户名"
                    clearButtonMode = "while-editing"
                    onChangeText={(text) => {
                    this.setState({
                      Username:text
                    })
                  }}
                  />
              </View>
              <View style = {styles.UsernameAndPasswordContainer}>
                  <TextInput ref="PasswordInput"style = {styles.Input} 
                      placeholder="请输入密码"
                      secureTextEntry={true}
                      clearButtonMode = "while-editing"
                      onChangeText={(text) => {
                      this.setState({
                        Password:text
                      })
                    }}
                  />
              </View>
                    <TouchableOpacity 
                        opacity = {0.2} 
                        onPress={()=>{
                          this._PressLoginButton()
                    }}
                    >
                      <View style = {[styles.TransparentLoginBtnContainer,this.HandleBtnStyle()]}>
                        <Text style = {{fontSize:16,color:'white'}}>登陆</Text>
                      </View>
                    </TouchableOpacity>

                   <TouchableOpacity 
                        opacity = {0.2} 
                        onPress={() => {
                          this._PressRegisterButton()
                      }}
                    >
                      <View style={styles.registerContainer}>
                        <Text style = {{fontSize:16,color:'#cccccc'}}>新用户注册</Text>
                      </View>
                    </TouchableOpacity>
            </View>
        </View>
      )
    }
}

const styles = StyleSheet.create({
  HomePageContainer: {
    flex:1,
  },
  titleContainer: {
    marginTop: 80,
    flexDirection:'column',
    justifyContent: 'center',
    alignItems:'center',
    height: 120
  },
  imgs: {
    width:90,
    height:100
  },
  loginContainer: {
    flexDirection:'column',
    height : 320,
    paddingTop : 10,
    paddingLeft : 20,
    paddingRight : 20
  },
  UsernameAndPasswordContainer: {
    flexDirection:'column',
    justifyContent:'center',
    height : 60,
  }, 
  Input:{
    height : 40,
    borderBottomColor: '#666666',
    borderBottomWidth: 1,
    fontSize: 18,
    padding: 0,
  },
 
  TransparentLoginBtnContainer:{
    marginTop: 32,
    backgroundColor:"#FF8C00",
    flexDirection:'column',
    justifyContent:'center',
    alignItems:'center',
    height:45,
    borderRadius:25,
    overflow: 'hidden',
    opacity:0.4
  },
  LoginBtnContainer:{
    opacity:1,
    // shadowColor : '#FF8C00',
    // shadowOffset: { width: 0, height: 0 },
    // shadowOpacity: 0, 
    // shadowRadius: 0, 
    // elevation: 0
  },
  registerContainer:{
    height:40,
    marginTop:20,
    flexDirection:"row",
    justifyContent:"flex-end"
  }
});



