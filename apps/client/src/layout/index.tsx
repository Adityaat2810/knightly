import React from 'react';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <main >
        {children}
      </main>
    </div>
  );
};
