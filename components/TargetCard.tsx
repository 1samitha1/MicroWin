import { Target } from '@/types';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';
import { IconSymbol } from './ui/icon-symbol';

interface TargetCardProps {
    target: Target | null;
    isFailed?: boolean;
    onComplete: (id: string) => void;
    onDismiss: (id: string) => void;
    onRestart?: (id: string, newDate: number) => void;
}

export function TargetCard({ target, isFailed, onComplete, onDismiss, onRestart }: TargetCardProps) {
    const [showDatePicker, setShowDatePicker] = useState(false);

    if (!target) return null;

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate && onRestart) {
            onRestart(target.id, selectedDate.getTime());
        }
    };

    return (
        <View style={[styles.card, isFailed && styles.cardFailed]}>
            <View style={styles.header}>
                <ThemedText style={[styles.title, isFailed && styles.titleFailed]}>
                    {isFailed ? "Failed Step" : "Your next small step"}
                </ThemedText>
                <TouchableOpacity onPress={() => onDismiss(target.id)} style={styles.iconButton}>
                    <IconSymbol name="xmark" size={16} color="#888" />
                </TouchableOpacity>
            </View>

            <ThemedText style={styles.targetText}>{target.text}</ThemedText>

            {isFailed ? (
                <View>
                    <TouchableOpacity
                        style={styles.restartButton}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <IconSymbol name="arrow.triangle.2.circlepath" size={20} color="#fff" />
                        <ThemedText style={styles.doneText}>Restart</ThemedText>
                    </TouchableOpacity>

                    {(showDatePicker || (Platform.OS === 'ios' && showDatePicker)) && (
                        <DateTimePicker
                            testID="dateTimePickerRestart"
                            value={new Date()}
                            mode="date"
                            is24Hour={true}
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={handleDateChange}
                            minimumDate={new Date()}
                        />
                    )}
                </View>
            ) : (
                <TouchableOpacity
                    style={styles.doneButton}
                    onPress={() => onComplete(target.id)}
                >
                    <IconSymbol name="checkmark.circle.fill" size={20} color="#fff" />
                    <ThemedText style={styles.doneText}>Mark Done</ThemedText>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'rgba(10, 126, 164, 0.1)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(10, 126, 164, 0.2)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 14,
        color: '#0a7ea4',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    iconButton: {
        padding: 4,
    },
    targetText: {
        fontSize: 18,
        marginBottom: 16,
    },
    doneButton: {
        backgroundColor: '#0a7ea4',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 12,
        gap: 8,
    },
    doneText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    cardFailed: {
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    titleFailed: {
        color: '#ef4444',
    },
    restartButton: {
        backgroundColor: '#ef4444',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 12,
        gap: 8,
    },
});
