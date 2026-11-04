const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  name: { type: String, required: true },
  deviceType: { type: String, required: true },
  room: { type: String, required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  quantity: { type: Number, required: true },
  status: { 
    type: String, 
    required: true,
    enum: ['Đang sử dụng', 'Hư hỏng', 'Đang sửa chữa', 'Ngừng sử dụng'] 
  },
  purchaseDate: { type: String, required: true },
  description: { type: String }
});

module.exports = mongoose.model('Device', deviceSchema, 'devices');