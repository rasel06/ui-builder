import type { DensityConfig, DensityType, ThemeConfig } from '../types/module';

export const PREBUILT_THEMES: Record<string, ThemeConfig> = {
    default: {
        name: 'Gray',
        cardBackground: 'bg-white dark:bg-tc-900 theme-gray',
        cardBorder: 'border-tc-200 dark:border-tc-800 theme-gray',
        headerBackground: 'bg-tc-50 dark:bg-tc-950 theme-gray',
        headerText: 'text-tc-900 dark:text-tc-100 theme-gray',
        primaryButton: 'bg-tc-600 hover:bg-tc-700 text-white theme-gray',
        secondaryButton:
            'bg-tc-100 hover:bg-tc-200 text-tc-900 dark:bg-tc-900 dark:hover:bg-tc-800 dark:text-tc-100 theme-gray',
        inputBackground: 'bg-white dark:bg-tc-800 theme-gray',
        inputBorder: 'border-tc-300 dark:border-tc-700 theme-gray',
        inputText: 'text-tc-900 dark:text-tc-100 theme-gray',
        paginationButton:
            'border-tc-300 dark:border-tc-700 hover:bg-tc-50 dark:hover:bg-tc-950 theme-gray',
        paginationActiveButton:
            'bg-tc-600 text-white border-tc-600 hover:bg-tc-700 theme-gray',
        paginationText: 'text-tc-700 dark:text-tc-300 theme-gray',
        badgeBackground: 'bg-tc-100 dark:bg-tc-900 theme-gray',
        badgeText: 'text-tc-800 dark:text-tc-200 theme-gray',
        tableBackground: 'bg-white dark:bg-tc-900 theme-gray',
        tableBorder: 'border-tc-200 dark:border-tc-800 theme-gray',
        tableHeaderBackground: 'bg-tc-50 dark:bg-tc-950 theme-gray',
        tableHeaderText: 'text-tc-900 dark:text-tc-100 theme-gray',
        tableRowHover: 'hover:bg-tc-50 dark:hover:bg-tc-950/50 theme-gray',
        tableRowSelected: 'bg-tc-50 dark:bg-tc-950/30 theme-gray',
        tableRowBorder: 'border-tc-100 dark:border-tc-900 theme-gray',
        tableTextPrimary: 'text-tc-900 dark:text-tc-100 theme-gray',
        tableTextSecondary: 'text-tc-700 dark:text-tc-300 theme-gray',
        tableToolbarBackground: 'bg-tc-50 dark:bg-tc-950 theme-gray',
        tableToolbarBorder: 'border-tc-200 dark:border-tc-800 theme-gray',
        tableToolbarText: 'text-tc-700 dark:text-tc-300 theme-gray',
        tableToolbarSeparator: 'bg-tc-300 dark:bg-tc-600 theme-gray',
        tableIconActive: 'text-tc-600 dark:text-tc-400 theme-gray',
        tableIconInactive: 'text-gray-500 dark:text-gray-400 theme-gray',
        tableMenuBackground: 'bg-white dark:bg-tc-950 theme-gray',
        tableMenuBorder: 'border-tc-200 dark:border-tc-800 theme-gray',
        tableMenuText: 'text-tc-900 dark:text-tc-100 theme-gray',
        loadingText: 'text-blue-700 dark:text-blue-400',
        checkbox: '!text-blue-600 focus:ring-blue-500',
    },
    blue: {
        name: 'Blue',
        cardBackground: 'bg-white dark:bg-neutral-900',
        cardBorder: 'border-tc-200 dark:border-white/10 theme-blue',
        headerBackground: 'bg-tc-50 dark:bg-neutral-800 theme-blue',
        headerText: 'text-tc-900 dark:text-neutral-100 theme-blue',
        primaryButton: 'bg-tc-600 hover:bg-tc-700 text-white theme-blue',
        secondaryButton:
            'bg-tc-100 hover:bg-tc-200 text-tc-900 dark:bg-white/5 dark:hover:bg-white/10 dark:text-neutral-100 theme-blue',
        inputBackground: 'bg-white dark:bg-neutral-950',
        inputBorder: 'border-tc-300 dark:border-white/15 theme-blue',
        inputText: 'text-gray-900 dark:text-neutral-100',
        paginationButton:
            'border-tc-300 hover:bg-tc-50 dark:border-white/10 dark:hover:bg-white/5 theme-blue',
        paginationActiveButton:
            'bg-tc-600 text-white border-tc-600 hover:bg-tc-700 theme-blue',
        paginationText: 'text-tc-700 dark:text-neutral-300 theme-blue',
        badgeBackground: 'bg-tc-100 dark:bg-tc-500/15 theme-blue',
        badgeText: 'text-tc-800 dark:text-tc-300 theme-blue',
        tableBackground: 'bg-white dark:bg-neutral-900',
        tableBorder: 'border-tc-200 dark:border-white/10 theme-blue',
        tableHeaderBackground: 'bg-tc-50 dark:bg-neutral-800 theme-blue',
        tableHeaderText: 'text-tc-900 dark:text-neutral-200 theme-blue',
        tableRowHover: 'hover:bg-tc-50 dark:hover:bg-white/5 theme-blue',
        tableRowSelected: 'bg-tc-50 dark:bg-tc-500/10 theme-blue',
        tableRowBorder: 'border-tc-100 dark:border-white/5 theme-blue',
        tableTextPrimary: 'text-gray-900 dark:text-neutral-100',
        tableTextSecondary: 'text-tc-700 dark:text-neutral-400 theme-blue',
        tableToolbarBackground: 'bg-tc-50 dark:bg-neutral-900 theme-blue',
        tableToolbarBorder: 'border-tc-200 dark:border-white/10 theme-blue',
        tableToolbarText: 'text-tc-700 dark:text-neutral-300 theme-blue',
        tableToolbarSeparator: 'bg-tc-200 dark:bg-white/10 theme-blue',
        tableIconActive: 'text-tc-600 dark:text-tc-400 theme-blue',
        tableIconInactive: 'text-gray-500 dark:text-neutral-400',
        tableMenuBackground: 'bg-white/95 backdrop-blur-md dark:bg-neutral-900/95',
        tableMenuBorder: 'border-tc-200 dark:border-white/10 theme-blue',
        tableMenuText: 'text-tc-900 dark:text-neutral-100 theme-blue',
        loadingText: 'text-tc-700 dark:text-tc-400 theme-blue',
        checkbox: '!text-tc-600 focus:ring-tc-500 theme-blue',
    },
    green: {
        name: 'Green',
        cardBackground: 'bg-white dark:bg-neutral-900',
        cardBorder: 'border-tc-200 dark:border-white/10 theme-emerald',
        headerBackground: 'bg-tc-50 dark:bg-neutral-800 theme-emerald',
        headerText: 'text-tc-900 dark:text-neutral-100 theme-emerald',
        primaryButton: 'bg-tc-600 hover:bg-tc-700 text-white theme-emerald',
        secondaryButton:
            'bg-tc-100 hover:bg-tc-200 text-tc-900 dark:bg-white/5 dark:hover:bg-white/10 dark:text-neutral-100 theme-emerald',
        inputBackground: 'bg-white dark:bg-neutral-950',
        inputBorder: 'border-tc-300 dark:border-white/15 theme-emerald',
        inputText: 'text-gray-900 dark:text-neutral-100',
        paginationButton:
            'border-tc-300 hover:bg-tc-50 dark:border-white/10 dark:hover:bg-white/5 theme-emerald',
        paginationActiveButton:
            'bg-tc-600 text-white border-tc-600 hover:bg-tc-700 theme-emerald',
        paginationText: 'text-tc-700 dark:text-neutral-300 theme-emerald',
        badgeBackground: 'bg-tc-100 dark:bg-tc-500/15 theme-emerald',
        badgeText: 'text-tc-800 dark:text-tc-300 theme-emerald',
        tableBackground: 'bg-white dark:bg-neutral-900',
        tableBorder: 'border-tc-200 dark:border-white/10 theme-emerald',
        tableHeaderBackground: 'bg-tc-50 dark:bg-neutral-800 theme-emerald',
        tableHeaderText: 'text-tc-900 dark:text-neutral-200 theme-emerald',
        tableRowHover: 'hover:bg-tc-50 dark:hover:bg-white/5 theme-emerald',
        tableRowSelected: 'bg-tc-50 dark:bg-tc-500/10 theme-emerald',
        tableRowBorder: 'border-tc-100 dark:border-white/5 theme-emerald',
        tableTextPrimary: 'text-gray-900 dark:text-neutral-100',
        tableTextSecondary: 'text-tc-700 dark:text-neutral-400 theme-emerald',
        tableToolbarBackground: 'bg-tc-50 dark:bg-neutral-900 theme-emerald',
        tableToolbarBorder: 'border-tc-200 dark:border-white/10 theme-emerald',
        tableToolbarText: 'text-tc-700 dark:text-neutral-300 theme-emerald',
        tableToolbarSeparator: 'bg-tc-200 dark:bg-white/10 theme-emerald',
        tableIconActive: 'text-tc-600 dark:text-tc-400 theme-emerald',
        tableIconInactive: 'text-gray-500 dark:text-neutral-400',
        tableMenuBackground:
            'bg-tc-50/95 backdrop-blur-md dark:bg-neutral-900/95 theme-emerald',
        tableMenuBorder: 'border-tc-200 dark:border-white/10 theme-emerald',
        tableMenuText: 'text-tc-900 dark:text-neutral-100 theme-emerald',
        loadingText: 'text-tc-700 dark:text-tc-400 theme-emerald',
        checkbox: '!text-tc-600 focus:ring-tc-500 theme-emerald',
    },
    purple: {
        name: 'Purple',
        cardBackground: 'bg-white dark:bg-neutral-900',
        cardBorder: 'border-tc-200 dark:border-white/10 theme-purple',
        headerBackground: 'bg-tc-50 dark:bg-neutral-800 theme-purple',
        headerText: 'text-tc-900 dark:text-neutral-100 theme-purple',
        primaryButton: 'bg-tc-600 hover:bg-tc-700 text-white theme-purple',
        secondaryButton:
            'bg-tc-100 hover:bg-tc-200 text-tc-900 dark:bg-white/5 dark:hover:bg-white/10 dark:text-neutral-100 theme-purple',
        inputBackground: 'bg-white dark:bg-neutral-950',
        inputBorder: 'border-tc-300 dark:border-white/15 theme-purple',
        inputText: 'text-gray-900 dark:text-neutral-100',
        paginationButton:
            'border-tc-300 hover:bg-tc-50 dark:border-white/10 dark:hover:bg-white/5 theme-purple',
        paginationActiveButton:
            'bg-tc-600 text-white border-tc-600 hover:bg-tc-700 theme-purple',
        paginationText: 'text-tc-700 dark:text-neutral-300 theme-purple',
        badgeBackground: 'bg-tc-100 dark:bg-tc-500/15 theme-purple',
        badgeText: 'text-tc-800 dark:text-tc-300 theme-purple',
        tableBackground: 'bg-white dark:bg-neutral-900',
        tableBorder: 'border-tc-200 dark:border-white/10 theme-purple',
        tableHeaderBackground: 'bg-tc-50 dark:bg-neutral-800 theme-purple',
        tableHeaderText: 'text-tc-900 dark:text-neutral-200 theme-purple',
        tableRowHover: 'hover:bg-tc-50 dark:hover:bg-white/5 theme-purple',
        tableRowSelected: 'bg-tc-50 dark:bg-tc-500/10 theme-purple',
        tableRowBorder: 'border-tc-100 dark:border-white/5 theme-purple',
        tableTextPrimary: 'text-gray-900 dark:text-neutral-100',
        tableTextSecondary: 'text-tc-700 dark:text-neutral-400 theme-purple',
        tableToolbarBackground: 'bg-tc-50 dark:bg-neutral-900 theme-purple',
        tableToolbarBorder: 'border-tc-200 dark:border-white/10 theme-purple',
        tableToolbarText: 'text-tc-700 dark:text-neutral-300 theme-purple',
        tableToolbarSeparator: 'bg-tc-200 dark:bg-white/10 theme-purple',
        tableIconActive: 'text-tc-600 dark:text-tc-400 theme-purple',
        tableIconInactive: 'text-gray-500 dark:text-neutral-400',
        tableMenuBackground:
            'bg-tc-50/95 backdrop-blur-md dark:bg-neutral-900/95 theme-purple',
        tableMenuBorder: 'border-tc-200 dark:border-white/10 theme-purple',
        tableMenuText: 'text-tc-900 dark:text-neutral-100 theme-purple',
        loadingText: 'text-tc-700 dark:text-tc-400 theme-purple',
        checkbox: '!text-tc-600 focus:ring-tc-500 theme-purple',
    },
    red: {
        name: 'Red',
        cardBackground: 'bg-white dark:bg-neutral-900',
        cardBorder: 'border-tc-200 dark:border-white/10 theme-red',
        headerBackground: 'bg-tc-50 dark:bg-neutral-800 theme-red',
        headerText: 'text-tc-900 dark:text-neutral-100 theme-red',
        primaryButton: 'bg-tc-600 hover:bg-tc-700 text-white theme-red',
        secondaryButton:
            'bg-tc-100 hover:bg-tc-200 text-tc-900 dark:bg-white/5 dark:hover:bg-white/10 dark:text-neutral-100 theme-red',
        inputBackground: 'bg-white dark:bg-neutral-950',
        inputBorder: 'border-tc-300 dark:border-white/15 theme-red',
        inputText: 'text-gray-900 dark:text-neutral-100',
        paginationButton:
            'border-tc-300 hover:bg-tc-50 dark:border-white/10 dark:hover:bg-white/5 theme-red',
        paginationActiveButton:
            'bg-tc-600 text-white border-tc-600 hover:bg-tc-700 theme-red',
        paginationText: 'text-tc-700 dark:text-neutral-300 theme-red',
        badgeBackground: 'bg-tc-100 dark:bg-tc-500/15 theme-red',
        badgeText: 'text-tc-800 dark:text-tc-300 theme-red',
        tableBackground: 'bg-white dark:bg-neutral-900',
        tableBorder: 'border-tc-200 dark:border-white/10 theme-red',
        tableHeaderBackground: 'bg-tc-50 dark:bg-neutral-800 theme-red',
        tableHeaderText: 'text-tc-900 dark:text-neutral-200 theme-red',
        tableRowHover: 'hover:bg-tc-50 dark:hover:bg-white/5 theme-red',
        tableRowSelected: 'bg-tc-50 dark:bg-tc-500/10 theme-red',
        tableRowBorder: 'border-tc-100 dark:border-white/5 theme-red',
        tableTextPrimary: 'text-gray-900 dark:text-neutral-100',
        tableTextSecondary: 'text-tc-700 dark:text-neutral-400 theme-red',
        tableToolbarBackground: 'bg-tc-50 dark:bg-neutral-900 theme-red',
        tableToolbarBorder: 'border-tc-200 dark:border-white/10 theme-red',
        tableToolbarText: 'text-tc-700 dark:text-neutral-300 theme-red',
        tableToolbarSeparator: 'bg-tc-200 dark:bg-white/10 theme-red',
        tableIconActive: 'text-tc-600 dark:text-tc-400 theme-red',
        tableIconInactive: 'text-gray-500 dark:text-neutral-400',
        tableMenuBackground: 'bg-tc-50/95 backdrop-blur-md dark:bg-neutral-900/95 theme-red',
        tableMenuBorder: 'border-tc-200 dark:border-white/10 theme-red',
        tableMenuText: 'text-tc-900 dark:text-neutral-100 theme-red',
        loadingText: 'text-tc-700 dark:text-tc-400 theme-red',
        checkbox: '!text-tc-600 focus:ring-tc-500 theme-red',
    },
    orange: {
        name: 'Orange',
        cardBackground: 'bg-white dark:bg-neutral-900',
        cardBorder: 'border-tc-200 dark:border-white/10 theme-orange',
        headerBackground: 'bg-tc-50 dark:bg-neutral-800 theme-orange',
        headerText: 'text-tc-900 dark:text-neutral-100 theme-orange',
        primaryButton: 'bg-tc-600 hover:bg-tc-700 text-white theme-orange',
        secondaryButton:
            'bg-tc-100 hover:bg-tc-200 text-tc-900 dark:bg-white/5 dark:hover:bg-white/10 dark:text-neutral-100 theme-orange',
        inputBackground: 'bg-white dark:bg-neutral-950',
        inputBorder: 'border-tc-300 dark:border-white/15 theme-orange',
        inputText: 'text-gray-900 dark:text-neutral-100',
        paginationButton:
            'border-tc-300 hover:bg-tc-50 dark:border-white/10 dark:hover:bg-white/5 theme-orange',
        paginationActiveButton:
            'bg-tc-600 text-white border-tc-600 hover:bg-tc-700 theme-orange',
        paginationText: 'text-tc-700 dark:text-neutral-300 theme-orange',
        badgeBackground: 'bg-tc-100 dark:bg-tc-500/15 theme-orange',
        badgeText: 'text-tc-800 dark:text-tc-300 theme-orange',
        tableBackground: 'bg-white dark:bg-neutral-900',
        tableBorder: 'border-tc-200 dark:border-white/10 theme-orange',
        tableHeaderBackground: 'bg-tc-50 dark:bg-neutral-800 theme-orange',
        tableHeaderText: 'text-tc-900 dark:text-neutral-200 theme-orange',
        tableRowHover: 'hover:bg-tc-50 dark:hover:bg-white/5 theme-orange',
        tableRowSelected: 'bg-tc-50 dark:bg-tc-500/10 theme-orange',
        tableRowBorder: 'border-tc-100 dark:border-white/5 theme-orange',
        tableTextPrimary: 'text-gray-900 dark:text-neutral-100',
        tableTextSecondary: 'text-tc-700 dark:text-neutral-400 theme-orange',
        tableToolbarBackground: 'bg-tc-50 dark:bg-neutral-900 theme-orange',
        tableToolbarBorder: 'border-tc-200 dark:border-white/10 theme-orange',
        tableToolbarText: 'text-tc-700 dark:text-neutral-300 theme-orange',
        tableToolbarSeparator: 'bg-tc-200 dark:bg-white/10 theme-orange',
        tableIconActive: 'text-tc-600 dark:text-tc-400 theme-orange',
        tableIconInactive: 'text-gray-500 dark:text-neutral-400',
        tableMenuBackground:
            'bg-tc-50/95 backdrop-blur-md dark:bg-neutral-900/95 theme-orange',
        tableMenuBorder: 'border-tc-200 dark:border-white/10 theme-orange',
        tableMenuText: 'text-tc-900 dark:text-neutral-100 theme-orange',
        loadingText: 'text-tc-700 dark:text-tc-400 theme-orange',
        checkbox: '!text-tc-600 focus:ring-tc-500 theme-orange',
    },
    yellow: {
        name: 'Yellow',
        cardBackground: 'bg-white dark:bg-neutral-900',
        cardBorder: 'border-tc-200 dark:border-white/10 theme-yellow',
        headerBackground: 'bg-tc-50 dark:bg-neutral-800 theme-yellow',
        headerText: 'text-tc-900 dark:text-neutral-100 theme-yellow',
        primaryButton: 'bg-tc-600 hover:bg-tc-700 text-white theme-yellow',
        secondaryButton:
            'bg-tc-100 hover:bg-tc-200 text-tc-900 dark:bg-white/5 dark:hover:bg-white/10 dark:text-neutral-100 theme-yellow',
        inputBackground: 'bg-white dark:bg-neutral-950',
        inputBorder: 'border-tc-300 dark:border-white/15 theme-yellow',
        inputText: 'text-gray-900 dark:text-neutral-100',
        paginationButton:
            'border-tc-300 hover:bg-tc-50 dark:border-white/10 dark:hover:bg-white/5 theme-yellow',
        paginationActiveButton:
            'bg-tc-600 text-white border-tc-600 hover:bg-tc-700 theme-yellow',
        paginationText: 'text-tc-700 dark:text-neutral-300 theme-yellow',
        badgeBackground: 'bg-tc-100 dark:bg-tc-500/15 theme-yellow',
        badgeText: 'text-tc-800 dark:text-tc-300 theme-yellow',
        tableBackground: 'bg-white dark:bg-neutral-900',
        tableBorder: 'border-tc-200 dark:border-white/10 theme-yellow',
        tableHeaderBackground: 'bg-tc-50 dark:bg-neutral-800 theme-yellow',
        tableHeaderText: 'text-tc-900 dark:text-neutral-200 theme-yellow',
        tableRowHover: 'hover:bg-tc-50 dark:hover:bg-white/5 theme-yellow',
        tableRowSelected: 'bg-tc-50 dark:bg-tc-500/10 theme-yellow',
        tableRowBorder: 'border-tc-100 dark:border-white/5 theme-yellow',
        tableTextPrimary: 'text-gray-900 dark:text-neutral-100',
        tableTextSecondary: 'text-tc-700 dark:text-neutral-400 theme-yellow',
        tableToolbarBackground: 'bg-tc-50 dark:bg-neutral-900 theme-yellow',
        tableToolbarBorder: 'border-tc-200 dark:border-white/10 theme-yellow',
        tableToolbarText: 'text-tc-700 dark:text-neutral-300 theme-yellow',
        tableToolbarSeparator: 'bg-tc-200 dark:bg-white/10 theme-yellow',
        tableIconActive: 'text-tc-600 dark:text-tc-400 theme-yellow',
        tableIconInactive: 'text-gray-500 dark:text-neutral-400',
        tableMenuBackground:
            'bg-tc-50/95 backdrop-blur-md dark:bg-neutral-900/95 theme-yellow',
        tableMenuBorder: 'border-tc-200 dark:border-white/10 theme-yellow',
        tableMenuText: 'text-tc-900 dark:text-neutral-100 theme-yellow',
        loadingText: 'text-tc-700 dark:text-tc-400 theme-yellow',
        checkbox: '!text-tc-600 focus:ring-tc-500 theme-yellow',
    },
    teal: {
        name: 'Teal',
        cardBackground: 'bg-white dark:bg-neutral-900',
        cardBorder: 'border-tc-200 dark:border-white/10 theme-teal',
        headerBackground: 'bg-tc-50 dark:bg-neutral-800 theme-teal',
        headerText: 'text-tc-900 dark:text-neutral-100 theme-teal',
        primaryButton: 'bg-tc-600 hover:bg-tc-700 text-white theme-teal',
        secondaryButton:
            'bg-tc-100 hover:bg-tc-200 text-tc-900 dark:bg-white/5 dark:hover:bg-white/10 dark:text-neutral-100 theme-teal',
        inputBackground: 'bg-white dark:bg-neutral-950',
        inputBorder: 'border-tc-300 dark:border-white/15 theme-teal',
        inputText: 'text-gray-900 dark:text-neutral-100',
        paginationButton:
            'border-tc-300 hover:bg-tc-50 dark:border-white/10 dark:hover:bg-white/5 theme-teal',
        paginationActiveButton:
            'bg-tc-600 text-white border-tc-600 hover:bg-tc-700 theme-teal',
        paginationText: 'text-tc-700 dark:text-neutral-300 theme-teal',
        badgeBackground: 'bg-tc-100 dark:bg-tc-500/15 theme-teal',
        badgeText: 'text-tc-800 dark:text-tc-300 theme-teal',
        tableBackground: 'bg-white dark:bg-neutral-900',
        tableBorder: 'border-tc-200 dark:border-white/10 theme-teal',
        tableHeaderBackground: 'bg-tc-50 dark:bg-neutral-800 theme-teal',
        tableHeaderText: 'text-tc-900 dark:text-neutral-200 theme-teal',
        tableRowHover: 'hover:bg-tc-50 dark:hover:bg-white/5 theme-teal',
        tableRowSelected: 'bg-tc-50 dark:bg-tc-500/10 theme-teal',
        tableRowBorder: 'border-tc-100 dark:border-white/5 theme-teal',
        tableTextPrimary: 'text-gray-900 dark:text-neutral-100',
        tableTextSecondary: 'text-tc-700 dark:text-neutral-400 theme-teal',
        tableToolbarBackground: 'bg-tc-50 dark:bg-neutral-900 theme-teal',
        tableToolbarBorder: 'border-tc-200 dark:border-white/10 theme-teal',
        tableToolbarText: 'text-tc-700 dark:text-neutral-300 theme-teal',
        tableToolbarSeparator: 'bg-tc-200 dark:bg-white/10 theme-teal',
        tableIconActive: 'text-tc-600 dark:text-tc-400 theme-teal',
        tableIconInactive: 'text-gray-500 dark:text-neutral-400',
        tableMenuBackground:
            'bg-tc-50/95 backdrop-blur-md dark:bg-neutral-900/95 theme-teal',
        tableMenuBorder: 'border-tc-200 dark:border-white/10 theme-teal',
        tableMenuText: 'text-tc-900 dark:text-neutral-100 theme-teal',
        loadingText: 'text-tc-700 dark:text-tc-400 theme-teal',
        checkbox: '!text-tc-600 focus:ring-tc-500 theme-teal',
    },
    cyan: {
        name: 'Cyan',
        cardBackground: 'bg-white dark:bg-neutral-900',
        cardBorder: 'border-tc-200 dark:border-white/10 theme-cyan',
        headerBackground: 'bg-tc-50 dark:bg-neutral-800 theme-cyan',
        headerText: 'text-tc-900 dark:text-neutral-100 theme-cyan',
        primaryButton: 'bg-tc-600 hover:bg-tc-700 text-white theme-cyan',
        secondaryButton:
            'bg-tc-100 hover:bg-tc-200 text-tc-900 dark:bg-white/5 dark:hover:bg-white/10 dark:text-neutral-100 theme-cyan',
        inputBackground: 'bg-white dark:bg-neutral-950',
        inputBorder: 'border-tc-300 dark:border-white/15 theme-cyan',
        inputText: 'text-gray-900 dark:text-neutral-100',
        paginationButton:
            'border-tc-300 hover:bg-tc-50 dark:border-white/10 dark:hover:bg-white/5 theme-cyan',
        paginationActiveButton:
            'bg-tc-600 text-white border-tc-600 hover:bg-tc-700 theme-cyan',
        paginationText: 'text-tc-700 dark:text-neutral-300 theme-cyan',
        badgeBackground: 'bg-tc-100 dark:bg-tc-500/15 theme-cyan',
        badgeText: 'text-tc-800 dark:text-tc-300 theme-cyan',
        tableBackground: 'bg-white dark:bg-neutral-900',
        tableBorder: 'border-tc-200 dark:border-white/10 theme-cyan',
        tableHeaderBackground: 'bg-tc-50 dark:bg-neutral-800 theme-cyan',
        tableHeaderText: 'text-tc-900 dark:text-neutral-200 theme-cyan',
        tableRowHover: 'hover:bg-tc-50 dark:hover:bg-white/5 theme-cyan',
        tableRowSelected: 'bg-tc-50 dark:bg-tc-500/10 theme-cyan',
        tableRowBorder: 'border-tc-100 dark:border-white/5 theme-cyan',
        tableTextPrimary: 'text-gray-900 dark:text-neutral-100',
        tableTextSecondary: 'text-tc-700 dark:text-neutral-400 theme-cyan',
        tableToolbarBackground: 'bg-tc-50 dark:bg-neutral-900 theme-cyan',
        tableToolbarBorder: 'border-tc-200 dark:border-white/10 theme-cyan',
        tableToolbarText: 'text-tc-700 dark:text-neutral-300 theme-cyan',
        tableToolbarSeparator: 'bg-tc-200 dark:bg-white/10 theme-cyan',
        tableIconActive: 'text-tc-600 dark:text-tc-400 theme-cyan',
        tableIconInactive: 'text-gray-500 dark:text-neutral-400',
        tableMenuBackground:
            'bg-tc-50/95 backdrop-blur-md dark:bg-neutral-900/95 theme-cyan',
        tableMenuBorder: 'border-tc-200 dark:border-white/10 theme-cyan',
        tableMenuText: 'text-tc-900 dark:text-neutral-100 theme-cyan',
        loadingText: 'text-tc-700 dark:text-tc-400 theme-cyan',
        checkbox: '!text-tc-600 focus:ring-tc-500 theme-cyan',
    },
    indigo: {
        name: 'Indigo',
        cardBackground: 'bg-white dark:bg-neutral-900',
        cardBorder: 'border-tc-200 dark:border-white/10 theme-indigo',
        headerBackground: 'bg-tc-50 dark:bg-neutral-800 theme-indigo',
        headerText: 'text-tc-900 dark:text-neutral-100 theme-indigo',
        primaryButton: 'bg-tc-600 hover:bg-tc-700 text-white theme-indigo',
        secondaryButton:
            'bg-tc-100 hover:bg-tc-200 text-tc-900 dark:bg-white/5 dark:hover:bg-white/10 dark:text-neutral-100 theme-indigo',
        inputBackground: 'bg-white dark:bg-neutral-950',
        inputBorder: 'border-tc-300 dark:border-white/15 theme-indigo',
        inputText: 'text-gray-900 dark:text-neutral-100',
        paginationButton:
            'border-tc-300 hover:bg-tc-50 dark:border-white/10 dark:hover:bg-white/5 theme-indigo',
        paginationActiveButton:
            'bg-tc-600 text-white border-tc-600 hover:bg-tc-700 theme-indigo',
        paginationText: 'text-tc-700 dark:text-neutral-300 theme-indigo',
        badgeBackground: 'bg-tc-100 dark:bg-tc-500/15 theme-indigo',
        badgeText: 'text-tc-800 dark:text-tc-300 theme-indigo',
        tableBackground: 'bg-white dark:bg-neutral-900',
        tableBorder: 'border-tc-200 dark:border-white/10 theme-indigo',
        tableHeaderBackground: 'bg-tc-50 dark:bg-neutral-800 theme-indigo',
        tableHeaderText: 'text-tc-900 dark:text-neutral-200 theme-indigo',
        tableRowHover: 'hover:bg-tc-50 dark:hover:bg-white/5 theme-indigo',
        tableRowSelected: 'bg-tc-50 dark:bg-tc-500/10 theme-indigo',
        tableRowBorder: 'border-tc-100 dark:border-white/5 theme-indigo',
        tableTextPrimary: 'text-gray-900 dark:text-neutral-100',
        tableTextSecondary: 'text-tc-700 dark:text-neutral-400 theme-indigo',
        tableToolbarBackground: 'bg-tc-50 dark:bg-neutral-900 theme-indigo',
        tableToolbarBorder: 'border-tc-200 dark:border-white/10 theme-indigo',
        tableToolbarText: 'text-tc-700 dark:text-neutral-300 theme-indigo',
        tableToolbarSeparator: 'bg-tc-200 dark:bg-white/10 theme-indigo',
        tableIconActive: 'text-tc-600 dark:text-tc-400 theme-indigo',
        tableIconInactive: 'text-gray-500 dark:text-neutral-400',
        tableMenuBackground:
            'bg-tc-50/95 backdrop-blur-md dark:bg-neutral-900/95 theme-indigo',
        tableMenuBorder: 'border-tc-200 dark:border-white/10 theme-indigo',
        tableMenuText: 'text-tc-900 dark:text-neutral-100 theme-indigo',
        loadingText: 'text-tc-700 dark:text-tc-400 theme-indigo',
        checkbox: '!text-tc-600 focus:ring-tc-500 theme-indigo',
    },
    pink: {
        name: 'Pink',
        cardBackground: 'bg-white dark:bg-neutral-900',
        cardBorder: 'border-tc-200 dark:border-white/10 theme-pink',
        headerBackground: 'bg-tc-50 dark:bg-neutral-800 theme-pink',
        headerText: 'text-tc-900 dark:text-neutral-100 theme-pink',
        primaryButton: 'bg-tc-600 hover:bg-tc-700 text-white theme-pink',
        secondaryButton:
            'bg-tc-100 hover:bg-tc-200 text-tc-900 dark:bg-white/5 dark:hover:bg-white/10 dark:text-neutral-100 theme-pink',
        inputBackground: 'bg-white dark:bg-neutral-950',
        inputBorder: 'border-tc-300 dark:border-white/15 theme-pink',
        inputText: 'text-gray-900 dark:text-neutral-100',
        paginationButton:
            'border-tc-300 hover:bg-tc-50 dark:border-white/10 dark:hover:bg-white/5 theme-pink',
        paginationActiveButton:
            'bg-tc-600 text-white border-tc-600 hover:bg-tc-700 theme-pink',
        paginationText: 'text-tc-700 dark:text-neutral-300 theme-pink',
        badgeBackground: 'bg-tc-100 dark:bg-tc-500/15 theme-pink',
        badgeText: 'text-tc-800 dark:text-tc-300 theme-pink',
        tableBackground: 'bg-white dark:bg-neutral-900',
        tableBorder: 'border-tc-200 dark:border-white/10 theme-pink',
        tableHeaderBackground: 'bg-tc-50 dark:bg-neutral-800 theme-pink',
        tableHeaderText: 'text-tc-900 dark:text-neutral-200 theme-pink',
        tableRowHover: 'hover:bg-tc-50 dark:hover:bg-white/5 theme-pink',
        tableRowSelected: 'bg-tc-50 dark:bg-tc-500/10 theme-pink',
        tableRowBorder: 'border-tc-100 dark:border-white/5 theme-pink',
        tableTextPrimary: 'text-gray-900 dark:text-neutral-100',
        tableTextSecondary: 'text-tc-700 dark:text-neutral-400 theme-pink',
        tableToolbarBackground: 'bg-tc-50 dark:bg-neutral-900 theme-pink',
        tableToolbarBorder: 'border-tc-200 dark:border-white/10 theme-pink',
        tableToolbarText: 'text-tc-700 dark:text-neutral-300 theme-pink',
        tableToolbarSeparator: 'bg-tc-200 dark:bg-white/10 theme-pink',
        tableIconActive: 'text-tc-600 dark:text-tc-400 theme-pink',
        tableIconInactive: 'text-gray-500 dark:text-neutral-400',
        tableMenuBackground:
            'bg-tc-50/95 backdrop-blur-md dark:bg-neutral-900/95 theme-pink',
        tableMenuBorder: 'border-tc-200 dark:border-white/10 theme-pink',
        tableMenuText: 'text-tc-900 dark:text-neutral-100 theme-pink',
        loadingText: 'text-tc-700 dark:text-tc-400 theme-pink',
        checkbox: '!text-tc-600 focus:ring-tc-500 theme-pink',
    },
    rose: {
        name: 'Rose',
        cardBackground: 'bg-white dark:bg-neutral-900',
        cardBorder: 'border-tc-200 dark:border-white/10 theme-rose',
        headerBackground: 'bg-tc-50 dark:bg-neutral-800 theme-rose',
        headerText: 'text-tc-900 dark:text-neutral-100 theme-rose',
        primaryButton: 'bg-tc-600 hover:bg-tc-700 text-white theme-rose',
        secondaryButton:
            'bg-tc-100 hover:bg-tc-200 text-tc-900 dark:bg-white/5 dark:hover:bg-white/10 dark:text-neutral-100 theme-rose',
        inputBackground: 'bg-white dark:bg-neutral-950',
        inputBorder: 'border-tc-300 dark:border-white/15 theme-rose',
        inputText: 'text-gray-900 dark:text-neutral-100',
        paginationButton:
            'border-tc-300 hover:bg-tc-50 dark:border-white/10 dark:hover:bg-white/5 theme-rose',
        paginationActiveButton:
            'bg-tc-600 text-white border-tc-600 hover:bg-tc-700 theme-rose',
        paginationText: 'text-tc-700 dark:text-neutral-300 theme-rose',
        badgeBackground: 'bg-tc-100 dark:bg-tc-500/15 theme-rose',
        badgeText: 'text-tc-800 dark:text-tc-300 theme-rose',
        tableBackground: 'bg-white dark:bg-neutral-900',
        tableBorder: 'border-tc-200 dark:border-white/10 theme-rose',
        tableHeaderBackground: 'bg-tc-50 dark:bg-neutral-800 theme-rose',
        tableHeaderText: 'text-tc-900 dark:text-neutral-200 theme-rose',
        tableRowHover: 'hover:bg-tc-50 dark:hover:bg-white/5 theme-rose',
        tableRowSelected: 'bg-tc-50 dark:bg-tc-500/10 theme-rose',
        tableRowBorder: 'border-tc-100 dark:border-white/5 theme-rose',
        tableTextPrimary: 'text-gray-900 dark:text-neutral-100',
        tableTextSecondary: 'text-tc-700 dark:text-neutral-400 theme-rose',
        tableToolbarBackground: 'bg-tc-50 dark:bg-neutral-900 theme-rose',
        tableToolbarBorder: 'border-tc-200 dark:border-white/10 theme-rose',
        tableToolbarText: 'text-tc-700 dark:text-neutral-300 theme-rose',
        tableToolbarSeparator: 'bg-tc-200 dark:bg-white/10 theme-rose',
        tableIconActive: 'text-tc-600 dark:text-tc-400 theme-rose',
        tableIconInactive: 'text-gray-500 dark:text-neutral-400',
        tableMenuBackground:
            'bg-tc-50/95 backdrop-blur-md dark:bg-neutral-900/95 theme-rose',
        tableMenuBorder: 'border-tc-200 dark:border-white/10 theme-rose',
        tableMenuText: 'text-tc-900 dark:text-neutral-100 theme-rose',
        loadingText: 'text-tc-700 dark:text-tc-400 theme-rose',
        checkbox: '!text-tc-600 focus:ring-tc-500 theme-rose',
    },
    slate: {
        name: 'Slate',
        cardBackground: 'bg-white dark:bg-tc-900 theme-slate',
        cardBorder: 'border-tc-200 dark:border-tc-800 theme-slate',
        headerBackground: 'bg-tc-50 dark:bg-tc-950 theme-slate',
        headerText: 'text-tc-900 dark:text-tc-100 theme-slate',
        primaryButton: 'bg-tc-600 hover:bg-tc-700 text-white theme-slate',
        secondaryButton:
            'bg-tc-100 hover:bg-tc-200 text-tc-900 dark:bg-tc-900 dark:hover:bg-tc-800 dark:text-tc-100 theme-slate',
        inputBackground: 'bg-white dark:bg-tc-800 theme-slate',
        inputBorder: 'border-tc-300 dark:border-tc-700 theme-slate',
        inputText: 'text-tc-900 dark:text-tc-100 theme-slate',
        paginationButton:
            'border-tc-300 dark:border-tc-700 hover:bg-tc-50 dark:hover:bg-tc-950 theme-slate',
        paginationActiveButton:
            'bg-tc-600 text-white border-tc-600 hover:bg-tc-700 theme-slate',
        paginationText: 'text-tc-700 dark:text-tc-300 theme-slate',
        badgeBackground: 'bg-tc-100 dark:bg-tc-900 theme-slate',
        badgeText: 'text-tc-800 dark:text-tc-200 theme-slate',
        tableBackground: 'bg-white dark:bg-tc-900 theme-slate',
        tableBorder: 'border-tc-200 dark:border-tc-800 theme-slate',
        tableHeaderBackground: 'bg-tc-50 dark:bg-tc-950 theme-slate',
        tableHeaderText: 'text-tc-900 dark:text-tc-100 theme-slate',
        tableRowHover: 'hover:bg-tc-50 dark:hover:bg-tc-950/50 theme-slate',
        tableRowSelected: 'bg-tc-50 dark:bg-tc-950/30 theme-slate',
        tableRowBorder: 'border-tc-100 dark:border-tc-900 theme-slate',
        tableTextPrimary: 'text-tc-900 dark:text-tc-100 theme-slate',
        tableTextSecondary: 'text-tc-700 dark:text-tc-300 theme-slate',
        tableToolbarBackground: 'bg-tc-50 dark:bg-tc-950 theme-slate',
        tableToolbarBorder: 'border-tc-200 dark:border-tc-800 theme-slate',
        tableToolbarText: 'text-tc-700 dark:text-tc-300 theme-slate',
        tableToolbarSeparator: 'bg-tc-200 dark:bg-tc-800 theme-slate',
        tableIconActive: 'text-tc-600 dark:text-tc-400 theme-slate',
        tableIconInactive: 'text-gray-500 dark:text-gray-400 theme-slate',
        tableMenuBackground:
            'bg-tc-50/95 dark:bg-tc-950/95 backdrop-blur-md theme-slate',
        tableMenuBorder: 'border-tc-200 dark:border-tc-800 theme-slate',
        tableMenuText: 'text-tc-900 dark:text-tc-100 theme-slate',
        loadingText: 'text-tc-700 dark:text-tc-400 theme-slate',
        checkbox: '!text-tc-600 focus:ring-tc-500 theme-slate',
    },
    zinc: {
        name: 'Zinc',
        cardBackground: 'bg-white dark:bg-tc-900 theme-zinc',
        cardBorder: 'border-tc-200 dark:border-tc-800 theme-zinc',
        headerBackground: 'bg-tc-50 dark:bg-tc-950 theme-zinc',
        headerText: 'text-tc-900 dark:text-tc-100 theme-zinc',
        primaryButton: 'bg-tc-600 hover:bg-tc-700 text-white theme-zinc',
        secondaryButton:
            'bg-tc-100 hover:bg-tc-200 text-tc-900 dark:bg-tc-900 dark:hover:bg-tc-800 dark:text-tc-100 theme-zinc',
        inputBackground: 'bg-white dark:bg-tc-800 theme-zinc',
        inputBorder: 'border-tc-300 dark:border-tc-700 theme-zinc',
        inputText: 'text-tc-900 dark:text-tc-100 theme-zinc',
        paginationButton:
            'border-tc-300 dark:border-tc-700 hover:bg-tc-50 dark:hover:bg-tc-950 theme-zinc',
        paginationActiveButton:
            'bg-tc-600 text-white border-tc-600 hover:bg-tc-700 theme-zinc',
        paginationText: 'text-tc-700 dark:text-tc-300 theme-zinc',
        badgeBackground: 'bg-tc-100 dark:bg-tc-900 theme-zinc',
        badgeText: 'text-tc-800 dark:text-tc-200 theme-zinc',
        tableBackground: 'bg-white dark:bg-tc-900 theme-zinc',
        tableBorder: 'border-tc-200 dark:border-tc-800 theme-zinc',
        tableHeaderBackground: 'bg-tc-50 dark:bg-tc-950 theme-zinc',
        tableHeaderText: 'text-tc-900 dark:text-tc-100 theme-zinc',
        tableRowHover: 'hover:bg-tc-50 dark:hover:bg-tc-950/50 theme-zinc',
        tableRowSelected: 'bg-tc-50 dark:bg-tc-950/30 theme-zinc',
        tableRowBorder: 'border-tc-100 dark:border-tc-900 theme-zinc',
        tableTextPrimary: 'text-tc-900 dark:text-tc-100 theme-zinc',
        tableTextSecondary: 'text-tc-700 dark:text-tc-300 theme-zinc',
        tableToolbarBackground: 'bg-tc-50 dark:bg-tc-950 theme-zinc',
        tableToolbarBorder: 'border-tc-200 dark:border-tc-800 theme-zinc',
        tableToolbarText: 'text-tc-700 dark:text-tc-300 theme-zinc',
        tableToolbarSeparator: 'bg-tc-200 dark:bg-tc-800 theme-zinc',
        tableIconActive: 'text-tc-600 dark:text-tc-400 theme-zinc',
        tableIconInactive: 'text-gray-500 dark:text-gray-400 theme-zinc',
        tableMenuBackground:
            'bg-tc-50/95 dark:bg-tc-950/95 backdrop-blur-md theme-zinc',
        tableMenuBorder: 'border-tc-200 dark:border-tc-800 theme-zinc',
        tableMenuText: 'text-tc-900 dark:text-tc-100 theme-zinc',
        loadingText: 'text-tc-700 dark:text-tc-400 theme-zinc',
        checkbox: '!text-tc-600 focus:ring-tc-500 theme-zinc',
    },
    stone: {
        name: 'Stone',
        cardBackground: 'bg-white dark:bg-tc-900 theme-stone',
        cardBorder: 'border-tc-200 dark:border-tc-800 theme-stone',
        headerBackground: 'bg-tc-50 dark:bg-tc-950 theme-stone',
        headerText: 'text-tc-900 dark:text-tc-100 theme-stone',
        primaryButton: 'bg-tc-600 hover:bg-tc-700 text-white theme-stone',
        secondaryButton:
            'bg-tc-100 hover:bg-tc-200 text-tc-900 dark:bg-tc-900 dark:hover:bg-tc-800 dark:text-tc-100 theme-stone',
        inputBackground: 'bg-white dark:bg-tc-800 theme-stone',
        inputBorder: 'border-tc-300 dark:border-tc-700 theme-stone',
        inputText: 'text-tc-900 dark:text-tc-100 theme-stone',
        paginationButton:
            'border-tc-300 dark:border-tc-700 hover:bg-tc-50 dark:hover:bg-tc-950 theme-stone',
        paginationActiveButton:
            'bg-tc-600 text-white border-tc-600 hover:bg-tc-700 theme-stone',
        paginationText: 'text-tc-700 dark:text-tc-300 theme-stone',
        badgeBackground: 'bg-tc-100 dark:bg-tc-900 theme-stone',
        badgeText: 'text-tc-800 dark:text-tc-200 theme-stone',
        tableBackground: 'bg-white dark:bg-tc-900 theme-stone',
        tableBorder: 'border-tc-200 dark:border-tc-800 theme-stone',
        tableHeaderBackground: 'bg-tc-50 dark:bg-tc-950 theme-stone',
        tableHeaderText: 'text-tc-900 dark:text-tc-100 theme-stone',
        tableRowHover: 'hover:bg-tc-50 dark:hover:bg-tc-950/50 theme-stone',
        tableRowSelected: 'bg-tc-50 dark:bg-tc-950/30 theme-stone',
        tableRowBorder: 'border-tc-100 dark:border-tc-900 theme-stone',
        tableTextPrimary: 'text-tc-900 dark:text-tc-100 theme-stone',
        tableTextSecondary: 'text-tc-700 dark:text-tc-300 theme-stone',
        tableToolbarBackground: 'bg-tc-50 dark:bg-tc-950 theme-stone',
        tableToolbarBorder: 'border-tc-200 dark:border-tc-800 theme-stone',
        tableToolbarText: 'text-tc-700 dark:text-tc-300 theme-stone',
        tableToolbarSeparator: 'bg-tc-200 dark:bg-tc-800 theme-stone',
        tableIconActive: 'text-tc-600 dark:text-tc-400 theme-stone',
        tableIconInactive: 'text-gray-500 dark:text-gray-400 theme-stone',
        tableMenuBackground:
            'bg-tc-50/95 dark:bg-tc-950/95 backdrop-blur-md theme-stone',
        tableMenuBorder: 'border-tc-200 dark:border-tc-800 theme-stone',
        tableMenuText: 'text-tc-900 dark:text-tc-100 theme-stone',
        loadingText: 'text-tc-700 dark:text-tc-400 theme-stone',
        checkbox: '!text-tc-600 focus:ring-tc-500 theme-stone',
    },
    neutral: {
        name: 'Neutral',
        cardBackground: 'bg-white dark:bg-tc-900 theme-neutral',
        cardBorder: 'border-tc-200 dark:border-tc-800 theme-neutral',
        headerBackground: 'bg-tc-50 dark:bg-tc-950 theme-neutral',
        headerText: 'text-tc-900 dark:text-tc-100 theme-neutral',
        primaryButton: 'bg-tc-600 hover:bg-tc-700 text-white theme-neutral',
        secondaryButton:
            'bg-tc-100 hover:bg-tc-200 text-tc-900 dark:bg-tc-900 dark:hover:bg-tc-800 dark:text-tc-100 border border-tc-200 dark:border-tc-800 theme-neutral',
        inputBackground: 'bg-white dark:bg-tc-800 theme-neutral',
        inputBorder: 'border-tc-300 dark:border-tc-700 theme-neutral',
        inputText: 'text-tc-900 dark:text-tc-100 theme-neutral',
        paginationButton:
            'border-tc-300 dark:border-tc-700 hover:bg-tc-50 dark:hover:bg-tc-950 theme-neutral',
        paginationActiveButton:
            'bg-tc-600 text-white border-tc-600 hover:bg-tc-700 theme-neutral',
        paginationText: 'text-tc-700 dark:text-tc-300 theme-neutral',
        badgeBackground: 'bg-tc-100 dark:bg-tc-900 theme-neutral',
        badgeText: 'text-tc-800 dark:text-tc-200 theme-neutral',
        tableBackground: 'bg-white dark:bg-tc-900 theme-neutral',
        tableBorder: 'border-tc-200 dark:border-tc-800 theme-neutral',
        tableHeaderBackground: 'bg-tc-50 dark:bg-tc-950 theme-neutral',
        tableHeaderText: 'text-tc-900 dark:text-tc-100 theme-neutral',
        tableRowHover: 'hover:bg-tc-50 dark:hover:bg-tc-950/50 theme-neutral',
        tableRowSelected: 'bg-tc-50 dark:bg-tc-950/30 theme-neutral',
        tableRowBorder: 'border-tc-100 dark:border-tc-900 theme-neutral',
        tableTextPrimary: 'text-tc-900 dark:text-tc-100 theme-neutral',
        tableTextSecondary: 'text-tc-700 dark:text-tc-300 theme-neutral',
        tableToolbarBackground: 'bg-tc-50 dark:bg-tc-950 theme-neutral',
        tableToolbarBorder: 'border-tc-200 dark:border-tc-800 theme-neutral',
        tableToolbarText: 'text-tc-700 dark:text-tc-300 theme-neutral',
        tableToolbarSeparator: 'bg-tc-200 dark:bg-tc-800 theme-neutral',
        tableIconActive: 'text-tc-600 dark:text-tc-400 theme-neutral',
        tableIconInactive: 'text-gray-500 dark:text-gray-400 theme-neutral',
        tableMenuBackground:
            'bg-tc-50/95 dark:bg-tc-950/95 backdrop-blur-md theme-neutral',
        tableMenuBorder: 'border-tc-200 dark:border-tc-800 theme-neutral',
        tableMenuText: 'text-tc-900 dark:text-tc-100 theme-neutral',
        loadingText: 'text-tc-700 dark:text-tc-400 theme-neutral',
        checkbox: '!text-tc-600 focus:ring-tc-500 theme-neutral',
    },
    lime: {
        name: 'Lime',
        cardBackground: 'bg-white dark:bg-neutral-900',
        cardBorder: 'border-tc-200 dark:border-white/10 theme-lime',
        headerBackground: 'bg-tc-50 dark:bg-neutral-800 theme-lime',
        headerText: 'text-tc-900 dark:text-neutral-100 theme-lime',
        primaryButton: 'bg-tc-600 hover:bg-tc-700 text-white theme-lime',
        secondaryButton:
            'bg-tc-100 hover:bg-tc-200 text-tc-900 border border-tc-200 dark:bg-white/5 dark:hover:bg-white/10 dark:text-neutral-100 dark:border-white/10 theme-lime',
        inputBackground: 'bg-white dark:bg-neutral-950',
        inputBorder: 'border-tc-300 dark:border-white/15 theme-lime',
        inputText: 'text-gray-900 dark:text-neutral-100',
        paginationButton:
            'border-tc-300 hover:bg-tc-50 dark:border-white/10 dark:hover:bg-white/5 theme-lime',
        paginationActiveButton:
            'bg-tc-600 text-white border-tc-600 hover:bg-tc-700 theme-lime',
        paginationText: 'text-tc-700 dark:text-neutral-300 theme-lime',
        badgeBackground: 'bg-tc-100 dark:bg-tc-500/15 theme-lime',
        badgeText: 'text-tc-800 dark:text-tc-300 theme-lime',
        tableBackground: 'bg-white dark:bg-neutral-900',
        tableBorder: 'border-tc-200 dark:border-white/10 theme-lime',
        tableHeaderBackground: 'bg-tc-50 dark:bg-neutral-800 theme-lime',
        tableHeaderText: 'text-tc-900 dark:text-neutral-200 theme-lime',
        tableRowHover: 'hover:bg-tc-50 dark:hover:bg-white/5 theme-lime',
        tableRowSelected: 'bg-tc-50 dark:bg-tc-500/10 theme-lime',
        tableRowBorder: 'border-tc-100 dark:border-white/5 theme-lime',
        tableTextPrimary: 'text-gray-900 dark:text-neutral-100',
        tableTextSecondary: 'text-tc-700 dark:text-neutral-400 theme-lime',
        tableToolbarBackground: 'bg-tc-50 dark:bg-neutral-900 theme-lime',
        tableToolbarBorder: 'border-tc-200 dark:border-white/10 theme-lime',
        tableToolbarText: 'text-tc-700 dark:text-neutral-300 theme-lime',
        tableToolbarSeparator: 'bg-tc-200 dark:bg-white/10 theme-lime',
        tableIconActive: 'text-tc-600 dark:text-tc-400 theme-lime',
        tableIconInactive: 'text-gray-500 dark:text-neutral-400',
        tableMenuBackground:
            'bg-tc-50/95 backdrop-blur-md dark:bg-neutral-900/95 theme-lime',
        tableMenuBorder: 'border-tc-200 dark:border-white/10 theme-lime',
        tableMenuText: 'text-tc-900 dark:text-neutral-100 theme-lime',
        loadingText: 'text-tc-700 dark:text-tc-400 theme-lime',
        checkbox: '!text-tc-600 focus:ring-tc-500 theme-lime',
    },
    amber: {
        name: 'Amber',
        cardBackground: 'bg-white dark:bg-neutral-900',
        cardBorder: 'border-tc-200 dark:border-white/10 theme-amber',
        headerBackground: 'bg-tc-50 dark:bg-neutral-800 theme-amber',
        headerText: 'text-tc-900 dark:text-neutral-100 theme-amber',
        primaryButton: 'bg-tc-600 hover:bg-tc-700 text-white theme-amber',
        secondaryButton:
            'bg-tc-100 hover:bg-tc-200 text-tc-900 border border-tc-200 dark:bg-white/5 dark:hover:bg-white/10 dark:text-neutral-100 dark:border-white/10 theme-amber',
        inputBackground: 'bg-white dark:bg-neutral-950',
        inputBorder: 'border-tc-300 dark:border-white/15 theme-amber',
        inputText: 'text-gray-900 dark:text-neutral-100',
        paginationButton:
            'border-tc-300 hover:bg-tc-50 dark:border-white/10 dark:hover:bg-white/5 theme-amber',
        paginationActiveButton:
            'bg-tc-600 text-white border-tc-600 hover:bg-tc-700 theme-amber',
        paginationText: 'text-tc-700 dark:text-neutral-300 theme-amber',
        badgeBackground: 'bg-tc-100 dark:bg-tc-500/15 theme-amber',
        badgeText: 'text-tc-800 dark:text-tc-300 theme-amber',
        tableBackground: 'bg-white dark:bg-neutral-900',
        tableBorder: 'border-tc-200 dark:border-white/10 theme-amber',
        tableHeaderBackground: 'bg-tc-50 dark:bg-neutral-800 theme-amber',
        tableHeaderText: 'text-tc-900 dark:text-neutral-200 theme-amber',
        tableRowHover: 'hover:bg-tc-50 dark:hover:bg-white/5 theme-amber',
        tableRowSelected: 'bg-tc-50 dark:bg-tc-500/10 theme-amber',
        tableRowBorder: 'border-tc-100 dark:border-white/5 theme-amber',
        tableTextPrimary: 'text-gray-900 dark:text-neutral-100',
        tableTextSecondary: 'text-tc-700 dark:text-neutral-400 theme-amber',
        tableToolbarBackground: 'bg-tc-50 dark:bg-neutral-900 theme-amber',
        tableToolbarBorder: 'border-tc-200 dark:border-white/10 theme-amber',
        tableToolbarText: 'text-tc-700 dark:text-neutral-300 theme-amber',
        tableToolbarSeparator: 'bg-tc-200 dark:bg-white/10 theme-amber',
        tableIconActive: 'text-tc-600 dark:text-tc-400 theme-amber',
        tableIconInactive: 'text-gray-500 dark:text-neutral-400',
        tableMenuBackground:
            'bg-tc-50/95 backdrop-blur-md dark:bg-neutral-900/95 theme-amber',
        tableMenuBorder: 'border-tc-200 dark:border-white/10 theme-amber',
        tableMenuText: 'text-tc-900 dark:text-neutral-100 theme-amber',
        loadingText: 'text-tc-700 dark:text-tc-400 theme-amber',
        checkbox: '!text-tc-600 focus:ring-tc-500 theme-amber',
    },
    violet: {
        name: 'Violet',
        cardBackground: 'bg-white dark:bg-neutral-900',
        cardBorder: 'border-tc-200 dark:border-white/10 theme-violet',
        headerBackground: 'bg-tc-50 dark:bg-neutral-800 theme-violet',
        headerText: 'text-tc-900 dark:text-neutral-100 theme-violet',
        primaryButton: 'bg-tc-600 hover:bg-tc-700 text-white theme-violet',
        secondaryButton:
            'bg-tc-100 hover:bg-tc-200 text-tc-900 border border-tc-200 dark:bg-white/5 dark:hover:bg-white/10 dark:text-neutral-100 dark:border-white/10 theme-violet',
        inputBackground: 'bg-white dark:bg-neutral-950',
        inputBorder: 'border-tc-300 dark:border-white/15 theme-violet',
        inputText: 'text-gray-900 dark:text-neutral-100',
        paginationButton:
            'border-tc-300 hover:bg-tc-50 dark:border-white/10 dark:hover:bg-white/5 theme-violet',
        paginationActiveButton:
            'bg-tc-600 text-white border-tc-600 hover:bg-tc-700 theme-violet',
        paginationText: 'text-tc-700 dark:text-neutral-300 theme-violet',
        badgeBackground: 'bg-tc-100 dark:bg-tc-500/15 theme-violet',
        badgeText: 'text-tc-800 dark:text-tc-300 theme-violet',
        tableBackground: 'bg-white dark:bg-neutral-900',
        tableBorder: 'border-tc-200 dark:border-white/10 theme-violet',
        tableHeaderBackground: 'bg-tc-50 dark:bg-neutral-800 theme-violet',
        tableHeaderText: 'text-tc-900 dark:text-neutral-200 theme-violet',
        tableRowHover: 'hover:bg-tc-50 dark:hover:bg-white/5 theme-violet',
        tableRowSelected: 'bg-tc-50 dark:bg-tc-500/10 theme-violet',
        tableRowBorder: 'border-tc-100 dark:border-white/5 theme-violet',
        tableTextPrimary: 'text-gray-900 dark:text-neutral-100',
        tableTextSecondary: 'text-tc-700 dark:text-neutral-400 theme-violet',
        tableToolbarBackground: 'bg-tc-50 dark:bg-neutral-900 theme-violet',
        tableToolbarBorder: 'border-tc-200 dark:border-white/10 theme-violet',
        tableToolbarText: 'text-tc-700 dark:text-neutral-300 theme-violet',
        tableToolbarSeparator: 'bg-tc-200 dark:bg-white/10 theme-violet',
        tableIconActive: 'text-tc-600 dark:text-tc-400 theme-violet',
        tableIconInactive: 'text-gray-500 dark:text-neutral-400',
        tableMenuBackground:
            'bg-tc-50/95 backdrop-blur-md dark:bg-neutral-900/95 theme-violet',
        tableMenuBorder: 'border-tc-200 dark:border-white/10 theme-violet',
        tableMenuText: 'text-tc-900 dark:text-neutral-100 theme-violet',
        loadingText: 'text-tc-700 dark:text-tc-400 theme-violet',
        checkbox: '!text-tc-600 focus:ring-tc-500 theme-violet',
    },
    fuchsia: {
        name: 'Fuchsia',
        cardBackground: 'bg-white dark:bg-neutral-900',
        cardBorder: 'border-tc-200 dark:border-white/10 theme-fuchsia',
        headerBackground: 'bg-tc-50 dark:bg-neutral-800 theme-fuchsia',
        headerText: 'text-tc-900 dark:text-neutral-100 theme-fuchsia',
        primaryButton: 'bg-tc-600 hover:bg-tc-700 text-white theme-fuchsia',
        secondaryButton:
            'bg-tc-100 hover:bg-tc-200 text-tc-900 border border-tc-200 dark:bg-white/5 dark:hover:bg-white/10 dark:text-neutral-100 dark:border-white/10 theme-fuchsia',
        inputBackground: 'bg-white dark:bg-neutral-950',
        inputBorder: 'border-tc-300 dark:border-white/15 theme-fuchsia',
        inputText: 'text-gray-900 dark:text-neutral-100',
        paginationButton:
            'border-tc-300 hover:bg-tc-50 dark:border-white/10 dark:hover:bg-white/5 theme-fuchsia',
        paginationActiveButton:
            'bg-tc-600 text-white border-tc-600 hover:bg-tc-700 theme-fuchsia',
        paginationText: 'text-tc-700 dark:text-neutral-300 theme-fuchsia',
        badgeBackground: 'bg-tc-100 dark:bg-tc-500/15 theme-fuchsia',
        badgeText: 'text-tc-800 dark:text-tc-300 theme-fuchsia',
        tableBackground: 'bg-white dark:bg-neutral-900',
        tableBorder: 'border-tc-200 dark:border-white/10 theme-fuchsia',
        tableHeaderBackground: 'bg-tc-50 dark:bg-neutral-800 theme-fuchsia',
        tableHeaderText: 'text-tc-900 dark:text-neutral-200 theme-fuchsia',
        tableRowHover: 'hover:bg-tc-50 dark:hover:bg-white/5 theme-fuchsia',
        tableRowSelected: 'bg-tc-50 dark:bg-tc-500/10 theme-fuchsia',
        tableRowBorder: 'border-tc-100 dark:border-white/5 theme-fuchsia',
        tableTextPrimary: 'text-gray-900 dark:text-neutral-100',
        tableTextSecondary: 'text-tc-700 dark:text-neutral-400 theme-fuchsia',
        tableToolbarBackground: 'bg-tc-50 dark:bg-neutral-900 theme-fuchsia',
        tableToolbarBorder: 'border-tc-200 dark:border-white/10 theme-fuchsia',
        tableToolbarText: 'text-tc-700 dark:text-neutral-300 theme-fuchsia',
        tableToolbarSeparator: 'bg-tc-200 dark:bg-white/10 theme-fuchsia',
        tableIconActive: 'text-tc-600 dark:text-tc-400 theme-fuchsia',
        tableIconInactive: 'text-gray-500 dark:text-neutral-400',
        tableMenuBackground:
            'bg-tc-50/95 backdrop-blur-md dark:bg-neutral-900/95 theme-fuchsia',
        tableMenuBorder: 'border-tc-200 dark:border-white/10 theme-fuchsia',
        tableMenuText: 'text-tc-900 dark:text-neutral-100 theme-fuchsia',
        loadingText: 'text-tc-700 dark:text-tc-400 theme-fuchsia',
        checkbox: '!text-tc-600 focus:ring-tc-500 theme-fuchsia',
    },
    sky: {
        name: 'Sky',
        cardBackground: 'bg-white dark:bg-neutral-900',
        cardBorder: 'border-tc-200 dark:border-white/10 theme-sky',
        headerBackground: 'bg-tc-50 dark:bg-neutral-800 theme-sky',
        headerText: 'text-tc-900 dark:text-neutral-100 theme-sky',
        primaryButton: 'bg-tc-600 hover:bg-tc-700 text-white theme-sky',
        secondaryButton:
            'bg-tc-100 hover:bg-tc-200 text-tc-900 border border-tc-200 dark:bg-white/5 dark:hover:bg-white/10 dark:text-neutral-100 dark:border-white/10 theme-sky',
        inputBackground: 'bg-white dark:bg-neutral-950',
        inputBorder: 'border-tc-300 dark:border-white/15 theme-sky',
        inputText: 'text-gray-900 dark:text-neutral-100',
        paginationButton:
            'border-tc-300 hover:bg-tc-50 dark:border-white/10 dark:hover:bg-white/5 theme-sky',
        paginationActiveButton:
            'bg-tc-600 text-white border-tc-600 hover:bg-tc-700 theme-sky',
        paginationText: 'text-tc-700 dark:text-neutral-300 theme-sky',
        badgeBackground: 'bg-tc-100 dark:bg-tc-500/15 theme-sky',
        badgeText: 'text-tc-800 dark:text-tc-300 theme-sky',
        tableBackground: 'bg-white dark:bg-neutral-900',
        tableBorder: 'border-tc-200 dark:border-white/10 theme-sky',
        tableHeaderBackground: 'bg-tc-50 dark:bg-neutral-800 theme-sky',
        tableHeaderText: 'text-tc-900 dark:text-neutral-200 theme-sky',
        tableRowHover: 'hover:bg-tc-50 dark:hover:bg-white/5 theme-sky',
        tableRowSelected: 'bg-tc-50 dark:bg-tc-500/10 theme-sky',
        tableRowBorder: 'border-tc-100 dark:border-white/5 theme-sky',
        tableTextPrimary: 'text-gray-900 dark:text-neutral-100',
        tableTextSecondary: 'text-tc-700 dark:text-neutral-400 theme-sky',
        tableToolbarBackground: 'bg-tc-50 dark:bg-neutral-900 theme-sky',
        tableToolbarBorder: 'border-tc-200 dark:border-white/10 theme-sky',
        tableToolbarText: 'text-tc-700 dark:text-neutral-300 theme-sky',
        tableToolbarSeparator: 'bg-tc-200 dark:bg-white/10 theme-sky',
        tableIconActive: 'text-tc-600 dark:text-tc-400 theme-sky',
        tableIconInactive: 'text-gray-500 dark:text-neutral-400',
        tableMenuBackground: 'bg-tc-50/95 backdrop-blur-md dark:bg-neutral-900/95 theme-sky',
        tableMenuBorder: 'border-tc-200 dark:border-white/10 theme-sky',
        tableMenuText: 'text-tc-900 dark:text-neutral-100 theme-sky',
        loadingText: 'text-tc-700 dark:text-tc-400 theme-sky',
        checkbox: '!text-tc-600 focus:ring-tc-500 theme-sky',
    },
    modern: {
        name: 'Modern',
        appContentBackdrop:
            'bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-950 dark:via-gray-900 dark:to-blue-900/30',
        cardBackground:
            'bg-gradient-to-br from-blue-50/80 via-white/90 to-blue-100/80 dark:from-gray-900/80 dark:via-gray-900 dark:to-neutral-900/60 backdrop-blur-sm',
        cardBorder: 'border-blue-200/60 dark:border-white/10',
        headerBackground:
            'bg-gradient-to-r from-blue-100/70 to-blue-50/50 dark:from-blue-950/15 dark:to-blue-900/15 backdrop-blur-sm',
        headerText: 'text-blue-900 dark:text-neutral-100 font-semibold',
        primaryButton:
            'bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200',
        secondaryButton:
            'bg-blue-100 hover:bg-blue-200 text-blue-900 dark:bg-white/5 dark:hover:bg-white/10 dark:text-neutral-100 border border-blue-200/60 dark:border-white/10 transition-all duration-200',
        inputBackground:
            'bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm focus:ring-2 focus:ring-blue-400/40 transition-all duration-200',
        inputBorder: 'border-blue-300/60 dark:border-white/10',
        inputText: 'text-gray-900 dark:text-gray-100',
        paginationButton:
            'border border-blue-200/60 dark:border-white/10 hover:bg-blue-50/70 dark:hover:bg-blue-950/15 transition-all duration-200',
        paginationActiveButton:
            'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 transition-all duration-200',
        paginationText: 'text-blue-700 dark:text-neutral-300',
        badgeBackground:
            'bg-gradient-to-r from-blue-100/80 to-blue-200/60 dark:from-blue-900/20 dark:to-blue-800/15',
        badgeText: 'text-blue-800 dark:text-neutral-100 font-medium',
        tableBackground:
            'bg-white/70 dark:bg-gray-900/60 backdrop-blur-sm border border-blue-100/40 dark:border-white/10',
        tableBorder: 'border-blue-200/40 dark:border-white/10',
        tableHeaderBackground:
            'bg-gradient-to-r from-blue-50/80 to-blue-100/60 dark:from-blue-950/15 dark:to-blue-900/15 backdrop-blur-sm',
        tableHeaderText: 'text-blue-900 dark:text-neutral-100 font-semibold',
        tableRowHover:
            'hover:bg-blue-100/40 dark:hover:bg-blue-900/10 transition-all duration-200',
        tableRowSelected: 'bg-blue-100/60 dark:bg-blue-900/15',
        tableRowBorder: 'border-blue-100/40 dark:border-white/10',
        tableTextPrimary: 'text-gray-900 dark:text-gray-100',
        tableTextSecondary: 'text-blue-700 dark:text-neutral-300',
        tableToolbarBackground:
            'bg-gradient-to-r from-blue-50/80 to-blue-100/60 dark:from-blue-950/15 dark:to-blue-900/15 backdrop-blur-sm',
        tableToolbarBorder: 'border-blue-200/40 dark:border-white/10',
        tableToolbarText: 'text-blue-900 dark:text-neutral-100 font-medium',
        tableToolbarSeparator: 'bg-blue-300/40 dark:bg-blue-700/15',
        tableIconActive: 'text-blue-600',
        tableIconInactive: 'text-gray-500 dark:text-gray-400',
        tableMenuBackground: 'bg-white/90 dark:bg-gray-950/90 backdrop-blur-md',
        tableMenuBorder: 'border-blue-200/40 dark:border-white/10',
        tableMenuText: 'text-blue-900 dark:text-neutral-100',
        loadingText: 'text-blue-700 dark:text-blue-400',
        checkbox: '!text-blue-600 focus:ring-blue-500',
    },
    modern1: {
        name: 'Modern1',
        appContentBackdrop:
            'bg-gradient-to-br from-white via-blue-50 to-blue-100 dark:from-blue-950/30 dark:via-gray-950 dark:to-blue-900/30',
        cardBackground:
            'bg-gradient-to-br from-white/40 via-white/20 to-blue-100/10 dark:from-neutral-900/20 dark:via-gray-900/30 dark:to-neutral-900/20 backdrop-blur-2xl shadow-[inset_0_0_0.5px_rgba(255,255,255,0.4),_0_4px_20px_rgba(0,0,0,0.1)] rounded-2xl',
        cardBorder:
            'border border-white/30 dark:border-white/10 backdrop-saturate-150',
        headerBackground:
            'bg-gradient-to-r from-white/30 via-blue-100/20 to-transparent dark:from-blue-950/15 dark:via-blue-900/10 dark:to-transparent backdrop-blur-xl',
        headerText:
            'text-blue-950 dark:text-neutral-100 font-semibold drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]',
        primaryButton:
            'bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 text-white font-medium rounded-xl shadow-[0_4px_15px_rgba(37,99,235,0.3)] transition-all duration-300 backdrop-blur-md border border-white/20',
        secondaryButton:
            'bg-white/20 hover:bg-white/30 text-blue-900 dark:text-neutral-100 dark:bg-blue-900/10 dark:hover:bg-blue-800/15 backdrop-blur-md border border-white/30 rounded-xl transition-all duration-300',
        inputBackground:
            'bg-white/30 dark:bg-gray-800/40 backdrop-blur-lg border border-white/30 focus:ring-2 focus:ring-blue-400/40 rounded-lg shadow-inner',
        inputBorder: 'border-white/30 dark:border-white/10',
        inputText: 'text-gray-900 dark:text-gray-100',
        paginationButton:
            'border border-white/20 hover:bg-blue-100/20 dark:hover:bg-blue-900/15 backdrop-blur-md rounded-lg transition-all duration-300',
        paginationActiveButton:
            'bg-gradient-to-r from-blue-700 to-blue-800 text-white border border-blue-500/40 hover:from-blue-800 hover:to-blue-900 shadow-[0_2px_10px_rgba(37,99,235,0.3)]',
        paginationText: 'text-blue-800 dark:text-neutral-100',
        badgeBackground:
            'bg-gradient-to-r from-blue-200/40 to-blue-300/30 dark:from-blue-900/15 dark:to-blue-800/10 backdrop-blur-md border border-white/30 rounded-full',
        badgeText: 'text-blue-900 dark:text-neutral-100 font-semibold',
        tableBackground:
            'bg-gradient-to-b from-white/30 to-white/10 dark:from-gray-900/30 dark:to-neutral-900/20 backdrop-blur-xl border border-white/20 rounded-xl shadow-[inset_0_0_0.5px_rgba(255,255,255,0.2)]',
        tableBorder: 'border-white/20 dark:border-white/10',
        tableHeaderBackground:
            'bg-gradient-to-r from-white/40 via-blue-50/30 to-transparent dark:from-blue-950/15 dark:via-blue-900/10 dark:to-transparent backdrop-blur-lg',
        tableHeaderText: 'text-blue-900 dark:text-neutral-100 font-semibold',
        tableRowHover:
            'hover:bg-white/20 dark:hover:bg-blue-900/10 transition-all duration-300 backdrop-blur-sm',
        tableRowSelected: 'bg-white/30 dark:bg-blue-900/15 backdrop-blur-md',
        tableRowBorder: 'border-white/10 dark:border-white/10',
        tableTextPrimary: 'text-gray-900 dark:text-gray-100',
        tableTextSecondary: 'text-blue-700 dark:text-neutral-300',
        tableToolbarBackground:
            'bg-gradient-to-r from-white/20 via-blue-50/10 to-transparent dark:from-blue-950/15 dark:via-blue-900/10 dark:to-transparent backdrop-blur-lg',
        tableToolbarBorder: 'border-white/20 dark:border-white/10',
        tableToolbarText: 'text-blue-900 dark:text-neutral-100 font-medium',
        tableToolbarSeparator: 'bg-white/30 dark:bg-white/10',
        tableIconActive: 'text-blue-500 dark:text-blue-400',
        tableIconInactive: 'text-blue-600 dark:text-neutral-300',
        loadingText: 'text-blue-700 dark:text-neutral-300',
        checkbox: '!text-blue-600 focus:ring-blue-500',
    },
    modern2: {
        name: 'Modern2',
        appContentBackdrop:
            'bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-violet-500/20 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30',
        cardBackground:
            'bg-gradient-to-br from-blue-500/20 via-cyan-400/10 to-violet-500/20 dark:from-neutral-900/30 dark:via-neutral-900/20 dark:to-neutral-900/30 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.15)] border border-white/20 rounded-2xl',
        cardBorder:
            'border border-white/30 dark:border-white/10 backdrop-saturate-150',
        headerBackground:
            'bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-violet-500/20 dark:from-blue-950/15 dark:via-indigo-900/10 dark:to-purple-950/10 backdrop-blur-xl',
        headerText:
            'text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-cyan-700 to-violet-700 dark:from-blue-300 dark:via-cyan-300 dark:to-violet-300 font-semibold tracking-wide',
        primaryButton:
            'bg-gradient-to-r from-blue-700 via-cyan-700 to-violet-700 hover:from-blue-800 hover:via-cyan-800 hover:to-violet-800 text-white font-medium rounded-xl shadow-[0_4px_20px_rgba(56,189,248,0.4)] transition-all duration-300',
        secondaryButton:
            'bg-gradient-to-r from-white/20 via-white/10 to-transparent hover:from-white/30 hover:via-white/20 hover:to-transparent text-blue-900 dark:text-white/90 dark:from-blue-900/10 dark:via-blue-800/5 dark:to-transparent backdrop-blur-md border border-white/30 rounded-xl transition-all duration-300',
        inputBackground:
            'bg-gradient-to-br from-white/20 via-white/10 to-transparent dark:from-gray-800/40 dark:via-gray-900/30 dark:to-transparent backdrop-blur-lg border border-white/30 focus:ring-2 focus:ring-cyan-400/50 rounded-lg shadow-inner transition-all duration-300',
        inputBorder: 'border-white/30 dark:border-white/10',
        inputText: 'text-gray-900 dark:text-gray-100',
        paginationButton:
            'border border-white/20 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 backdrop-blur-md rounded-lg transition-all duration-300',
        paginationActiveButton:
            'bg-gradient-to-r from-cyan-700 to-blue-700 text-white border border-cyan-500/40 hover:from-cyan-800 hover:to-blue-800 shadow-[0_2px_10px_rgba(6,182,212,0.4)]',
        paginationText: 'text-cyan-900 dark:text-neutral-300 font-medium',
        badgeBackground:
            'bg-gradient-to-r from-blue-500/30 via-cyan-400/30 to-violet-500/30 dark:from-blue-900/15 dark:via-cyan-800/15 dark:to-violet-900/15 backdrop-blur-md border border-white/30 rounded-full',
        badgeText:
            'text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-cyan-600 to-violet-600 dark:from-cyan-300 dark:via-blue-300 dark:to-violet-300 font-semibold',
        tableBackground:
            'bg-gradient-to-br from-white/20 via-white/10 to-transparent dark:from-gray-900/30 dark:via-neutral-900/30 dark:to-neutral-900/20 backdrop-blur-xl border border-white/20 rounded-xl shadow-[inset_0_0_0.5px_rgba(255,255,255,0.2)]',
        tableBorder: 'border-white/20 dark:border-white/10',
        tableHeaderBackground:
            'bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-violet-500/20 dark:from-blue-950/15 dark:via-indigo-900/10 dark:to-purple-950/10 backdrop-blur-lg',
        tableHeaderText:
            'text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-cyan-600 to-violet-600 dark:from-cyan-300 dark:via-blue-300 dark:to-violet-300 font-semibold',
        tableRowHover:
            'hover:bg-gradient-to-r hover:from-cyan-500/10 hover:via-blue-500/10 hover:to-violet-500/10 transition-all duration-300 backdrop-blur-sm',
        tableRowSelected:
            'bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-violet-500/20 backdrop-blur-md',
        tableRowBorder: 'border-white/10 dark:border-white/10',
        tableTextPrimary: 'text-gray-900 dark:text-gray-100',
        tableTextSecondary:
            'text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-cyan-700 to-violet-700 dark:from-cyan-300 dark:via-blue-300 dark:to-violet-300',
        tableToolbarBackground:
            'bg-gradient-to-r from-cyan-400/10 via-blue-500/10 to-violet-500/10 dark:from-blue-950/15 dark:via-indigo-900/10 dark:to-purple-950/10 backdrop-blur-lg',
        tableToolbarBorder: 'border-white/20 dark:border-white/10',
        tableToolbarText: 'text-blue-800 dark:text-neutral-300 font-medium',
        tableToolbarSeparator: 'bg-white/20 dark:bg-white/10',
        tableIconActive: 'text-cyan-700 dark:text-cyan-400',
        tableIconInactive: 'text-blue-600 dark:text-neutral-300',
        tableMenuBackground: 'bg-white/90 dark:bg-gray-950/90 backdrop-blur-md',
        tableMenuBorder: 'border-blue-200/40 dark:border-white/10',
        tableMenuText: 'text-blue-900 dark:text-neutral-100',
        loadingText: 'text-cyan-900 dark:text-neutral-300',
        checkbox: '!text-cyan-600 focus:ring-cyan-500',
    },
    modern3: {
        name: 'Modern3',
        appContentBackdrop:
            'bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 dark:from-slate-950 dark:via-blue-950/30 dark:to-slate-900',
        cardBackground:
            'bg-gradient-to-br from-slate-100/60 via-white/40 to-slate-200/50 dark:from-slate-900/40 dark:via-slate-950/40 dark:to-neutral-900/40 backdrop-blur-2xl border border-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-2xl',
        cardBorder:
            'border border-slate-300/40 dark:border-slate-800/40 backdrop-saturate-150',
        headerBackground:
            'bg-gradient-to-r from-blue-100/60 via-slate-50/50 to-transparent dark:from-blue-950/10 dark:via-slate-900/40 dark:to-transparent backdrop-blur-xl',
        headerText:
            'text-transparent bg-clip-text bg-gradient-to-r from-blue-800 via-slate-700 to-blue-700 dark:from-blue-200 dark:via-slate-300 dark:to-blue-400 font-semibold tracking-wide',
        primaryButton:
            'bg-gradient-to-r from-blue-700 to-slate-700 hover:from-blue-800 hover:to-slate-800 text-white font-medium rounded-xl shadow-[0_4px_18px_rgba(30,64,175,0.3)] transition-all duration-300',
        secondaryButton:
            'bg-gradient-to-r from-white/20 via-slate-100/10 to-transparent hover:from-white/30 hover:via-slate-100/20 hover:to-transparent text-slate-800 dark:text-slate-100 dark:from-slate-900/30 dark:via-slate-800/20 dark:to-transparent backdrop-blur-md border border-white/20 rounded-xl transition-all duration-300',
        inputBackground:
            'bg-gradient-to-br from-white/40 via-white/20 to-transparent dark:from-slate-800/40 dark:via-slate-900/30 dark:to-transparent backdrop-blur-lg border border-white/30 focus:ring-2 focus:ring-blue-300/40 rounded-lg shadow-inner transition-all duration-300',
        inputBorder: 'border-white/20 dark:border-slate-700/40',
        inputText: 'text-slate-900 dark:text-slate-100',
        paginationButton:
            'border border-white/10 hover:bg-blue-100/20 dark:hover:bg-blue-900/10 backdrop-blur-md rounded-lg transition-all duration-300',
        paginationActiveButton:
            'bg-gradient-to-r from-blue-700 to-slate-700 text-white border border-blue-500/50 hover:from-blue-800 hover:to-slate-800 shadow-[0_2px_12px_rgba(30,64,175,0.3)]',
        paginationText: 'text-blue-800 dark:text-neutral-300 font-medium',
        badgeBackground:
            'bg-gradient-to-r from-slate-200/40 via-blue-100/40 to-slate-200/40 dark:from-slate-800/40 dark:via-blue-900/10 dark:to-slate-800/40 backdrop-blur-md border border-white/20 rounded-full',
        badgeText:
            'text-transparent bg-clip-text bg-gradient-to-r from-blue-800 via-slate-700 to-blue-700 dark:from-blue-200 dark:via-slate-300 dark:to-blue-400 font-medium',
        tableBackground:
            'bg-gradient-to-br from-white/30 via-slate-50/20 to-transparent dark:from-slate-900/30 dark:via-slate-950/20 dark:to-neutral-900/20 backdrop-blur-xl border border-white/10 rounded-xl shadow-[inset_0_0_0.5px_rgba(255,255,255,0.15)]',
        tableBorder: 'border-white/10 dark:border-slate-800/20',
        tableHeaderBackground:
            'bg-gradient-to-r from-blue-100/30 via-slate-100/20 to-transparent dark:from-slate-900/40 dark:via-slate-950/30 dark:to-transparent backdrop-blur-lg',
        tableHeaderText:
            'text-transparent bg-clip-text bg-gradient-to-r from-blue-800 via-slate-700 to-blue-700 dark:from-blue-200 dark:via-slate-300 dark:to-blue-400 font-semibold',
        tableRowHover:
            'hover:bg-gradient-to-r hover:from-blue-100/20 hover:via-slate-100/20 hover:to-transparent dark:hover:from-slate-800/30 dark:hover:via-blue-900/5 dark:hover:to-transparent transition-all duration-300 backdrop-blur-sm',
        tableRowSelected:
            'bg-gradient-to-r from-blue-100/30 via-slate-100/30 to-transparent dark:from-slate-800/40 dark:via-blue-900/10 dark:to-transparent backdrop-blur-md',
        tableRowBorder: 'border-white/10 dark:border-slate-800/20',
        tableTextPrimary: 'text-slate-900 dark:text-slate-100',
        tableTextSecondary:
            'text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-slate-700 to-blue-800 dark:from-blue-300 dark:via-slate-300 dark:to-blue-400',
        tableToolbarBackground:
            'bg-gradient-to-r from-slate-100/20 via-blue-100/10 to-transparent dark:from-slate-900/40 dark:via-slate-950/30 dark:to-transparent backdrop-blur-lg',
        tableToolbarBorder: 'border-white/20 dark:border-slate-800/20',
        tableToolbarText: 'text-slate-800 dark:text-slate-200 font-medium',
        tableToolbarSeparator: 'bg-slate-300/40 dark:bg-slate-700/40',
        tableIconActive: 'text-blue-600 dark:text-blue-400',
        tableIconInactive: 'text-slate-600 dark:text-slate-400',
        tableMenuBackground:
            'bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md',
        tableMenuBorder: 'border-slate-200/40 dark:border-slate-800/40',
        tableMenuText: 'text-slate-900 dark:text-slate-100',
        loadingText: 'text-blue-700 dark:text-blue-400',
        checkbox: '!text-blue-600 focus:ring-blue-500',
    },
    modern4: {
        name: 'Modern4',
        darkOnly: true,
        appContentBackdrop:
            'bg-gradient-to-br from-blue-950 via-purple-950 to-pink-900 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950',
        cardBackground:
            'bg-white/20 dark:bg-gray-900/30 backdrop-blur-xl shadow-lg border border-white/20 dark:border-gray-800/40',
        cardBorder: 'border-white/20 dark:border-gray-700/40',
        headerBackground:
            'bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-pink-500/40 backdrop-blur-2xl',
        headerText: 'text-white drop-shadow-sm',
        primaryButton:
            'bg-gradient-to-r from-blue-700 via-cyan-700 to-purple-700 hover:from-blue-800 hover:via-cyan-800 hover:to-purple-800 text-white shadow-md backdrop-blur-md',
        secondaryButton:
            'bg-white/20 hover:bg-white/30 dark:bg-gray-800/30 dark:hover:bg-gray-800/40 text-white border border-white/30 backdrop-blur-md',
        inputBackground:
            'bg-white/10 dark:bg-gray-800/30 backdrop-blur-md text-white placeholder-gray-300 dark:placeholder-gray-500',
        inputBorder:
            'border-white/30 dark:border-gray-700/50 focus:border-cyan-400',
        inputText: 'text-white dark:text-gray-100',
        paginationButton:
            'border-white/30 dark:border-gray-700/50 bg-white/10 hover:bg-white/20 dark:hover:bg-gray-800/40 backdrop-blur-md text-white',
        paginationActiveButton:
            'bg-gradient-to-r from-cyan-700 to-blue-700 text-white border-none shadow-lg',
        paginationText: 'text-white dark:text-gray-300',
        badgeBackground:
            'bg-gradient-to-r from-blue-400/30 to-purple-400/30 backdrop-blur-md border border-white/20',
        badgeText: 'text-white font-semibold drop-shadow-sm',
        tableBackground:
            'bg-white/10 dark:bg-gray-900/20 backdrop-blur-xl border border-white/10 dark:border-gray-800/30',
        tableBorder: 'border-white/10 dark:border-gray-800/30',
        tableHeaderBackground:
            'bg-gradient-to-r from-blue-500/30 to-cyan-500/30 backdrop-blur-md',
        tableHeaderText:
            'text-white font-semibold tracking-wide drop-shadow-sm',
        tableRowHover:
            'hover:bg-white/20 dark:hover:bg-gray-800/40 transition-all duration-200',
        tableRowSelected: 'bg-white/30 dark:bg-gray-800/50 backdrop-blur-md',
        tableRowBorder: 'border-white/10 dark:border-gray-800/30',
        tableTextPrimary: 'text-white dark:text-gray-100',
        tableTextSecondary: 'text-white dark:text-blue-300',
        tableToolbarBackground:
            'bg-gradient-to-r from-blue-500/30 to-purple-500/30 backdrop-blur-lg',
        tableToolbarBorder: 'border-white/10 dark:border-gray-700/30',
        tableToolbarText: 'text-white font-medium',
        tableToolbarSeparator: 'bg-white/20 dark:bg-white/10',
        tableIconActive: 'text-cyan-300',
        tableIconInactive: 'text-white/70',
        tableMenuBackground: 'bg-gray-900/90 backdrop-blur-xl',
        tableMenuBorder: 'border-white/20 dark:border-gray-800/50',
        tableMenuText: 'text-white dark:text-gray-100',
    },
    neumorphism: {
        name: 'Neumorphism',
        appContentBackdrop: 'bg-[#e0e5ec] dark:bg-[#1e2130]',

        // Light: #e0e5ec is the canonical neumorphic base
        // Dark:  #1e2130 deep slate, shadows still readable
        cardBackground:
            'bg-[#e0e5ec] dark:bg-[#1e2130] ' +
            'shadow-[6px_6px_14px_#b8bec7,_-6px_-6px_14px_#ffffff] ' +
            'dark:shadow-[6px_6px_14px_#141720,_-6px_-6px_14px_#282d40] ' +
            'rounded-2xl border-0',

        cardBorder: 'border-0', // neumorphism uses shadows, not borders

        headerBackground: 'bg-[#e0e5ec] dark:bg-[#1e2130]',

        headerText:
            'text-[#4a5568] dark:text-[#a0aec0] font-semibold tracking-wide',

        // Raised (extruded) → convex shadow for default state
        primaryButton:
            'bg-[#e0e5ec] dark:bg-[#1e2130] ' +
            'text-[#3451c7] dark:text-[#7b9fff] font-semibold ' +
            'shadow-[4px_4px_10px_#b8bec7,_-4px_-4px_10px_#ffffff] ' +
            'dark:shadow-[4px_4px_10px_#141720,_-4px_-4px_10px_#282d40] ' +
            'hover:shadow-[2px_2px_6px_#b8bec7,_-2px_-2px_6px_#ffffff] ' +
            'dark:hover:shadow-[2px_2px_6px_#141720,_-2px_-2px_6px_#282d40] ' +
            'active:shadow-[inset_3px_3px_8px_#b8bec7,_inset_-3px_-3px_8px_#ffffff] ' +
            'dark:active:shadow-[inset_3px_3px_8px_#141720,_inset_-3px_-3px_8px_#282d40] ' +
            'transition-shadow duration-150 rounded-xl border-0',

        secondaryButton:
            'bg-[#e0e5ec] dark:bg-[#1e2130] ' +
            'text-[#4a5568] dark:text-[#8896b0] font-medium ' +
            'shadow-[4px_4px_10px_#b8bec7,_-4px_-4px_10px_#ffffff] ' +
            'dark:shadow-[4px_4px_10px_#141720,_-4px_-4px_10px_#282d40] ' +
            'hover:shadow-[2px_2px_5px_#b8bec7,_-2px_-2px_5px_#ffffff] ' +
            'dark:hover:shadow-[2px_2px_5px_#141720,_-2px_-2px_5px_#282d40] ' +
            'transition-shadow duration-150 rounded-xl border-0',

        // ─── Inputs (inset = "pressed in" look) ─────────────────────────
        inputBackground:
            'bg-[#e0e5ec] dark:bg-[#1e2130] ' +
            'shadow-[inset_4px_4px_10px_#b8bec7,_inset_-4px_-4px_10px_#ffffff] ' +
            'dark:shadow-[inset_4px_4px_10px_#141720,_inset_-4px_-4px_10px_#282d40] ' +
            'rounded-xl border-0',

        inputBorder:
            'border-0 focus:ring-2 focus:ring-[#5b7fff]/40 dark:focus:ring-[#7b9fff]/30',

        inputText:
            'text-[#2d3748] dark:text-[#e2e8f0] placeholder-[#a0aec0] dark:placeholder-[#4a5568]',

        paginationButton:
            'bg-[#e0e5ec] dark:bg-[#1e2130] ' +
            'text-[#4a5568] dark:text-[#8896b0] ' +
            'shadow-[3px_3px_8px_#b8bec7,_-3px_-3px_8px_#ffffff] ' +
            'dark:shadow-[3px_3px_8px_#141720,_-3px_-3px_8px_#282d40] ' +
            'hover:shadow-[1px_1px_4px_#b8bec7,_-1px_-1px_4px_#ffffff] ' +
            'dark:hover:shadow-[1px_1px_4px_#141720,_-1px_-1px_4px_#282d40] ' +
            'rounded-lg border-0 transition-shadow duration-150',

        paginationActiveButton:
            'bg-[#e0e5ec] dark:bg-[#1e2130] ' +
            'text-[#3451c7] dark:text-[#7b9fff] font-bold ' +
            'shadow-[inset_3px_3px_8px_#b8bec7,_inset_-3px_-3px_8px_#ffffff] ' +
            'dark:shadow-[inset_3px_3px_8px_#141720,_inset_-3px_-3px_8px_#282d40] ' +
            'rounded-lg border-0',

        paginationText: 'text-[#4a5568] dark:text-[#a0aec0]',

        badgeBackground:
            'bg-[#e0e5ec] dark:bg-[#1e2130] ' +
            'shadow-[2px_2px_6px_#b8bec7,_-2px_-2px_6px_#ffffff] ' +
            'dark:shadow-[2px_2px_6px_#141720,_-2px_-2px_6px_#282d40] ' +
            'rounded-full border-0',

        badgeText: 'text-[#3451c7] dark:text-[#7b9fff] font-semibold text-xs',

        tableBackground:
            'bg-[#e0e5ec] dark:bg-[#1e2130] ' +
            'shadow-[8px_8px_18px_#b8bec7,_-8px_-8px_18px_#ffffff] ' +
            'dark:shadow-[8px_8px_18px_#141720,_-8px_-8px_18px_#282d40] ' +
            'rounded-2xl border-0',

        tableBorder: 'border-[#cdd3db] dark:border-[#2a3048] border-opacity-60',

        tableHeaderBackground:
            'bg-[#d6dbe4] dark:bg-[#191d2b] ' +
            'shadow-[inset_2px_2px_5px_#b8bec7,_inset_-2px_-2px_5px_#f0f4f8] ' +
            'dark:shadow-[inset_2px_2px_5px_#111420,_inset_-2px_-2px_5px_#232840]',

        tableHeaderText:
            'text-[#4a5568] dark:text-[#8896b0] font-semibold tracking-wide uppercase text-xs',

        tableRowHover:
            'hover:bg-[#d6dbe4]/60 dark:hover:bg-[#252a3d]/60 transition-colors duration-150',
        tableRowSelected: 'bg-[#d6dbe4] dark:bg-[#252a3d]',
        tableRowBorder: 'border-[#cdd3db]/50 dark:border-[#2a3048]/50',

        tableTextPrimary: 'text-[#2d3748] dark:text-[#e2e8f0]',
        tableTextSecondary: 'text-[#4a5568] dark:text-[#8896b0]',

        tableToolbarBackground:
            'bg-[#d6dbe4] dark:bg-[#191d2b] ' +
            'shadow-[inset_2px_2px_5px_#b8bec7,_inset_-2px_-2px_5px_#f0f4f8] ' +
            'dark:shadow-[inset_2px_2px_5px_#111420,_inset_-2px_-2px_5px_#232840]',
        tableToolbarBorder: 'border-[#cdd3db]/40 dark:border-[#2a3048]/40',
        tableToolbarText: 'text-[#4a5568] dark:text-[#a0aec0] font-medium',
        tableToolbarSeparator: 'bg-[#b8bec7] dark:bg-[#141720]',
        tableIconActive: 'text-[#3451c7] dark:text-[#7b9fff]',
        tableIconInactive: 'text-[#4a5568] dark:text-[#8896b0]',
        tableMenuBackground:
            'bg-[#e0e5ec] dark:bg-[#1e2130] ' +
            'shadow-[4px_4px_10px_#b8bec7,_-4px_-4px_10px_#ffffff] ' +
            'dark:shadow-[4px_4px_10px_#141720,_-4px_-4px_10px_#282d40]',
        tableMenuBorder: 'border-0',
        tableMenuText: 'text-[#4a5568] dark:text-[#a0aec0]',
    },

    glassmorphism: {
        name: 'Glassmorphism',
        appContentBackdrop:
            'bg-gradient-to-br from-indigo-700/40 via-purple-600/40 to-rose-600/40 dark:from-indigo-950 dark:via-purple-950 dark:to-rose-950',

        cardBackground:
            'bg-white/18 dark:bg-black/55 backdrop-blur-3xl ' +
            'shadow-[0_8px_32px_rgba(0,0,0,0.30)] ' +
            'dark:shadow-[0_8px_32px_rgba(0,0,0,0.60)]',

        cardBorder: 'border-white/40 dark:border-white/20',

        headerBackground: 'bg-white/25 dark:bg-black/60 backdrop-blur-3xl',

        headerText:
            'text-indigo-950 dark:text-white font-bold tracking-wide ' +
            'dark:[text-shadow:0_2px_12px_rgba(0,0,0,0.6)]',

        primaryButton:
            'bg-white/35 dark:bg-white/20 ' +
            'hover:bg-white/45 dark:hover:bg-white/30 ' +
            'backdrop-blur-md ' +
            'text-indigo-950 dark:text-white font-bold ' +
            'dark:[text-shadow:0_1px_8px_rgba(0,0,0,0.5)] ' +
            'shadow-[0_4px_16px_rgba(0,0,0,0.3)] ' +
            'hover:shadow-[0_6px_24px_rgba(0,0,0,0.4)] ' +
            'active:scale-95 transition-all duration-200',

        secondaryButton:
            'bg-white/15 dark:bg-white/15 ' +
            'hover:bg-white/25 dark:hover:bg-white/20 ' +
            'backdrop-blur-md ' +
            'text-indigo-900 dark:text-white font-semibold ' +
            'shadow-[0_2px_10px_rgba(0,0,0,0.2)] ' +
            'transition-all duration-200',

        inputBackground:
            'bg-white/20 dark:bg-black/55 ' +
            'backdrop-blur-xl ' +
            'shadow-[inset_0_2px_10px_rgba(0,0,0,0.25)]',

        inputBorder:
            'border-white/40 dark:border-white/25 ' +
            'focus:border-white/70 dark:focus:border-white/50',

        inputText:
            'text-indigo-950 dark:text-white font-medium ' +
            'placeholder-indigo-950/40 dark:placeholder-white/30',

        paginationButton:
            'bg-white/20 dark:bg-white/12 ' +
            'hover:bg-white/30 dark:hover:bg-white/18 ' +
            'backdrop-blur-md ' +
            'text-indigo-900 dark:text-white font-semibold ' +
            'shadow-[0_2px_8px_rgba(0,0,0,0.2)] ' +
            'transition-all duration-150',

        paginationActiveButton:
            'bg-white/50 dark:bg-white/30 ' +
            'backdrop-blur-md ' +
            'text-indigo-950 dark:text-white font-extrabold ' +
            'dark:[text-shadow:0_1px_10px_rgba(0,0,0,0.5)] ' +
            'shadow-[0_4px_16px_rgba(255,255,255,0.25)]',

        paginationText: 'text-indigo-900 dark:text-white font-semibold',

        badgeBackground:
            'bg-white/25 dark:bg-white/15 ' +
            'backdrop-blur-sm ' +
            'shadow-[0_2px_8px_rgba(0,0,0,0.2)]',

        badgeText: 'text-indigo-950 dark:text-white font-bold text-xs',

        tableBackground:
            'bg-white/22 dark:bg-black/55 ' +
            'backdrop-blur-3xl ' +
            'shadow-[0_16px_48px_rgba(0,0,0,0.40)] ' +
            'dark:shadow-[0_16px_48px_rgba(0,0,0,0.80)]',

        tableBorder: 'border-white/25 dark:border-white/15',

        tableHeaderBackground: 'bg-white/25 dark:bg-black/65 backdrop-blur-xl',

        tableHeaderText:
            'text-indigo-950 dark:text-white font-bold tracking-widest uppercase text-xs',

        tableRowHover:
            'hover:bg-white/25 dark:hover:bg-white/15 ' +
            'transition-colors duration-150',
        tableRowSelected: 'bg-white/40 dark:bg-white/25',
        tableRowBorder: 'border-white/20 dark:border-white/10',

        // High contrast Indigo-950 used for maximum legibility on light glass
        tableTextPrimary: 'text-indigo-950 dark:text-white font-bold',

        tableTextSecondary:
            'text-indigo-900/80 dark:text-white/80 font-semibold',

        tableToolbarBackground: 'bg-white/20 dark:bg-black/45 backdrop-blur-xl',
        tableToolbarBorder: 'border-white/30 dark:border-white/15',
        tableToolbarText: 'text-indigo-950 dark:text-white font-bold',
        tableToolbarSeparator: 'bg-white/35 dark:bg-white/18',
        tableIconActive: 'text-indigo-950 dark:text-white',
        tableIconInactive: 'text-indigo-950/60 dark:text-white/60',
        tableMenuBackground: 'bg-black/70 dark:bg-black/90 backdrop-blur-3xl',
        tableMenuBorder: 'border-white/40 dark:border-white/20',
        tableMenuText: 'text-white',
    },

    glassmorphism1: {
        name: 'Glassmorphism1',
        darkOnly: true,
        appContentBackdrop: [
            'min-h-screen',
            'bg-gradient-to-br',
            'from-[#0f0c29]',
            'via-[#302b63]',
            'to-[#24243e]',
            'relative',
            'overflow-hidden',
        ].join(' '),

        // ─── REQUIREMENT ─────────────────────────────────────────────────
        // Page wrapper must have a rich background, e.g.:
        // className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900"
        // Glass on a white/light bg = invisible. Dark vivid backdrops only.
        // ─────────────────────────────────────────────────────────────────

        // ✨ Optional: decorative blobs as separate utility or component
        backdropDecorations: [
            'absolute',
            'w-[500px]',
            'h-[500px]',
            'rounded-full',
            'bg-violet-600/30',
            'blur-[100px]',
            'pointer-events-none',
        ].join(' '),

        // Bumped to white/20 so the glass surface is dark enough for white text
        cardBackground: 'bg-white/20 dark:bg-white/10 ' + 'backdrop-blur-2xl',

        cardBorder: 'border-white/30 dark:border-white/15',

        // Darkest surface = most readable. black/40 ensures the header
        // always has enough contrast regardless of backdrop color.
        headerBackground: 'bg-black/35 dark:bg-black/50 ' + 'backdrop-blur-3xl',

        headerText: 'text-white font-bold tracking-wide drop-shadow-md',

        primaryButton:
            'bg-white/25 dark:bg-white/15 ' +
            'hover:bg-white/30 dark:hover:bg-white/25 ' +
            'backdrop-blur-md ' +
            'text-white font-bold ' +
            'drop-shadow-md ' +
            'shadow-[0_4px_16px_rgba(0,0,0,0.25)] ' +
            'hover:shadow-[0_6px_24px_rgba(0,0,0,0.35)] ' +
            'active:bg-black/20 ' +
            'transition-all duration-200',

        secondaryButton:
            'bg-black/20 dark:bg-black/30 ' +
            'hover:bg-black/30 dark:hover:bg-black/40 ' +
            'backdrop-blur-md ' +
            'text-white font-semibold ' +
            'drop-shadow-sm ' +
            'transition-all duration-200',

        // Dark inner surface = white text always readable regardless of backdrop
        inputBackground: 'bg-black/25 dark:bg-black/40 ' + 'backdrop-blur-xl',

        inputBorder:
            'border border-white/25 dark:border-white/15 ' +
            'focus:border-white/60 dark:focus:border-white/40 ' +
            'focus:ring-2 focus:ring-white/20 dark:focus:ring-white/10',

        inputText:
            'text-white font-medium ' +
            'placeholder-white/50 dark:placeholder-white/35',

        paginationButton:
            'bg-black/20 dark:bg-black/30 ' +
            'hover:bg-black/35 dark:hover:bg-black/45 ' +
            'backdrop-blur-md ' +
            'text-white font-semibold ' +
            'drop-shadow-sm ' +
            'shadow-[0_2px_8px_rgba(0,0,0,0.20)] ' +
            'transition-all duration-150',

        paginationActiveButton:
            'bg-white/30 dark:bg-white/20 ' +
            'backdrop-blur-md ' +
            'text-white font-extrabold ' +
            'drop-shadow-md ' +
            'shadow-[0_4px_16px_rgba(255,255,255,0.15)]',

        paginationText:
            'text-white/90 dark:text-white/90 font-semibold drop-shadow-sm',

        badgeBackground:
            'bg-black/25 dark:bg-black/35 ' +
            'backdrop-blur-sm ' +
            'shadow-[0_2px_8px_rgba(0,0,0,0.20)]',

        badgeText: 'text-white font-bold text-xs drop-shadow-sm',

        tableBackground:
            'bg-black/25 dark:bg-black/40 ' +
            'backdrop-blur-2xl ' +
            'shadow-[0_16px_48px_rgba(0,0,0,0.35)] ' +
            'dark:shadow-[0_16px_48px_rgba(0,0,0,0.60)]',

        tableBorder: 'border-white/12 dark:border-white/6',

        // Header row: solid enough to anchor column labels
        tableHeaderBackground:
            'bg-black/35 dark:bg-black/50 ' + 'backdrop-blur-xl',

        tableHeaderText:
            'text-white font-bold tracking-widest uppercase text-xs drop-shadow-md',

        tableRowHover:
            'hover:bg-white/10 dark:hover:bg-white/6 ' +
            'transition-colors duration-150',
        tableRowSelected: 'bg-white/20 dark:bg-white/12',
        tableRowBorder: 'border-white/8 dark:border-white/4',

        // Full white, semibold — guaranteed legibility
        tableTextPrimary: 'text-white font-semibold drop-shadow-sm',

        // Minimum white/80 — never go below this on glass
        tableTextSecondary:
            'text-white/80 dark:text-white/70 font-medium drop-shadow-sm',

        tableToolbarBackground:
            'bg-black/30 dark:bg-black/45 ' + 'backdrop-blur-xl',
        tableToolbarBorder: 'border-white/15 dark:border-white/8',
        tableToolbarText: 'text-white font-medium',
        tableToolbarSeparator: 'bg-white/20 dark:bg-white/10',
        tableIconActive: 'text-white',
        tableIconInactive: 'text-white/60',
        tableMenuBackground: 'bg-black/60 dark:bg-black/80 backdrop-blur-3xl',
        tableMenuBorder: 'border-white/20 dark:border-white/10',
        tableMenuText: 'text-white',
    },

    glassmorphism2: {
        name: 'Glassmorphism2',
        darkOnly: true,
        appContentBackdrop:
            'relative bg-gradient-to-br from-sky-900 via-purple-950 to-fuchsia-950 overflow-hidden',

        // ─── BACKDROP REQUIREMENT ─────────────────────────────────────────
        // Your page root MUST have a dark vivid gradient, e.g.:
        // "min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]"
        // Add decorative blobs with filter:blur(80px) behind everything.
        // Glass on white/light backgrounds = completely invisible.
        // ─────────────────────────────────────────────────────────────────

        cardBackground: [
            '[background:rgba(255,255,255,0.08)]',
            '[backdrop-filter:blur(24px)_saturate(180%)]',
            '[box-shadow:0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.15)]',
        ].join(' '),

        cardBorder: 'border-white/[0.18]',

        // ─── Header — most opaque surface for best text contrast ─────────
        headerBackground: [
            '[background:rgba(0,0,0,0.40)]',
            '[backdrop-filter:blur(32px)_saturate(200%)]',
        ].join(' '),

        // ✅ Solid white — never use opacity on primary text
        headerText: 'text-white font-bold tracking-wide',

        primaryButton: [
            'font-semibold text-white',
            '[background:rgba(255,255,255,0.18)]',
            '[backdrop-filter:blur(12px)]',
            '[box-shadow:0_4px_16px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.20)]',
            'hover:[background:rgba(255,255,255,0.28)]',
            'transition-all duration-200',
        ].join(' '),

        secondaryButton: [
            'font-medium',
            '[color:rgba(255,255,255,0.85)]',
            '[background:rgba(255,255,255,0.06)]',
            '[backdrop-filter:blur(12px)]',
            'hover:[background:rgba(255,255,255,0.13)]',
            'hover:text-white',
            'transition-all duration-200',
        ].join(' '),

        // ─── Inputs — dark surface = white text always readable ───────────
        inputBackground: [
            '[background:rgba(0,0,0,0.28)]',
            '[backdrop-filter:blur(16px)]',
            '[box-shadow:inset_0_2px_8px_rgba(0,0,0,0.20)]',
        ].join(' '),

        inputBorder: [
            'border border-white/[0.18]',
            'focus:border-white/[0.45]',
            'focus:[box-shadow:inset_0_2px_8px_rgba(0,0,0,0.20),0_0_0_3px_rgba(255,255,255,0.10)]',
        ].join(' '),

        // ✅ Solid white text, 40% placeholder — tested minimum
        inputText: 'text-white font-medium placeholder-white/40',

        paginationButton: [
            'font-medium',
            '[color:rgba(255,255,255,0.80)]',
            '[background:rgba(255,255,255,0.08)]',
            '[backdrop-filter:blur(12px)]',
            'hover:[background:rgba(255,255,255,0.16)]',
            'hover:text-white',
            'transition-all duration-150',
        ].join(' '),

        paginationActiveButton: [
            'font-bold text-white',
            '[background:rgba(255,255,255,0.25)]',
            '[box-shadow:0_4px_16px_rgba(255,255,255,0.12)]',
        ].join(' '),

        // ✅ 75% white minimum for secondary text — never below this
        paginationText: 'text-white/90 font-medium',

        badgeBackground: [
            '[background:rgba(255,255,255,0.12)]',
            '[backdrop-filter:blur(8px)]',
        ].join(' '),

        badgeText: 'text-white font-bold text-xs',

        tableBackground: [
            '[background:rgba(255,255,255,0.08)]',
            '[backdrop-filter:blur(24px)_saturate(180%)]',
            '[box-shadow:0_16px_48px_rgba(0,0,0,0.35)]',
        ].join(' '),

        tableBorder: 'border-white/[0.07]',

        tableHeaderBackground: [
            '[background:rgba(0,0,0,0.35)]',
            '[backdrop-filter:blur(16px)]',
        ].join(' '),

        // ✅ Solid white + bold + uppercase — no contrast issues
        tableHeaderText:
            'text-white font-bold text-xs uppercase tracking-widest',

        tableRowHover:
            '[&:hover]:[background:rgba(255,255,255,0.06)] transition-colors duration-150',
        tableRowSelected: '[background:rgba(255,255,255,0.12)]',
        tableRowBorder: 'border-white/[0.07]',

        tableTextPrimary: 'text-white font-semibold', // ✅ 100% — primary
        tableTextSecondary: 'text-white/90 font-medium', // ✅ 75% — readable minimum

        tableToolbarBackground: [
            '[background:rgba(0,0,0,0.35)]',
            '[backdrop-filter:blur(16px)]',
        ].join(' '),
        tableToolbarBorder: 'border-white/[0.12]',
        tableToolbarText: 'text-white font-medium',
        tableToolbarSeparator: 'bg-white/20',
        tableIconActive: 'text-white',
        tableIconInactive: 'text-white/60',
        tableMenuBackground: 'bg-black/60 backdrop-blur-3xl',
        tableMenuBorder: 'border-white/[0.12]',
        tableMenuText: 'text-white',
    },
    modern6: {
        name: 'Modern6',
        darkOnly: true,
        appContentBackdrop:
            'bg-gradient-to-br from-indigo-950 via-purple-950 to-fuchsia-950',

        // ── BACKDROP (your page root) ──────────────────────────────────
        // 'min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-fuchsia-950 relative overflow-hidden'
        // + colored blobs: 'absolute w-[500px] h-[500px] rounded-full bg-violet-600 opacity-50 blur-[100px]'

        cardBackground: 'bg-white/10 backdrop-blur-2xl shadow-2xl',

        cardBorder: 'border-white/20',

        headerBackground: 'bg-black/40 backdrop-blur-2xl',

        headerText: 'text-white font-bold tracking-wide',

        primaryButton:
            'bg-white/20 hover:bg-white/30 text-white font-semibold backdrop-blur-md shadow-lg transition-all duration-200',

        secondaryButton:
            'bg-white/8 hover:bg-white/15 text-white/85 hover:text-white font-medium backdrop-blur-md transition-all duration-200',

        inputBackground:
            'bg-black/30 backdrop-blur-xl outline-none transition-all duration-150',

        inputBorder:
            'border border-white/20 focus:border-white/45 focus:ring-2 focus:ring-white/10',

        inputText: 'text-white font-medium placeholder:text-white/40',

        paginationButton:
            'bg-white/8 hover:bg-white/15 text-white/80 hover:text-white font-medium backdrop-blur-md transition-all duration-150',

        paginationActiveButton: 'bg-white/25 text-white font-bold shadow-lg',

        paginationText: 'text-white/90 font-medium',

        badgeBackground: 'bg-white/15 backdrop-blur-sm',

        badgeText: 'text-white font-bold text-xs',

        tableBackground:
            'bg-white/10 backdrop-blur-2xl border border-white/15 shadow-2xl rounded-2xl overflow-hidden',

        tableBorder: 'border-white/8',

        tableHeaderBackground:
            'bg-black/35 backdrop-blur-xl border-b border-white/10',

        tableHeaderText:
            'text-white font-bold text-xs uppercase tracking-widest',

        tableRowHover: 'hover:bg-white/8 transition-colors duration-150',
        tableRowSelected: 'bg-white/16',
        tableRowBorder: 'border-white/8',

        tableTextPrimary: 'text-white font-semibold',
        tableTextSecondary: 'text-white/90 font-medium',

        tableToolbarBackground: 'bg-black/35 backdrop-blur-xl',
        tableToolbarBorder: 'border-white/10',
        tableToolbarText: 'text-white font-medium',
        tableToolbarSeparator: 'bg-white/20',
        tableIconActive: 'text-white',
        tableIconInactive: 'text-white/60',
        tableMenuBackground: 'bg-black/60 backdrop-blur-3xl',
        tableMenuBorder: 'border-white/20',
        tableMenuText: 'text-white',
    },
};

