import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useLocation,
  useNavigate
} from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ClipboardList, 
  History, 
  Settings, 
  Bell, 
  User, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Wrench,
  Truck,
  ChevronRight,
  Menu,
  X,
  RefreshCw,
  MoreVertical,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { supabase } from './lib/supabase';
import { Ticket, Priority, Status } from './types';

// --- Components ---

const SidebarItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link 
    to={to} 
    className={cn(
      "sidebar-item",
      active && "sidebar-item-active"
    )}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

const StatCard = ({ label, value, icon: Icon, colorClass, trend }: any) => (
  <div className="glass-panel p-6 flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      {trend && (
        <p className="text-xs mt-2 text-emerald-600 font-medium flex items-center gap-1">
          {trend}
        </p>
      )}
    </div>
    <div className={cn("p-3 rounded-2xl", colorClass)}>
      <Icon size={24} />
    </div>
  </div>
);

const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const styles = {
    low: "bg-emerald-100 text-emerald-700 border-emerald-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    high: "bg-orange-100 text-orange-700 border-orange-200",
    urgent: "bg-rose-100 text-rose-700 border-rose-200",
  };
  
  const labels = {
    low: "Baixa",
    medium: "Média",
    high: "Alta",
    urgent: "Urgente",
  };

  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border", styles[priority])}>
      {labels[priority]}
    </span>
  );
};

const StatusBadge = ({ status }: { status: Status }) => {
  const styles = {
    open: "bg-blue-100 text-blue-700",
    in_progress: "bg-indigo-100 text-indigo-700",
    completed: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-slate-100 text-slate-700",
  };
  
  const labels = {
    open: "Aberto",
    in_progress: "Em Andamento",
    completed: "Concluído",
    cancelled: "Cancelado",
  };

  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", styles[status])}>
      {labels[status]}
    </span>
  );
};

// --- Views ---

