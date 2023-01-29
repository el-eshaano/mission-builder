import React from "react";

// Create a tab group that holds multiple tabs which are plain text
// and can be clicked to switch between them

interface TabGroupProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    children: React.ReactNode;
}

const TabGroup = ({ activeTab, setActiveTab, children }: TabGroupProps) => {
    return (
        <div className="tab-group">
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child, {
                        child.props.activeTab = activeTab;
                        child.props.setActiveTab = setActiveTab;
                    });
                }
                return child;
            })}
        </div>
    );
};

interface TabProps {
    text: string;
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const Tab = ({ text, activeTab, setActiveTab }: TabProps) => {
    return (
        <div
            className={`tab ${activeTab === text ? "active" : ""}`}
            onClick={() => setActiveTab(text)}
        >
            {text}
        </div>
    );
};

export { TabGroup, Tab };