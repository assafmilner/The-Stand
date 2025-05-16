import React from "react";

const ProfileTabs = ({ activeTab, setActiveTab, colors }) => {
  const tabs = [
    { id: "posts", label: "פוסטים" },
    { id: "friends", label: "חברים" },
  ];

  return (
    <div className="flex justify-center border-b border-gray-200 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`mx-4 pb-2 text-sm font-medium transition-all duration-200 bg-transparent ${
            activeTab === tab.id
              ? "border-b-2"
              : "text-gray-600 border-b-2 border-transparent"
          }`}
          style={{
            color: activeTab === tab.id ? colors.primary : undefined,
            borderBottomColor:
              activeTab === tab.id ? colors.primary : undefined,
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default ProfileTabs;
