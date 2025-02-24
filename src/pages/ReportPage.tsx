import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTickets } from '../contexts/TicketContext';
import { Calendar, ChevronDown, Star, ArrowLeft } from 'lucide-react';

export default function ReportPage() {
  const navigate = useNavigate();
  const { tickets } = useTickets();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedSector, setSelectedSector] = useState('all');
  const [sliderValue, setSliderValue] = useState(50);
  const [stats, setStats] = useState({
    total: 0,
    finished: 0,
    inProgress: 0,
    averageTime: 0,
    totalCost: 0,
    averageRating: 0,
  });

  // Get unique sectors from tickets
  const sectors = ['all', ...new Set(tickets.map(ticket => ticket.sector))];

  // Update dates based on slider
  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value);
    setSliderValue(value);
    
    // Calculate dates based on slider value
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - (100 - value));
    setStartDate(start);
    setEndDate(today);
  };

  // Calculate statistics based on filtered data
  useEffect(() => {
    const filteredTickets = tickets.filter(ticket => {
      const ticketDate = new Date(ticket.createdAt);
      const isInDateRange = ticketDate >= startDate && ticketDate <= endDate;
      const isInSector = selectedSector === 'all' || ticket.sector === selectedSector;
      return isInDateRange && isInSector;
    });

    const totalFinished = filteredTickets.filter(t => t.status === 'Finalizado').length;
    const totalInProgress = filteredTickets.filter(t => t.status === 'Em Andamento').length;
    const totalCost = filteredTickets.reduce((sum, t) => sum + (t.cost || 0), 0);
    
    const finishedTickets = filteredTickets.filter(t => t.status === 'Finalizado' && t.startTime && t.endTime);
    const averageTime = finishedTickets.length > 0
      ? finishedTickets.reduce((sum, t) => {
          const start = new Date(t.startTime);
          const end = new Date(t.endTime);
          return sum + (end - start);
        }, 0) / finishedTickets.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    const ticketsWithRating = filteredTickets.filter(t => t.rating);
    const averageRating = ticketsWithRating.length > 0
      ? ticketsWithRating.reduce((sum, t) => sum + t.rating, 0) / ticketsWithRating.length
      : 0;

    setStats({
      total: filteredTickets.length,
      finished: totalFinished,
      inProgress: totalInProgress,
      averageTime: averageTime,
      totalCost: totalCost,
      averageRating: averageRating,
    });
  }, [tickets, startDate, endDate, selectedSector]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#004928] hover:bg-[#004928] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#004928]"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col space-y-6">
          {/* Seletor de Período */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Período</h3>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="date"
                  value={startDate.toISOString().split('T')[0]}
                  onChange={(e) => setStartDate(new Date(e.target.value))}
                  className="pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <span className="text-gray-500">até</span>
              <div className="relative">
                <input
                  type="date"
                  value={endDate.toISOString().split('T')[0]}
                  onChange={(e) => setEndDate(new Date(e.target.value))}
                  className="pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            {/* Barra de rolagem do período */}
            <div className="mt-4">
              <input
                type="range"
                min="0"
                max="100"
                value={sliderValue}
                onChange={handleSliderChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Seletor de Setor */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Setor</h3>
            <div className="relative">
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full pl-4 pr-10 py-2 border rounded-md appearance-none bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {sectors.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector === 'all' ? 'Todos os setores' : sector}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500">Total de Chamados</h3>
          <div className="mt-2 flex items-baseline">
            <p className="text-3xl font-semibold text-gray-900">{stats.total}</p>
            <p className="ml-2 text-sm text-gray-500">chamados</p>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-green-600">{stats.finished} finalizados</span>
              <span className="text-blue-600">{stats.inProgress} em andamento</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500">Tempo Médio</h3>
          <div className="mt-2 flex items-baseline">
            <p className="text-3xl font-semibold text-gray-900">
              {stats.averageTime.toFixed(1)}
            </p>
            <p className="ml-2 text-sm text-gray-500">horas</p>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Tempo médio por chamado finalizado
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500">Custo Total</h3>
          <div className="mt-2 flex items-baseline">
            <p className="text-3xl font-semibold text-gray-900">
              R$ {stats.totalCost.toFixed(2)}
            </p>
          </div>
          <div className="mt-4 flex items-center">
            <Star className="h-5 w-5 text-yellow-400" />
            <span className="ml-2 text-sm text-gray-500">
              Avaliação média: {stats.averageRating.toFixed(1)}/10
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}