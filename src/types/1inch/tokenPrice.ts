export type ChartRangeResponse = {
  p: string;
  d: Array<{ t: number; v: number }>;
};

export type CurrentPriceResponse = {
  [key: string]: number;
};
