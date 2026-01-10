import NotificationsList from '@/components/dashboard/NotificationsList';

export const metadata = {
    title: 'Notifications | SweetLook',
    description: 'Consultez vos alertes et notifications sur SweetLook.',
};

export default function NotificationsPage() {
    return (
        <div className="py-4 sm:py-8">
            <NotificationsList />
        </div>
    );
}
