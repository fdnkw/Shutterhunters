import React, { useState } from 'react';
import { useStore } from '../store';
import { Product, Order } from '../types';
import { Search, ShoppingCart, Printer, X, CheckCircle2, ScanLine } from 'lucide-react';
import { format } from 'date-fns';

export default function Sell() {
  const { products, orders, addOrder, updateProduct, user } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  
  // Buyer form state
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerDob, setBuyerDob] = useState('');

  if (!user) return <div className="text-center py-20 text-gray-400">กรุณาเข้าสู่ระบบ</div>;

  const availableProducts = products.filter(p => p.status !== 'ขายแล้ว');
  const soldProducts = products.filter(p => p.status === 'ขายแล้ว');

  const filteredProducts = availableProducts.filter(p => 
    p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.includes(searchTerm)
  );

  const handleSell = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      dateSold: new Date().toISOString(),
      productId: selectedProduct.id,
      buyerName,
      buyerPhone,
      buyerDob,
      price: selectedProduct.sellPrice,
    };

    addOrder(newOrder);
    updateProduct(selectedProduct.id, { status: 'ขายแล้ว' });
    
    console.log(`[Telegram Bot] สินค้า ${selectedProduct.brand} ${selectedProduct.model} ถูกขายแล้ว โดย ${user.name}`);

    setReceiptOrder(newOrder);
    setSelectedProduct(null);
    setBuyerName('');
    setBuyerPhone('');
    setBuyerDob('');
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
        <h1 className="text-3xl font-bold uppercase tracking-wider flex items-center gap-3">
          <span className="w-2 h-8 bg-leica-red inline-block"></span>
          Point of Sale
        </h1>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="สแกน Barcode/QR หรือค้นหา..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-leica-gray/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-leica-red focus:outline-none font-mono"
              autoFocus
            />
          </div>
          <button
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap"
            title="สแกนผ่านกล้อง"
          >
            <ScanLine size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Selection */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold uppercase tracking-wider border-l-4 border-leica-red pl-4">
            เลือกสินค้า
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                onClick={() => setSelectedProduct(product)}
                className={`glass-panel p-4 rounded-xl cursor-pointer transition-all ${
                  selectedProduct?.id === product.id 
                    ? 'border-leica-red bg-leica-red/5 ring-1 ring-leica-red' 
                    : 'hover:border-white/30 hover:bg-white/5'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-xs text-leica-red font-bold uppercase">{product.brand}</p>
                    <h3 className="font-bold text-white">{product.model}</h3>
                  </div>
                  <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300">
                    {product.condition}
                  </span>
                </div>
                <div className="flex justify-between items-end mt-4">
                  <p className="text-xs font-mono text-gray-500">ID: {product.id}</p>
                  <p className="font-mono font-bold text-lg">฿{product.sellPrice.toLocaleString()}</p>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500 glass-panel rounded-xl">
                ไม่พบสินค้าที่ค้นหา
              </div>
            )}
          </div>

          {/* Sold Items List */}
          <div className="mt-12">
            <h2 className="text-xl font-bold uppercase tracking-wider border-l-4 border-gray-500 pl-4 mb-4 text-gray-400">
              รายการที่ขายแล้ว
            </h2>
            <div className="glass-panel rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-gray-500 font-mono uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-4 py-3">วันที่ขาย</th>
                    <th className="px-4 py-3">สินค้า</th>
                    <th className="px-4 py-3">ผู้ซื้อ</th>
                    <th className="px-4 py-3 text-right">ราคา</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-400">
                  {orders.slice().reverse().map((order) => {
                    const product = products.find(p => p.id === order.productId);
                    return (
                      <tr key={order.id} className="hover:bg-white/5">
                        <td className="px-4 py-3">{format(new Date(order.dateSold), 'dd/MM/yyyy HH:mm')}</td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-gray-300">{product?.brand} {product?.model}</span>
                          <span className="block text-xs font-mono">{product?.serialNumber}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="block text-gray-300">{order.buyerName}</span>
                          <span className="block text-xs">{order.buyerPhone}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono">฿{order.price.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">ยังไม่มีรายการขาย</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Checkout Panel */}
        <div className="lg:col-span-1">
          <div className="glass-panel rounded-2xl p-6 sticky top-24">
            <h2 className="text-xl font-bold uppercase tracking-wider flex items-center gap-2 mb-6">
              <ShoppingCart size={20} className="text-leica-red" />
              Checkout
            </h2>

            {selectedProduct ? (
              <form onSubmit={handleSell} className="space-y-6">
                <div className="bg-black/50 p-4 rounded-lg border border-white/10">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs text-leica-red font-bold uppercase">{selectedProduct.brand}</p>
                      <h3 className="font-bold text-white">{selectedProduct.model}</h3>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setSelectedProduct(null)}
                      className="text-gray-500 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
                    <span className="text-sm text-gray-400">ยอดรวม</span>
                    <span className="text-2xl font-mono font-bold text-leica-red">
                      ฿{selectedProduct.sellPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">ข้อมูลผู้ซื้อ</h3>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">ชื่อ-สกุล</label>
                    <input
                      type="text"
                      required
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white focus:border-leica-red focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">เบอร์โทรศัพท์</label>
                    <input
                      type="tel"
                      required
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white focus:border-leica-red focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">วันเกิด</label>
                    <input
                      type="date"
                      value={buyerDob}
                      onChange={(e) => setBuyerDob(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white focus:border-leica-red focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-leica-red hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={20} />
                  ยืนยันการขาย
                </button>
              </form>
            ) : (
              <div className="text-center py-12 text-gray-500 border-2 border-dashed border-white/10 rounded-lg">
                <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
                <p>กรุณาเลือกสินค้าเพื่อทำรายการ</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {receiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="bg-white text-black w-full max-w-sm rounded-lg p-8 relative print:w-full print:max-w-none print:h-full print:p-4 print:m-0 print:bg-white print:rounded-none">
            <button onClick={() => setReceiptOrder(null)} className="absolute top-4 right-4 text-gray-400 hover:text-black print:hidden">
              <X size={24} />
            </button>
            
            <div className="text-center space-y-4" id="receipt-area">
              <div className="border-b border-dashed border-gray-400 pb-4">
                <h2 className="text-2xl font-bold uppercase tracking-widest">Shutterhunters</h2>
                <p className="text-xs text-gray-500 mt-1">ใบเสร็จรับเงิน / Receipt</p>
              </div>
              
              <div className="text-left text-sm space-y-1 py-2">
                <p><span className="text-gray-500">Order ID:</span> {receiptOrder.id}</p>
                <p><span className="text-gray-500">Date:</span> {format(new Date(receiptOrder.dateSold), 'dd/MM/yyyy HH:mm')}</p>
                <p><span className="text-gray-500">Cashier:</span> {user.name}</p>
              </div>

              <div className="border-t border-b border-dashed border-gray-400 py-4 text-left">
                <p className="font-bold mb-1">Customer Info</p>
                <p className="text-sm">{receiptOrder.buyerName}</p>
                <p className="text-sm text-gray-600">{receiptOrder.buyerPhone}</p>
              </div>
              
              <div className="py-4 text-left">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    {(() => {
                      const p = products.find(p => p.id === receiptOrder.productId);
                      return (
                        <>
                          <p className="font-bold text-sm">{p?.brand} {p?.model}</p>
                          <p className="text-xs text-gray-500 font-mono">S/N: {p?.serialNumber}</p>
                        </>
                      );
                    })()}
                  </div>
                  <p className="font-mono text-sm">฿{receiptOrder.price.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="border-t-2 border-black pt-4 flex justify-between items-center">
                <p className="font-bold uppercase">Total</p>
                <p className="text-xl font-bold font-mono">฿{receiptOrder.price.toLocaleString()}</p>
              </div>

              <div className="pt-8 text-xs text-gray-500 text-center">
                <p>Thank you for your purchase!</p>
                <p>Please keep this receipt for your records.</p>
              </div>
            </div>

            <div className="mt-8 flex justify-center print:hidden">
              <button onClick={handlePrintReceipt} className="bg-black text-white px-8 py-3 rounded font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors">
                <Printer size={20} />
                พิมพ์ใบเสร็จ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
