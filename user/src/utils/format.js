export const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export const FALLBACK_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="#f0fdf4"/><text x="50%" y="50%" font-size="60" text-anchor="middle" dy=".35em">🥬</text></svg>'
  );

export const productUnitLabel = (p) => (p.unitType === 'weight' ? 'per kg' : 'per pc');

export const dateFmt = (d) =>
  new Date(d).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
