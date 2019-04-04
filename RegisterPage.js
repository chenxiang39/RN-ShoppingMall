import React, {Component} from 'react';
import {StyleSheet,Image, Text, View ,TextInput , Button , Slider,TouchableOpacity} from 'react-native';
import UserDataModel from './viewModel/UserDataModel'
import UserService from './service/UserService';
import apiHelper from './common/apiHelper'
global.User = {}
global.btnStyleFlag = false  //控制按钮的样式
export default class RegisterPage extends Component{  
    constructor(props)
    {
      super(props);
      this.state = {
        Username : "",
        Password : "",
        RetypePassword :"",
      }
    }
    static navigationOptions = {
      title:""
    };
    //根据输入的内容处理按钮样式
    HandleBtnStyle(){
      if(this.state.Username != ""&&this.state.Password != ""&&this.state.RetypePassword != ""){
        this.btnStyleFlag = true
      }else{
        this.btnStyleFlag = false
      }
      return this.btnStyleFlag ? styles.RegisterBtnContainer : ''
    }
    _isUserExist(UserData){
      for(let i = 0;i < UserData.UserInfo.length;i++){
        if(UserData.UserInfo[i].Username === this.state.Username)
        {
          return false
        }
      }
      return true
  }


    //点击注册页面确定按钮接收api返回的数据，处理用户操作
    async _PressConfirmButton(){
      if (this.state.Username != ""&&this.state.Password != ""&&this.state.RetypePassword !=""){
          if(this.state.Password == this.state.RetypePassword){
            let newUser = {
              'u_name':this.state.Username,
              'u_password':this.state.Password
            }
            await UserService.saveUser(newUser)  //给API发送注册用户的请求
            let API = apiHelper.getAPI()       //获得API的返回值（包含status,msg,result）
            if(API.status == 200){
                if (API.result_kind == "SUCCESS"){        
                  this.props.navigation.goBack()
                } 
                if (API.result_kind == "WARNING"){        //数据库中已有重复的用户名
                  alert(API.reuslt.msg)
                } 
            }else if(API.status == 404){
               alert(API.reuslt.msg)
               //跳转错误页面
            }else if(API.status == 500){
              alert(API.reuslt.msg)
               //跳转错误页面
            }
          }else{
            alert("两次密码输得不同，请重新输入！")
          }
      }else{
        alert("请输入完整的信息！")
      }
    }

    render()
    {
      const {navigation} = this.props
      return (
        <View style={styles.LoginContainer}>
            <View style ={styles.titleContainer}>
              <Image source={require('./images/Title_icon.jpeg')} style={styles.imgs} />
            </View>
            <View style={styles.loginContainer}>
              <View style = {styles.UsernameAndPasswordContainer}>
                  <TextInput style = {styles.Input} 
                    placeholder="请设置用户名"
                    clearButtonMode = "while-editing"
                    onChangeText={(text) => {
                    this.setState({
                      Username:text
                    })
                  }}
                  />
              </View>
              <View style = {styles.UsernameAndPasswordContainer}>
                  <TextInput style = {styles.Input} 
                        placeholder="请设置密码"
                        clearButtonMode = "while-editing"
                        secureTextEntry={true}
                        onChangeText={(text) => {
                        this.setState({
                          Password:text
                        })
                      }}
                  />
              </View>
              <View style = {styles.UsernameAndPasswordContainer}>
                  <TextInput style = {styles.Input} 
                        placeholder="请确认密码"
                        clearButtonMode = "while-editing"
                        secureTextEntry={true}
                        onChangeText={(text) => {
                        this.setState({
                          RetypePassword:text
                        })
                      }}
                  />
              </View>
              <TouchableOpacity 
                        opacity = {0.2} 
                        onPress={()=>{
                          this._PressConfirmButton()
                    }}
                    >
                      <View style = {[styles.TransparentRegisterBtnContainer,this.HandleBtnStyle()]}>
                        <Text style = {{fontSize:16,color:'white'}}>确认注册</Text>
                      </View>
                </TouchableOpacity>
          </View>
        </View>
      )
    }
}

const styles = StyleSheet.create({
  LoginContainer: {
    flex:1,
  },
  titleContainer: {
    marginTop: 40,
    flexDirection:'column',
    justifyContent: 'center',
    alignItems:'center',
    height:120
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
    padding: 0
  },
  TransparentRegisterBtnContainer:{
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
  RegisterBtnContainer:{
    opacity:1,
    // shadowColor : '#FF8C00',
    // shadowOffset: { width: 0, height: 0 },
    // shadowOpacity: 0, 
    // shadowRadius: 0, 
    // elevation: 0
  },
});



