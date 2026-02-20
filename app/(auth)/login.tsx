import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppContext } from '@/contexts/AppContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAppContext();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const textColor = colorScheme === 'dark' ? '#fff' : '#000';

    const handleLogin = async () => {
        if (!username || !password) return;
        // Basic auth logic - in a real app this would verify against a database
        await login({ username, password });
        router.replace('/(tabs)');
    };

    return (
        <ThemedView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.header}>
                    <ThemedText type="title" style={styles.title}>MicroWin</ThemedText>
                    <ThemedText style={styles.subtitle}>Celebrate your small steps.</ThemedText>
                </View>

                <View style={styles.form}>
                    <TextInput
                        style={[styles.input, { color: textColor }]}
                        placeholder="Username"
                        placeholderTextColor="#888"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={[styles.input, { color: textColor }]}
                        placeholder="Password"
                        placeholderTextColor="#888"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity style={styles.button} onPress={handleLogin}>
                        <Text style={styles.buttonText}>Log In</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkButton}
                        onPress={() => router.push('/(auth)/register')}
                    >
                        <ThemedText style={styles.linkText}>New here? Create an account</ThemedText>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    title: {
        fontSize: 42,
        lineHeight: 48,
        fontWeight: '800',
        color: '#0a7ea4',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 18,
        opacity: 0.8,
    },
    form: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
        gap: 16,
    },
    input: {
        backgroundColor: 'rgba(150, 150, 150, 0.1)',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#333', // Will adapt later for dark mode if needed
    },
    button: {
        backgroundColor: '#0a7ea4',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    linkButton: {
        alignItems: 'center',
        marginTop: 16,
    },
    linkText: {
        opacity: 0.7,
    },
});
