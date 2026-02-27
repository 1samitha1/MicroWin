import DateTimePicker from '@react-native-community/datetimepicker';
import { BlurView } from 'expo-blur';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Target } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

interface AddTargetModalProps {
    visible: boolean;
    initialTarget?: Target | null;
    onClose: () => void;
    onSaveTarget: (text: string, date: number, id?: string) => Promise<void>;
}

export function AddTargetModal({
    visible,
    initialTarget,
    onClose,
    onSaveTarget,
}: AddTargetModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [text, setText] = useState('');
    const [targetDate, setTargetDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Populate state when opening modal with an existing target
    React.useEffect(() => {
        if (visible) {
            if (initialTarget) {
                setText(initialTarget.text);
                setTargetDate(initialTarget.targetDate ? new Date(initialTarget.targetDate) : new Date());
            } else {
                setText('');
                setTargetDate(new Date());
            }
        }
    }, [visible, initialTarget]);

    const handleSave = async () => {
        if (!text.trim() || isSaving) return;

        setIsSaving(true);
        try {
            await onSaveTarget(text.trim(), targetDate.getTime(), initialTarget?.id);
            onClose();
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        setText('');
        setTargetDate(new Date());
        onClose();
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setTargetDate(selectedDate);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={handleClose}
        >
            <View style={[styles.container, isDark ? styles.darkBg : styles.lightBg]}>
                {/* Header */}
                <BlurView intensity={isDark ? 30 : 80} tint={isDark ? "dark" : "light"} style={styles.header}>
                    <TouchableOpacity onPress={handleClose} style={styles.headerBtn}>
                        <Ionicons name="close" size={24} color={isDark ? '#94a3b8' : '#64748b'} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, isDark ? styles.darkText : styles.lightText]}>
                        {initialTarget ? "Edit Target" : "Add New Target"}
                    </Text>
                    <TouchableOpacity onPress={handleSave} disabled={!text.trim() || isSaving} style={styles.headerBtnRight}>
                        <Text style={[styles.headerSave, (!text.trim() || isSaving) && styles.disabledText]}>Save</Text>
                    </TouchableOpacity>
                </BlurView>

                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
                    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

                        <View style={styles.introSection}>
                            <Text style={[styles.title, isDark ? styles.darkText : styles.lightText]}>
                                What&apos;s your next <Text style={styles.primaryText}>MicroWin</Text>?
                            </Text>
                            <Text style={[styles.subtitle, isDark ? styles.darkSubText : styles.lightSubText]}>
                                Small steps lead to big changes.
                            </Text>
                        </View>

                        <View style={[styles.card, isDark ? styles.darkCard : styles.lightCard]}>
                            <Text style={[styles.label, isDark ? styles.darkSubText : styles.lightSubText]}>TARGET NAME</Text>
                            <TextInput
                                style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
                                placeholder="e.g., Morning Walk"
                                placeholderTextColor={isDark ? "#475569" : "#94a3b8"}
                                value={text}
                                onChangeText={setText}
                                returnKeyType="done"
                            />
                        </View>

                        <View style={[styles.card, isDark ? styles.darkCard : styles.lightCard]}>
                            <View style={styles.dateHeader}>
                                <Text style={[styles.label, isDark ? styles.darkSubText : styles.lightSubText]}>SET DEADLINE</Text>
                                <View style={styles.datePreview}>
                                    <Ionicons name="calendar-outline" size={16} color="#22c55e" />
                                    <Text style={styles.datePreviewText}>{format(targetDate, 'MMMM yyyy')}</Text>
                                </View>
                            </View>

                            {Platform.OS === 'android' && (
                                <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
                                    <Text style={styles.datePickerButtonText}>
                                        {format(targetDate, 'EEE, MMM d, yyyy')}
                                    </Text>
                                    <Ionicons name="calendar" size={20} color="#22c55e" />
                                </TouchableOpacity>
                            )}

                            {(showDatePicker || Platform.OS === 'ios') && (
                                <DateTimePicker
                                    testID="dateTimePicker"
                                    value={targetDate}
                                    mode="date"
                                    is24Hour={true}
                                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                                    onChange={handleDateChange}
                                    minimumDate={initialTarget ? undefined : new Date()}
                                    themeVariant={isDark ? "dark" : "light"}
                                />
                            )}
                        </View>

                        <View style={styles.bottomActions}>
                            <TouchableOpacity
                                style={[styles.primaryBtn, (!text.trim() || isSaving) && styles.primaryBtnDisabled]}
                                onPress={handleSave}
                                disabled={!text.trim() || isSaving}
                            >
                                {isSaving ? (
                                    <ActivityIndicator color={isDark ? "#102212" : "#f6f8f6"} />
                                ) : (
                                    <Text style={styles.primaryBtnText}>{initialTarget ? "Update Target" : "Create Target"}</Text>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.secondaryBtn, isDark ? styles.secondaryBtnDark : styles.secondaryBtnLight]} onPress={handleClose}>
                                <Text style={[styles.secondaryBtnText, isDark ? styles.darkSubText : styles.lightSubText]}>Cancel</Text>
                            </TouchableOpacity>
                        </View>

                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    lightBg: { backgroundColor: '#f6f8f6' },
    darkBg: { backgroundColor: '#102212' },
    lightText: { color: '#0f172a' },
    darkText: { color: '#f8fafc' },
    lightSubText: { color: '#64748b' },
    darkSubText: { color: '#94a3b8' },
    primaryText: { color: '#22c55e' },
    disabledText: { opacity: 0.5 },

    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 50 : 20, paddingHorizontal: 16, paddingBottom: 16,
        borderBottomWidth: 1, borderBottomColor: 'rgba(34, 197, 94, 0.1)', zIndex: 10,
    },
    headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    headerBtnRight: { paddingHorizontal: 8, paddingVertical: 8 },
    headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, letterSpacing: -0.5 },
    headerSave: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#22c55e' },

    keyboardView: { flex: 1 },
    scrollContent: { padding: 16, paddingBottom: 40, gap: 24 },

    introSection: { paddingTop: 8 },
    title: { fontFamily: 'Inter_700Bold', fontSize: 28, lineHeight: 34 },
    subtitle: { fontFamily: 'Inter_400Regular', fontSize: 16, marginTop: 4 },

    card: { borderRadius: 16, padding: 20, borderWidth: 1 },
    lightCard: { backgroundColor: '#ffffff', borderColor: 'rgba(34, 197, 94, 0.05)', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    darkCard: { backgroundColor: 'rgba(34, 197, 94, 0.05)', borderColor: 'rgba(34, 197, 94, 0.05)' },

    label: { fontFamily: 'Inter_600SemiBold', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },

    input: { height: 56, borderRadius: 12, paddingHorizontal: 16, fontFamily: 'Inter_500Medium', fontSize: 18 },
    inputLight: { backgroundColor: '#f1f5f9', color: '#0f172a' },
    inputDark: { backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#f8fafc' },

    dateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    datePreview: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    datePreviewText: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#22c55e' },

    datePickerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(34, 197, 94, 0.1)', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 },
    datePickerButtonText: { color: '#22c55e', fontSize: 16, fontFamily: 'Inter_600SemiBold' },

    bottomActions: { marginTop: 16, gap: 12 },
    primaryBtn: { height: 56, backgroundColor: '#22c55e', borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#22c55e', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    primaryBtnDisabled: { opacity: 0.5, shadowOpacity: 0 },
    primaryBtnText: { fontFamily: 'Inter_700Bold', fontSize: 18, color: '#102212' },

    secondaryBtn: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    secondaryBtnLight: { backgroundColor: '#e2e8f0' },
    secondaryBtnDark: { backgroundColor: 'rgba(34, 197, 94, 0.1)' },
    secondaryBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 16 },
});
