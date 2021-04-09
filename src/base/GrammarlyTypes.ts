export interface ExtraProperties {
  fluency?: string;
  j?: string;
  priority?: string;
}

export interface JsonContext {
  s: number;
  e: number;
}

export interface TransformJson {
  context: JsonContext;
  highlights: JsonContext[];
}

interface CardLayout {
  category: string;
  group: string;
  groupDescription: string;
  rank: number;
  outcome: string;
  outcomeDescription: string;
  outcomeRank: number;
  bundle: string;
  bundleRank: number;
}

export interface GrammarlyAlert {
  hiddem: boolean;
  category: string;
  pid: number;
  rid: number;
  sid: number;
  begin: number;
  end: number;
  text: string;
  group: string;
  pname: string;
  phash: string;
  pversion: string;
  rev: number;
  highlightBegin: number;
  highlightEnd: number;
  highlightText: string;
  replacements: string[];
  transformJson: TransformJson;
  impact: string;
  extra_properties: ExtraProperties;
  cardLaoyut: CardLayout;
  categoryHuman: string;
  cost: number;
  view: string;
  inline: string;
  action: string;
  id: number;
}

export interface GrammarlyResult {
  sid: number;
  rev: number;
  score: number;
  generalScore: number;
  removed: string[]; // ???
  dialect: string;
  foreign: boolean;
  action: string;
}

export default interface GrammarlyReply {
  alerts: GrammarlyAlert[];
  result: GrammarlyResult;
  original: string;
}