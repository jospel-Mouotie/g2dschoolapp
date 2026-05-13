// hooks/useMessages.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/lib/stores';

export function useMessages() {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/messages', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Erreur chargement messages:", err);
      setError("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const sendMessage = useCallback(async (message: Omit<Message, 'id'>) => {
    if (!token) return null;
    
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(message)
      });
      
      if (response.ok) {
        const newMessage = await response.json();
        setMessages(prev => [...prev, newMessage]);
        return newMessage;
      }
    } catch (err) {
      console.error("Erreur envoi message:", err);
    }
    return null;
  }, [token]);

  const markAsRead = useCallback(async (id: number) => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/messages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id, lu: true })
      });
      
      if (response.ok) {
        setMessages(prev => prev.map(m => 
          m.id === id ? { ...m, lu: true } : m
        ));
      }
    } catch (err) {
      console.error("Erreur marquage lu:", err);
    }
  }, [token]);

  const deleteMessage = useCallback(async (id: number) => {
    if (!token) return;
    
    try {
      const response = await fetch(`/api/messages?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setMessages(prev => prev.filter(m => m.id !== id));
      }
    } catch (err) {
      console.error("Erreur suppression message:", err);
    }
  }, [token]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return { messages, loading, error, sendMessage, markAsRead, deleteMessage, refresh: fetchMessages };
}