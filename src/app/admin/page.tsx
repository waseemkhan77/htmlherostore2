
import { redirect } from 'next/navigation';

export default function OldAdminDashboardPage() {
    redirect('/wkhanadmin');
    // This return is technically unreachable but required by React.
    return null;
}
