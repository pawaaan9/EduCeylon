export type QualificationFields = {
  title: string;
  institute: string;
  year: string;
};

export function isQualificationComplete(q: QualificationFields): boolean {
  return (
    !!q.title.trim() &&
    !!q.institute.trim() &&
    /^\d{4}$/.test(q.year.trim())
  );
}

export function hasValidQualifications(
  quals: QualificationFields[],
): boolean {
  return quals.some(isQualificationComplete);
}
