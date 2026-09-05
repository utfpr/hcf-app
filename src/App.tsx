import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ContainerProvider } from './context/container/ContainerProvider';
import { Login } from './domain/login/Login';

function App() {
  return (
    <SafeAreaProvider>
      <ContainerProvider baseUrl="https://jsonplaceholder.typicode.com">
        <StatusBar barStyle={'light-content'} />
        <Login />
      </ContainerProvider>
    </SafeAreaProvider>
  );
}

export default App;
