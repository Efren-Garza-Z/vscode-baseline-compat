// src/types.ts
export interface FeatureData {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  spec?: string | string[];
  // El estado real está dentro de `status.baseline`
  status: {
    baseline: 'high' | 'low' | false;
    baseline_high_date?: string;
    baseline_low_date?: string;
    support?: Record<string, string>;
  };
  // otras props posibles: compat_features, kind, etc.
  [k: string]: any;
}
