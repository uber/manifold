// @noflow
import {
  generateRandomId,
  generateRandomSteps,
  generateRandomNormal,
} from './gen-data';
import {COLOR, FEATURE_TYPE, STATES} from '../constants';

const DOMAIN_SIZE = 100;
const NUM_INSTANCES = 10000;
const DEFAULT_COLORS = [COLOR.GREEN, COLOR.PURPLE];

export const generateRandomCategoricalValues = (
  k = NUM_INSTANCES,
  domain = Object.values(STATES)
) => {
  return [...Array(k)]
    .map(_ => Math.floor(Math.random() * domain.length))
    .map(i => domain[i]);
};

export const generateRandomNumericalValues = (
  k = NUM_INSTANCES,
  domain = [-100, 100]
) => {
  return [...Array(k)].map(
    _ => Math.random() * (domain[1] - domain[0]) + domain[0]
  );
};

export const generateRawCategoricalFeature = () => {
  return {
    name: `dummy-raw-categorical-feature-${generateRandomId()}`,
    type: FEATURE_TYPE.CATEGORICAL,
    values: [
      generateRandomCategoricalValues(),
      generateRandomCategoricalValues(),
    ],
  };
};

export const generateRawNumericalFeature = () => {
  return {
    name: `dummy-raw-numerical-feature-${generateRandomId()}`,
    type: FEATURE_TYPE.NUMERICAL,
    values: [
      generateRandomNormal(2500, 2, 0.5),
      generateRandomNormal(7500, 0, 1),
    ],
  };
};

export const generateCategoricalFeature = () => {
  const distroA = Object.values(STATES).map(_ => Math.random());
  const distroB = Object.values(STATES).map(_ => Math.random());
  return {
    name: `dummy-categorical-feature-${generateRandomId()}`,
    type: FEATURE_TYPE.CATEGORICAL,
    domain: Object.values(STATES),
    distributions: [distroA, distroB],
    distributionsNormalized: [distroA, distroB],
    colors: DEFAULT_COLORS,
    divergence: Math.random(),
  };
};

export const generateNumericalFeature = () => {
  const distroA = [...Array(DOMAIN_SIZE)].map(_ => Math.random());
  const distroB = [...Array(DOMAIN_SIZE)].map(_ => Math.random());
  return {
    name: `dummy-numerical-feature-${generateRandomId()}`,
    type: FEATURE_TYPE.NUMERICAL,
    domain: generateRandomSteps(DOMAIN_SIZE),
    distributions: [distroA, distroB],
    distributionsNormalized: [distroA, distroB],
    colors: DEFAULT_COLORS,
    divergence: Math.random(),
  };
};
