/**
 * Configuration et logique des alertes admin
 * Définit les seuils et règles pour déclencher des alertes
 */

export interface AlertConfig {
    id: string;
    name: string;
    description: string;
    type: 'warning' | 'danger' | 'info';
    icon: string;
    checkFn: (stats: any) => boolean;
    getMessage: (stats: any) => string;
    href?: string;
    priority: number; // 1 = haute, 2 = moyenne, 3 = basse
}

export interface ActiveAlert {
    id: string;
    name: string;
    message: string;
    type: 'warning' | 'danger' | 'info';
    icon: string;
    href?: string;
    priority: number;
    timestamp: string;
}

/**
 * Configuration des alertes avec seuils
 * Modifiez ces valeurs selon vos besoins
 */
export const ALERT_THRESHOLDS = {
    // Signalements
    pendingReportsWarning: 3,   // Alerte jaune à partir de X signalements
    pendingReportsDanger: 10,  // Alerte rouge à partir de X signalements

    // Annonces en attente de modération
    pendingAdsWarning: 5,
    pendingAdsDanger: 20,

    // Utilisateurs en attente de validation
    pendingUsersWarning: 5,
    pendingUsersDanger: 15,

    // Tickets support
    openTicketsWarning: 5,
    openTicketsDanger: 15,

    // Utilisateurs bannis (surveillance)
    bannedUsersInfo: 5,

    // Taux d'approbation bas
    lowApprovalRateThreshold: 50, // % minimum acceptable

    // Taux de vérification bas
    lowVerificationRateThreshold: 30, // % minimum acceptable
};

/**
 * Définition des règles d'alertes
 */
