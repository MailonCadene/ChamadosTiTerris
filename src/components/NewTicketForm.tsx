import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTickets } from '../contexts/TicketContext';
import { toast } from 'react-hot-toast';
import { X } from 'lucide-react';

interface NewTicketFormProps {
  onClose: () => void;
}

const SECTORS = [
  'RH',
  'Pós-Vendas',
  'Financeiro',
  'Marketing',
  'Engenharia',
  'Analise de Dados',
  'Diretoria',
  'Produção',
  'Qualidade',
  'Compras',
];

const PROBLEM_TYPES = ['Software', 'Hardware', 'Rede', 'Impressora', 'Outros'];

export default function NewTicketForm({ onClose }: NewTicketFormProps) {
  const { user } = useAuth();
  const { createTicket } = useTickets();
  const [formData, setFormData] = useState({
    sector: '',
    problemType: '',
    description: '',
    urgency: 'Moderado' as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      createTicket({
        ...formData,
        userId: user.id,
        userName: user.name,
      });
      toast.success('Chamado criado com sucesso!');
      onClose();
    } catch (error) {
      toast.error('Erro ao criar chamado');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Novo Chamado</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="sector"
            className="block text-sm font-medium text-gray-700"
          >
            Setor
          </label>
          <select
            id="sector"
            required
            value={formData.sector}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, sector: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2E8B57] focus:ring-[#2E8B57] sm:text-sm"
          >
            <option value="">Selecione um setor</option>
            {SECTORS.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="problemType"
            className="block text-sm font-medium text-gray-700"
          >
            Tipo do Problema
          </label>
          <select
            id="problemType"
            required
            value={formData.problemType}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, problemType: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2E8B57] focus:ring-[#2E8B57] sm:text-sm"
          >
            <option value="">Selecione o tipo do problema</option>
            {PROBLEM_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Descrição do Problema
          </label>
          <textarea
            id="description"
            required
            rows={4}
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2E8B57] focus:ring-[#2E8B57] sm:text-sm"
            placeholder="Descreva o problema em detalhes..."
          />
        </div>

        <div>
          <label
            htmlFor="urgency"
            className="block text-sm font-medium text-gray-700"
          >
            Grau de Urgência
          </label>
          <select
            id="urgency"
            required
            value={formData.urgency}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                urgency: e.target.value as 'Urgente' | 'Médio' | 'Moderado',
              }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2E8B57] focus:ring-[#2E8B57] sm:text-sm"
          >
            <option value="Moderado">Moderado (Melhoria)</option>
            <option value="Médio">Médio (Atrasando o processo)</option>
            <option value="Urgente">Urgente (Colaborador Ocioso)</option>
          </select>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2E8B57]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-[#2E8B57] border border-transparent rounded-md shadow-sm hover:bg-[#236B43] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2E8B57]"
          >
            Criar Chamado
          </button>
        </div>
      </form>
    </div>
  );
}
