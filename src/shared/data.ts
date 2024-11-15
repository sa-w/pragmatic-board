export type TCard = {
  id: string;
  description: string;
};

export type TColumn = {
  id: string;
  title: string;
  cards: TCard[];
};

export type TBoard = {
  columns: TColumn[];
};

const cardKey = Symbol('card');
export type TCardData = {
  [cardKey]: true;
  card: TCard;
};

export function getCardData({ card }: Omit<TCardData, typeof cardKey>): TCardData {
  return {
    [cardKey]: true,
    card,
  };
}

export function isCardData(value: Record<string | symbol, unknown>): value is TCardData {
  return Boolean(value[cardKey]);
}

export function isDraggingACard({
  source,
}: {
  source: { data: Record<string | symbol, unknown> };
}): boolean {
  return isCardData(source.data);
}
