
import { redirect } from 'next/navigation';

export default function OldMyAppsPage() {
    redirect('/wkhanadmin/my-apps');
    // This return is technically unreachable but required by React.
    return null;
}
