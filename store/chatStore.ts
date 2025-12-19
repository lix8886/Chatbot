import { ChatSession, Project } from '../types';

const CHAT_STORAGE_KEY = 'gemini_chat_history';
const PROJECT_STORAGE_KEY = 'gemini_project_history';

/**
 * 从本地存储加载会话列表
 * Loads chat sessions from the local store folder (simulated via localStorage)
 */
export const loadSessionsFromStore = (): ChatSession[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedData = localStorage.getItem(CHAT_STORAGE_KEY);
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (error) {
    console.error("Failed to load sessions from store:", error);
  }
  
  return [];
};

/**
 * 保存会话列表到本地存储
 * Saves chat sessions to the local store
 */
export const saveSessionsToStore = (sessions: ChatSession[]): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error("Failed to save sessions to store:", error);
  }
};

/**
 * 从本地存储加载项目列表
 * Loads projects from local store. Returns default projects if empty.
 */
export const loadProjectsFromStore = (): Project[] => {
  if (typeof window === 'undefined') return [];

  try {
    const storedData = localStorage.getItem(PROJECT_STORAGE_KEY);
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (error) {
    console.error("Failed to load projects from store:", error);
  }

  // Default projects if none exist
  return [
    { id: 'p1', name: 'python编程' },
    { id: 'p2', name: '写作' },
  ];
};

/**
 * 保存项目列表到本地存储
 */
export const saveProjectsToStore = (projects: Project[]): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error("Failed to save projects to store:", error);
  }
};
