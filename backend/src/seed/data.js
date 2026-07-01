// Real product image URLs (Unsplash - free to use). Replace with your own uploads via admin.
export const categories = [
  { name: 'Vegetables', icon: '🥬', description: 'Fresh farm vegetables', order: 1, image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400' },
  { name: 'Fruits', icon: '🍎', description: 'Seasonal fresh fruits', order: 2, image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400' },
  { name: 'Dairy', icon: '🥛', description: 'Milk, curd, paneer & more', order: 3, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400' },
  { name: 'Organic', icon: '🌱', description: 'Certified organic produce', order: 4, image: 'https://images.unsplash.com/photo-1607305387299-a3d9611cd469?w=400' },
];

// price/mrp are per KG for weight products, per piece for piece products
export const products = [
  // Vegetables
  { name: 'Fresh Tomato', cat: 'Vegetables', unitType: 'weight', mrp: 40, price: 30, stock: 50000, images: ['https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=500'], desc: 'Juicy red tomatoes, farm fresh.' },
  { name: 'Onion', cat: 'Vegetables', unitType: 'weight', mrp: 45, price: 35, stock: 60000, images: ['https://images.unsplash.com/photo-1508747703725-719777637510?w=500'], desc: 'Premium quality onions.' },
  { name: 'Potato', cat: 'Vegetables', unitType: 'weight', mrp: 35, price: 28, stock: 80000, images: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500'], desc: 'Fresh potatoes, perfect for all dishes.' },
  { name: 'Green Capsicum', cat: 'Vegetables', unitType: 'weight', mrp: 80, price: 60, stock: 20000, images: ['https://images.unsplash.com/photo-1596056094719-10ba4f7f7b1f?w=500'], desc: 'Crunchy green capsicum.' },
  { name: 'Cauliflower', cat: 'Vegetables', unitType: 'piece', mrp: 40, price: 30, stock: 120, images: ['https://images.unsplash.com/photo-1568584711271-6c929fb49b60?w=500'], desc: 'Fresh white cauliflower head.' },
  { name: 'Lady Finger (Bhindi)', cat: 'Vegetables', unitType: 'weight', mrp: 60, price: 45, stock: 15000, images: ['https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?w=500'], desc: 'Tender fresh okra.' },
  // Fruits
  { name: 'Banana', cat: 'Fruits', unitType: 'weight', mrp: 60, price: 48, stock: 40000, images: ['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500'], desc: 'Sweet ripe bananas.' },
  { name: 'Apple Shimla', cat: 'Fruits', unitType: 'weight', mrp: 180, price: 140, stock: 30000, images: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500'], desc: 'Crisp and sweet Shimla apples.' },
  { name: 'Alphonso Mango', cat: 'Fruits', unitType: 'weight', mrp: 300, price: 250, stock: 25000, images: ['https://images.unsplash.com/photo-1553279768-865429fa0078?w=500'], desc: 'King of fruits, premium Alphonso.' },
  { name: 'Pomegranate', cat: 'Fruits', unitType: 'weight', mrp: 200, price: 160, stock: 18000, images: ['https://images.unsplash.com/photo-1541344999736-83eca272f6fc?w=500'], desc: 'Juicy ruby-red pomegranate.' },
  // Dairy
  { name: 'Full Cream Milk 1L', cat: 'Dairy', unitType: 'piece', mrp: 70, price: 66, stock: 200, images: ['https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500'], desc: 'Fresh full cream milk 1 litre pack.' },
  { name: 'Paneer 200g', cat: 'Dairy', unitType: 'piece', mrp: 90, price: 80, stock: 100, images: ['https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500'], desc: 'Soft fresh paneer block.' },
  { name: 'Curd 400g', cat: 'Dairy', unitType: 'piece', mrp: 50, price: 45, stock: 150, images: ['https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=500'], desc: 'Thick creamy curd.' },
  // Organic
  { name: 'Organic Spinach', cat: 'Organic', unitType: 'weight', mrp: 50, price: 40, stock: 12000, organic: true, images: ['https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500'], desc: 'Pesticide-free organic spinach.' },
  { name: 'Organic Carrot', cat: 'Organic', unitType: 'weight', mrp: 70, price: 55, stock: 14000, organic: true, images: ['https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500'], desc: 'Sweet organic carrots.' },
  { name: 'Organic Brown Rice 1kg', cat: 'Organic', unitType: 'piece', mrp: 150, price: 120, stock: 80, organic: true, images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500'], desc: 'Wholesome organic brown rice.' },
];

export const banners = [
  { title: 'Tazi Sabzi, Seedhe Ghar Tak', subtitle: 'Get 20% off on your first order', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=900', link: '/category/offers', order: 1 },
  { title: 'Fresh Fruits Daily', subtitle: 'Handpicked & delivered fresh', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=900', link: '/category/fruits', order: 2 },
  { title: 'Go Organic', subtitle: 'Certified organic produce', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=900', link: '/category/organic', order: 3 },
];

export const coupons = [
  { code: 'WELCOME20', description: '20% off up to ₹50 on first order', discountType: 'percent', discountValue: 20, maxDiscount: 50, minOrder: 149 },
  { code: 'FLAT50', description: 'Flat ₹50 off on orders above ₹299', discountType: 'flat', discountValue: 50, minOrder: 299 },
  { code: 'FRESH10', description: '10% off up to ₹100', discountType: 'percent', discountValue: 10, maxDiscount: 100, minOrder: 199 },
];
