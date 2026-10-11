import React from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  trendType?: 'positive' | 'warning' | 'neutral' | 'brand';
  actionLabel?: string;
  onAction?: () => void;
  accentColor?: 'plum' | 'gold' | 'sage' | 'magenta';
}

export function KPICard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendType = 'positive',
  actionLabel,
  onAction,
  accentColor = 'plum',
}: KPICardProps) {
  const getTrendColor = () => {
    switch (trendType) {
      case 'positive':
        return 'text-emerald-800 bg-emerald-50 border-emerald-200/80';
      case 'warning':
        return 'text-amber-800 bg-amber-50 border-amber-200/80';
      case 'brand':
        return 'text-[var(--bb-plum)] bg-[var(--bb-blush)]/50 border-[var(--bb-plum)]/20';
      default:
        return 'text-stone-700 bg-stone-100/80 border-stone-200';
    }
  };

  const getAccentBar = () => {
    switch (accentColor) {
      case 'gold':
        return 'from-[var(--bb-gold)] via-[var(--bb-nectar)] to-amber-200';
      case 'sage':
        return 'from-[#3E6351] via-[#52826B] to-emerald-200';
      case 'magenta':
        return 'from-[var(--bb-magenta)] via-[#831843] to-pink-200';
      default:
        return 'from-[var(--bb-plum)] via-[var(--bb-magenta)] to-[var(--bb-gold)]';
    }
  };

  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-5 lg:p-6 shadow-xs border border-stone-200/80 hover:border-[var(--bb-gold)]/60 hover:shadow-md transition-all duration-200 group">
      {/* Subtle top accent gradient */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getAccentBar()} opacity-80 group-hover:opacity-100 transition-opacity`}
      />

      {/* Main card body */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 font-sans">
            {title}
          </p>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--bb-plum)]/10 text-[var(--bb-plum)] ring-1 ring-[var(--bb-gold)]/30 group-hover:scale-105 transition-transform duration-200">
            {icon}
          </div>
        </div>

        <div className="mt-2.5 space-y-1">
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 font-serif">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-stone-500 font-sans truncate" title={subtitle}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Footer: Dedicated status & action row */}
      {(trend || (actionLabel && onAction)) && (
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-stone-100 gap-2">
          {trend ? (
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${getTrendColor()}`}
            >
              {trend}
            </span>
          ) : (
            <span />
          )}

          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--bb-plum)] hover:text-[var(--bb-magenta)] shrink-0 transition-colors cursor-pointer group-hover:translate-x-0.5 duration-150"
            >
              <span>{actionLabel}</span>
              <span>&rarr;</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
