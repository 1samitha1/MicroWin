import AsyncStorage from '@react-native-async-storage/async-storage';
import { isBefore, subMonths, subWeeks } from 'date-fns';
import { Target, User, Win } from '../types';

const KEYS = {
    USERS: 'microwin_users',
    CURRENT_USER: 'microwin_current_user',
    WINS: 'microwin_wins',
    TARGETS: 'microwin_targets',
};

export const Storage = {
    // Has Registered Flag
    // Users list
    async getUsers(): Promise<User[]> {
        try {
            const data = await AsyncStorage.getItem(KEYS.USERS);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    },
    async saveUsers(users: User[]): Promise<void> {
        await AsyncStorage.setItem(KEYS.USERS, JSON.stringify(users));
    },

    // Current Session
    async getCurrentUser(): Promise<User | null> {
        try {
            const data = await AsyncStorage.getItem(KEYS.CURRENT_USER);
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    },
    async saveCurrentUser(user: User): Promise<void> {
        await AsyncStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    },
    async logoutUser(): Promise<void> {
        await AsyncStorage.removeItem(KEYS.CURRENT_USER);
    },

    // Wins
    async getWins(): Promise<Win[]> {
        try {
            const data = await AsyncStorage.getItem(KEYS.WINS);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    },
    async saveWins(wins: Win[]): Promise<void> {
        await AsyncStorage.setItem(KEYS.WINS, JSON.stringify(wins));
    },

    // Targets
    async getTargets(): Promise<Target[]> {
        try {
            const data = await AsyncStorage.getItem(KEYS.TARGETS);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    },
    async saveTargets(targets: Target[]): Promise<void> {
        await AsyncStorage.setItem(KEYS.TARGETS, JSON.stringify(targets));
    },

    // Cleanup old data
    async performCleanup(): Promise<void> {
        try {
            const wins = await this.getWins();
            const targets = await this.getTargets();

            const now = new Date();
            const oneMonthAgo = subMonths(now, 1);
            const oneWeekAgo = subWeeks(now, 1);

            // Keep wins from THIS month
            const validWins = wins.filter((win) => isBefore(oneMonthAgo, new Date(win.timestamp)));

            // Keep targets that are NOT older than a week from their targetDate (or createdAt)
            const validTargets = targets.filter((target) => {
                const referenceDate = target.targetDate ? new Date(target.targetDate) : new Date(target.createdAt);
                return isBefore(oneWeekAgo, referenceDate);
            });

            if (wins.length !== validWins.length) {
                await this.saveWins(validWins);
            }
            if (targets.length !== validTargets.length) {
                await this.saveTargets(validTargets);
            }
        } catch (e) {
            console.error('Failed to cleanup storage', e);
        }
    },
};
