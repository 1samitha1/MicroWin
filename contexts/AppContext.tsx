import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Target, User, Win } from '../types';
import { Storage } from '../utils/storage';

interface AppContextType {
    users: User[];
    currentUser: User | null;
    wins: Win[];
    targets: Target[];
    isLoading: boolean;
    login: (username: string, password?: string) => Promise<boolean>;
    register: (user: User) => Promise<boolean>;
    logout: () => Promise<void>;
    resetPassword: (username: string, newPassword?: string) => Promise<boolean>;
    addWin: (text: string, category?: string, linkedTargetId?: string) => Promise<void>;
    removeWin: (id: string) => Promise<void>;
    addTarget: (text: string, targetDate?: number) => Promise<void>;
    completeTarget: (id: string, winText?: string) => Promise<void>;
    editTarget: (id: string, text: string, targetDate?: number) => Promise<void>;
    removeTarget: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [allWins, setAllWins] = useState<Win[]>([]);
    const [allTargets, setAllTargets] = useState<Target[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            await Storage.performCleanup();
            const storedUsers = await Storage.getUsers();
            const storedCurrentUser = await Storage.getCurrentUser();
            const storedWins = await Storage.getWins();
            const storedTargets = await Storage.getTargets();

            setUsers(storedUsers);
            setCurrentUser(storedCurrentUser);
            setAllWins(storedWins);
            setAllTargets(storedTargets);
        } catch (e) {
            console.error('Failed to load data', e);
        } finally {
            setIsLoading(false);
        }
    };

    // Derived state for the current user
    const wins = currentUser ? allWins.filter((w) => w.userId === currentUser.id) : [];
    const targets = currentUser ? allTargets.filter((t) => t.userId === currentUser.id) : [];

    const login = async (username: string, password?: string) => {
        const foundUser = users.find(u => u.username === username && u.password === password);
        if (foundUser) {
            await Storage.saveCurrentUser(foundUser);
            setCurrentUser(foundUser);
            return true;
        }
        return false;
    };

    const register = async (newUser: User) => {
        if (users.find(u => u.username === newUser.username)) {
            return false; // Username exists
        }
        const updatedUsers = [...users, newUser];
        await Storage.saveUsers(updatedUsers);
        await Storage.saveCurrentUser(newUser);
        setUsers(updatedUsers);
        setCurrentUser(newUser);
        return true;
    };

    const resetPassword = async (username: string, newPassword?: string) => {
        const userIndex = users.findIndex(u => u.username === username);
        if (userIndex === -1) return false;

        const updatedUsers = [...users];
        updatedUsers[userIndex] = { ...updatedUsers[userIndex], password: newPassword };

        await Storage.saveUsers(updatedUsers);
        setUsers(updatedUsers);

        // If they are currently logged in with this account, update session
        if (currentUser?.id === updatedUsers[userIndex].id) {
            await Storage.saveCurrentUser(updatedUsers[userIndex]);
            setCurrentUser(updatedUsers[userIndex]);
        }
        return true;
    };

    const logout = async () => {
        await Storage.logoutUser();
        setCurrentUser(null);
    };

    const addWin = async (text: string, category?: string, linkedTargetId?: string) => {
        if (!currentUser) return;
        const newWin: Win = {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
            userId: currentUser.id,
            text,
            category,
            timestamp: Date.now(),
            linkedTargetId,
        };
        const updatedWins = [newWin, ...allWins];
        setAllWins(updatedWins);
        await Storage.saveWins(updatedWins);
    };

    const removeWin = async (id: string) => {
        const updatedWins = allWins.filter((w) => w.id !== id);
        setAllWins(updatedWins);
        await Storage.saveWins(updatedWins);
    };

    const addTarget = async (text: string, targetDate?: number) => {
        if (!currentUser) return;
        const newTarget: Target = {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
            userId: currentUser.id,
            text,
            createdAt: Date.now(),
            targetDate,
            completed: false,
        };
        const updatedTargets = [newTarget, ...allTargets];
        setAllTargets(updatedTargets);
        await Storage.saveTargets(updatedTargets);
    };

    const completeTarget = async (id: string, winText?: string) => {
        if (!currentUser) return;
        const target = allTargets.find((t) => t.id === id);
        if (!target) return;

        const updatedTargets = allTargets.map((t) => (t.id === id ? { ...t, completed: true } : t));
        setAllTargets(updatedTargets);
        await Storage.saveTargets(updatedTargets);

        await addWin(winText || `Completed: ${target.text}`, undefined, id);
    };

    const editTarget = async (id: string, text: string, targetDate?: number) => {
        const updatedTargets = allTargets.map((t) => (t.id === id ? { ...t, text, targetDate } : t));
        setAllTargets(updatedTargets);
        await Storage.saveTargets(updatedTargets);
    };

    const removeTarget = async (id: string) => {
        const updatedTargets = allTargets.filter((t) => t.id !== id);
        setAllTargets(updatedTargets);
        await Storage.saveTargets(updatedTargets);
    };

    return (
        <AppContext.Provider
            value={{
                users,
                currentUser,
                wins,
                targets,
                isLoading,
                login,
                register,
                logout,
                resetPassword,
                addWin,
                removeWin,
                addTarget,
                completeTarget,
                editTarget,
                removeTarget,
            }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
