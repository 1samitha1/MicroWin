import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppContext } from '@/contexts/AppContext';
import { Win } from '@/types';
import { format } from 'date-fns';
import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function TimelineScreen() {
    const { wins, removeWin, targets } = useAppContext();

    // Group wins by day
    const groupedWins = wins.reduce((acc, win) => {
        const dateKey = format(new Date(win.timestamp), 'yyyy-MM-dd');
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(win);
        return acc;
    }, {} as Record<string, Win[]>);

    const sections = Object.keys(groupedWins)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
        .map((date) => ({
            title: format(new Date(date), 'MMM d, yyyy'),
            data: groupedWins[date],
        }));

    const renderItem = ({ item }: { item: Win }) => {
        const linkedTarget = item.linkedTargetId
            ? targets.find(t => t.id === item.linkedTargetId)
            : null;

        return (
            <View style={styles.winCard}>
                <View style={styles.winHeader}>
                    <ThemedText style={styles.winText}>{item.text}</ThemedText>
                    <TouchableOpacity onPress={() => removeWin(item.id)}>
                        <IconSymbol name="trash" size={16} color="#ff4444" />
                    </TouchableOpacity>
                </View>
                <View style={styles.winFooter}>
                    <ThemedText style={styles.timeText}>
                        {format(new Date(item.timestamp), 'h:mm a')}
                    </ThemedText>
                    {item.category && (
                        <View style={styles.categoryBadge}>
                            <ThemedText style={styles.categoryText}>{item.category}</ThemedText>
                        </View>
                    )}
                </View>
                {linkedTarget && (
                    <View style={styles.linkedTarget}>
                        <IconSymbol name="arrow.triangle.branch" size={12} color="#888" />
                        <ThemedText style={styles.linkedTargetText}>
                            From target: {linkedTarget.text}
                        </ThemedText>
                    </View>
                )}
            </View>
        );
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <ThemedText type="title">Timeline</ThemedText>
                <ThemedText style={styles.subtitle}>Your progress, step by step.</ThemedText>
            </View>

            <FlatList
                data={sections}
                keyExtractor={(item) => item.title}
                renderItem={({ item }) => (
                    <View style={styles.section}>
                        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                            {item.title}
                        </ThemedText>
                        {item.data.map((win) => (
                            <React.Fragment key={win.id}>
                                {renderItem({ item: win })}
                            </React.Fragment>
                        ))}
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <ThemedText style={styles.emptyText}>No wins recorded yet.</ThemedText>
                    </View>
                }
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 24,
        backgroundColor: 'rgba(150, 150, 150, 0.05)',
    },
    subtitle: {
        opacity: 0.7,
        marginTop: 4,
    },
    section: {
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    sectionTitle: {
        marginBottom: 12,
        color: '#0a7ea4',
    },
    winCard: {
        backgroundColor: 'rgba(150, 150, 150, 0.1)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    winHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    winText: {
        fontSize: 16,
        flex: 1,
        marginRight: 12,
    },
    winFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    timeText: {
        fontSize: 12,
        opacity: 0.5,
    },
    categoryBadge: {
        backgroundColor: 'rgba(10, 126, 164, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    categoryText: {
        fontSize: 10,
        color: '#0a7ea4',
        fontWeight: '600',
    },
    linkedTarget: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(150, 150, 150, 0.2)',
    },
    linkedTargetText: {
        fontSize: 12,
        opacity: 0.6,
        fontStyle: 'italic',
    },
    emptyContainer: {
        padding: 48,
        alignItems: 'center',
    },
    emptyText: {
        opacity: 0.5,
    },
});
