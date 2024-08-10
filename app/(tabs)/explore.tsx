import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, Platform, SafeAreaView } from 'react-native';

import DrawingCanvas from '@/components/DrawingCanvas';

export default function TabTwoScreen() {
    return (
        <SafeAreaView style={styles.container}>
          <DrawingCanvas />
        </SafeAreaView>
      );    
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
      },
});
