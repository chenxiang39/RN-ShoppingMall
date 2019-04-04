import React, {Component} from 'react';
import { createStackNavigator, createAppContainer } from 'react-navigation';
import HomePage from './HomePage'
import RegisterPage from './RegisterPage'
import TabNavigator from './TabNavigator'
import ShowGoodsListPage from './ShowGoodsListPage'
import ShopPage from './ShopPage'
import ShowGoodPage from './ShowGoodPage'
import OrderPage from './OrderPage'
import AddressPage from './AddressPage'
import StackCartPage from './StackCartPage'
import MyOrderListPage from './MyOrderListPage'
import SuccessPayPage from './SuccessPayPage'
const RootStack = createStackNavigator(
  {
    HomePage:HomePage,
    RegisterPage:RegisterPage,
    MainPage:{screen:TabNavigator,navigationOptions :({navigation})=>({
      header:null,
      headerBackTitle: null,
    })},
    ShowGoodsListPage:ShowGoodsListPage,
    ShopPage:ShopPage,
    ShowGoodPage:ShowGoodPage,
    OrderPage:OrderPage,
    AddressPage:AddressPage,
    StackCartPage:StackCartPage,
    MyOrderListPage:MyOrderListPage,
    SuccessPayPage:SuccessPayPage
  },
  {
    initialRouteName:'HomePage'
  }
)

const AppContainer = createAppContainer(RootStack);
export default class App extends Component{
  render(){
    return <AppContainer />
  }
}