const DashboardView = ({ tickets }: { tickets: Ticket[] }) => {
  const stats = {
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    completed: tickets.filter(t => t.status === 'completed').length,
    total: tickets.length
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Chamados Abertos" 
          value={stats.open} 
          icon={AlertTriangle} 
          colorClass="bg-blue-50 text-blue-600"
        />
        <StatCard 
          label="Em Andamento" 
          value={stats.inProgress} 
          icon={Clock} 
          colorClass="bg-indigo-50 text-indigo-600"
        />
        <StatCard 
          label="Concluídos" 
          value={stats.completed} 
          icon={CheckCircle2} 
          colorClass="bg-emerald-50 text-emerald-600"
          trend="+12% este mês"
        />
        <StatCard 
          label="Total Manutenções" 
          value={stats.total} 
          icon={Wrench} 
          colorClass="bg-slate-50 text-slate-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Chamados Recentes</h2>
            <Link to="/tickets" className="text-brand-600 hover:text-brand-700 text-sm font-medium flex items-center gap-1">
              Ver todos <ChevronRight size={16} />
            </Link>
          </div>
          
          <div className="glass-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Empilhadeira</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Operador</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Problema</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Prioridade</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tickets.slice(0, 5).map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                            <Truck size={16} />
                          </div>
                          <span className="font-semibold text-slate-900">{ticket.forkliftId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{ticket.operatorName}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{ticket.problemType}</td>
                      <td className="px-6 py-4">
                        <PriorityBadge priority={ticket.priority} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={ticket.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Avisos do Sistema</h2>
          <div className="bg-brand-600 rounded-2xl p-6 text-white shadow-lg shadow-brand-200 relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2">Configuração Pendente</h3>
              <p className="text-brand-100 text-sm leading-relaxed mb-4">
                O sistema detectou que alguns setores ainda não possuem empilhadeiras vinculadas. Complete o cadastro para otimizar os chamados.
              </p>
              <button className="bg-white text-brand-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-brand-50 transition-colors">
                Configurar Agora
              </button>
            </div>
            <div className="absolute -right-8 -bottom-8 opacity-10">
              <Wrench size={160} />
            </div>
          </div>

          <div className="glass-panel p-6">
            <h3 className="font-bold text-slate-900 mb-4">Próximas Preventivas</h3>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">EMP-0{i+10}</p>
                    <p className="text-xs text-slate-500">Em {i+2} dias • Revisão 500h</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TicketFormView = ({ onAdd }: { onAdd: (t: Omit<Ticket, 'id' | 'status' | 'createdAt'>) => void }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    operatorName: '',
    sector: '',
    forkliftId: '',
    problemType: '',
    description: '',
    priority: 'medium' as Priority
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    navigate('/tickets');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Abrir Novo Chamado</h1>
        <p className="text-slate-500">Preencha os detalhes abaixo para solicitar manutenção.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <User size={16} className="text-slate-400" /> Nome do Operador
            </label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              placeholder="Ex: João Silva"
              value={formData.operatorName}
              onChange={e => setFormData({...formData, operatorName: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Search size={16} className="text-slate-400" /> Fazenda ou Setor
            </label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              placeholder="Ex: Fazenda Norte"
              value={formData.sector}
              onChange={e => setFormData({...formData, sector: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Truck size={16} className="text-slate-400" /> Empilhadeira (ID)
            </label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              placeholder="Ex: EMP-042"
              value={formData.forkliftId}
              onChange={e => setFormData({...formData, forkliftId: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Wrench size={16} className="text-slate-400" /> Tipo de Problema
            </label>
            <select 
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all bg-white"
              value={formData.problemType}
              onChange={e => setFormData({...formData, problemType: e.target.value})}
            >
              <option value="">Selecione...</option>
              <option value="Hidráulico">Hidráulico</option>
              <option value="Elétrico">Elétrico</option>
              <option value="Motor">Motor</option>
              <option value="Pneus">Pneus</option>
              <option value="Outros">Outros</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Descrição do Problema</label>
          <textarea 
            required
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
            placeholder="Descreva detalhadamente o que está acontecendo..."
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="space-y-4">
          <label className="text-sm font-semibold text-slate-700">Prioridade</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(['low', 'medium', 'high', 'urgent'] as Priority[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setFormData({...formData, priority: p})}
                className={cn(
                  "px-4 py-3 rounded-xl border text-sm font-bold transition-all",
                  formData.priority === p 
                    ? "bg-brand-600 text-white border-brand-600 shadow-md" 
                    : "bg-white text-slate-600 border-slate-200 hover:border-brand-300"
                )}
              >
                {p === 'low' && 'Baixa'}
                {p === 'medium' && 'Média'}
                {p === 'high' && 'Alta'}
                {p === 'urgent' && 'Urgente'}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <button 
            type="submit"
            className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 flex items-center justify-center gap-2"
          >
            <PlusCircle size={20} /> Enviar Chamado
          </button>
        </div>
      </form>
    </div>
  );
};

const TicketListView = ({ tickets, title, onUpdate }: { tickets: Ticket[], title: string, onUpdate: (id: string, updates: Partial<Ticket>) => void }) => {
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('priority');

  const priorityWeight = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1
  };

  const sortedTickets = [...tickets].sort((a, b) => {
    if (sortBy === 'priority') {
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-slate-500">Gerencie e acompanhe o status das manutenções.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1">
            <button 
              onClick={() => setSortBy('priority')}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                sortBy === 'priority' ? "bg-brand-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              Prioridade
            </button>
            <button 
              onClick={() => setSortBy('date')}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                sortBy === 'date' ? "bg-brand-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              Data
            </button>
          </div>
          <button className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
            <Filter size={20} />
          </button>
          <button className="bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-brand-700 flex items-center gap-2">
            <RefreshCw size={16} /> Atualizar
          </button>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Empilhadeira</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Operador / Setor</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Problema</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Prioridade</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    Nenhum chamado encontrado.
                  </td>
                </tr>
              ) : (
                sortedTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                          <Truck size={20} />
                        </div>
                        <span className="font-bold text-slate-900">{ticket.forkliftId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900">{ticket.operatorName}</p>
                      <p className="text-xs text-slate-500">{ticket.sector}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-900 font-medium">{ticket.problemType}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[200px]">{ticket.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative group">
                        <PriorityBadge priority={ticket.priority} />
                        <div className="absolute left-0 top-full mt-2 hidden group-hover:flex flex-col bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 min-w-[120px]">
                          <p className="text-[10px] font-bold text-slate-400 uppercase px-2 mb-1">Alterar Prioridade</p>
                          {(['low', 'medium', 'high', 'urgent'] as Priority[]).map((p) => (
                            <button
                              key={p}
                              onClick={() => onUpdate(ticket.id, { priority: p })}
                              className={cn(
                                "text-left px-2 py-1.5 rounded-lg text-xs font-medium transition-colors",
                                ticket.priority === p ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"
                              )}
                            >
                              {p === 'low' && 'Baixa'}
                              {p === 'medium' && 'Média'}
                              {p === 'high' && 'Alta'}
                              {p === 'urgent' && 'Urgente'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Main Layout ---

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className={cn(
        "bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-50",
        isSidebarOpen ? "w-72" : "w-20"
      )}>
        <div className="p-6 flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-200">
            <Wrench size={24} />
          </div>
          {isSidebarOpen && (
            <span className="text-xl font-black tracking-tight text-slate-900 whitespace-nowrap">Forklift<span className="text-brand-600">Care</span></span>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/'} />
          <SidebarItem to="/new-ticket" icon={PlusCircle} label="Abrir Chamado" active={location.pathname === '/new-ticket'} />
          <SidebarItem to="/tickets" icon={ClipboardList} label="Chamados Abertos" active={location.pathname === '/tickets'} />
          <SidebarItem to="/history" icon={History} label="Histórico" active={location.pathname === '/history'} />
          <div className="pt-6 mt-6 border-t border-slate-100">
            <SidebarItem to="/settings" icon={Settings} label="Configurações" active={location.pathname === '/settings'} />
          </div>
        </nav>

        <div className="p-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full p-3 rounded-xl hover:bg-slate-50 text-slate-400 flex items-center justify-center transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md w-full hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar chamados, empilhadeiras..." 
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 border-transparent focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 relative transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 leading-none">Admin User</p>
                <p className="text-xs text-slate-500 mt-1">Gestor de Frota</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 overflow-hidden">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState(false);

  const fetchTickets = async () => {
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      setConfigError(true);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('createdAt', { ascending: false });
      
      if (error) throw error;
      setTickets(data || []);
      setConfigError(false);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      // If it's a 404 or similar, it might be that the table doesn't exist yet
      if (error && typeof error === 'object' && 'code' in error && error.code === 'PGRST116') {
        // Table not found or similar
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    
    const channel = supabase
      .channel('tickets_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
        fetchTickets();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAddTicket = async (newTicketData: Omit<Ticket, 'id' | 'status' | 'createdAt'>) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .insert([{
          ...newTicketData,
          status: 'open',
          createdAt: new Date().toISOString()
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error adding ticket:', error);
      alert('Erro ao adicionar chamado. Verifique se a tabela "tickets" existe no Supabase.');
    }
  };

  const handleUpdateTicket = async (id: string, updates: Partial<Ticket>) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  return (
    <Router>
      <Layout>
        {configError && (
          <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-900">Configuração do Supabase Pendente</h3>
              <p className="text-amber-700 text-sm mt-1">
                Para que o sistema funcione, você precisa configurar as chaves do Supabase no painel de <strong>Secrets</strong> do AI Studio.
                Use as variáveis <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code>.
              </p>
            </div>
          </div>
        )}
        {loading && (
          <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-[100] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <RefreshCw className="animate-spin text-brand-600" size={40} />
              <p className="text-slate-600 font-medium">Sincronizando com Supabase...</p>
            </div>
          </div>
        )}
        <Routes>
          <Route path="/" element={<DashboardView tickets={tickets} />} />
          <Route path="/new-ticket" element={<TicketFormView onAdd={handleAddTicket} />} />
          <Route path="/tickets" element={<TicketListView tickets={tickets.filter(t => t.status !== 'completed')} title="Chamados Abertos" onUpdate={handleUpdateTicket} />} />
          <Route path="/history" element={<TicketListView tickets={tickets.filter(t => t.status === 'completed')} title="Histórico de Manutenção" onUpdate={handleUpdateTicket} />} />
          <Route path="/settings" element={
            <div className="glass-panel p-12 text-center">
              <Settings size={48} className="mx-auto text-slate-300 mb-4" />
              <h2 className="text-xl font-bold text-slate-900">Configurações</h2>
              <p className="text-slate-500">Esta seção está em desenvolvimento.</p>
            </div>
          } />
        </Routes>
      </Layout>
    </Router>
  );
}
