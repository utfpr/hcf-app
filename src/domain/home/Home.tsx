import { StyleSheet, Text, View } from 'react-native';
import { useQuery } from '../../hook/query/useQuery';
import {useContainer} from '../../context/container/useContainer';

export function Home() {
  const {httpClient} = useContainer()

  const { data, error, loading, validating } = useQuery(
    async () => {
      const response = await httpClient.get<object[]>({
        url: '/posts',
      });
      return response.json();
    },
    ['/posts'],
  );

  console.log(data?.length, error, loading, validating);

  return (
    <View style={styles.container}>
      <Text>Home</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#082113',
    padding: 16
  },
});
