import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';


interface VerificationStep {
  id: string;
  label: string;
  icon: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  description?: string;
}

interface ProviderStatusTrackerProps {
  currentStep: string;
  steps: VerificationStep[];
}

export default function ProviderStatusTracker({ currentStep, steps }: ProviderStatusTrackerProps) {
  const currentIndex = steps.findIndex(step => step.id === currentStep);
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return { name: 'checkmark-circle', color: '#10b981' };
      case 'in_progress':
        return { name: 'time', color: '#f59e0b' };
      case 'failed':
        return { name: 'close-circle', color: '#ef4444' };
      default:
        return { name: 'ellipse-outline', color: '#94a3b8' };
    }
  };

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const statusIcon = getStatusIcon(isCompleted ? 'completed' : isCurrent ? 'in_progress' : step.status);
        
        return (
          <View key={step.id} style={styles.stepContainer}>
            <View style={[
              styles.iconContainer,
              isCompleted && styles.iconContainerCompleted,
              isCurrent && styles.iconContainerCurrent,
              step.status === 'failed' && styles.iconContainerFailed
            ]}>
              <Ionicons 
                name={statusIcon.name as any} 
                size={20} 
                color={isCompleted || isCurrent ? 'white' : statusIcon.color} 
              />
            </View>
            
            <View style={styles.stepContent}>
              <Text style={[
                styles.stepLabel,
                (isCompleted || isCurrent) && styles.stepLabelActive,
                step.status === 'failed' && styles.stepLabelFailed
              ]}>
                {step.label}
              </Text>
              
              {step.description && (
                <Text style={styles.stepDescription}>
                  {step.description}
                </Text>
              )}
            </View>
            
            {index < steps.length - 1 && (
              <View style={[
                styles.connector,
                isCompleted && styles.connectorActive,
                step.status === 'failed' && styles.connectorFailed
              ]} />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
    minHeight: 60,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    zIndex: 2,
  },
  iconContainerCompleted: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  iconContainerCurrent: {
    backgroundColor: '#0d9488',
    borderColor: '#0d9488',
  },
  iconContainerFailed: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
  },
  stepContent: {
    flex: 1,
    marginLeft: 12,
    paddingTop: 8,
  },
  stepLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  stepLabelActive: {
    color: '#1e293b',
  },
  stepLabelFailed: {
    color: '#ef4444',
  },
  stepDescription: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
  connector: {
    position: 'absolute',
    top: 40,
    left: 19,
    width: 2,
    flex:1,
    backgroundColor: '#e2e8f0',
    zIndex: 1,
  },
  connectorActive: {
    backgroundColor: '#10b981',
  },
  connectorFailed: {
    backgroundColor: '#ef4444',
  },
});