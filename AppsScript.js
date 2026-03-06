// File: Code.gs (Google Apps Script)
// คำแนะนำ: คัดลอกโค้ดนี้ไปวางทับใน Google Apps Script ของคุณ
// จากนั้นกด Deploy > New deployment > Web App > สิทธิ์การเข้าถึง: Anyone

const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // เปลี่ยนเป็น ID ของ Google Sheet
const FOLDER_ID = 'YOUR_FOLDER_ID_HERE'; // เปลี่ยนเป็น ID ของ Google Drive Folder สำหรับเก็บรูปภาพ
const TELEGRAM_BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN_HERE'; // เปลี่ยนเป็น Token ของ Telegram Bot
const TELEGRAM_CHAT_ID = 'YOUR_TELEGRAM_CHAT_ID_HERE'; // เปลี่ยนเป็น Chat ID ของ Admin

// ==========================================
// 1. Web App Setup (REST API)
// ==========================================

// จัดการ GET Request (ดึงข้อมูลตอนเปิดเว็บ)
function doGet(e) {
  try {
    const products = getProducts();
    const orders = getOrders();
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      products: products,
      orders: orders
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// จัดการ POST Request (เพิ่ม/แก้ไขข้อมูล)
function doPost(e) {
  try {
    // รับข้อมูล JSON ที่ส่งมาจาก React
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const payload = data.payload;
    
    let result = { success: false, message: 'Unknown action' };

    if (action === 'addProduct') {
      result = addProduct(payload);
    } else if (action === 'updateProduct') {
      result = updateProductStatus(payload.id, payload.status);
    } else if (action === 'addOrder') {
      result = addOrder(payload);
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ==========================================
// 2. Initialization & Setup
// ==========================================
function setupDatabase() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // สร้าง Sheet "Products" ถ้ายังไม่มี
  let productSheet = ss.getSheetByName('Products');
  if (!productSheet) {
    productSheet = ss.insertSheet('Products');
    productSheet.appendRow([
      'ID', 'DateAdded', 'Brand', 'Model', 'SerialNumber', 'Condition', 
      'Note', 'CostPrice', 'SellPrice', 'SellerName', 'SellerPhone', 
      'SellerDob', 'Status', 'Images'
    ]);
    // แช่แข็งแถวแรก
    productSheet.setFrozenRows(1);
  }

  // สร้าง Sheet "Orders" ถ้ายังไม่มี
  let orderSheet = ss.getSheetByName('Orders');
  if (!orderSheet) {
    orderSheet = ss.insertSheet('Orders');
    orderSheet.appendRow([
      'OrderID', 'DateSold', 'ProductID', 'BuyerName', 'BuyerPhone', 'BuyerDob', 'BuyerAddress', 'Price'
    ]);
    orderSheet.setFrozenRows(1);
  }
  
  return 'Database setup complete!';
}

// ==========================================
// 3. Database Functions
// ==========================================

// ดึงข้อมูลสินค้าทั้งหมด
function getProducts() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Products');
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const products = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const product = {};
    
    product.id = row[0].toString();
    product.dateAdded = row[1];
    product.brand = row[2];
    product.model = row[3];
    product.serialNumber = row[4];
    product.condition = row[5];
    product.note = row[6];
    product.costPrice = Number(row[7]);
    product.sellPrice = Number(row[8]);
    product.sellerName = row[9];
    product.sellerPhone = row[10];
    product.sellerDob = row[11];
    product.status = row[12];
    
    try {
      product.images = row[13] ? JSON.parse(row[13]) : [];
    } catch (e) {
      product.images = row[13] ? row[13].split(',') : [];
    }
    
    products.push(product);
  }
  return products;
}

// เพิ่มสินค้าใหม่
function addProduct(productData) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Products');
    
    // จัดการอัพโหลดรูปภาพ
    const imageIds = [];
    if (productData.images && productData.images.length > 0) {
      const folder = DriveApp.getFolderById(FOLDER_ID);
      
      for (let i = 0; i < productData.images.length; i++) {
        const base64Data = productData.images[i];
        if (base64Data.startsWith('data:image')) {
          const contentType = base64Data.substring(5, base64Data.indexOf(';'));
          const bytes = Utilities.base64Decode(base64Data.split(',')[1]);
          const blob = Utilities.newBlob(bytes, contentType, `${productData.id}_${i}.jpg`);
          const file = folder.createFile(blob);
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          imageIds.push(file.getId());
        } else {
          imageIds.push(base64Data);
        }
      }
    }
    
    sheet.appendRow([
      productData.id,
      productData.dateAdded,
      productData.brand,
      productData.model,
      productData.serialNumber,
      productData.condition,
      productData.note,
      productData.costPrice,
      productData.sellPrice,
      productData.sellerName,
      productData.sellerPhone,
      productData.sellerDob,
      productData.status,
      JSON.stringify(imageIds)
    ]);
    
    sendTelegramMessage(`📦 <b>เพิ่มสินค้าใหม่</b>\n\nยี่ห้อ: ${productData.brand}\nรุ่น: ${productData.model}\nS/N: ${productData.serialNumber}\nสถานะ: ${productData.status}`);
    return { success: true, message: 'Product added successfully' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// อัพเดทสถานะสินค้า
function updateProductStatus(productId, newStatus) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Products');
    const data = sheet.getDataRange().getValues();
    
    let updated = false;
    let productInfo = '';
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0].toString() === productId.toString()) {
        sheet.getRange(i + 1, 13).setValue(newStatus); // คอลัมน์ที่ 13 คือ Status
        updated = true;
        productInfo = `${data[i][2]} ${data[i][3]}`;
        break;
      }
    }
    
    if (updated) {
      sendTelegramMessage(`🔄 <b>อัพเดทสถานะสินค้า</b>\n\nสินค้า: ${productInfo}\nสถานะใหม่: <b>${newStatus}</b>`);
      return { success: true };
    } else {
      return { success: false, error: 'Product not found' };
    }
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// ดึงข้อมูลคำสั่งซื้อ
function getOrders() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Orders');
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const orders = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    orders.push({
      id: row[0].toString(),
      dateSold: row[1],
      productId: row[2].toString(),
      buyerName: row[3],
      buyerPhone: row[4],
      buyerDob: row[5],
      buyerAddress: row[6],
      price: Number(row[7])
    });
  }
  return orders;
}

// เพิ่มคำสั่งซื้อ (ขายออก)
function addOrder(orderData) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Orders');
    
    sheet.appendRow([
      orderData.id,
      orderData.dateSold,
      orderData.productId,
      orderData.buyerName,
      orderData.buyerPhone,
      orderData.buyerDob || '',
      orderData.buyerAddress || '',
      orderData.price
    ]);
    
    updateProductStatus(orderData.productId, 'ขายแล้ว');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// ==========================================
// 4. Telegram Notification
// ==========================================
function sendTelegramMessage(text) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const payload = {
    chat_id: TELEGRAM_CHAT_ID,
    text: text,
    parse_mode: 'HTML'
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    UrlFetchApp.fetch(url, options);
  } catch (e) {
    console.error('Telegram Error:', e);
  }
}
