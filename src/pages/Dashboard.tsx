import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTickets } from '../contexts/TicketContext';
import { Clock, LogOut, Plus, Timer, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NewTicketForm from '../components/NewTicketForm';
import TicketList from '../components/TicketList';
import TicketDetails from '../components/TicketDetails';
import logoTerris from '../assets/logo-terris.png';

export default function Dashboard() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-2">
              <a
                href="https://terris.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <img
                  src={logoTerris}
                  alt="Logo Terris"
                  className="h-8 w-auto"
                />
              </a>
              <div className="w-0.5 h-14 bg-[#004928]"></div>
              <h1 className="ml-2 text-2xl font-bold text-[#004928]">
                <div className="flex flex-col">
                  <span>Sistema de Chamados</span>
                  <span className="text-xl">Ti Terris</span>
                </div>
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">{user?.name}</span>
              <button
                onClick={() => signOut()}
                className="inline-flex items-center px-4 py-2 text-sm text-[#004928] hover:bg-gray-100 rounded-md"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-4 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4">
              {user?.role === 'user' && (
                <button
                  onClick={() => setShowNewTicketForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#004928] hover:bg-[#004928] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#004928]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Chamado
                </button>
              )}
              {user?.role === 'admin' && (
                <button
                  onClick={() => navigate('/reports')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#004928] hover:bg-[#004928] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#004928]"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Relatório de Chamados
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              {showNewTicketForm ? (
                <NewTicketForm onClose={() => setShowNewTicketForm(false)} />
              ) : selectedTicket ? (
                <TicketDetails
                  ticketId={selectedTicket}
                  onClose={() => setSelectedTicket(null)}
                />
              ) : (
                <TicketList
                  onSelectTicket={setSelectedTicket}
                  showAllTickets={user?.role === 'admin'}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
