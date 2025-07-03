
import * as React from 'react';

// This layout is now a simple pass-through.
// The pages within this route will handle redirection to the new /wkhanadmin path.
export default function DeprecatedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
