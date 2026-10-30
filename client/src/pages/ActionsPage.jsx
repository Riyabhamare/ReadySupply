import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ListTodo,
  Plus,
  LayoutGrid,
  List as ListIcon,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Trash2,
  Check,
  RotateCw,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useToast } from '../components/common/Toast.jsx';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { Button } from '../components/common/Button.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';

export const ActionsPage = () => {
  const { t } = useTranslation();
  const { success, error: toastError } = useToast();

  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
  const [filterPriority, setFilterPriority] = useState('all');

  // New Action Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedToName: '',
    priority: 'medium',
    dueDate: '',
  });

  // Prompt to re-run mapping on completion
  const [promptMappingOpen, setPromptMappingOpen] = useState(false);

  const fetchActions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/actions');
      setActions(res.data || []);
    } catch (err) {
      toastError('Failed to load corrective actions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  const handleCreateAction = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.dueDate) {
      toastError('Please fill in action title and due date.');
      return;
    }

    try {
      await api.post('/actions', {
        title: formData.title,
        description: formData.description,
        assignedTo: { name: formData.assignedToName || 'Unassigned', role: 'Quality Head' },
        priority: formData.priority,
        dueDate: formData.dueDate,
      });

      success('Corrective action item created!');
      setIsModalOpen(false);
      setFormData({
        title: '',
        description: '',
        assignedToName: '',
        priority: 'medium',
        dueDate: '',
      });
      fetchActions();
    } catch (err) {
      toastError('Failed to create action');
    }
  };

  const updateStatus = async (actionId, newStatus) => {
    try {
      await api.put(`/actions/${actionId}`, { status: newStatus });
      success(`Status updated to ${newStatus}`);
      fetchActions();

      if (newStatus === 'completed') {
        setPromptMappingOpen(true);
      }
    } catch (err) {
      toastError('Failed to update status');
    }
  };

  const deleteAction = async (actionId) => {
    try {
      await api.delete(`/actions/${actionId}`);
      setActions((prev) => prev.filter((a) => a._id !== actionId));
      success('Action deleted');
    } catch (err) {
      toastError('Failed to delete action');
    }
  };

  const filteredActions = actions.filter((a) => {
    if (filterPriority !== 'all' && a.priority !== filterPriority) return false;
    return true;
  });

  const columns = [
    { id: 'open', title: 'Open', status: 'open' },
    { id: 'in_progress', title: 'In Progress', status: 'in_progress' },
    { id: 'completed', title: 'Completed', status: 'completed' },
  ];

  const getPriorityBadge = (p) => {
    const map = {
      critical: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 font-bold',
      high: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-semibold',
      medium: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
      low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    };
    return (
      <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${map[p] || map.medium}`}>
        {p}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-light dark:border-border-dark">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy dark:text-white">
            {t('actions.title')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-light dark:text-muted-dark mt-0.5">
            {t('actions.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-0.5 shadow-subtle select-none">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-navy dark:bg-navy-light text-white shadow-xs'
                  : 'text-muted-light hover:text-text-light'
              }`}
              title="Board View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-navy dark:bg-navy-light text-white shadow-xs'
                  : 'text-muted-light hover:text-text-light'
              }`}
              title="List View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
          >
            {t('actions.newAction')}
          </Button>
        </div>
      </div>

      {/* Priority Filter */}
      <div className="flex items-center gap-2 select-none text-xs">
        <span className="font-semibold text-muted-light dark:text-muted-dark">
          Priority:
        </span>
        {['all', 'critical', 'high', 'medium', 'low'].map((p) => (
          <button
            key={p}
            onClick={() => setFilterPriority(p)}
            className={`px-3 py-1 rounded-full capitalize font-semibold transition-colors ${
              filterPriority === p
                ? 'bg-navy text-white'
                : 'bg-surface-light dark:bg-surface-dark border border-border-light text-muted-light hover:text-text-light'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {columns.map((col) => {
            const colActions = filteredActions.filter((a) => {
              if (col.status === 'open') return a.status === 'open' || a.computedStatus === 'overdue';
              return a.status === col.status;
            });

            return (
              <div
                key={col.id}
                className="p-4 rounded-2xl border border-border-light dark:border-border-dark bg-slate-50/70 dark:bg-slate-900/40 min-h-[450px] flex flex-col"
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-border-light dark:border-border-dark">
                  <h3 className="font-bold text-sm text-navy dark:text-white flex items-center gap-2">
                    <span>{col.title}</span>
                    <span className="px-2 py-0.5 rounded-full bg-surface-light dark:bg-surface-dark text-xs font-mono border border-border-light">
                      {colActions.length}
                    </span>
                  </h3>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colActions.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-light dark:text-muted-dark italic">
                      No actions in this column
                    </div>
                  ) : (
                    colActions.map((act) => {
                      const isOverdue = act.computedStatus === 'overdue';

                      return (
                        <div
                          key={act._id}
                          className="p-4 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-subtle space-y-2.5 transition-all hover:shadow-elevated"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-xs text-text-light dark:text-text-dark leading-snug">
                              {act.title}
                            </span>
                            {getPriorityBadge(act.priority)}
                          </div>

                          {act.description && (
                            <p className="text-[11px] text-muted-light dark:text-muted-dark line-clamp-2 leading-relaxed">
                              {act.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-border-light dark:border-border-dark text-[11px]">
                            <div className="flex items-center gap-1.5 text-muted-light dark:text-muted-dark">
                              <User className="w-3.5 h-3.5" />
                              <span className="truncate max-w-[100px]">{act.assignedTo?.name || 'Unassigned'}</span>
                            </div>

                            <div className="flex items-center gap-1 font-mono">
                              <Calendar className="w-3.5 h-3.5 text-muted-light" />
                              <span className={isOverdue ? 'text-red-600 dark:text-red-400 font-bold' : 'text-slate-600 dark:text-slate-400'}>
                                {new Date(act.dueDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {/* Quick Status Dropdown / Complete Button */}
                          <div className="flex items-center justify-between pt-1">
                            <select
                              value={act.status}
                              onChange={(e) => updateStatus(act._id, e.target.value)}
                              className="text-[11px] py-1 px-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark font-medium"
                            >
                              <option value="open">Open</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>

                            <button
                              onClick={() => deleteAction(act._id)}
                              className="p-1 text-muted-light hover:text-red-600 transition-colors"
                              title="Delete action"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark font-semibold">
                  <th className="py-3 px-4">Action Item</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-border-dark">
                {filteredActions.map((act) => (
                  <tr key={act._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-text-light dark:text-text-dark">
                      {act.title}
                    </td>
                    <td className="py-3.5 px-4">{getPriorityBadge(act.priority)}</td>
                    <td className="py-3.5 px-4 text-muted-light dark:text-muted-dark">
                      {act.assignedTo?.name || 'Unassigned'}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className={act.computedStatus === 'overdue' ? 'text-red-600 font-bold' : ''}>
                        {new Date(act.dueDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={act.computedStatus || act.status} size="xs" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => deleteAction(act._id)}
                        className="p-1.5 rounded-lg text-muted-light hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Action Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Corrective Action"
        subtitle="Track gap resolution and compliance tasks"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateAction}>
              Save Action Item
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateAction} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Renew NABL Calibration for digital micrometers"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
                Assignee Name
              </label>
              <input
                type="text"
                placeholder="e.g. Rameshwar Patil / Kailash Sharma"
                value={formData.assignedToName}
                onChange={(e) => setFormData({ ...formData, assignedToName: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
              Due Date *
            </label>
            <input
              type="date"
              required
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
              Task Description & Evidence Required
            </label>
            <textarea
              rows={3}
              placeholder="Specify requirements, responsible agency, contact info..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </form>
      </Modal>

      {/* Prompt re-run mapping */}
      <Modal
        isOpen={promptMappingOpen}
        onClose={() => setPromptMappingOpen(false)}
        title="Action Completed!"
        subtitle="Keep your buyer readiness score updated"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPromptMappingOpen(false)}>
              Maybe Later
            </Button>
            <Button
              variant="primary"
              icon={RotateCw}
              onClick={() => {
                setPromptMappingOpen(false);
                window.location.href = '/gap-matrix';
              }}
            >
              Re-run Gap Matrix
            </Button>
          </>
        }
      >
        <p className="text-xs sm:text-sm text-muted-light dark:text-muted-dark leading-relaxed">
          {t('actions.reRunMappingPrompt')}
        </p>
      </Modal>
    </div>
  );
};

