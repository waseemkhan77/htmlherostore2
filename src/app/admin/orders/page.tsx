
import { redirect } from 'next/navigation';

export default function OldOrdersPage() {
    redirect('/wkhanadmin/orders');
    // This return is technically unreachable but required by React.
    return null;
}
