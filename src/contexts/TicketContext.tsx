import React, { createContext, useContext, useEffect, useState } from 'react';

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
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const savedTickets = localStorage.getItem('tickets');
    return savedTickets ? JSON.parse(savedTickets) : [];
  });

  useEffect(() => {
    localStorage.setItem('tickets', JSON.stringify(tickets));
  }, [tickets]);

  const createTicket = (
    ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'history' | 'status' | 'feedback' | 'rating'>
  ) => {
    const newTicket: Ticket = {
      ...ticketData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'Pendente',
      history: [
        {
          timestamp: new Date().toISOString(),
          description: 'Chamado criado',
          type: 'CREATION'
        },
      ],
    };

    setTickets((prev) => [...prev, newTicket]);
  };

  const updateTicket = (id: string, updates: Partial<Ticket>) => {
    setTickets((prev) =>
      prev.map((ticket) => {
        if (ticket.id === id) {
          const historyEntry: HistoryEntry = {
            timestamp: new Date().toISOString(),
            description: `Status atualizado para: ${updates.status || ticket.status}`,
            type: 'STATUS_CHANGE'
          };

          const updatedTicket = {
            ...ticket,
            ...updates,
            updatedAt: new Date().toISOString(),
            history: [...ticket.history, historyEntry],
          };
          return updatedTicket;
        }
        return ticket;
      })
    );
  };

  const updateTicketWithSolution = (id: string, solution: string, status: 'Finalizado') => {
    setTickets((prev) =>
      prev.map((ticket) => {
        if (ticket.id === id) {
          const historyEntry: HistoryEntry = {
            timestamp: new Date().toISOString(),
            description: 'Chamado finalizado com solução',
            type: 'SOLUTION',
            solution: solution
          };

          return {
            ...ticket,
            solution,
            status,
            endTime: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            history: [...ticket.history, historyEntry],
          };
        }
        return ticket;
      })
    );
  };

  const submitFeedback = (ticketId: string, feedback: string, rating: number) => {
    setTickets((prev) =>
      prev.map((ticket) => {
        if (ticket.id === ticketId) {
          const historyEntry: HistoryEntry = {
            timestamp: new Date().toISOString(),
            description: `Usuário enviou feedback com avaliação ${rating}/10`,
            type: 'FEEDBACK',
            feedback,
            rating
          };

          return {
            ...ticket,
            feedback,
            rating,
            updatedAt: new Date().toISOString(),
            history: [...ticket.history, historyEntry],
          };
        }
        return ticket;
      })
    );
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