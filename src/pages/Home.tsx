import React, { useState } from 'react';
import { useStore } from '../store';
import { Product } from '../types';
import { Search, ShoppingBag, Camera, X } from 'lucide-react';
import { format } from 'date-fns';

export default function Home() {
  const { products, addOrder } = useStore();
  const [searchPhone, setSearchPhone] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Buy form state
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');

  const availableProducts = products.filter(p => p.status === 'ถ่ายรูปแล้ว' || p.status === 'รอถ่ายรูป');

  const handleBuy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const newOrder = {
      id: `ORD-${Date.now()}`,
      dateSold: new Date().toISOString(),
      productId: selectedProduct.id,
      buyerName,
      buyerPhone,
      buyerDob: '', // Optional for public buy
      buyerAddress,
      price: selectedProduct.sellPrice,
    };

    addOrder(newOrder);
    
    // In a real app, we would update the product status to 'ติดจอง' or 'ขายแล้ว'
    useStore.getState().updateProduct(selectedProduct.id, { status: 'ติดจอง' });

    alert('สั่งซื้อสำเร็จ! กรุณารอการติดต่อกลับ');
    setSelectedProduct(null);
    setBuyerName('');
    setBuyerPhone('');
    setBuyerAddress('');
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12 border-b border-white/10">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase text-white">
          Capture <span className="text-leica-red">The Moment</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
          อุปกรณ์ถ่ายภาพระดับพรีเมียม คัดสรรอย่างดีเพื่อคุณ
        </p>
      </section>

      {/* Search Order History */}
      <section className="max-w-md mx-auto">
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Search className="text-leica-red" size={20} />
            ตรวจสอบประวัติคำสั่งซื้อ
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="กรอกเบอร์โทรศัพท์..."
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              className="flex-1 bg-leica-gray/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-leica-red"
            />
            <button 
              onClick={() => alert('ระบบกำลังค้นหา... (Mock)')}
              className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
            >
              ค้นหา
            </button>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section>
        <h2 className="text-2xl font-bold mb-8 uppercase tracking-wider border-l-4 border-leica-red pl-4">
          Available Gear
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableProducts.map((product) => (
            <div key={product.id} className="glass-panel rounded-2xl overflow-hidden group hover:border-leica-red/50 transition-colors">
              <div className="aspect-[4/3] bg-leica-gray flex items-center justify-center relative overflow-hidden">
                {product.images.length > 0 ? (
                  <img 
                    src={`https://lh3.googleusercontent.com/d/${product.images[0]}`} 
                    alt={product.model}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${product.model}/400/300`;
                    }}
                  />
                ) : (
                  <Camera size={48} className="text-gray-500" />
                )}
                <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium border border-white/10">
                  {product.condition}
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-leica-red text-sm font-bold uppercase tracking-wider">{product.brand}</p>
                    <h3 className="text-xl font-bold text-white">{product.model}</h3>
                  </div>
                  <p className="text-lg font-mono">฿{product.sellPrice.toLocaleString()}</p>
                </div>
                
                <p className="text-sm text-gray-400 mb-6 line-clamp-2">{product.note}</p>
                
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="w-full bg-white text-black hover:bg-leica-red hover:text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={18} />
                  สั่งซื้อสินค้า
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Buy Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-8 relative my-8">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-bold mb-6">สั่งซื้อ {selectedProduct.brand} {selectedProduct.model}</h2>
            
            <div className="bg-white/5 p-4 rounded-lg mb-6 flex justify-between items-center">
              <span className="text-gray-400">ราคา:</span>
              <span className="text-xl font-mono font-bold text-leica-red">฿{selectedProduct.sellPrice.toLocaleString()}</span>
            </div>

            <form onSubmit={handleBuy} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">ชื่อ-สกุล</label>
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full bg-leica-gray/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-leica-red focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">เบอร์โทรศัพท์</label>
                <input
                  type="tel"
                  required
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  className="w-full bg-leica-gray/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-leica-red focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">ที่อยู่จัดส่ง</label>
                <textarea
                  required
                  rows={3}
                  value={buyerAddress}
                  onChange={(e) => setBuyerAddress(e.target.value)}
                  className="w-full bg-leica-gray/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-leica-red focus:outline-none resize-none"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-leica-red hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors mt-4"
              >
                ยืนยันการสั่งซื้อ
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
