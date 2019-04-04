import { createBottomTabNavigator, createAppContainer } from 'react-navigation';
import ShowPage from './ShowPage';
import ShowKindsPage from './ShowKindsPage'
import CartPage from './CartPage'
import UserInfoPage from './UserInfoPage'

const TabNavigator = createBottomTabNavigator({
  ShowPage: ShowPage,
  ShowKindsPage: ShowKindsPage,
  CartPage: CartPage,
  UserInfoPage: UserInfoPage
},{
  tabBarOptions: {
    //当前选中的tab bar的文本颜色和图标颜色
    activeTintColor: '#FF8C00',
    //当前未选中的tab bar的文本颜色和图标颜色
    inactiveTintColor: 'black',
    //是否显示tab bar的图标，默认是false
    showIcon: true,
    //showLabel - 是否显示tab bar的文本，默认是true
    showLabel: true,
    //tab bar的样式
    style: {
        backgroundColor: 'white',
        height:60
    },
    //tab bar的文本样式
    labelStyle: {
        fontSize: 14,
        marginBottom:5,
    },
    //tab 页指示符的样式 (tab页下面的一条线).
    indicatorStyle: {height: 0},
},
//tab bar的位置, 可选值： 'top' or 'bottom'
tabBarPosition: 'bottom',
//是否允许滑动切换tab页
swipeEnabled: true,
//是否在切换tab页时使用动画
animationEnabled: false,
//是否懒加载
lazy: true,
//返回按钮是否会导致tab切换到初始tab页？ 如果是，则设置为initialRoute，否则为none。 缺省为initialRoute。
backBehavior: 'none',
});

export default createAppContainer(TabNavigator);