export const ALERT_RULES: AlertConfig[] = [
    // === ALERTES CRITIQUES (DANGER) ===
    {
        id: 'reports-critical',
        name: 'Signalements critiques',
        description: `Plus de ${ALERT_THRESHOLDS.pendingReportsDanger} signalements en attente`,
        type: 'danger',
        icon: 'AlertTriangle',
        priority: 1,
        href: '/admin/reports',
        checkFn: (stats) => stats.moderation?.pendingReports >= ALERT_THRESHOLDS.pendingReportsDanger,
        getMessage: (stats) => `${stats.moderation?.pendingReports} signalements en attente nécessitent une action urgente`,
    },
    {
        id: 'ads-moderation-critical',
        name: 'Modération urgente',
        description: `Plus de ${ALERT_THRESHOLDS.pendingAdsDanger} annonces en attente`,
        type: 'danger',
        icon: 'ShoppingBag',
        priority: 1,
        href: '/admin/ads?moderationStatus=PENDING',
        checkFn: (stats) => stats.ads?.pending >= ALERT_THRESHOLDS.pendingAdsDanger,
        getMessage: (stats) => `${stats.ads?.pending} annonces attendent validation depuis trop longtemps`,
    },
    {
        id: 'support-critical',
        name: 'Support débordé',
        description: `Plus de ${ALERT_THRESHOLDS.openTicketsDanger} tickets ouverts`,
        type: 'danger',
        icon: 'HeadphonesIcon',
        priority: 1,
        href: '/admin/support',
        checkFn: (stats) => stats.moderation?.totalTicketsPending >= ALERT_THRESHOLDS.openTicketsDanger,
        getMessage: (stats) => `${stats.moderation?.totalTicketsPending} tickets de support en attente`,
    },

    // === ALERTES AVERTISSEMENT (WARNING) ===
    {
        id: 'reports-warning',
        name: 'Signalements en attente',
        description: `${ALERT_THRESHOLDS.pendingReportsWarning}+ signalements`,
        type: 'warning',
        icon: 'AlertTriangle',
        priority: 2,
        href: '/admin/reports',
        checkFn: (stats) => {
            const count = stats.moderation?.pendingReports || 0;
            return count >= ALERT_THRESHOLDS.pendingReportsWarning && count < ALERT_THRESHOLDS.pendingReportsDanger;
        },
        getMessage: (stats) => `${stats.moderation?.pendingReports} signalements à traiter`,
    },
    {
        id: 'ads-moderation-warning',
        name: 'Annonces à modérer',
        description: `${ALERT_THRESHOLDS.pendingAdsWarning}+ annonces en attente`,
        type: 'warning',
        icon: 'ShoppingBag',
        priority: 2,
        href: '/admin/ads?moderationStatus=PENDING',
        checkFn: (stats) => {
            const count = stats.ads?.pending || 0;
            return count >= ALERT_THRESHOLDS.pendingAdsWarning && count < ALERT_THRESHOLDS.pendingAdsDanger;
        },
        getMessage: (stats) => `${stats.ads?.pending} annonces en attente de validation`,
    },
    {
        id: 'users-validation-warning',
        name: 'Utilisateurs à valider',
        description: `${ALERT_THRESHOLDS.pendingUsersWarning}+ utilisateurs en attente`,
        type: 'warning',
        icon: 'Users',
        priority: 2,
        href: '/admin/users?status=PENDING',
        checkFn: (stats) => stats.users?.byStatus?.pending >= ALERT_THRESHOLDS.pendingUsersWarning,
        getMessage: (stats) => `${stats.users?.byStatus?.pending} utilisateurs attendent validation`,
    },
    {
        id: 'support-warning',
        name: 'Tickets support',
        description: `${ALERT_THRESHOLDS.openTicketsWarning}+ tickets ouverts`,
        type: 'warning',
        icon: 'HeadphonesIcon',
        priority: 2,
        href: '/admin/support',
        checkFn: (stats) => {
            const count = stats.moderation?.totalTicketsPending || 0;
            return count >= ALERT_THRESHOLDS.openTicketsWarning && count < ALERT_THRESHOLDS.openTicketsDanger;
        },
        getMessage: (stats) => `${stats.moderation?.totalTicketsPending} tickets de support à traiter`,
    },
    {
        id: 'low-approval-rate',
        name: 'Taux d\'approbation bas',
        description: `Taux < ${ALERT_THRESHOLDS.lowApprovalRateThreshold}%`,
        type: 'warning',
        icon: 'TrendingDown',
        priority: 2,
        href: '/admin/ads',
        checkFn: (stats) => stats.ads?.approvalRate < ALERT_THRESHOLDS.lowApprovalRateThreshold && stats.ads?.total > 10,
        getMessage: (stats) => `Taux d'approbation à ${stats.ads?.approvalRate}% (seuil: ${ALERT_THRESHOLDS.lowApprovalRateThreshold}%)`,
    },

    // === ALERTES INFO ===
    {
        id: 'banned-users-info',
        name: 'Utilisateurs bannis',
        description: `${ALERT_THRESHOLDS.bannedUsersInfo}+ comptes bannis`,
        type: 'info',
        icon: 'UserX',
        priority: 3,
        href: '/admin/users?status=BANNED',
        checkFn: (stats) => stats.users?.byStatus?.banned >= ALERT_THRESHOLDS.bannedUsersInfo,
        getMessage: (stats) => `${stats.users?.byStatus?.banned} comptes sont actuellement bannis`,
    },
    {
        id: 'growth-positive',
        name: 'Croissance positive',
        description: 'Forte croissance cette semaine',
        type: 'info',
        icon: 'TrendingUp',
        priority: 3,
        checkFn: (stats) => stats.users?.trend7Days > 50,
        getMessage: (stats) => `Croissance de +${stats.users?.trend7Days}% d'utilisateurs cette semaine !`,
    },
];

/**
 * Évalue les stats et retourne les alertes actives
 */
export function evaluateAlerts(stats: any): ActiveAlert[] {
    if (!stats) return [];

    const activeAlerts: ActiveAlert[] = [];
    const now = new Date().toISOString();

    for (const rule of ALERT_RULES) {
        try {
            if (rule.checkFn(stats)) {
                activeAlerts.push({
                    id: rule.id,
                    name: rule.name,
                    message: rule.getMessage(stats),
                    type: rule.type,
                    icon: rule.icon,
                    href: rule.href,
                    priority: rule.priority,
                    timestamp: now,
                });
            }
        } catch (error) {
            // Ignorer les erreurs de règles individuelles
            console.error(`Error evaluating alert rule ${rule.id}:`, error);
        }
    }

    // Trier par priorité (1 = plus urgent)
    return activeAlerts.sort((a, b) => a.priority - b.priority);
}

/**
 * Compte les alertes par type
 */
export function countAlertsByType(alerts: ActiveAlert[]): { danger: number; warning: number; info: number } {
    return alerts.reduce(
        (acc, alert) => {
            acc[alert.type]++;
            return acc;
        },
        { danger: 0, warning: 0, info: 0 }
    );
}
