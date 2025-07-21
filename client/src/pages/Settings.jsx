import React from "react";
import Layout from "../components/layout/Layout";
import SettingsForm from "../components/settings/SettingsForm";

/**
 * Settings Page
 *
 * This component wraps the SettingsForm with the main Layout.
 * Used for rendering the user settings page.
 */

const Settings = () => {
  return (
    <Layout>
      <SettingsForm />
    </Layout>
  );
};

export default Settings;
