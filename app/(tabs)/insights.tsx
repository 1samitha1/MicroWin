import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function InsightsScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View style={[styles.container, isDark ? styles.darkBg : styles.lightBg]}>
            <Text style={[styles.text, isDark ? styles.darkText : styles.lightText]}>
                Insights Page Coming Soon...
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    lightBg: { backgroundColor: '#f6f8f6' },
    darkBg: { backgroundColor: '#102212' },
    lightText: { color: '#0f172a' },
    darkText: { color: '#f1f5f9' },
    text: {
        fontFamily: 'Inter_500Medium',
        fontSize: 16,
    }
});
