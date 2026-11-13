import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';

/* ═══════════════════════════════════════════════════════════════════════════
   1. BUTTON & ICON BUTTON
   ═══════════════════════════════════════════════════════════════════════════ */

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  className = '',
  children,
  type = 'button',
  ...props
}) => {
  const sizeClass =
    size === 'sm'
      ? 'h-8 px-3 text-xs rounded-lg gap-1.5'
      : size === 'lg'
        ? 'h-11 px-5 text-sm rounded-xl gap-2'
        : 'h-9 px-4 text-xs rounded-lg gap-2';

  const variantClass =
    variant === 'primary'
      ? 'btn-primary'
      : variant === 'secondary'
        ? 'btn-secondary'
        : variant === 'ghost'
          ? 'bg-transparent hover:bg-white/[0.06] text-slate-300 hover:text-white border border-transparent'
          : 'bg-transparent text-slate-400 hover:text-slate-200 underline-offset-4 hover:underline px-1 h-auto';

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center font-sans font-medium transition-all cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${sizeClass} ${variantClass} ${className}`}
      {...props}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  );
};

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  active?: boolean;
  size?: 'sm' | 'md';
}

export const IconButton: React.FC<IconButtonProps> = ({
  label,
  active = false,
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const dim = size === 'sm' ? 'w-8 h-8 rounded-lg' : 'w-9 h-9 rounded-lg';
  const stateClass = active
    ? 'bg-[var(--accent-surface)] border-[var(--accent-border)] text-[var(--accent-text)] shadow-[0_0_14px_-4px_var(--accent-border)]'
    : 'bg-slate-900/75 hover:bg-slate-800/90 border-white/[0.08] hover:border-white/20 text-slate-300 hover:text-white';

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={`inline-flex items-center justify-center border transition-all duration-150 hover:-translate-y-[0.5px] active:translate-y-0 active:scale-95 cursor-pointer disabled:opacity-40 ${dim} ${stateClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   2. SEGMENTED CONTROL
   ═══════════════════════════════════════════════════════════════════════════ */

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  fullWidth = false,
  className = '',
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (next: T) => void;
  ariaLabel?: string;
  fullWidth?: boolean;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={`${
        fullWidth ? 'flex w-full' : 'inline-flex'
      } items-center p-1 rounded-lg bg-slate-900/85 border border-white/[0.08] ${className}`}
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              soundFx.playClick();
              onChange(opt.value);
            }}
            className={`${
              fullWidth ? 'flex-1 justify-center' : ''
            } px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
              isActive
                ? 'bg-slate-800/95 text-slate-50 border border-[var(--accent-border-subtle)] shadow-[0_4px_12px_-4px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.10)]'
                : 'text-slate-400 hover:text-slate-200 border border-transparent hover:bg-white/[0.03]'
            }`}
          >
            {opt.icon}
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span className="text-xs font-mono tabular-nums text-slate-400">({opt.count})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   3. BADGE, PANEL & STAT
   ═══════════════════════════════════════════════════════════════════════════ */

export interface BadgeProps {
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  tone = 'neutral',
  children,
  className = '',
  dot = false,
}) => {
  const toneClass =
    tone === 'accent'
      ? 'hud-badge'
      : tone === 'success'
        ? 'bg-emerald-500/12 text-emerald-300 border border-emerald-500/30'
        : tone === 'warning'
          ? 'bg-amber-500/12 text-amber-300 border border-amber-500/30'
          : tone === 'danger'
            ? 'bg-red-500/12 text-red-300 border border-red-500/30'
            : 'bg-slate-800/80 text-slate-300 border border-white/[0.08]';

  const dotColor =
    tone === 'success'
      ? 'bg-emerald-400'
      : tone === 'warning'
        ? 'bg-amber-400'
        : tone === 'danger'
          ? 'bg-red-400'
          : tone === 'accent'
            ? 'bg-[var(--accent-primary)]'
            : 'bg-slate-400';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium ${toneClass} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      {children}
    </span>
  );
};

