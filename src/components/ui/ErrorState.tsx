export function ErrorState({
  title,
  description,
  retryLabel,
  onRetry,
}: {
  title: string;
  description: string;
  retryLabel?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="panel rounded-3xl border border-rose-200 bg-rose-50 px-6 py-10 text-center">
      <h3 className="text-lg font-semibold text-rose-700">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-rose-600">{description}</p>
      {retryLabel && onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
        >
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}
