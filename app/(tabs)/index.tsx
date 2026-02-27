import { AddTargetModal } from '@/components/AddTargetModal';
import { AddWinModal } from '@/components/AddWinModal';
import { useAppContext } from '@/contexts/AppContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Target } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow, getHours, isSameWeek } from 'date-fns';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const { currentUser, wins, targets, addWin, addTarget, editTarget, logout } = useAppContext();
  const [winModalVisible, setWinModalVisible] = useState(false);
  const [targetModalVisible, setTargetModalVisible] = useState(false);
  const [editingTarget, setEditingTarget] = useState<Target | null>(null);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getGreeting = () => {
    const hour = getHours(new Date());
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Logic
  const winsThisWeek = wins.filter(w => isSameWeek(new Date(w.timestamp), new Date()));
  const recentWins = wins.slice(0, 5); // display top 5 on dash

  const handleSaveWin = async (text: string, category: string) => {
    await addWin(text, category);
  };

  const handleSaveTarget = async (text: string, targetDate?: number, id?: string) => {
    if (id) {
      await editTarget(id, text, targetDate);
    } else {
      await addTarget(text, targetDate);
    }
  };

  const openNewTargetModal = () => {
    setEditingTarget(null);
    setTargetModalVisible(true);
  };

  return (
    <View style={[styles.container, isDark ? styles.darkBg : styles.lightBg]}>
      {/* Header */}
      <View style={[styles.header, isDark ? styles.darkHeaderBg : styles.lightHeaderBg]}>
        <View style={[styles.avatarContainer, isDark ? styles.darkBorder : styles.lightBorder]}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/100?img=11' }}
            style={styles.avatar}
          />
        </View>
        <Text style={[styles.headerTitle, isDark ? styles.darkText : styles.lightText]}>MicroWin</Text>
        <TouchableOpacity style={styles.notificationBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#22c55e" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Greeting Section */}
        <View style={styles.greetingContainer}>
          <Text style={[styles.greetingText, isDark ? styles.darkText : styles.lightText]}>
            {getGreeting()}, {currentUser?.name?.split(' ')[0] || currentUser?.username}! 👋
          </Text>
        </View>

        {/* Weekly Progress Hero */}
        <View style={styles.heroSection}>
          <View style={[styles.heroCard, isDark ? styles.darkBorder : styles.lightBorder]}>
            <Text style={styles.heroLabel}>WEEKLY PROGRESS</Text>
            <Text style={[styles.heroStat, isDark ? styles.darkText : styles.lightText]}>
              {winsThisWeek.length} Wins
            </Text>
            <Text style={[styles.heroSubtext, isDark ? styles.darkSubText : styles.lightSubText]}>
              {winsThisWeek.length > 0 ? `You're doing great, ${currentUser?.name || currentUser?.username}!` : `Let's get started, ${currentUser?.name || currentUser?.username}!`}
            </Text>

            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${Math.min((winsThisWeek.length / 10) * 100, 100)}%` }]} />
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.primaryBtn]}
            activeOpacity={0.8}
            onPress={() => setWinModalVisible(true)}
          >
            <View style={styles.primaryIconBg}>
              <Ionicons name="add-circle" size={24} color={isDark ? "#102212" : "#ffffff"} />
            </View>
            <Text style={styles.primaryBtnText}>Add a Win</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, isDark ? styles.secondaryBtnDark : styles.secondaryBtnLight]}
            activeOpacity={0.8}
            onPress={openNewTargetModal}
          >
            <View style={styles.secondaryIconBg}>
              <Ionicons name="disc" size={24} color="#22c55e" />
            </View>
            <Text style={[styles.secondaryBtnText, isDark ? styles.textPrimary : styles.textDark]}>Add Target</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity Feed */}
        <View style={styles.activityFeed}>
          <View style={styles.activityHeader}>
            <Text style={[styles.activityTitle, isDark ? styles.darkText : styles.lightText]}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activityList}>
            {recentWins.map((win, index) => {
              const iconColors = [
                { bg: 'rgba(19, 236, 37, 0.2)', text: '#22c55e', icon: 'ribbon' },
                { bg: 'rgba(59, 130, 246, 0.2)', text: '#60a5fa', icon: 'body' },
                { bg: 'rgba(249, 115, 22, 0.2)', text: '#fb923c', icon: 'book' },
              ];
              const theme = iconColors[index % iconColors.length];

              const linkedTarget = win.linkedTargetId ? targets.find(t => t.id === win.linkedTargetId) : null;
              const subText = linkedTarget ? `Target: ${linkedTarget.text}` : win.category ? `Category: ${win.category}` : 'Small step forward.';

              let timeAgo = formatDistanceToNow(new Date(win.timestamp), { addSuffix: true }).toUpperCase();
              if (timeAgo.includes('ABOUT ')) timeAgo = timeAgo.replace('ABOUT ', '');

              return (
                <View key={win.id} style={[styles.activityCard, isDark ? styles.darkCard : styles.lightCard]}>
                  <View style={[styles.activityIconBox, { backgroundColor: theme.bg }]}>
                    <Ionicons name={theme.icon as any} size={20} color={theme.text} />
                  </View>
                  <View style={styles.activityContent}>
                    <View style={styles.activityRow}>
                      <Text style={[styles.activityWinText, isDark ? styles.darkText : styles.lightText]} numberOfLines={1}>
                        {win.text}
                      </Text>
                      <Text style={styles.activityTime}>{timeAgo}</Text>
                    </View>
                    <Text style={[styles.activitySubtext, isDark ? styles.darkSubText : styles.lightSubText]} numberOfLines={1}>
                      {subText}
                    </Text>
                  </View>
                </View>
              );
            })}

            {recentWins.length === 0 && (
              <Text style={[styles.emptyText, isDark ? styles.darkSubText : styles.lightSubText]}>
                No recent wins to show yet.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Modals remain functionally identical to old version */}
      <AddWinModal
        visible={winModalVisible}
        onClose={() => setWinModalVisible(false)}
        onSaveWin={handleSaveWin}
        onSaveTarget={handleSaveTarget}
      />

      <AddTargetModal
        visible={targetModalVisible}
        initialTarget={editingTarget}
        onClose={() => {
          setTargetModalVisible(false);
          setEditingTarget(null);
        }}
        onSaveTarget={handleSaveTarget}
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
  lightBorder: { borderColor: 'rgba(19, 236, 37, 0.1)' },
  darkBorder: { borderColor: 'rgba(19, 236, 37, 0.2)' },
  lightHeaderBg: { backgroundColor: '#f6f8f6' },
  darkHeaderBg: { backgroundColor: '#102212' },
  lightCard: { backgroundColor: '#ffffff', borderColor: '#e2e8f0' },
  darkCard: { backgroundColor: 'rgba(15, 23, 42, 0.5)', borderColor: 'rgba(19, 236, 37, 0.1)' },

  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: 'rgba(19, 236, 37, 0.1)'
  },
  avatarContainer: {
    width: 40, height: 40, borderRadius: 20, borderWidth: 1, overflow: 'hidden'
  },
  avatar: { width: '100%', height: '100%' },
  headerTitle: { flex: 1, textAlign: 'center', fontFamily: 'Inter_700Bold', fontSize: 18, letterSpacing: -0.5 },
  notificationBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(19, 236, 37, 0.1)', alignItems: 'center', justifyContent: 'center' },

  scrollContent: { paddingBottom: 100 },

  greetingContainer: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 },
  greetingText: { fontFamily: 'Inter_700Bold', fontSize: 24, letterSpacing: -0.5 },

  heroSection: { paddingHorizontal: 16, paddingVertical: 16 },
  heroCard: {
    backgroundColor: 'rgba(19, 236, 37, 0.1)', padding: 24, borderRadius: 24, borderWidth: 1,
    alignItems: 'center'
  },
  heroLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#22c55e', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' },
  heroStat: { fontFamily: 'Inter_700Bold', fontSize: 36, letterSpacing: -1, marginBottom: 4 },
  heroSubtext: { fontFamily: 'Inter_400Regular', fontSize: 14 },
  progressBarBg: { width: '100%', height: 8, backgroundColor: 'rgba(19, 236, 37, 0.2)', borderRadius: 4, marginTop: 16, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#22c55e', borderRadius: 4 },

  quickActions: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 16, gap: 16 },
  actionBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 24, borderRadius: 24 },
  primaryBtn: { backgroundColor: '#22c55e', shadowColor: '#22c55e', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  secondaryBtnLight: { backgroundColor: '#e2e8f0', borderWidth: 1, borderColor: 'rgba(34, 197, 94, 0.3)' },
  secondaryBtnDark: { backgroundColor: 'rgba(34, 197, 94, 0.15)', borderWidth: 1, borderColor: 'rgba(34, 197, 94, 0.3)' },
  primaryIconBg: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255, 255, 255, 0.2)', alignItems: 'center', justifyContent: 'center' },
  secondaryIconBg: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(34, 197, 94, 0.2)', alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { fontFamily: 'Inter_700Bold', color: '#102212' },
  secondaryBtnText: { fontFamily: 'Inter_700Bold' },
  textPrimary: { color: '#22c55e' },
  textDark: { color: '#0f172a' },

  activityFeed: { flex: 1, paddingHorizontal: 16, paddingBottom: 24 },
  activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  activityTitle: { fontFamily: 'Inter_700Bold', fontSize: 20, letterSpacing: -0.5 },
  seeAllText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#22c55e' },

  activityList: { gap: 16 },
  activityCard: { flexDirection: 'row', padding: 16, borderRadius: 20, borderWidth: 1, alignItems: 'flex-start', gap: 16 },
  activityIconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  activityContent: { flex: 1 },
  activityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  activityWinText: { fontFamily: 'Inter_700Bold', fontSize: 16, flex: 1, marginRight: 8 },
  activityTime: { fontFamily: 'Inter_500Medium', fontSize: 10, color: '#64748b', marginTop: 2 },
  activitySubtext: { fontFamily: 'Inter_400Regular', fontSize: 14 },

  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 14, textAlign: 'center', marginTop: 24, fontStyle: 'italic' },
});
