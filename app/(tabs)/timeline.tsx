import { useAppContext } from '@/contexts/AppContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { format, formatDistanceToNow, isToday } from 'date-fns';
import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Tab = 'wins' | 'targets';

export default function TimelineScreen() {
    const { wins, targets, removeWin, removeTarget, completeTarget } = useAppContext();
    const [activeTab, setActiveTab] = useState<Tab>('wins');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const renderWins = () => {
        const todayWins = wins.filter(w => isToday(new Date(w.timestamp)));

        return (
            <View style={styles.listContainer}>
                <View style={styles.listHeader}>
                    <Text style={[styles.listTitle, isDark ? styles.darkText : styles.lightText]}>Completed</Text>
                    {todayWins.length > 0 && (
                        <View style={styles.badgeLabel}>
                            <Text style={styles.badgeText}>{todayWins.length} Today</Text>
                        </View>
                    )}
                </View>

                {wins.length === 0 ? (
                    <Text style={[styles.emptyText, isDark ? styles.darkSubText : styles.lightSubText]}>No wins recorded yet.</Text>
                ) : (
                    wins.map((win, index) => {
                        const linkedTarget = win.linkedTargetId ? targets.find(t => t.id === win.linkedTargetId) : null;
                        const defaultImages = [
                            'https://images.unsplash.com/photo-1543352632-5a4b24e4d2a6?q=80&w=200&auto=format&fit=crop',
                            'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=200&auto=format&fit=crop',
                            'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=200&auto=format&fit=crop'
                        ];

                        return (
                            <View key={win.id} style={[styles.winCard, isDark ? styles.darkCard : styles.lightCard]}>
                                <View style={styles.winCardContent}>
                                    <View style={styles.winCardTop}>
                                        <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                                        <Text style={[styles.winTimeLabel, isDark ? styles.greenSubText : styles.graySubText]}>
                                            {format(new Date(win.timestamp), 'h:mm a')}
                                        </Text>
                                    </View>
                                    <Text style={[styles.winCardTitle, isDark ? styles.darkText : styles.lightText]} numberOfLines={2}>
                                        {win.text}
                                    </Text>
                                    <Text style={[styles.winCardDesc, isDark ? styles.darkSubText : styles.lightSubText]} numberOfLines={2}>
                                        {linkedTarget ? `Target: ${linkedTarget.text}` : win.category ? `Category: ${win.category}` : 'Great job!'}
                                    </Text>

                                    <TouchableOpacity style={[styles.viewBtn, isDark ? styles.viewBtnDark : styles.viewBtnLight]} onPress={() => removeWin(win.id)}>
                                        <Text style={[styles.viewBtnText, isDark ? styles.darkText : styles.lightText]}>Remove</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })
                )}
            </View>
        );
    };

    const renderTargets = () => {
        const activeTargets = targets.filter(t => !t.completed);

        return (
            <View style={styles.listContainer}>
                <View style={styles.listHeader}>
                    <Text style={[styles.listTitle, isDark ? styles.darkText : styles.lightText]}>Active Targets</Text>
                </View>

                {activeTargets.length === 0 ? (
                    <Text style={[styles.emptyText, isDark ? styles.darkSubText : styles.lightSubText]}>No active targets.</Text>
                ) : (
                    activeTargets.map(target => (
                        <View key={target.id} style={[styles.targetCard, isDark ? styles.darkTransCard : styles.lightTargetCard]}>
                            <View style={styles.targetCardRow}>
                                <View style={{ flex: 1, paddingRight: 12 }}>
                                    <Text style={[styles.targetCardTitle, isDark ? styles.darkText : styles.lightText]}>{target.text}</Text>
                                    <Text style={[styles.targetCardDesc, isDark ? styles.darkSubText : styles.lightSubText]}>
                                        Deadline: {target.targetDate ? format(new Date(target.targetDate), 'MMM d, yyyy') : 'No date'}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    style={[styles.targetAddBtn, isDark ? styles.targetAddBtnDark : styles.targetAddBtnLight]}
                                    onPress={() => completeTarget(target.id, `Completed: ${target.text}`)}
                                >
                                    <Ionicons name="checkmark" size={24} color="#22c55e" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.targetTags}>
                                <View style={styles.targetTag}>
                                    <Ionicons name="time-outline" size={12} color={isDark ? '#9ca3af' : '#64748b'} />
                                    <Text style={[styles.targetTagText, isDark ? styles.darkSubText : styles.lightSubText]}>
                                        {formatDistanceToNow(new Date(target.createdAt))}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => removeTarget(target.id)}>
                                    <View style={[styles.targetTag, { marginLeft: 12 }]}>
                                        <Ionicons name="trash-outline" size={12} color="#ef4444" />
                                        <Text style={[styles.targetTagText, { color: '#ef4444' }]}>Delete</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </View>
        );
    };

    return (
        <View style={[styles.container, isDark ? styles.darkBg : styles.lightBg]}>
            {/* Header */}
            <View style={[styles.header, isDark ? styles.headerDark : styles.headerLight]}>
                <View style={[styles.avatar, isDark ? styles.avatarDarkBorder : styles.avatarLightBorder]}>
                    <Image source={{ uri: 'https://i.pravatar.cc/100?img=11' }} style={{ width: '100%', height: '100%', borderRadius: 20 }} />
                </View>
                <Text style={[styles.headerTitle, isDark ? styles.darkText : styles.lightText]}>MicroWin</Text>
                <TouchableOpacity style={styles.notificationBtn}>
                    <Ionicons name="notifications-outline" size={20} color={isDark ? '#f8fafc' : '#0f172a'} />
                </TouchableOpacity>
            </View>

            {/* Segmented Control */}
            <View style={[styles.navTabs, isDark ? styles.headerDark : styles.headerLight]}>
                <TouchableOpacity
                    style={[styles.tabBtn, activeTab === 'wins' && styles.tabBtnActive]}
                    onPress={() => setActiveTab('wins')}
                >
                    <Text style={[styles.tabText, activeTab === 'wins' ? styles.tabTextActive : (isDark ? styles.darkSubText : styles.lightSubText)]}>
                        Wins
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabBtn, activeTab === 'targets' && styles.tabBtnActive]}
                    onPress={() => setActiveTab('targets')}
                >
                    <Text style={[styles.tabText, activeTab === 'targets' ? styles.tabTextActive : (isDark ? styles.darkSubText : styles.lightSubText)]}>
                        Targets
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                contentContainerStyle={styles.scrollContent}
                data={[{ key: 'content' }]}
                renderItem={() => activeTab === 'wins' ? renderWins() : renderTargets()}
                showsVerticalScrollIndicator={false}
            />
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
    graySubText: { color: '#64748b' },
    greenSubText: { color: 'rgba(34, 197, 94, 0.7)' },

    headerLight: { backgroundColor: 'rgba(246, 248, 246, 0.8)', borderBottomColor: 'transparent' },
    headerDark: { backgroundColor: 'rgba(16, 34, 18, 0.8)', borderBottomColor: 'rgba(34, 197, 94, 0.2)' },

    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16, zIndex: 10,
    },
    avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
    avatarLightBorder: { borderColor: '#e2e8f0', backgroundColor: '#e2e8f0' },
    avatarDarkBorder: { borderColor: 'rgba(34, 197, 94, 0.2)', backgroundColor: 'rgba(34, 197, 94, 0.1)' },
    headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, letterSpacing: -0.5 },
    notificationBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },

    navTabs: { flexDirection: 'row', paddingHorizontal: 16, borderBottomWidth: 1 },
    tabBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderBottomWidth: 3, borderBottomColor: 'transparent' },
    tabBtnActive: { borderBottomColor: '#22c55e' },
    tabText: { fontFamily: 'Inter_700Bold', fontSize: 14, letterSpacing: 1 },
    tabTextActive: { color: '#22c55e' },

    scrollContent: { padding: 16, paddingBottom: 100 },
    listContainer: { gap: 16 },
    listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    listTitle: { fontFamily: 'Inter_700Bold', fontSize: 20, letterSpacing: -0.5 },
    badgeLabel: { backgroundColor: 'rgba(34, 197, 94, 0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    badgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#22c55e' },

    lightCard: { backgroundColor: '#ffffff', borderColor: '#f1f5f9' },
    darkCard: { backgroundColor: 'rgba(34, 197, 94, 0.05)', borderColor: 'rgba(34, 197, 94, 0.1)' },
    winCard: { flexDirection: 'row', borderRadius: 20, padding: 16, borderWidth: 1, gap: 16, marginBottom: 16 },
    winCardContent: { flex: 2, gap: 8 },
    winCardTop: { flexDirection: 'row', gap: 8, alignItems: 'center' },
    winTimeLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
    winCardTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, lineHeight: 22 },
    winCardDesc: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20 },
    viewBtn: { marginTop: 4, alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16 },
    viewBtnLight: { backgroundColor: '#f1f5f9' },
    viewBtnDark: { backgroundColor: 'rgba(34, 197, 94, 0.1)' },
    viewBtnText: { fontFamily: 'Inter_700Bold', fontSize: 10, textTransform: 'uppercase' },

    winCardImageContainer: { flex: 1, borderRadius: 12, overflow: 'hidden', minHeight: 100, backgroundColor: '#333' },
    winCardImage: { width: '100%', height: '100%', resizeMode: 'cover' },

    emptyText: { fontFamily: 'Inter_400Regular', fontSize: 14, textAlign: 'center', marginTop: 40, fontStyle: 'italic' },

    lightTargetCard: { backgroundColor: '#f1f5f9', borderColor: 'transparent' },
    darkTransCard: { backgroundColor: 'rgba(30, 41, 59, 0.4)', borderColor: 'transparent' },
    targetCard: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 12 },
    targetCardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    targetCardTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, marginBottom: 4 },
    targetCardDesc: { fontFamily: 'Inter_400Regular', fontSize: 14 },
    targetAddBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    targetAddBtnLight: { backgroundColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    targetAddBtnDark: { backgroundColor: '#1e293b', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 },
    targetTags: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
    targetTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    targetTagText: { fontFamily: 'Inter_700Bold', fontSize: 10, textTransform: 'uppercase' },
});
