// Slugify a string for URLs
export const slugify = (str = '') =>
  str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Build absolute file URL for an uploaded file
export const fileUrl = (req, filename) => {
  if (!filename) return '';
  const base = process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`;
  return `${base}/uploads/${filename}`;
};

// Default preset weight options for weight products
export const defaultWeightOptions = () => [
  { label: '100 g', grams: 100 },
  { label: '250 g', grams: 250 },
  { label: '500 g', grams: 500 },
  { label: '1 kg', grams: 1000 },
];

export const defaultPieceOptions = () => [
  { label: '1 pc', pieces: 1 },
  { label: '2 pc', pieces: 2 },
  { label: '4 pc', pieces: 4 },
  { label: '6 pc', pieces: 6 },
];