export const DENSITY_CONFIGS: Record<DensityType, DensityConfig> = {
    compact: {
        buttonSize: '!h-7 !w-7 text-xs',
        buttonPadding: '!p-0',
        gap: 'gap-0.5',
        textSize: 'text-xs',
        cellPadding: 'px-4 py-1 h-10',
        headerPadding: 'px-3 py-3',
        avatarSize: 'h-6 w-6',
        fontSize: 'text-sm',
        badgePadding: 'px-2 py-0.5 text-xs',
    },
    normal: {
        buttonSize: '!h-9 !w-9 text-sm',
        buttonPadding: '!p-0',
        gap: 'gap-1',
        textSize: 'text-sm',
        cellPadding: 'px-4 py-1.25 h-11',
        headerPadding: 'px-4 py-3.5',
        avatarSize: 'h-7 w-7',
        fontSize: 'text-sm',
        badgePadding: 'px-2.5 py-1 text-xs',
    },
    relaxed: {
        buttonSize: '!h-10 !w-10 text-base',
        buttonPadding: '!p-0',
        gap: 'gap-2',
        textSize: 'text-base',
        cellPadding: 'px-4 py-2 h-12',
        headerPadding: 'px-4 py-4',
        avatarSize: 'h-8 w-8',
        fontSize: 'text-base',
        badgePadding: 'px-3 py-1.5 text-xs',
    },
};

