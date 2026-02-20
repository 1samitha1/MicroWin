import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Target, User, Win } from '../types';
import { Storage } from '../utils/storage';

interface AppContextType {
    hasRegistered: boolean;
    user: User | null;
    wins: Win[];
    targets: Target[];
    isLoading: boolean;
    login: (user: User) => Promise<void>;
    register: (user: User) => Promise<void>;
    logout: () => Promise<void>;
    addWin: (text: string, category?: string, linkedTargetId?: string) => Promise<void>;
    removeWin: (id: string) => Promise<void>;
    addTarget: (text: string, targetDate?: number) => Promise<void>;
    completeTarget: (id: string, winText?: string) => Promise<void>;
    editTarget: (id: string, text: string) => Promise<void>;
    removeTarget: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [hasRegistered, setHasRegistered] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [wins, setWins] = useState<Win[]>([]);
    const [targets, setTargets] = useState<Target[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            await Storage.performCleanup();
            const storedHasReg = await Storage.getHasRegistered();
            const storedUser = await Storage.getUser();
            const storedWins = await Storage.getWins();
            const storedTargets = await Storage.getTargets();

            setHasRegistered(storedHasReg);
            setUser(storedUser);
            setWins(storedWins);
            setTargets(storedTargets);
        } catch (e) {
            console.error('Failed to load data', e);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (loggedInUser: User) => {
        const storedUser = await Storage.getUser();
        // If the username matches our local DB, load the full profile (which includes name)
        if (storedUser && storedUser.username === loggedInUser.username) {
            setUser(storedUser);
        } else {
            // Otherwise failover to just saving what we have
            await Storage.setHasRegistered();
            await Storage.saveUser(loggedInUser);
            setUser(loggedInUser);
        }
    };

    const register = async (newUser: User) => {
        await Storage.setHasRegistered();
        await Storage.saveUser(newUser);
        setHasRegistered(true);
        setUser(newUser);
    };

    const logout = async () => {
        await Storage.logoutUser();
        setUser(null);
    };

    const addWin = async (text: string, category?: string, linkedTargetId?: string) => {
        const newWin: Win = {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
            text,
            category,
            timestamp: Date.now(),
            linkedTargetId,
        };
        const updatedWins = [newWin, ...wins]; // latest first
        setWins(updatedWins);
        await Storage.saveWins(updatedWins);
    };

    const removeWin = async (id: string) => {
        const updatedWins = wins.filter((w) => w.id !== id);
        setWins(updatedWins);
        await Storage.saveWins(updatedWins);
    };

    const addTarget = async (text: string, targetDate?: number) => {
        const newTarget: Target = {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
            text,
            createdAt: Date.now(),
            targetDate,
            completed: false,
        };
        const updatedTargets = [newTarget, ...targets];
        setTargets(updatedTargets);
        await Storage.saveTargets(updatedTargets);
    };

    const completeTarget = async (id: string, winText?: string) => {
        const target = targets.find((t) => t.id === id);
        if (!target) return;

        // Mark completed
        const updatedTargets = targets.map((t) => (t.id === id ? { ...t, completed: true } : t));
        setTargets(updatedTargets);
        await Storage.saveTargets(updatedTargets);

        // Auto convert to win
        await addWin(winText || `Completed: ${target.text}`, undefined, id);
    };

    const editTarget = async (id: string, text: string) => {
        const updatedTargets = targets.map((t) => (t.id === id ? { ...t, text } : t));
        setTargets(updatedTargets);
        await Storage.saveTargets(updatedTargets);
    };

    const removeTarget = async (id: string) => {
        const updatedTargets = targets.filter((t) => t.id !== id);
        setTargets(updatedTargets);
        await Storage.saveTargets(updatedTargets);
    };

    return (
        <AppContext.Provider
            value={{
                hasRegistered,
                user,
                wins,
                targets,
                isLoading,
                login,
                register,
                logout,
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
