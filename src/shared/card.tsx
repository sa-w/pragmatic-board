import { forwardRef, ReactElement } from 'react';
import { Apple } from 'lucide-react';

export type TCard = {
  id: string;
  icon: ReactElement;
};

export function getCards({ amount }: { amount: number }): TCard[] {
  return Array.from({ length: amount }, (_, index) => {
    const card: TCard = {
      id: `card:${index}`,
      icon: <Apple />,
    };

    return card;
  });
}

export const Card = forwardRef<HTMLDivElement, { card: TCard }>(function Card({ card }, ref) {
  return (
    <div ref={ref}>
      {card.icon} {card.id}
    </div>
  );
});
