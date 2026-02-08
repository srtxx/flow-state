import { Layout, SleepInputModal, OnboardingModal, IntakeModal, ToastContainer, BuyMeACoffeeWidget, ConfirmDialog } from './components';
import { DashboardPage, JournalPage, ProfilePage } from './pages';
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

  // Render current page based on active tab
  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'journal':
        return <JournalPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return null;
    }
  };

  return (
    <>
      <Layout
        activeTab={activeTab}
        onTabChange={setActiveTab}
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
