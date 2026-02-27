import { useColorScheme } from '@/hooks/use-color-scheme';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { IconSymbol } from './ui/icon-symbol';

interface AddWinModalProps {
    visible: boolean;
    onClose: () => void;
    onSaveWin: (text: string, category: string) => void;
    onSaveTarget: (text: string, targetDate: number) => void;
}

const CATEGORIES = ['Personal', 'Work', 'Health', 'Other'];

export function AddWinModal({ visible, onClose, onSaveWin, onSaveTarget }: AddWinModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [step, setStep] = useState<'WIN' | 'TARGET'>('WIN');
    const [winText, setWinText] = useState('');
    const [category, setCategory] = useState('');
    const [targetText, setTargetText] = useState('');
    const [targetDate, setTargetDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleClose = () => {
        setStep('WIN');
        setWinText('');
        setCategory('');
        setTargetText('');
        setTargetDate(new Date());
        setShowDatePicker(false);
        onClose();
    };

    const handleSaveWin = () => {
        if (!winText.trim()) return;
        onSaveWin(winText, category || 'Personal');
        setStep('TARGET'); // Move to optional target step
    };

    const handleFinish = () => {
        if (targetText.trim()) {
            onSaveTarget(targetText, targetDate.getTime());
        }
        handleClose();
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setTargetDate(selectedDate);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalOverlay}
            >
                <ThemedView style={styles.modalContent}>
                    <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                        <IconSymbol name="xmark" size={24} color="#888" />
                    </TouchableOpacity>

                    {step === 'WIN' ? (
                        <ScrollView
                            style={styles.stepContainer}
                            contentContainerStyle={{ paddingBottom: 24 }}
                            keyboardShouldPersistTaps="handled"
                        >
                            <ThemedText type="title" style={styles.title}>Log a Win</ThemedText>
                            <TextInput
                                style={[styles.input, isDark && styles.inputDark]}
                                placeholder="What did you achieve? ✨ (max 80 chars)"
                                placeholderTextColor={isDark ? "#aaa" : "#666"}
                                value={winText}
                                onChangeText={setWinText}
                                maxLength={80}
                                multiline
                            />
                            <View style={styles.categories}>
                                {CATEGORIES.map(cat => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[styles.categoryPill, category === cat && styles.categoryPillActive]}
                                        onPress={() => setCategory(cat)}
                                    >
                                        <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>
                                            {cat}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <TouchableOpacity
                                style={[styles.button, !winText.trim() && styles.buttonDisabled]}
                                onPress={handleSaveWin}
                                disabled={!winText.trim()}
                            >
                                <Text style={styles.buttonText}>Save Win</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    ) : (
                        <ScrollView
                            style={styles.stepContainer}
                            contentContainerStyle={{ paddingBottom: 24 }}
                            keyboardShouldPersistTaps="handled"
                        >
                            <ThemedText type="title" style={styles.title}>What&apos;s next?</ThemedText>
                            <ThemedText style={styles.subtitle}>Set one small next step related to this win. (Optional)</ThemedText>
                            <TextInput
                                style={[styles.input, isDark && styles.inputDark]}
                                placeholder="Next small step... 🎯 (max 60 chars)"
                                placeholderTextColor={isDark ? "#aaa" : "#666"}
                                value={targetText}
                                onChangeText={setTargetText}
                                maxLength={60}
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
                                        <IconSymbol name="calendar" size={16} color="#22c55e" />
                                    </TouchableOpacity>
                                )}

                                {(showDatePicker || Platform.OS === 'ios') && (
                                    <DateTimePicker
                                        testID="dateTimePickerWinTarget"
                                        value={targetDate}
                                        mode="date"
                                        is24Hour={true}
                                        display={Platform.OS === 'ios' ? 'compact' : 'default'}
                                        onChange={handleDateChange}
                                        minimumDate={new Date()}
                                        style={styles.iosDatePicker}
                                    />
                                )}
                            </View>

                            <View style={styles.actions}>
                                <TouchableOpacity style={styles.skipButton} onPress={handleFinish}>
                                    <ThemedText style={styles.skipText}>Skip</ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.button, styles.flexButton]} onPress={handleFinish}>
                                    <Text style={styles.buttonText}>Done</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    )}
                </ThemedView>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        minHeight: 400,
    },
    closeButton: {
        alignSelf: 'flex-end',
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
    categories: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginVertical: 8,
    },
    categoryPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(150, 150, 150, 0.2)',
    },
    categoryPillActive: {
        backgroundColor: '#22c55e',
    },
    categoryText: {
        color: '#888',
        fontWeight: '600',
    },
    categoryTextActive: {
        color: '#fff',
    },
    button: {
        backgroundColor: '#22c55e',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 'auto',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 'auto',
        gap: 16,
    },
    skipButton: {
        padding: 16,
    },
    skipText: {
        opacity: 0.7,
        fontSize: 16,
    },
    flexButton: {
        flex: 1,
        marginTop: 0,
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
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    datePickerButtonText: {
        color: '#22c55e',
        fontSize: 16,
        fontWeight: '600',
    },
    iosDatePicker: {
        width: 130,
    },
});
