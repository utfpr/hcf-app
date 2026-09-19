import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Formulario: { latitude: number; longitude: number };
};

export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