export const THEME_COLOR_DISPLAY: Record<string, string> = {
    default: 'bg-gray-500',
    blue: 'bg-blue-500',
    green: 'bg-emerald-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    yellow: 'bg-yellow-500',
    teal: 'bg-teal-500',
    cyan: 'bg-cyan-500',
    indigo: 'bg-indigo-500',
    pink: 'bg-pink-500',
    rose: 'bg-rose-500',
    slate: 'bg-slate-500',
    zinc: 'bg-zinc-500',
    stone: 'bg-stone-500',
    neutral: 'bg-neutral-500',
    lime: 'bg-lime-500',
    amber: 'bg-amber-500',
    violet: 'bg-violet-500',
    fuchsia: 'bg-fuchsia-500',
    sky: 'bg-sky-500',
};

export const getTheme = (
    themeName: string,
    fallback = 'default',
): ThemeConfig => {
    return (
        PREBUILT_THEMES[themeName] ||
        PREBUILT_THEMES[fallback] ||
        PREBUILT_THEMES.default
    );
};

/**
 * The Tailwind colour family a theme class string is drawn in ("blue", "emerald"). Single-colour presets
 * use the shared tc-* utilities plus a theme-<family> class (see styles/palettes.css), so
 * the family is read from that class first; bespoke presets still name the colour in the utility.
 */
