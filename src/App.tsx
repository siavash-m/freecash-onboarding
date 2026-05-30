import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './App.css';
import { OnboardingScreen } from './components/OnboardingScreen';
import { QuestionFlow }     from './components/QuestionFlow';
import { SuccessScreen }    from './components/SuccessScreen';

type AppScreen = 'onboarding' | 'question' | 'success';

function App() {
  const [screen, setScreen] = useState<AppScreen>('onboarding');

  return (
    <AnimatePresence mode="wait" initial={false}>
      {screen === 'onboarding' && (
        <motion.div
          key="onboarding"
          className="fixed inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          <OnboardingScreen onContinue={() => setScreen('question')} />
        </motion.div>
      )}

      {screen === 'question' && (
        <motion.div
          key="question"
          className="fixed inset-0 flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.08 }}
          transition={{ duration: 0.25 }}
        >
          <QuestionFlow
            onBackToStart={() => setScreen('onboarding')}
            onDone={() => setScreen('success')}
          />
        </motion.div>
      )}

      {screen === 'success' && (
        <motion.div
          key="success"
          className="fixed inset-0"
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 20 }}
        >
          <SuccessScreen onGoHome={() => setScreen('onboarding')} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;
