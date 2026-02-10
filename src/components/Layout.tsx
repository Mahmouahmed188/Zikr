import React, { ReactNode } from 'react';

interface LayoutProps {
    children: ReactNode;
    className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className = '' }) => {
    return (
        <div className={`w-[360px] h-[600px] overflow-hidden bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text font-sans relative flex flex-col transition-colors duration-300 ${className}`}>
            <div className="absolute inset-0 pointer-events-none opacity-50 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 dark:from-primary/10 dark:to-secondary/10" />
            <div className="flex-1 flex flex-col relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
};

export default Layout;
