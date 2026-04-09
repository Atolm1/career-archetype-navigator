export type TemperamentGroup = 'NT' | 'NF' | 'SJ' | 'SP';

export interface MBTIType {
  code: string;
  archetypeName: string;
  temperament: TemperamentGroup;
}

export interface TemperamentMeta {
  label: string;
  subtitle: string;
  bg: string;
  border: string;
  headerColor: string;
}

export const TEMPERAMENT_META: Record<TemperamentGroup, TemperamentMeta> = {
  NT: {
    label: 'NT',
    subtitle: 'Rationals',
    bg: 'rgba(74, 123, 157, 0.12)',
    border: 'rgba(74, 123, 157, 0.35)',
    headerColor: '#4A7B9D',
  },
  NF: {
    label: 'NF',
    subtitle: 'Idealists',
    bg: 'rgba(123, 111, 160, 0.12)',
    border: 'rgba(123, 111, 160, 0.35)',
    headerColor: '#7B6FA0',
  },
  SJ: {
    label: 'SJ',
    subtitle: 'Guardians',
    bg: 'rgba(93, 138, 107, 0.12)',
    border: 'rgba(93, 138, 107, 0.35)',
    headerColor: '#5D8A6B',
  },
  SP: {
    label: 'SP',
    subtitle: 'Artisans',
    bg: 'rgba(157, 107, 74, 0.12)',
    border: 'rgba(157, 107, 74, 0.35)',
    headerColor: '#9D6B4A',
  },
};

export const MBTI_TYPES: MBTIType[] = [
  { code: 'INTJ', archetypeName: 'The Sovereign Architect', temperament: 'NT' },
  { code: 'INTP', archetypeName: 'The Quiet Oracle', temperament: 'NT' },
  { code: 'ENTJ', archetypeName: 'The Field Commander', temperament: 'NT' },
  { code: 'ENTP', archetypeName: 'The Disruptor', temperament: 'NT' },
  { code: 'INFJ', archetypeName: 'The Illuminated Guide', temperament: 'NF' },
  { code: 'INFP', archetypeName: 'The Dreaming Healer', temperament: 'NF' },
  { code: 'ENFJ', archetypeName: 'The Catalyst', temperament: 'NF' },
  { code: 'ENFP', archetypeName: 'The Visionary Bard', temperament: 'NF' },
  { code: 'ISTJ', archetypeName: 'The Steadfast Keeper', temperament: 'SJ' },
  { code: 'ISFJ', archetypeName: 'The Devoted Steward', temperament: 'SJ' },
  { code: 'ESTJ', archetypeName: 'The Master Builder', temperament: 'SJ' },
  { code: 'ESFJ', archetypeName: 'The Community Anchor', temperament: 'SJ' },
  { code: 'ISTP', archetypeName: 'The Precision Craftsman', temperament: 'SP' },
  { code: 'ISFP', archetypeName: 'The Artful Wanderer', temperament: 'SP' },
  { code: 'ESTP', archetypeName: 'The Bold Operator', temperament: 'SP' },
  { code: 'ESFP', archetypeName: 'The Electric Connector', temperament: 'SP' },
];

export const TEMPERAMENT_ORDER: TemperamentGroup[] = ['NT', 'NF', 'SJ', 'SP'];

export function getTypeByCode(code: string): MBTIType | undefined {
  return MBTI_TYPES.find((t) => t.code === code);
}

export function getTypesByTemperament(temperament: TemperamentGroup): MBTIType[] {
  return MBTI_TYPES.filter((t) => t.temperament === temperament);
}
