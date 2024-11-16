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
  columnId: string;
};

export function getCardData({
  card,
  columnId,
}: Omit<TCardData, typeof cardKey> & { columnId: string }): TCardData {
  return {
    [cardKey]: true,
    card,
    columnId,
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
