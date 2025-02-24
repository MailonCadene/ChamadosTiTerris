import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTickets } from '../contexts/TicketContext';
import { formatDistanceToNow, formatDateTime } from '../utils/dateUtils';
import { Timer, X, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface TicketDetailsProps {
  ticketId: string;
  onClose: () => void;
}

interface FeedbackFormProps {
  ticketId: string;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ ticketId }) => {
  const { submitFeedback } = useTickets();
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Por favor, forneça uma avaliação de 1 a 10');
      return;
    }
    submitFeedback(ticketId, feedback, rating);
    toast.success('Feedback enviado com sucesso!');
  };

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Avalie o Atendimento</h3>
      <form onSubmit={handleSubmitFeedback}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seu Feedback
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#2E8B57] focus:ring-[#2E8B57] sm:text-sm"
            rows={4}
            placeholder="Compartilhe sua experiência com o atendimento..."
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Avaliação (1-10)
          </label>
          <div className="flex items-center space-x-1">
            {[...Array(10)].map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setRating(index + 1)}
                className={`p-1 ${rating >= index + 1 ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                <Star className="h-6 w-6" />
              </button>
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#2E8B57] hover:bg-[#236B43] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2E8B57]"
        >
          Enviar Avaliação
        </button>
      </form>
    </div>
  );
};

export default function TicketDetails({ ticketId, onClose }: TicketDetailsProps) {
  const { user } = useAuth();
  const { tickets, updateTicket, updateTicketWithSolution } = useTickets();
  const ticket = tickets.find((t) => t.id === ticketId);
  const [solution, setSolution] = useState(ticket?.solution || '');
  const [cost, setCost] = useState(ticket?.cost?.toString() || '');

  if (!ticket) return null;

  const isAdmin = user?.role === 'admin';
  const showFeedbackForm = !isAdmin && 
                          ticket.status === 'Finalizado' && 
                          !ticket.feedback && 
                          ticket.userId === user?.id;

  const handleStartService = () => {
    if (!ticket.startTime) {
      updateTicket(ticketId, {
        status: 'Em Andamento',
        startTime: new Date().toISOString(),
      });
      toast.success('Atendimento iniciado!');
    }
  };

  const handleFinishService = () => {
    if (!solution) {
      toast.error('Por favor, preencha a solução antes de finalizar.');
      return;
    }

    updateTicketWithSolution(ticketId, solution, 'Finalizado');
    toast.success('Chamado finalizado com sucesso!');
  };

  const renderHistoryEntry = (entry: any, index: number) => {
    return (
      <div
        key={index}
        className="flex items-start space-x-3 text-sm text-gray-500"
      >
        <div className="flex-shrink-0">
          <div className="h-2 w-2 rounded-full bg-gray-400 mt-2"></div>
        </div>
        <div className="flex-1">
          <p className="text-gray-900">{entry.description}</p>
          {entry.type === 'SOLUTION' && entry.solution && (
            <div className="mt-2 p-3 bg-green-50 rounded-md">
              <p className="text-sm font-medium text-green-800">Solução aplicada:</p>
              <p className="mt-1 text-sm text-green-700">{entry.solution}</p>
            </div>
          )}
          {entry.type === 'FEEDBACK' && entry.feedback && (
            <div className="mt-2 p-3 bg-blue-50 rounded-md">
              <p className="text-sm font-medium text-blue-800">Feedback do usuário:</p>
              <p className="mt-1 text-sm text-blue-700">{entry.feedback}</p>
              <div className="mt-2 flex items-center">
                <span className="text-sm font-medium text-blue-800 mr-2">Avaliação:</span>
                <div className="flex items-center">
                  {[...Array(entry.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400" fill="currentColor" />
                  ))}
                </div>
              </div>
            </div>
          )}
          <p className="text-xs mt-1">
            {formatDistanceToNow(new Date(entry.timestamp))}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Chamado #{ticket.id.slice(-4)}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Solicitante</h3>
            <p className="mt-1 text-sm text-gray-900">{ticket.userName}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Setor</h3>
            <p className="mt-1 text-sm text-gray-900">{ticket.sector}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">
              Tipo do Problema
            </h3>
            <p className="mt-1 text-sm text-gray-900">{ticket.problemType}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Urgência</h3>
            <p className="mt-1 text-sm text-gray-900">{ticket.urgency}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <p className="mt-1 text-sm text-gray-900">{ticket.status}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Criado em</h3>
            <p className="mt-1 text-sm text-gray-900">
              {formatDateTime(new Date(ticket.createdAt))}
            </p>
          </div>
        </div>

        <div className="space-y-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">
              Descrição do Problema
            </h3>
            <p className="mt-1 text-sm text-gray-900">{ticket.description}</p>
          </div>

          {ticket.solution && !isAdmin && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Solução Aplicada
              </h3>
              <div className="mt-1 p-3 bg-green-50 rounded-md">
                <p className="text-sm text-gray-900">{ticket.solution}</p>
              </div>
            </div>
          )}
        </div>

        {isAdmin && (
          <div className="space-y-6">
            <div>
              <label
                htmlFor="solution"
                className="block text-sm font-medium text-gray-700"
              >
                Solução
              </label>
              <textarea
                id="solution"
                rows={4}
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2E8B57] focus:ring-[#2E8B57] sm:text-sm"
                placeholder="Descreva a solução aplicada..."
              />
            </div>

            <div>
              <label
                htmlFor="cost"
                className="block text-sm font-medium text-gray-700"
              >
                Custo (R$)
              </label>
              <input
                type="number"
                id="cost"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2E8B57] focus:ring-[#2E8B57] sm:text-sm"
                placeholder="0,00"
                step="0.01"
              />
            </div>

            <div className="flex justify-end space-x-4">
              {ticket.status === 'Pendente' && (
                <button
                  onClick={handleStartService}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Timer className="h-4 w-4 mr-2" />
                  Iniciar Atendimento
                </button>
              )}
              {ticket.status === 'Em Andamento' && (
                <button
                  onClick={handleFinishService}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#2E8B57] hover:bg-[#236B43] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2E8B57]"
                >
                  Finalizar Chamado
                </button>
              )}
            </div>
          </div>
        )}

        {showFeedbackForm && <FeedbackForm ticketId={ticketId} />}

        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Histórico</h3>
          <div className="space-y-4">
            {ticket.history.map((entry, index) => renderHistoryEntry(entry, index))}
          </div>
        </div>
      </div>
    </div>
  );
}