export const Panel: React.FC<{
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'aside';
}> = ({ children, className = '', as: Tag = 'div' }) => {
  return <Tag className={`hud-card hud-card-featured rounded-2xl ${className}`}>{children}</Tag>;
};

export const Stat: React.FC<{
  label: string;
  value: React.ReactNode;
  sublabel?: React.ReactNode;
  mono?: boolean;
  className?: string;
}> = ({ label, value, sublabel, mono = true, className = '' }) => {
  return (
    <div className={`px-3 py-2.5 rounded-xl hud-well ${className}`}>
      <span className="block text-[10px] font-mono uppercase tracking-[0.16em] text-slate-400">
        {label}
      </span>
      <span
        className={`block text-xs font-semibold text-slate-100 mt-0.5 truncate ${
          mono ? 'font-mono tabular-nums' : 'font-sans'
        }`}
      >
        {value}
      </span>
      {sublabel && (
        <span className="block text-[11px] text-slate-400 mt-0.5 truncate font-mono tabular-nums">
          {sublabel}
        </span>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   4. MODAL SHELL (Native <dialog closedby="any"> + Light-Dismiss Fallback)
   ═══════════════════════════════════════════════════════════════════════════ */

export interface ModalShellProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: React.ReactNode;
  eyebrow?: string;
  statusBadge?: { label: string; tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger' };
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const ModalShell: React.FC<ModalShellProps> = ({
  id,
  isOpen,
  onClose,
  title,
  subtitle,
  eyebrow,
  statusBadge,
  size = 'md',
  children,
  footer,
  className = '',
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      try {
        dialog.showModal();
      } catch (_) {}
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleNativeClose = () => {
      if (isOpen) {
        onClose();
      }
    };

    dialog.addEventListener('close', handleNativeClose);
    return () => dialog.removeEventListener('close', handleNativeClose);
  }, [isOpen, onClose]);

  // Fallback light-dismiss for browsers without <dialog closedby="any">
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    let pressedOutside = false;
    const isOutsideSurface = (e: PointerEvent) => {
      const box = surfaceRef.current?.getBoundingClientRect();
      if (!box) return false;
      return (
        e.clientX < box.left ||
        e.clientX > box.right ||
        e.clientY < box.top ||
        e.clientY > box.bottom
      );
    };

    const onDown = (e: PointerEvent) => {
      pressedOutside = isOutsideSurface(e);
    };
    const onUp = (e: PointerEvent) => {
      if (pressedOutside && isOutsideSurface(e) && dialog.open) {
        dialog.close();
      }
    };

    dialog.addEventListener('pointerdown', onDown);
    dialog.addEventListener('pointerup', onUp);
    return () => {
      dialog.removeEventListener('pointerdown', onDown);
      dialog.removeEventListener('pointerup', onUp);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const widthClass =
    size === 'sm' ? 'max-w-[480px]' : size === 'lg' ? 'max-w-[960px]' : 'max-w-[720px]';

  const handleCloseButton = () => {
    soundFx.playClick();
    if (dialogRef.current?.open) {
      dialogRef.current.close();
    } else {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      id={id}
      aria-labelledby={titleId}
      className="app-modal-dialog text-slate-50 select-none"
      {...({ closedby: 'any' } as Record<string, string>)}
    >
      <div
        ref={surfaceRef}
        className={`w-full ${widthClass} max-h-[88dvh] flex flex-col rounded-2xl hud-modal hud-card-featured relative overflow-hidden ${className}`}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex-shrink-0 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 min-w-0">
              {(eyebrow || statusBadge) && (
                <div className="flex items-center gap-2 flex-wrap">
                  {eyebrow && (
                    <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-slate-400">
                      {eyebrow}
                    </span>
                  )}
                  {statusBadge && (
                    <Badge tone={statusBadge.tone || 'neutral'} dot={statusBadge.tone === 'success'}>
                      {statusBadge.label}
                    </Badge>
                  )}
                </div>
              )}
              <h2
                id={titleId}
                className="text-base sm:text-lg font-bold font-orbitron uppercase tracking-[0.05em] text-white"
              >
                {title}
              </h2>
              {subtitle && <div className="text-xs text-slate-400">{subtitle}</div>}
            </div>

            <button
              type="button"
              onClick={handleCloseButton}
              aria-label="Close dialog"
              className="w-8 h-8 rounded-full hud-well hover:border-[var(--accent-border)] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="hud-deck-rule" aria-hidden="true" />
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 content-selectable">
          {children}
        </div>

        {/* Optional Footer */}
        {footer && (
          <div className="px-6 py-3.5 border-t border-white/[0.08] bg-slate-950/60 flex items-center justify-between gap-3 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </dialog>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   5. DRAWER SHELL (Native <dialog closedby="any"> Right Sheet)
   ═══════════════════════════════════════════════════════════════════════════ */

export interface DrawerShellProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: React.ReactNode;
  eyebrow?: string;
  headerExtra?: React.ReactNode;
  headerActions?: React.ReactNode;
  width?: 'sm' | 'lg';
  flushBody?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const DrawerShell: React.FC<DrawerShellProps> = ({
  id,
  isOpen,
  onClose,
  title,
  subtitle,
  eyebrow,
  headerExtra,
  headerActions,
  width = 'lg',
  flushBody = false,
  children,
  footer,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      try {
        dialog.showModal();
      } catch (_) {}
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleNativeClose = () => {
      if (isOpen) {
        onClose();
      }
    };

    dialog.addEventListener('close', handleNativeClose);
    return () => dialog.removeEventListener('close', handleNativeClose);
  }, [isOpen, onClose]);

  // Fallback light-dismiss for browsers without <dialog closedby="any">
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if ('closedBy' in HTMLDialogElement.prototype) return;

    let pressedOutside = false;
    const isOutside = (e: PointerEvent) => {
      const rect = dialog.getBoundingClientRect();
      return (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      );
    };

    const onDown = (e: PointerEvent) => {
      pressedOutside = isOutside(e);
    };
    const onUp = (e: PointerEvent) => {
      if (pressedOutside && isOutside(e) && dialog.open) {
        dialog.close();
      }
    };

    dialog.addEventListener('pointerdown', onDown);
    dialog.addEventListener('pointerup', onUp);
    return () => {
      dialog.removeEventListener('pointerdown', onDown);
      dialog.removeEventListener('pointerup', onUp);
    };
  }, [isOpen]);

  const handleCloseButton = () => {
    soundFx.playClick();
    if (dialogRef.current?.open) {
      dialogRef.current.close();
    } else {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      id={id}
      data-width={width}
      aria-labelledby={titleId}
      className="app-drawer-dialog text-slate-50 select-none"
      {...({ closedby: 'any' } as Record<string, string>)}
    >
      <div className="flex flex-col h-full hud-modal hud-card-featured border-l border-slate-400/15">
        {/* Header */}
        <div className="px-5 pt-4 pb-3 flex-shrink-0 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-0.5 min-w-0">
              {eyebrow && (
                <span className="block font-mono text-[10px] tracking-[0.18em] uppercase text-slate-400">
                  {eyebrow}
                </span>
              )}
              <h2
                id={titleId}
                className="text-sm sm:text-base font-bold font-orbitron uppercase tracking-[0.05em] text-white"
              >
                {title}
              </h2>
              {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {headerActions}
              <button
                type="button"
                onClick={handleCloseButton}
                aria-label="Close panel"
                className="w-8 h-8 rounded-full hud-well hover:border-[var(--accent-border)] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {headerExtra}
          <div className="hud-deck-rule" aria-hidden="true" />
        </div>

        {/* Body */}
        <div
          className={
            flushBody
              ? 'flex-1 overflow-y-auto content-selectable'
              : 'flex-1 overflow-y-auto px-5 py-4 space-y-4 content-selectable'
          }
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-5 py-3 border-t border-white/[0.08] bg-slate-950/60 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </dialog>
  );
};
