import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ContainerProvider } from './context/container/ContainerProvider';
import { Home } from './domain/home/Home';

function App() {
  return (
    <SafeAreaProvider>
      <ContainerProvider baseUrl="https://jsonplaceholder.typicode.com">
        <StatusBar barStyle={'light-content'} />
        <Home />
      </ContainerProvider>
    </SafeAreaProvider>
  );
}

export default App;
