import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface HistoryEntry {
  timestamp: string;
  description: string;
  type?: 'STATUS_CHANGE' | 'SOLUTION' | 'FEEDBACK' | 'CREATION';
  solution?: string;
  feedback?: string;
  rating?: number;
}

export interface Ticket {
  id: string;
  userId: string;
  userName: string;
  sector: string;
  problemType: string;
  description: string;
  urgency: 'Urgente' | 'Médio' | 'Moderado';
  status: 'Pendente' | 'Em Andamento' | 'Finalizado';
  createdAt: string;
  updatedAt: string;
  solution?: string;
  cost?: number;
  startTime?: string;
  endTime?: string;
  feedback?: string;
  rating?: number;
  history: HistoryEntry[];
}

interface TicketContextType {
  tickets: Ticket[];
  createTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'history' | 'status' | 'feedback' | 'rating'>) => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  getTicketsByUser: (userId: string) => Ticket[];
  getAllTickets: () => Ticket[];
  submitFeedback: (ticketId: string, feedback: string, rating: number) => void;
  updateTicketWithSolution: (id: string, solution: string, status: 'Finalizado') => void;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export function TicketProvider({ children }: { children: React.ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    const fetchTickets = async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tickets:', error);
        return;
      }

      if (data) {
        setTickets(data);
      }
    };

    fetchTickets();
  }, []);

  const createTicket = async (
    ticketInput: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'history' | 'status' | 'feedback' | 'rating'>
  ) => {
    const { data: newTicketData, error: ticketError } = await supabase
      .from('tickets')
      .insert([
        {
          user_id: ticketInput.userId,
          user_name: ticketInput.userName,
          sector: ticketInput.sector,
          problem_type: ticketInput.problemType,
          urgency: ticketInput.urgency,
          description: ticketInput.description,
          status: 'Pendente'
        }
      ])
      .select()
      .single();

    if (ticketError) {
      console.error('Error creating ticket:', ticketError);
      return;
    }

    if (newTicketData) {
      const { error: historyError } = await supabase
        .from('ticket_history')
        .insert([
          {
            ticket_id: newTicketData.id,
            description: 'Chamado criado',
            type: 'CREATION'
          }
        ]);

      if (historyError) {
        console.error('Error creating ticket history:', historyError);
      }

      setTickets((prev) => [newTicketData as Ticket, ...prev]);
    }
  };

  const updateTicket = async (id: string, updates: Partial<Ticket>) => {
    const { data: ticketData, error: ticketError } = await supabase
      .from('tickets')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (ticketError) {
      console.error('Error updating ticket:', ticketError);
      return;
    }

    if (ticketData) {
      const { error: historyError } = await supabase
        .from('ticket_history')
        .insert([
          {
            ticket_id: id,
            description: `Status atualizado para: ${updates.status || ticketData.status}`,
            type: 'STATUS_CHANGE'
          }
        ]);

      if (historyError) {
        console.error('Error creating ticket history:', historyError);
      }

      setTickets((prev) =>
        prev.map((ticket) => ticket.id === id ? ticketData : ticket)
      );
    }
  };

  const updateTicketWithSolution = async (id: string, solution: string, status: 'Finalizado') => {
    const { data: ticketData, error: ticketError } = await supabase
      .from('tickets')
      .update({
        solution,
        status,
        end_time: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (ticketError) {
      console.error('Error updating ticket with solution:', ticketError);
      return;
    }

    if (ticketData) {
      const { error: historyError } = await supabase
        .from('ticket_history')
        .insert([
          {
            ticket_id: id,
            description: 'Chamado finalizado com solução',
            type: 'SOLUTION',
            solution
          }
        ]);

      if (historyError) {
        console.error('Error creating ticket history:', historyError);
      }

      setTickets((prev) =>
        prev.map((ticket) => ticket.id === id ? ticketData : ticket)
      );
    }
  };

  const submitFeedback = async (ticketId: string, feedback: string, rating: number) => {
    const { data: ticketData, error: ticketError } = await supabase
      .from('tickets')
      .update({
        feedback,
        rating,
        updated_at: new Date().toISOString()
      })
      .eq('id', ticketId)
      .select()
      .single();

    if (ticketError) {
      console.error('Error updating ticket feedback:', ticketError);
      return;
    }

    if (ticketData) {
      const { error: historyError } = await supabase
        .from('ticket_history')
        .insert([
          {
            ticket_id: ticketId,
            description: `Usuário enviou feedback com avaliação ${rating}/10`,
            type: 'FEEDBACK',
            feedback,
            rating
          }
        ]);

      if (historyError) {
        console.error('Error creating ticket history:', historyError);
      }

      setTickets((prev) =>
        prev.map((ticket) => ticket.id === ticketId ? ticketData : ticket)
      );
    }
  };

  const getTicketsByUser = (userId: string) => {
    return tickets.filter((ticket) => ticket.userId === userId);
  };

  const getAllTickets = () => tickets;

  return (
    <TicketContext.Provider
      value={{
        tickets,
        createTicket,
        updateTicket,
        getTicketsByUser,
        getAllTickets,
        submitFeedback,
        updateTicketWithSolution
      }}
    >
      {children}
    </TicketContext.Provider>
  );
}

export function useTickets() {
  const context = useContext(TicketContext);
  if (context === undefined) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
}