const PALETTE_CLASS =
    /\btheme-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)\b/;

export const themeColorFamily = (classes?: string | null): string | null =>
    classes?.match(PALETTE_CLASS)?.[1] ?? classes?.match(/\bbg-([a-z0-9-]+)-\d+/)?.[1] ?? null;

export const getThemeDisplayColor = (themeName: string): string => {
    return THEME_COLOR_DISPLAY[themeName] || 'bg-gray-500';
};

export const getAvailableThemes = (): string[] => {
    return Object.keys(PREBUILT_THEMES);
};
export const themeHexMap: Record<string, string> = {
    default: '#4b5563', // gray-600
    gray: '#4b5563',
    blue: '#2563eb', // blue-600
    green: '#10b981', // emerald-500
    emerald: '#10b981',
    purple: '#9333ea', // purple-600
    red: '#dc2626', // red-600
    orange: '#ea580c', // orange-600
    yellow: '#ca8a04', // yellow-600
    teal: '#0d9488', // teal-600
    cyan: '#0891b2', // cyan-600
    indigo: '#4f46e5', // indigo-600
    pink: '#db2777', // pink-600
    rose: '#e11d48', // rose-600
    slate: '#475569', // slate-600
    zinc: '#52525b', // zinc-600
    stone: '#57534e', // stone-600
    neutral: '#525252', // neutral-600
    lime: '#65a30d', // lime-600
    amber: '#d97706', // amber-600
    violet: '#7c3aed', // violet-600
    fuchsia: '#c026d3', // fuchsia-600
    sky: '#0284c7', // sky-600
    modern: '#2563eb',
    modern1: '#3b82f6',
    modern2: '#06b6d4',
    modern3: '#1e40af',
    modern4: '#8b5cf6',
};

