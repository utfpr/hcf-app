import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ContainerProvider } from './context/container/ContainerProvider';
import { Home } from './domain/home/Home';
import { Formulario } from './domain/evidencia/Formulario';

function App() {
  return (
    <SafeAreaProvider>
      <ContainerProvider baseUrl="https://jsonplaceholder.typicode.com">
        <StatusBar barStyle={'light-content'} />
        <Formulario latitude={-20.2508} longitude={-46.4167} />
      </ContainerProvider>
    </SafeAreaProvider>
  );
}

export default App;
