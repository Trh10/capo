interface PurchaseBannerProps {
  purchased?: boolean;
  cancelled?: boolean;
}

export function PurchaseBanner({ purchased, cancelled }: PurchaseBannerProps) {
  if (purchased) {
    return (
      <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
        Achat confirmé — vous avez maintenant accès à toutes les leçons de ce cours.
      </div>
    );
  }

  if (cancelled) {
    return (
      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Paiement annulé. Vous pouvez réessayer quand vous voulez.
      </div>
    );
  }

  return null;
}
