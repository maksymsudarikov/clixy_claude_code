import React from 'react';
import { Shoot } from '../types';

interface AssistantProps {
  shoot: Shoot;
}

// Component is disabled/removed. Returns null to render nothing.
export const Assistant: React.FC<AssistantProps> = ({ shoot: _shoot }) => {
  return null;
};
