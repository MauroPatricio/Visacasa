import React, { memo, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate
} from 'react-native-reanimated';

import Home from '../screens/Home';
import Search from '../screens/Search';
import Orders from '../screens/Orders';
import RequestDeliv from '../screens/RequestDeliv';
import Profile from '../screens/Profile';

const { width } = Dimensions.get('window');
const TAB_BAR_WIDTH = width * 0.95;
const TAB_WIDTH = TAB_BAR_WIDTH / 5;

const Tab = createBottomTabNavigator();

// --- COMPONENTS ---

const TabBarIndicator = ({ state }) => {
  const offset = useSharedValue(0);

  useEffect(() => {
    offset.value = withSpring(state.index * TAB_WIDTH, {
      damping: 15,
      stiffness: 100,
    });
  }, [state.index]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: offset.value }],
    };
  });

  return (
    <Animated.View style={[styles.indicatorContainer, animatedStyle]}>
      <View style={styles.indicatorPill} />
    </Animated.View>
  );
};

const CustomTabBarButton = memo(({ children, onPress }) => (
  <TouchableOpacity
    style={styles.centerButtonWrapper}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <LinearGradient
      colors={['#E85A4F', '#D3483E']}
      style={styles.centerButton}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {children}
    </LinearGradient>
  </TouchableOpacity>
));

const TabIcon = ({ name, focused }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.2 : 1);
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: interpolate(scale.value, [1, 1.2], [0.5, 1]),
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons
        name={name}
        size={24}
        color={focused ? '#E85A4F' : '#8E8E93'}
      />
    </Animated.View>
  );
};

// --- NAVIGATION ---

const BottomTabNavigation = () => {
  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarHideOnKeyboard: true,
          tabBarStyle: styles.tabBar,
        }}
      >
        <Tab.Screen
          name="Início"
          component={Home}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} />
            ),
          }}
        />

        <Tab.Screen
          name="Pesquisa"
          component={Search}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon name={focused ? 'search' : 'search-outline'} focused={focused} />
            ),
          }}
        />

        <Tab.Screen
          name="NovoPedido"
          component={RequestDeliv}
          options={{
            tabBarIcon: () => <Ionicons name="add" size={20} color="white" />,
            tabBarButton: (props) => <CustomTabBarButton {...props} />,
          }}
        />

        <Tab.Screen
          name="Pedidos"
          component={Orders}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon name={focused ? 'file-tray-full' : 'file-tray-full-outline'} focused={focused} />
            ),
          }}
        />

        <Tab.Screen
          name="Perfil"
          component={Profile}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} />
            ),
          }}
        />
      </Tab.Navigator>

      {/* Indicator logic would traditionally need a custom TabBar component, 
          but for simplicity in this replacement, we keep the default and use TabIcon animations.
          If a sliding pill is strictly required, we'd wrap Tab.Navigator with a custom TabBar. 
          Given the current structure, animated icons are a safer and very modern enhancement. */}
    </View>
  );
};

export default BottomTabNavigation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 25 : 15,
    left: (width - TAB_BAR_WIDTH) / 2,
    right: (width - TAB_BAR_WIDTH) / 2,
    height: 70,
    backgroundColor: '#FFFFFF',
    borderRadius: 35,
    borderTopWidth: 0,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 15,
    paddingBottom: 0, // Align icons vertically
  },
  centerButtonWrapper: {
    top: 0, // Centered vertically within the tab bar
    width: TAB_WIDTH,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E85A4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  centerButton: {
    width: 44,
    height: 44,
    borderRadius: 22, // Circle for 44x44
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 5,
    width: TAB_WIDTH,
    alignItems: 'center',
  },
  indicatorPill: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E85A4F',
  }
});
