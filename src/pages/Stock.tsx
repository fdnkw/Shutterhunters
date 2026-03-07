import React, { useState } from 'react';
import { useStore } from '../store';
import { Product, ProductCondition, ProductStatus } from '../types';
import { Plus, Search, QrCode, Printer, X, Image as ImageIcon, ScanLine } from 'lucide-react';
import QRCode from 'react-qr-code';
import { format } from 'date-fns';
import BarcodeScanner from '../components/BarcodeScanner';

export default function Stock() {
  const { products, addProduct, updateProduct, user } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [printProduct, setPrintProduct] = useState<Product | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<Product>>({
    brand: '',
    model: '',
    serialNumber: '',
    condition: 'มือ1',
    note: '',
    costPrice: 0,
    sellPrice: 0,
    sellerName: '',
    sellerPhone: '',
    sellerDob: '',
    status: 'รอถ่ายรูป',
    images: [],
  });

  const [imageInput, setImageInput] = useState('');

  if (!user) return <div className="text-center py-20 text-gray-400">กรุณาเข้าสู่ระบบ</div>;

  const filteredProducts = products.filter(p => 
    p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.includes(searchTerm)
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
      // Mock Telegram notification
      console.log(`[Telegram Bot] สินค้า ${formData.brand} ${formData.model} อัพเดทสถานะเป็น ${formData.status}`);
    } else {
      const newProduct: Product = {
        ...formData as Product,
        id: Math.floor(100000 + Math.random() * 900000).toString(),
        dateAdded: new Date().toISOString(),
      };
      addProduct(newProduct);
      console.log(`[Telegram Bot] เพิ่มสินค้าใหม่ ${newProduct.brand} ${newProduct.model}`);
    }
    setIsModalOpen(false);
    setEditingProduct(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      brand: '', model: '', serialNumber: '', condition: 'มือ1', note: '',
      costPrice: 0, sellPrice: 0, sellerName: '', sellerPhone: '', sellerDob: '',
      status: 'รอถ่ายรูป', images: [],
    });
    setImageInput('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({ ...prev, images: [...(prev.images || []), base64String] }));
      };
      reader.readAsDataURL(file);
    });
    
    // Reset input value to allow uploading the same file again if needed
    e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index)
    }));
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setIsModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
        <h1 className="text-3xl font-bold uppercase tracking-wider flex items-center gap-3">
          <span className="w-2 h-8 bg-leica-red inline-block"></span>
          Stock Management
        </h1>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="ค้นหาสินค้า..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-leica-gray/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-leica-red focus:outline-none"
            />
          </div>
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-leica-red hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Plus size={18} />
            เพิ่มสินค้า
          </button>
        </div>
      </div>

      {/* Data Grid */}
      <div className="glass-panel rounded-xl overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-gray-400 font-mono uppercase tracking-wider text-xs">
            <tr>
              <th className="px-6 py-4">ID / Barcode</th>
              <th className="px-6 py-4">วันที่ซื้อเข้า</th>
              <th className="px-6 py-4">ยี่ห้อ / รุ่น</th>
              <th className="px-6 py-4">S/N</th>
              <th className="px-6 py-4">สภาพ</th>
              <th className="px-6 py-4">ทุน / ขาย</th>
              <th className="px-6 py-4">สถานะ</th>
              <th className="px-6 py-4 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4 font-mono">{product.id}</td>
                <td className="px-6 py-4 text-gray-400">{format(new Date(product.dateAdded), 'dd/MM/yyyy')}</td>
                <td className="px-6 py-4">
                  <div className="font-bold text-white">{product.brand}</div>
                  <div className="text-gray-400">{product.model}</div>
                </td>
                <td className="px-6 py-4 font-mono text-gray-400">{product.serialNumber}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-white/10 rounded text-xs">{product.condition}</span>
                </td>
                <td className="px-6 py-4 font-mono">
                  <div className="text-gray-400">฿{product.costPrice.toLocaleString()}</div>
                  <div className="text-leica-red font-bold">฿{product.sellPrice.toLocaleString()}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                    product.status === 'รอถ่ายรูป' ? 'border-yellow-500/50 text-yellow-500 bg-yellow-500/10' :
                    product.status === 'ถ่ายรูปแล้ว' ? 'border-green-500/50 text-green-500 bg-green-500/10' :
                    product.status === 'ส่งซ่อม' ? 'border-red-500/50 text-red-500 bg-red-500/10' :
                    product.status === 'ติดจอง' ? 'border-blue-500/50 text-blue-500 bg-blue-500/10' :
                    'border-gray-500/50 text-gray-500 bg-gray-500/10'
                  }`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button 
                    onClick={() => setPrintProduct(product)}
                    className="p-2 text-gray-400 hover:text-white bg-white/5 rounded transition-colors"
                    title="พิมพ์ Barcode/QR"
                  >
                    <Printer size={16} />
                  </button>
                  <button 
                    onClick={() => openEditModal(product)}
                    className="p-2 text-gray-400 hover:text-leica-red bg-white/5 rounded transition-colors"
                  >
                    แก้ไข
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass-panel w-full max-w-4xl rounded-2xl p-8 relative my-8">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-bold mb-6 uppercase tracking-wider border-l-4 border-leica-red pl-4">
              {editingProduct ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มสินค้าใหม่'}
            </h2>

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-leica-red border-b border-white/10 pb-2">ข้อมูลสินค้า</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 uppercase">ยี่ห้อ</label>
                    <select required value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white focus:border-leica-red focus:outline-none appearance-none">
                      <option value="" disabled>เลือกยี่ห้อ</option>
                      <option value="Leica">Leica</option>
                      <option value="Voigtlander">Voigtlander</option>
                      <option value="Sigma">Sigma</option>
                      <option value="Ricoh">Ricoh</option>
                      <option value="Hasselblad">Hasselblad</option>
                      <option value="Fujifilm">Fujifilm</option>
                      <option value="Sony">Sony</option>
                      <option value="Contax">Contax</option>
                      <option value="Olympus">Olympus</option>
                      <option value="Other brand">Other brand</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 uppercase">รุ่น</label>
                    <input type="text" required value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white focus:border-leica-red focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1 uppercase">Serial Number</label>
                  <div className="flex gap-2">
                    <input type="text" required value={formData.serialNumber} onChange={e => setFormData({...formData, serialNumber: e.target.value})} className="flex-1 bg-black/50 border border-white/10 rounded px-3 py-2 text-white focus:border-leica-red focus:outline-none font-mono" />
                    <button
                      type="button"
                      onClick={() => setIsScanning(true)}
                      className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded transition-colors flex items-center justify-center"
                      title="สแกนบาร์โค้ด"
                    >
                      <ScanLine size={20} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 uppercase">สภาพ</label>
                    <select value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value as ProductCondition})} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white focus:border-leica-red focus:outline-none appearance-none">
                      <option value="มือ1">มือ 1</option>
                      <option value="มือ2">มือ 2</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 uppercase">สถานะ</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as ProductStatus})} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white focus:border-leica-red focus:outline-none appearance-none">
                      <option value="รอถ่ายรูป">รอถ่ายรูป</option>
                      <option value="ถ่ายรูปแล้ว">ถ่ายรูปแล้ว</option>
                      <option value="ส่งซ่อม">ส่งซ่อม</option>
                      <option value="ติดจอง">ติดจอง</option>
                      <option value="ขายแล้ว">ขายแล้ว</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 uppercase">ราคาทุน</label>
                    <input type="number" required value={formData.costPrice === 0 ? '' : formData.costPrice} onChange={e => setFormData({...formData, costPrice: e.target.value === '' ? 0 : Number(e.target.value)})} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white focus:border-leica-red focus:outline-none font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 uppercase">ราคาขาย</label>
                    <input type="number" required value={formData.sellPrice === 0 ? '' : formData.sellPrice} onChange={e => setFormData({...formData, sellPrice: e.target.value === '' ? 0 : Number(e.target.value)})} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white focus:border-leica-red focus:outline-none font-mono" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1 uppercase">หมายเหตุ</label>
                  <textarea rows={2} value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white focus:border-leica-red focus:outline-none resize-none" />
                </div>
              </div>

              {/* Seller Info & Images */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-leica-red border-b border-white/10 pb-2">ข้อมูลผู้ขาย (รับเข้า)</h3>
                <div>
                  <label className="block text-xs text-gray-400 mb-1 uppercase">ชื่อ-สกุล</label>
                  <input type="text" required value={formData.sellerName} onChange={e => setFormData({...formData, sellerName: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white focus:border-leica-red focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 uppercase">เบอร์โทร</label>
                    <input type="tel" required value={formData.sellerPhone} onChange={e => setFormData({...formData, sellerPhone: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white focus:border-leica-red focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 uppercase">วันเกิด</label>
                    <input type="date" value={formData.sellerDob} onChange={e => setFormData({...formData, sellerDob: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white focus:border-leica-red focus:outline-none" />
                  </div>
                </div>

                <h3 className="text-lg font-medium text-leica-red border-b border-white/10 pb-2 mt-6">รูปภาพ (อัพโหลดจากอุปกรณ์)</h3>
                <div className="flex gap-2">
                  <input 
                    type="file" 
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="flex-1 bg-black/50 border border-white/10 rounded px-3 py-2 text-white focus:border-leica-red focus:outline-none text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-leica-red file:text-white hover:file:bg-red-700" 
                  />
                </div>
                
                {formData.images && formData.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {formData.images.map((imgSrc, idx) => (
                      <div key={idx} className="relative group aspect-square bg-black/50 rounded border border-white/10 overflow-hidden">
                        <img 
                          src={imgSrc.startsWith('data:') ? imgSrc : `https://lh3.googleusercontent.com/d/${imgSrc}`} 
                          alt={`img-${idx}`} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            if (!imgSrc.startsWith('data:')) {
                              (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${imgSrc}/100/100`;
                            }
                          }}
                        />
                        <button 
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="col-span-1 md:col-span-2 pt-4 border-t border-white/10 flex justify-end gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                  ยกเลิก
                </button>
                <button type="submit" className="bg-leica-red hover:bg-red-700 text-white px-8 py-2 rounded font-bold transition-colors uppercase tracking-wider">
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Modal */}
      {printProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="bg-white text-black w-full max-w-sm rounded-lg p-6 relative print:w-[50mm] print:h-auto print:p-2 print:m-0 print:bg-white print:rounded-none">
            <button onClick={() => setPrintProduct(null)} className="absolute top-4 right-4 text-gray-400 hover:text-black print:hidden">
              <X size={24} />
            </button>
            
            <div className="text-center space-y-2 print:space-y-1" id="print-area">
              <div className="border-b border-black pb-2">
                <h2 className="text-sm font-bold uppercase tracking-widest">Shutterhunters</h2>
                <p className="text-[10px] text-gray-600 font-bold">{printProduct.brand} {printProduct.model}</p>
                <p className="text-[8px] text-gray-500 font-mono mt-0.5">S/N: {printProduct.serialNumber}</p>
              </div>
              
              <div className="flex justify-center py-2">
                <QRCode value={printProduct.id} size={80} level="H" />
              </div>
              
              <div className="pt-2 border-t border-black flex flex-col items-center">
                <p className="text-[10px] font-bold font-mono">฿{printProduct.sellPrice.toLocaleString()}</p>
                <p className="text-[8px] text-gray-600 mt-1">IG: ShutterHunters.bkk</p>
              </div>
            </div>

            <div className="mt-6 flex justify-center print:hidden">
              <button onClick={handlePrint} className="bg-black text-white px-6 py-2 rounded font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors">
                <Printer size={18} />
                พิมพ์ฉลาก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      {isScanning && (
        <BarcodeScanner 
          onResult={(result) => {
            setFormData(prev => ({ ...prev, serialNumber: result }));
            setIsScanning(false);
          }}
          onClose={() => setIsScanning(false)}
        />
      )}
    </div>
  );
}
