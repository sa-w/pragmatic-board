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
