import React, { useState } from 'react';
import { useStore } from '../store';
import { Product, Order } from '../types';
import { Search, ShoppingBag, Camera, X, Info, Package, Calendar, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

export default function Home() {
  const { products, orders, addOrder } = useStore();
  const [searchPhone, setSearchPhone] = useState('');
  const [searchResult, setSearchResult] = useState<Order[] | null>(null);
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Buy form state
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');

  const availableProducts = products.filter(p => p.status === 'ถ่ายรูปแล้ว' || p.status === 'รอถ่ายรูป');

  const handleSearchOrder = () => {
    if (!searchPhone.trim()) {
      setSearchResult(null);
      return;
    }
    const results = orders.filter(o => o.buyerPhone.includes(searchPhone.trim()));
    setSearchResult(results);
  };

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

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    
    setSelectedProduct(null);
    setBuyerName('');
    setBuyerPhone('');
    setBuyerAddress('');
  };

  return (
    <div className="space-y-12 relative">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 size={20} />
          <span className="font-bold">สั่งซื้อสำเร็จ! กรุณารอการติดต่อกลับ</span>
        </div>
      )}

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
      <section className="max-w-2xl mx-auto">
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Search className="text-leica-red" size={20} />
            ตรวจสอบประวัติคำสั่งซื้อ
          </h3>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="กรอกเบอร์โทรศัพท์..."
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchOrder()}
              className="flex-1 bg-leica-gray/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-leica-red"
            />
            <button 
              onClick={handleSearchOrder}
              className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-lg transition-colors font-bold"
            >
              ค้นหา
            </button>
          </div>

          {/* Search Results */}
          {searchResult !== null && (
            <div className="mt-6 border-t border-white/10 pt-4 animate-in fade-in">
              <h4 className="text-sm text-gray-400 mb-3">ผลการค้นหา ({searchResult.length} รายการ)</h4>
              {searchResult.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                  {searchResult.map(order => {
                    const product = products.find(p => p.id === order.productId);
                    return (
                      <div key={order.id} className="bg-black/30 p-4 rounded-lg border border-white/5 flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                          <p className="text-xs text-leica-red font-mono mb-1">{order.id}</p>
                          <p className="font-bold text-white">{product ? `${product.brand} ${product.model}` : 'สินค้าไม่ทราบชื่อ'}</p>
                          <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                            <Calendar size={14} />
                            {format(new Date(order.dateSold), 'dd MMM yyyy HH:mm')}
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-lg font-mono font-bold text-white">฿{order.price.toLocaleString()}</p>
                          <span className="inline-block mt-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">ชำระเงินแล้ว</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">ไม่พบประวัติคำสั่งซื้อสำหรับเบอร์โทรศัพท์นี้</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Product Grid */}
      <section>
        <h2 className="text-2xl font-bold mb-8 uppercase tracking-wider border-l-4 border-leica-red pl-4">
          Available Gear
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableProducts.map((product) => (
            <div 
              key={product.id} 
              className="glass-panel rounded-2xl overflow-hidden group hover:border-leica-red/50 transition-colors cursor-pointer flex flex-col"
              onClick={() => setViewProduct(product)}
            >
              <div className="aspect-[4/3] bg-leica-gray flex items-center justify-center relative overflow-hidden">
                {product.images.length > 0 ? (
                  <img 
                    src={product.images[0].startsWith('data:image') ? product.images[0] : `https://lh3.googleusercontent.com/d/${product.images[0]}`} 
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
              
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-leica-red text-sm font-bold uppercase tracking-wider">{product.brand}</p>
                    <h3 className="text-xl font-bold text-white">{product.model}</h3>
                  </div>
                  <p className="text-lg font-mono">฿{product.sellPrice.toLocaleString()}</p>
                </div>
                
                <p className="text-sm text-gray-400 mb-6 line-clamp-2 flex-grow">{product.note}</p>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent opening the view modal
                    setSelectedProduct(product);
                  }}
                  className="w-full bg-white text-black hover:bg-leica-red hover:text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={18} />
                  สั่งซื้อสินค้า
                </button>
              </div>
            </div>
          ))}
          {availableProducts.length === 0 && (
            <div className="col-span-full text-center py-20 text-gray-500 glass-panel rounded-2xl">
              <Package size={48} className="mx-auto mb-4 opacity-50" />
              <p>ไม่มีสินค้าพร้อมขายในขณะนี้</p>
            </div>
          )}
        </div>
      </section>

      {/* View Product Details Modal */}
      {viewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass-panel w-full max-w-4xl rounded-2xl overflow-hidden relative my-8 flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setViewProduct(null)}
              className="absolute top-4 right-4 z-10 bg-black/50 p-2 rounded-full text-gray-400 hover:text-white hover:bg-leica-red transition-colors"
            >
              <X size={24} />
            </button>
            
            {/* Image Gallery Side */}
            <div className="w-full md:w-1/2 bg-leica-gray min-h-[300px] flex flex-col">
              <div className="flex-grow flex items-center justify-center p-4 relative">
                {viewProduct.images.length > 0 ? (
                  <img 
                    src={viewProduct.images[0].startsWith('data:image') ? viewProduct.images[0] : `https://lh3.googleusercontent.com/d/${viewProduct.images[0]}`} 
                    alt={viewProduct.model}
                    className="max-w-full max-h-[500px] object-contain"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${viewProduct.model}/800/600`;
                    }}
                  />
                ) : (
                  <Camera size={64} className="text-gray-600" />
                )}
                <div className="absolute top-4 left-4 bg-leica-red px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider">
                  {viewProduct.condition}
                </div>
              </div>
              
              {/* Thumbnails if multiple images */}
              {viewProduct.images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto bg-black/20 custom-scrollbar">
                  {viewProduct.images.map((img, idx) => (
                    <img 
                      key={idx}
                      src={img.startsWith('data:image') ? img : `https://lh3.googleusercontent.com/d/${img}`} 
                      alt={`${viewProduct.model} ${idx + 1}`}
                      className="w-16 h-16 object-cover rounded cursor-pointer border-2 border-transparent hover:border-leica-red transition-colors flex-shrink-0"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${viewProduct.model}${idx}/100/100`;
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Details Side */}
            <div className="w-full md:w-1/2 p-8 flex flex-col">
              <div className="mb-6">
                <p className="text-leica-red font-bold uppercase tracking-widest mb-1">{viewProduct.brand}</p>
                <h2 className="text-3xl font-bold text-white mb-2">{viewProduct.model}</h2>
                <p className="text-2xl font-mono text-white">฿{viewProduct.sellPrice.toLocaleString()}</p>
              </div>

              <div className="space-y-4 flex-grow">
                <div>
                  <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-1">รายละเอียด / ตำหนิ</h4>
                  <p className="text-gray-300 bg-white/5 p-4 rounded-lg leading-relaxed">
                    {viewProduct.note || 'ไม่มีรายละเอียดเพิ่มเติม'}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-3 rounded-lg">
                    <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-1">Serial Number</h4>
                    <p className="text-sm text-white font-mono">{viewProduct.serialNumber}</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg">
                    <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-1">สถานะ</h4>
                    <p className="text-sm text-white">{viewProduct.status}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <button
                  onClick={() => {
                    setViewProduct(null);
                    setSelectedProduct(viewProduct);
                  }}
                  className="w-full bg-leica-red hover:bg-red-700 text-white font-bold py-4 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg uppercase tracking-wider shadow-lg shadow-red-900/20"
                >
                  <ShoppingBag size={20} />
                  สั่งซื้อสินค้านี้
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Buy Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-8 relative my-8 animate-in fade-in zoom-in-95 duration-200">
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
