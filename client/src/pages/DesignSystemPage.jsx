import React, { useState } from 'react';
import {
  Palette,
  CheckCircle2,
  AlertTriangle,
  Upload,
  FolderLock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/common/Button.jsx';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { StatCard } from '../components/common/StatCard.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { useToast } from '../components/common/Toast.jsx';

export const DesignSystemPage = () => {
  const { success, error: toastError, info, showUndo } = useToast();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-12">
      <div className="pb-4 border-b border-border-light dark:border-border-dark">
        <h1 className="text-2xl font-bold text-navy dark:text-white flex items-center gap-2">
          <Palette className="w-6 h-6 text-primary" />
          <span>ReadySupply Design System & Tokens</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-light dark:text-muted-dark mt-1">
          Specification showcase of tokens, typography scales, buttons, status badges, and interactive controls.
        </p>
      </div>

      {/* 1. Color Palette Tokens */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-light dark:text-muted-dark">
          1. Color Palette Tokens
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-navy text-white shadow-subtle">
            <span className="font-bold block">Primary Navy</span>
            <span className="text-[10px] opacity-80 font-mono">#0B1F44</span>
          </div>
          <div className="p-3 rounded-xl bg-primary text-white shadow-subtle">
            <span className="font-bold block">Primary Blue</span>
            <span className="text-[10px] opacity-80 font-mono">#2563EB</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-600 text-white shadow-subtle">
            <span className="font-bold block">Success</span>
            <span className="text-[10px] opacity-80 font-mono">#16A34A</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500 text-white shadow-subtle">
            <span className="font-bold block">Warning Orange</span>
            <span className="text-[10px] opacity-80 font-mono">#F59E0B</span>
          </div>
          <div className="p-3 rounded-xl bg-red-600 text-white shadow-subtle">
            <span className="font-bold block">Danger Red</span>
            <span className="text-[10px] opacity-80 font-mono">#DC2626</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-600 text-white shadow-subtle">
            <span className="font-bold block">Muted Slate</span>
            <span className="text-[10px] opacity-80 font-mono">#64748B</span>
          </div>
        </div>
      </section>

      {/* 2. Status Badges Matrix (Critical Status Rules) */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-light dark:text-muted-dark">
          2. Three-Tier Separated Status Badges (Hover for Tooltips)
        </h2>
        <div className="p-6 rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-subtle space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status="uploaded" />
            <StatusBadge status="verified" />
            <StatusBadge status="accepted" />
            <StatusBadge status="pending_review" />
            <StatusBadge status="expiring_soon" />
            <StatusBadge status="expired" />
            <StatusBadge status="rejected" />
            <StatusBadge status="needs_manual_assessment" />
            <StatusBadge status="not_applicable" />
          </div>

          <div className="pt-3 border-t border-border-light dark:border-border-dark flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-muted-light">Action Statuses:</span>
            <StatusBadge status="open" />
            <StatusBadge status="in_progress" />
            <StatusBadge status="completed" />
            <StatusBadge status="overdue" />
          </div>
        </div>
      </section>

      {/* 3. Button Component Variants & Sizes */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-light dark:text-muted-dark">
          3. Button Variants & Interactive States
        </h2>
        <div className="p-6 rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-subtle space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="danger">Danger Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="primary" isLoading>Loading State</Button>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border-light dark:border-border-dark">
            <Button variant="primary" size="sm">Small (sm)</Button>
            <Button variant="primary" size="md">Medium (md)</Button>
            <Button variant="primary" size="lg">Large (lg)</Button>
          </div>
        </div>
      </section>

      {/* 4. Stat Card Showcase */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-light dark:text-muted-dark">
          4. Stat Cards
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Vault Documents"
            value="10"
            icon={FolderLock}
            subtitle="Total uploaded files"
          />
          <StatCard
            title="Expiring Soon"
            value="2"
            icon={AlertTriangle}
            variant="warning"
            subtitle="Within 30 days"
          />
          <StatCard
            title="Readiness Score"
            value="75%"
            icon={CheckCircle2}
            variant="success"
            subtitle="Apex Auto Components"
          />
        </div>
      </section>

      {/* 5. Toast Notifications & Dialogs */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-light dark:text-muted-dark">
          5. Toast Feedback with 8-Second Undo & Modal Dialogs
        </h2>
        <div className="p-6 rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-subtle flex flex-wrap gap-3">
          <Button variant="primary" onClick={() => success('Operation completed successfully!')}>
            Trigger Success Toast
          </Button>
          <Button variant="secondary" onClick={() => toastError('Could not process request.')}>
            Trigger Error Toast
          </Button>
          <Button
            variant="danger"
            onClick={() =>
              showUndo('Document deleted from vault.', () => {
                success('Document restored via Undo!');
              })
            }
          >
            Trigger 8s Undo Delete Toast
          </Button>
          <Button variant="outline" onClick={() => setModalOpen(true)}>
            Open Sample Accessible Modal
          </Button>
        </div>
      </section>

      {/* 6. Empty State Component */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-light dark:text-muted-dark">
          6. Standard Empty State
        </h2>
        <EmptyState
          icon={FolderLock}
          title="No Documents Uploaded"
          description="Drag and drop your statutory certificates or inspection reports here to start qualification matching."
          actionLabel="Upload First File"
          onAction={() => success('Upload trigger clicked')}
        />
      </section>

      {/* Sample Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Sample Accessible Modal Dialog"
        subtitle="Full keyboard trap, Esc key listener, focus ring retention"
        footer={
          <Button variant="primary" onClick={() => setModalOpen(false)}>
            Close Modal
          </Button>
        }
      >
        <p className="text-xs sm:text-sm text-muted-light dark:text-muted-dark leading-relaxed">
          ReadySupply adheres to WCAG 2.1 AA accessibility standards with minimum 4.5:1 contrast, visible focus rings, semantic landmark tags, and screen-reader compliant aria attributes.
        </p>
      </Modal>
    </div>
  );
};

