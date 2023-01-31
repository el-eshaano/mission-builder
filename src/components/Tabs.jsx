import React, { useState } from "react";

const Tab = (props) => {

    return (
        <div 
            className={props.isActive ? "tab active" : "tab"}
            onClick={props.handleClick}
            style={props.style}
        >
            {props.text}
        </div>
    )

}

const Tabs = (props) => {

    const [activeTab, setActiveTab] = useState(0);


    const tabs = props.tabs.map((tab, index) => {

        const tab_style = {
            color: activeTab === index ? "#2A9D8F" : "#191435",
        }

        return (
            <Tab 
                text={tab} 
                id={index}
                key={index} 
                handleClick={() => {setActiveTab(index); props.handleClick(tab.toLowerCase())}}
                isActive={activeTab === index}
                style={tab_style}
                cursor="pointer"
            />
        )
    })

    const tabs_style = {
        width: `${props.tabs.length * 27 + props.tabs.length * 100}px`,
        position: "absolute",
        top: `${props.top}px`,
        left: `${props.left}px`,
        zIndex: "1000",
    }
    return (


        <div className="tab--container" style={tabs_style}>
            {tabs}
        </div>
    )
}

export default Tabs;