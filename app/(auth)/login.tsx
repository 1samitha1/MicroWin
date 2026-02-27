import { useAppContext } from '@/contexts/AppContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAppContext();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert("Error", "Please enter both username and password.");
            return;
        }
        const success = await login(username, password);
        if (success) {
            router.replace('/(tabs)');
        } else {
            Alert.alert("Login Failed", "Invalid username or password.");
        }
    };

    return (
        <View style={[styles.container, isDark ? styles.darkBg : styles.lightBg]}>
            <View style={[styles.blurCircle, styles.blurBottomLeft]} />
            <View style={[styles.blurCircle, styles.blurTopRight]} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.formContainer}>
                    <View style={styles.heroSection}>
                        <View style={styles.iconBox}>
                            <Ionicons name="trophy-outline" size={48} color="#22c55e" />
                        </View>
                        <Text style={[styles.title, isDark ? styles.darkText : styles.lightText]}>
                            Welcome Back
                        </Text>
                        <Text style={[styles.subtitle, isDark ? styles.darkSubText : styles.lightSubText]}>
                            Log in to continue tracking your micro wins.
                        </Text>
                    </View>

                    <View style={styles.formSection}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, isDark ? styles.darkSubText : styles.lightSubText]}>USERNAME</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="at-outline" size={20} color={isDark ? '#9BA1A6' : '#687076'} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, isDark ? styles.darkInput : styles.lightInput, isDark ? styles.darkText : styles.lightText]}
                                    placeholder="alex_wins"
                                    placeholderTextColor={isDark ? '#555' : '#888'}
                                    value={username}
                                    onChangeText={setUsername}
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, isDark ? styles.darkSubText : styles.lightSubText]}>PASSWORD</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="lock-closed-outline" size={20} color={isDark ? '#9BA1A6' : '#687076'} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, isDark ? styles.darkInput : styles.lightInput, isDark ? styles.darkText : styles.lightText]}
                                    placeholder="••••••••"
                                    placeholderTextColor={isDark ? '#555' : '#888'}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                            </View>
                        </View>

                        <Link href="/(auth)/forgot-password" asChild>
                            <TouchableOpacity style={{ alignSelf: 'flex-end', marginTop: -8 }}>
                                <Text style={[styles.linkText, { color: '#22c55e' }]}>Forgot Password?</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>

                    <View style={styles.footerSection}>
                        <TouchableOpacity style={styles.button} onPress={handleLogin}>
                            <Text style={styles.buttonText}>Get Started</Text>
                            <Ionicons name="arrow-forward" size={24} color="#102212" />
                        </TouchableOpacity>

                        <View style={styles.dividerContainer}>
                            <View style={[styles.divider, isDark ? styles.darkBorder : styles.lightBorder]} />
                            <Text style={[styles.dividerText, isDark ? styles.darkSubText : styles.lightSubText]}>OR</Text>
                            <View style={[styles.divider, isDark ? styles.darkBorder : styles.lightBorder]} />
                        </View>

                        <Link href="/(auth)/register" asChild>
                            <TouchableOpacity style={styles.secondaryButton}>
                                <Text style={[styles.secondaryButtonText, isDark ? styles.darkText : styles.lightText]}>
                                    Get Connected
                                </Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    lightBg: { backgroundColor: '#f6f8f6' },
    darkBg: { backgroundColor: '#102212' },
    lightText: { color: '#0f172a' },
    darkText: { color: '#f1f5f9' },
    lightSubText: { color: '#64748b' },
    darkSubText: { color: '#94a3b8' },
    lightBorder: { borderColor: '#e2e8f0', borderTopWidth: 1 },
    darkBorder: { borderColor: 'rgba(34, 197, 94, 0.1)', borderTopWidth: 1 },
    lightInput: { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' },
    darkInput: { backgroundColor: 'rgba(34, 197, 94, 0.05)', borderColor: 'rgba(34, 197, 94, 0.2)' },
    blurCircle: {
        position: 'absolute',
        width: 256,
        height: 256,
        borderRadius: 128,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        opacity: 0.5,
    },
    blurBottomLeft: { bottom: -100, left: -100 },
    blurTopRight: { top: -100, right: -100 },
    keyboardView: { flex: 1, justifyContent: 'center', padding: 16 },
    formContainer: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
        paddingVertical: 40,
        backgroundColor: 'transparent',
    },
    heroSection: { alignItems: 'center', marginBottom: 40, paddingHorizontal: 24 },
    iconBox: {
        width: 80, height: 80,
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderRadius: 20,
        borderWidth: 1, borderColor: 'rgba(34, 197, 94, 0.3)',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 32,
    },
    title: { fontFamily: 'Inter_700Bold', fontSize: 28, textAlign: 'center', marginBottom: 8, letterSpacing: -0.5 },
    subtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, textAlign: 'center', lineHeight: 20, paddingHorizontal: 16 },
    formSection: { paddingHorizontal: 32, gap: 24, marginBottom: 48 },
    inputGroup: { gap: 8 },
    label: { fontFamily: 'Inter_600SemiBold', fontSize: 12, letterSpacing: 1, marginLeft: 4 },
    inputWrapper: { position: 'relative', justifyContent: 'center' },
    inputIcon: { position: 'absolute', left: 16, zIndex: 1 },
    input: {
        fontFamily: 'Inter_400Regular',
        height: 56, borderWidth: 1, borderRadius: 16,
        paddingLeft: 48, paddingRight: 16, fontSize: 16,
    },
    linkText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
    footerSection: { paddingHorizontal: 32, gap: 16 },
    button: {
        height: 64, backgroundColor: '#22c55e', borderRadius: 16,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4,
    },
    buttonText: { fontFamily: 'Inter_700Bold', fontSize: 18, color: '#102212' },
    secondaryButton: {
        height: 64, borderRadius: 16,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: '#22c55e'
    },
    secondaryButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 16 },
    dividerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, marginBottom: 16 },
    divider: { flex: 1, height: 1 },
    dividerText: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 2 },
});
