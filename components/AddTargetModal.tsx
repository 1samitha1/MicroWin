import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { IconSymbol } from './ui/icon-symbol';

interface AddTargetModalProps {
    visible: boolean;
    onClose: () => void;
    onSaveTarget: (text: string, date: number) => Promise<void>;
}

export function AddTargetModal({
    visible,
    onClose,
    onSaveTarget,
}: AddTargetModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [text, setText] = useState('');
    const [targetDate, setTargetDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!text.trim() || isSaving) return;

        setIsSaving(true);
        try {
            // Keep the selected Date but strip the time portion implicitly when saving
            await onSaveTarget(text.trim(), targetDate.getTime());

            // Reset state
            setText('');
            setTargetDate(new Date());
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
            transparent={true}
            onRequestClose={handleClose}
        >
            <TouchableWithoutFeedback onPress={handleClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={styles.keyboardView}
                        >
                            <ThemedView style={styles.modalContent}>
                                <View style={styles.header}>
                                    <View style={[styles.dragIndicator, isDark && styles.dragIndicatorDark]} />
                                    <TouchableOpacity
                                        onPress={handleClose}
                                        style={styles.closeButton}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        <IconSymbol name="xmark" size={20} color="#888" />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView
                                    style={styles.stepContainer}
                                    contentContainerStyle={{ paddingBottom: 24 }}
                                    keyboardShouldPersistTaps="handled"
                                >
                                    <ThemedText type="title" style={styles.title}>New Target</ThemedText>
                                    <ThemedText style={styles.subtitle}>What's your next small step?</ThemedText>

                                    <TextInput
                                        style={[styles.input, isDark && styles.inputDark]}
                                        placeholder="I will... 🎯"
                                        placeholderTextColor={isDark ? "#aaa" : "#666"}
                                        value={text}
                                        onChangeText={setText}
                                        multiline
                                        autoFocus
                                        maxLength={120}
                                    />

                                    <View style={[styles.dateSelectorContainer, isDark && styles.inputDark]}>
                                        <ThemedText style={styles.dateLabel}>Target Date:</ThemedText>
                                        {Platform.OS === 'android' && (
                                            <TouchableOpacity
                                                style={styles.datePickerButton}
                                                onPress={() => setShowDatePicker(true)}
                                            >
                                                <ThemedText style={styles.datePickerButtonText}>
                                                    {targetDate.toLocaleDateString(undefined, {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </ThemedText>
                                                <IconSymbol name="calendar" size={16} color="#0a7ea4" />
                                            </TouchableOpacity>
                                        )}

                                        {(showDatePicker || Platform.OS === 'ios') && (
                                            <DateTimePicker
                                                testID="dateTimePicker"
                                                value={targetDate}
                                                mode="date"
                                                is24Hour={true}
                                                display={Platform.OS === 'ios' ? 'compact' : 'default'}
                                                onChange={handleDateChange}
                                                minimumDate={new Date()} // Prevent past dates for new targets
                                                style={styles.iosDatePicker}
                                            />
                                        )}
                                    </View>
                                </ScrollView>

                                <View style={styles.footer}>
                                    <ThemedText style={styles.charCount}>
                                        {text.length}/120
                                    </ThemedText>
                                    <TouchableOpacity
                                        style={[
                                            styles.saveButton,
                                            !text.trim() && styles.saveButtonDisabled
                                        ]}
                                        onPress={handleSave}
                                        disabled={!text.trim() || isSaving}
                                    >
                                        {isSaving ? (
                                            <ActivityIndicator color="white" />
                                        ) : (
                                            <ThemedText style={styles.saveButtonText}>Set Target</ThemedText>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </ThemedView>
                        </KeyboardAvoidingView>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
    },
    keyboardView: {
        width: '100%',
    },
    modalContent: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingTop: 12,
        minHeight: '60%',
        maxHeight: '90%',
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
        position: 'relative',
    },
    dragIndicator: {
        width: 40,
        height: 4,
        backgroundColor: '#ddd',
        borderRadius: 2,
    },
    dragIndicatorDark: {
        backgroundColor: '#444',
    },
    closeButton: {
        position: 'absolute',
        right: 0,
        top: 0,
        backgroundColor: 'rgba(150, 150, 150, 0.1)',
        borderRadius: 16,
        padding: 8,
    },
    stepContainer: {
        flex: 1,
        gap: 16,
    },
    title: {
        fontSize: 28,
    },
    subtitle: {
        opacity: 0.7,
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        fontSize: 18,
        color: '#111827',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        minHeight: 120,
        textAlignVertical: 'top',
    },
    inputDark: {
        backgroundColor: '#1F2937',
        color: '#F9FAFB',
        borderColor: '#374151',
    },
    dateSelectorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginTop: 8,
    },
    dateLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#374151',
    },
    datePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(10, 126, 164, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    datePickerButtonText: {
        color: '#0a7ea4',
        fontSize: 16,
        fontWeight: '600',
    },
    iosDatePicker: {
        width: 130, // constrain width for iOS compact picker
    },
    footer: {
        marginTop: 32,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    charCount: {
        opacity: 0.5,
        fontSize: 14,
    },
    saveButton: {
        backgroundColor: '#0a7ea4',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 120,
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
