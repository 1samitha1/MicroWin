import { AddTargetModal } from '@/components/AddTargetModal';
import { AddWinModal } from '@/components/AddWinModal';
import { TargetCard } from '@/components/TargetCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppContext } from '@/contexts/AppContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Target } from '@/types';
import { isSameWeek } from 'date-fns';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const { user, wins, targets, addWin, addTarget, editTarget, completeTarget, removeTarget, logout } = useAppContext();
  const [winModalVisible, setWinModalVisible] = useState(false);
  const [targetModalVisible, setTargetModalVisible] = useState(false);
  const [editingTarget, setEditingTarget] = useState<Target | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Weekly Reflection Logic
  const winsThisWeek = wins.filter(w => isSameWeek(new Date(w.timestamp), new Date()));
  const categoryCount = winsThisWeek.reduce((acc, win) => {
    if (win.category) acc[win.category] = (acc[win.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostWinsCategory = Object.keys(categoryCount).length > 0
    ? Object.keys(categoryCount).reduce((a, b) => categoryCount[a] > categoryCount[b] ? a : b)
    : null;

  // Target Logic
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day

  const activeTargets = targets.filter(t => !t.completed);

  const currentTargets = activeTargets.filter(t => {
    const tDate = t.targetDate ? new Date(t.targetDate) : new Date(t.createdAt);
    tDate.setHours(0, 0, 0, 0);
    return tDate.getTime() >= today.getTime();
  });

  const failedTargets = activeTargets.filter(t => {
    const tDate = t.targetDate ? new Date(t.targetDate) : new Date(t.createdAt);
    tDate.setHours(0, 0, 0, 0);
    return tDate.getTime() < today.getTime();
  });

  const handleSaveWin = async (text: string, category: string) => {
    await addWin(text, category);
  };

  const handleSaveTarget = async (text: string, targetDate?: number, id?: string) => {
    if (id) {
      // We are updating an existing target
      await editTarget(id, text, targetDate);
    } else {
      // Creating a brand new target
      await addTarget(text, targetDate);
    }
  };

  const handleEditTarget = (id: string) => {
    const target = targets.find(t => t.id === id);
    if (target) {
      setEditingTarget(target);
      setTargetModalVisible(true);
    }
  };

  const openNewTargetModal = () => {
    setEditingTarget(null);
    setTargetModalVisible(true);
  };

  const handleRestartTarget = async (id: string, newDate: number) => {
    // Find text to preserve it while updating date
    const target = targets.find(t => t.id === id);
    if (!target) return;

    // We are essentially updating the date, which can be done via editTarget 
    // Wait, editTarget in AppContext currently only updates text. Let's write a small workaround.
    removeTarget(id); // Remove old failed
    addTarget(target.text, newDate); // Re-add as new Active target
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <ThemedText style={styles.greeting}>Hello,</ThemedText>
            <ThemedText type="title" style={styles.name}>{user?.name || user?.username}</ThemedText>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <IconSymbol name="rectangle.portrait.and.arrow.right" size={16} color="#888" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>

        {/* Weekly Reflection Card */}
        <View style={styles.reflectionCard}>
          <ThemedText style={styles.reflectionTitle}>This Week's Progress</ThemedText>
          <ThemedText style={styles.reflectionStat}>
            You recorded <Text style={styles.highlight}>{winsThisWeek.length}</Text> wins.
          </ThemedText>
          {mostWinsCategory && (
            <ThemedText style={styles.reflectionSubstat}>
              Most wins were in <Text style={{ fontWeight: 'bold' }}>{mostWinsCategory}</Text>.
            </ThemedText>
          )}
        </View>

        {/* Active Targets */}
        {currentTargets.length > 0 && (
          <View style={styles.targetSection}>
            <ThemedText style={styles.sectionHeader}>Active Targets</ThemedText>
            {currentTargets.map(target => (
              <TargetCard
                key={target.id}
                target={target}
                onComplete={completeTarget}
                onDismiss={removeTarget}
                onEdit={handleEditTarget}
              />
            ))}
          </View>
        )}

        {/* Failed / Overdue Targets */}
        {failedTargets.length > 0 && (
          <View style={[styles.targetSection, { marginTop: 24 }]}>
            <ThemedText style={[styles.sectionHeader, { color: '#ef4444' }]}>Past Due</ThemedText>
            {failedTargets.map(target => (
              <TargetCard
                key={target.id}
                target={target}
                onComplete={completeTarget}
                onDismiss={removeTarget}
                onEdit={handleEditTarget}
                onRestart={handleRestartTarget}
              />
            ))}
          </View>
        )}

      </ScrollView>

      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[styles.fab, styles.fabSecondary, isDark && styles.fabSecondaryDark]}
          onPress={openNewTargetModal}
        >
          <IconSymbol name="target" size={32} color="#ffffff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.fab}
          onPress={() => setWinModalVisible(true)}
        >
          <Text style={styles.fabPlus}>+</Text>
        </TouchableOpacity>
      </View>

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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 100, // Space for FAB
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: {
    fontSize: 18,
    opacity: 0.7,
  },
  name: {
    fontSize: 32,
    color: '#0a7ea4',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    borderRadius: 20,
  },
  logoutText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
  },
  reflectionCard: {
    backgroundColor: 'rgba(150, 150, 150, 0.05)',
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
  },
  reflectionTitle: {
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.5,
    marginBottom: 12,
  },
  reflectionStat: {
    fontSize: 24,
    marginBottom: 4,
  },
  highlight: {
    color: '#0a7ea4',
    fontWeight: 'bold',
  },
  reflectionSubstat: {
    opacity: 0.7,
    marginTop: 8,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    opacity: 0.8,
  },
  targetSection: {
    marginTop: 8,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 40,
    right: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  fab: {
    backgroundColor: '#0a7ea4',
    width: 68,
    height: 68,
    borderRadius: 24, // modern squircle rather than perfect circle
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0a7ea4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  fabSecondary: {
    backgroundColor: '#0a7ea4', // Use same solid blue so it aligns perfectly with primary button
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  fabSecondaryDark: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
  },
  fabPlus: {
    color: 'white',
    fontSize: 40,
    fontWeight: '300',
    marginTop: -4, // optical alignment
  }
});
