import { useStore } from '../store';
import { TrendingUp, Package, DollarSign, ShoppingBag, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function Dashboard() {
  const { products, orders, user } = useStore();

  if (!user || user.role !== 'Admin') {
    return <div className="text-center py-20 text-gray-400">เฉพาะผู้ดูแลระบบเท่านั้น</div>;
  }

  const totalProducts = products.length;
  const availableProducts = products.filter(p => p.status !== 'ขายแล้ว').length;
  const soldProducts = products.filter(p => p.status === 'ขายแล้ว').length;

  const totalCost = products.reduce((sum, p) => sum + p.costPrice, 0);
  const totalExpectedRevenue = products.reduce((sum, p) => sum + p.sellPrice, 0);
  const expectedProfit = totalExpectedRevenue - totalCost;

  const actualRevenue = orders.reduce((sum, o) => sum + o.price, 0);
  const actualCost = orders.reduce((sum, o) => {
    const p = products.find(prod => prod.id === o.productId);
    return sum + (p?.costPrice || 0);
  }, 0);
  const actualProfit = actualRevenue - actualCost;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
        <h1 className="text-3xl font-bold uppercase tracking-wider flex items-center gap-3">
          <span className="w-2 h-8 bg-leica-red inline-block"></span>
          Dashboard
        </h1>
        <div className="text-sm text-gray-400">
          ข้อมูลอัพเดทล่าสุด: {new Date().toLocaleDateString('th-TH')}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Package size={64} />
          </div>
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">สินค้าทั้งหมด</p>
          <h3 className="text-4xl font-bold text-white font-mono">{totalProducts}</h3>
          <p className="text-xs text-gray-500 mt-2">พร้อมขาย {availableProducts} รายการ</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShoppingBag size={64} />
          </div>
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">ขายแล้ว</p>
          <h3 className="text-4xl font-bold text-white font-mono">{soldProducts}</h3>
          <p className="text-xs text-gray-500 mt-2">จากทั้งหมด {totalProducts} รายการ</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group border-leica-red/30">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-leica-red">
            <DollarSign size={64} />
          </div>
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">ยอดขายรวม</p>
          <h3 className="text-4xl font-bold text-leica-red font-mono">฿{actualRevenue.toLocaleString()}</h3>
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
            <ArrowUpRight size={14} className="text-green-500" />
            รายได้จริงที่ได้รับ
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group border-green-500/30">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-green-500">
            <TrendingUp size={64} />
          </div>
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">กำไรสุทธิ</p>
          <h3 className="text-4xl font-bold text-green-500 font-mono">฿{actualProfit.toLocaleString()}</h3>
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
            <ArrowUpRight size={14} className="text-green-500" />
            หักต้นทุนแล้ว
          </p>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-lg font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-leica-red"></span>
            ภาพรวมการลงทุน (สต๊อกปัจจุบัน)
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
              <span className="text-gray-400">มูลค่าต้นทุนรวม</span>
              <span className="text-xl font-mono font-bold">฿{totalCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
              <span className="text-gray-400">มูลค่าขายคาดการณ์</span>
              <span className="text-xl font-mono font-bold text-blue-400">฿{totalExpectedRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10">
              <span className="text-gray-400">กำไรคาดการณ์</span>
              <span className="text-xl font-mono font-bold text-green-400">฿{expectedProfit.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-lg font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            ผลประกอบการจริง
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
              <span className="text-gray-400">ต้นทุนสินค้าที่ขายแล้ว</span>
              <span className="text-xl font-mono font-bold">฿{actualCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
              <span className="text-gray-400">ยอดขายจริง</span>
              <span className="text-xl font-mono font-bold text-leica-red">฿{actualRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10">
              <span className="text-gray-400">กำไรจริง</span>
              <span className="text-xl font-mono font-bold text-green-500">฿{actualProfit.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
