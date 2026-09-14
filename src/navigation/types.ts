import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
};

export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
