import { useState } from 'react';
import { Layout, SleepInputModal, OnboardingModal, IntakeModal, ToastContainer, BuyMeACoffeeWidget, ConfirmDialog } from './components';
import { DashboardPage, JournalPage, ProfilePage } from './pages';
import { PrivacyPolicyPage, TermsPage } from './pages/LegalPages';
import { FlowStateProvider, useFlowState } from './context/FlowStateContext';
import './App.css';

function AppContent() {
  const {
    activeTab,
    setActiveTab,
    sleepData,
    setSleepData,
    addIntake,
    hasOnboarded,
    completeOnboarding,
    actualSleepHours,
    showIntakeModal,
    setShowIntakeModal,
    showSleepInput,
    setShowSleepInput,
    toasts,
    dismissToast,
    confirmConfig,
    closeConfirm
  } = useFlowState();

  const [legalPage, setLegalPage] = useState<'privacy' | 'terms' | null>(null);

  // Render current page based on active tab
  const renderPage = () => {
    // Show legal pages if requested
    if (legalPage === 'privacy') {
      return <PrivacyPolicyPage onBack={() => setLegalPage(null)} />;
    }
    if (legalPage === 'terms') {
      return <TermsPage onBack={() => setLegalPage(null)} />;
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'journal':
        return <JournalPage />;
      case 'profile':
        return <ProfilePage onShowLegal={(page) => setLegalPage(page)} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Layout
        activeTab={activeTab}
        onTabChange={(tab) => {
          setLegalPage(null);
          setActiveTab(tab);
        }}
        actualSleepHours={actualSleepHours}
        onSleepClick={() => setShowSleepInput(true)}
      >
        {renderPage()}
      </Layout>

      {/* Modals */}
      <OnboardingModal
        isOpen={!hasOnboarded}
        onComplete={completeOnboarding}
      />

      <SleepInputModal
        isOpen={showSleepInput}
        onClose={() => setShowSleepInput(false)}
        sleepData={sleepData}
        onSave={setSleepData}
      />

      <IntakeModal
        isOpen={showIntakeModal}
        onClose={() => setShowIntakeModal(false)}
        onAdd={addIntake}
      />

      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        isDestructive={confirmConfig.isDestructive}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Buy Me a Coffee Widget - show after onboarding */}
      {hasOnboarded && <BuyMeACoffeeWidget username="bulletlifew" />}
    </>
  );
}

function App() {
  return (
    <FlowStateProvider>
      <AppContent />
    </FlowStateProvider>
  );
}

export default App;

