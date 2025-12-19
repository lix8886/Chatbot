
import React from 'react';

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  rating?: 'liked' | 'disliked';
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  projectId?: string; // Optional ID of the project this session belongs to
}

export interface Project {
  id: string;
  name: string;
}

export enum SidebarItemType {
  ACTION = 'ACTION',
  PROJECT = 'PROJECT',
  HISTORY = 'HISTORY',
}

export interface SidebarItem {
  id: string;
  label: string;
  type: SidebarItemType;
  icon?: React.ReactNode;
}