export const getThemeHex = (themeName: string): string => {
    return themeHexMap[themeName] || '#3b82f6';
};

const relativeLuminance = (hex: string): number => {
    const h = hex.replace('#', '');
    const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    const [r, g, b] = [0, 2, 4].map((i) => lin(parseInt(h.substring(i, i + 2), 16) / 255));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** WCAG contrast ratio between two #rrggbb colours. */
export const contrastRatio = (a: string, b: string): number => {
    const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
};

/**
 * Text colour for a solid #rrggbb fill: white if it reaches WCAG AA (4.5:1), else slate-900, else
 * black. Black is always reachable: on any fill, white or black clears 4.5:1. The single place
 * that decides "text on an accent fill" (tags, avatars, dashboard badges, printed receipts).
 */
export const readableTextOn = (hex: string): string => {
    const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(hex);
    if (short) hex = `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`;
    // Not a plain hex colour (a CSS variable, rgb(), a named colour): keep the old white.
    if (!/^#[0-9a-f]{6}$/i.test(hex)) return '#ffffff';
    for (const candidate of ['#ffffff', '#0f172a']) {
        if (contrastRatio(candidate, hex) >= 4.5) return candidate;
    }
    return '#000000';
};

/** Readable text colour on top of a preset's accent colour. */
export const getThemeTagTextColor = (themeName: string): string => readableTextOn(getThemeHex(themeName));

// ✅ Theme active switch color mapping (using !important to ensure override)
export const THEME_ACTIVE_SWITCH_COLORS: Record<string, string> = {
    blue: '!bg-blue-600',
    red: '!bg-red-600',
    green: '!bg-green-600',
    postgres: '!bg-[#336791]',
    orange: '!bg-orange-600',
    yellow: '!bg-yellow-600',
    purple: '!bg-purple-600',
    pink: '!bg-pink-600',
    indigo: '!bg-indigo-600',
    teal: '!bg-teal-600',
    cyan: '!bg-cyan-600',
    emerald: '!bg-emerald-600',
    lime: '!bg-lime-600',
    amber: '!bg-amber-600',
    violet: '!bg-violet-600',
    fuchsia: '!bg-fuchsia-600',
    rose: '!bg-rose-600',
    sky: '!bg-sky-600',
    neutral: '!bg-neutral-600',
    stone: '!bg-stone-600',
    modern: '!bg-blue-600',
    modern1: '!bg-blue-600',
    modern2: '!bg-cyan-600',
    modern3: '!bg-blue-700',
    modern4: '!bg-purple-600',
};

export const getThemeActiveSwitchColor = (
    primaryButtonClass: string = '',
): string => {
    for (const [key, cls] of Object.entries(THEME_ACTIVE_SWITCH_COLORS)) {
        if (primaryButtonClass.includes(key)) {
            // Special case: if it's a gray/neutral theme, we might want a more "active" color for switches
            // but for now let's stick to the mapped color if it exists.
            return cls;
        }
    }
    // Default fallback to blue (matches standard UI primary)
    return '!bg-blue-600';
};

export const CHECKBOX_THEME_COLORS: Record<string, string> = {
    gray: 'text-gray-600 focus:ring-gray-600',
    blue: 'text-blue-600 focus:ring-blue-600',
    red: 'text-red-600 focus:ring-red-600',
    green: 'text-green-600 focus:ring-green-600',
    emerald: 'text-emerald-600 focus:ring-emerald-600',
    orange: 'text-orange-600 focus:ring-orange-600',
    yellow: 'text-yellow-600 focus:ring-yellow-600',
    purple: 'text-purple-600 focus:ring-purple-600',
    pink: 'text-pink-600 focus:ring-pink-600',
    indigo: 'text-indigo-600 focus:ring-indigo-600',
    teal: 'text-teal-600 focus:ring-teal-600',
    cyan: 'text-cyan-600 focus:ring-cyan-600',
    lime: 'text-lime-600 focus:ring-lime-600',
    amber: 'text-amber-600 focus:ring-amber-600',
    violet: 'text-violet-600 focus:ring-violet-600',
    fuchsia: 'text-fuchsia-600 focus:ring-fuchsia-600',
    rose: 'text-rose-600 focus:ring-rose-600',
    sky: 'text-sky-600 focus:ring-sky-600',
    neutral: 'text-neutral-600 focus:ring-neutral-600',
    stone: 'text-stone-600 focus:ring-stone-600',
    slate: 'text-slate-600 focus:ring-slate-600',
    zinc: 'text-zinc-600 focus:ring-zinc-600',
    postgres: 'text-[#336791] focus:ring-[#4d82b1]',
};

export const getThemeActiveCheckboxColor = (
    primaryButtonClass: string = '',
): string => {
    for (const [key, classes] of Object.entries(CHECKBOX_THEME_COLORS)) {
        if (primaryButtonClass.includes(key)) {
            return classes;
        }
    }
    return 'text-blue-600 focus:ring-blue-600';
};

export const getThemeActiveRingColor = (
    primaryButtonClass: string = '',
): string => {
    const checkboxClass = getThemeActiveCheckboxColor(primaryButtonClass);
    return (
        checkboxClass.split(' ').find((c) => c.startsWith('focus:ring')) ||
        'focus:ring-blue-600'
    );
};

export const getThemeActiveBorderColor = (
    primaryButtonClass: string = '',
): string => {
    const ringClass = getThemeActiveRingColor(primaryButtonClass);
    return ringClass.replace('focus:ring-', 'focus:border-');
};
