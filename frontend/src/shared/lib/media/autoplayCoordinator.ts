type AutoplayOwnerListener = (ownerId: string | null) => void;

type AutoplayCandidate = {
  score: number;
  sequence: number;
};

const SCORE_EPSILON = 0.0001;

const candidates = new Map<string, AutoplayCandidate>();
const listeners = new Set<AutoplayOwnerListener>();

let ownerId: string | null = null;
let sequence = 0;

const notifyOwnerChanged = () => {
  for (const listener of listeners) {
    listener(ownerId);
  }
};

const pickNextOwner = () => {
  let bestId: string | null = null;
  let bestScore = -Infinity;
  let bestSequence = -Infinity;

  for (const [candidateId, candidate] of candidates.entries()) {
    if (candidate.score > bestScore + SCORE_EPSILON) {
      bestId = candidateId;
      bestScore = candidate.score;
      bestSequence = candidate.sequence;
      continue;
    }

    if (Math.abs(candidate.score - bestScore) > SCORE_EPSILON) {
      continue;
    }

    if (candidateId === ownerId) {
      bestId = candidateId;
      bestScore = candidate.score;
      bestSequence = candidate.sequence;
      continue;
    }

    if (bestId !== ownerId && candidate.sequence > bestSequence) {
      bestId = candidateId;
      bestScore = candidate.score;
      bestSequence = candidate.sequence;
    }
  }

  return bestId;
};

const syncOwner = () => {
  const nextOwnerId = pickNextOwner();
  if (nextOwnerId === ownerId) return;

  ownerId = nextOwnerId;
  notifyOwnerChanged();
};

export const upsertAutoplayCandidate = (id: string, score: number) => {
  if (!Number.isFinite(score) || score <= 0) {
    if (!candidates.delete(id)) return;
    syncOwner();
    return;
  }

  candidates.set(id, {
    score,
    sequence: ++sequence,
  });
  syncOwner();
};

export const removeAutoplayCandidate = (id: string) => {
  if (!candidates.delete(id)) return;
  syncOwner();
};

export const subscribeAutoplayOwner = (listener: AutoplayOwnerListener) => {
  listeners.add(listener);
  listener(ownerId);

  return () => {
    listeners.delete(listener);
  };
};

