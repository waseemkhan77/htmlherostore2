
import { redirect } from 'next/navigation';

export default function OldSellRequestsPage() {
    redirect('/wkhanadmin/sell-requests');
    // This return is technically unreachable but required by React.
    return null;
}
