export const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
export const dateFmt = (d) =>
  new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' });
export const FALLBACK_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="100%" height="100%" fill="#f0fdf4"/><text x="50%" y="55%" font-size="30" text-anchor="middle">🥬</text></svg>');
