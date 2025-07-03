
import { redirect } from 'next/navigation';

export default function OldProductsPage() {
    redirect('/wkhanadmin/products');
    // This return is technically unreachable but required by React.
    return null;
}
