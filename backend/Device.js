const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  deviceId: { 
    type: String, 
    required: [true, 'Mã thiết bị không được để trống'], 
    unique: true, 
    trim: true 
  },
  name: { 
    type: String, 
    required: [true, 'Tên thiết bị không được để trống'], 
    trim: true 
  },
  deviceType: { 
    type: String, 
    required: [true, 'Loại thiết bị không được để trống'], 
    trim: true 
  },
  room: { 
    type: String, 
    required: [true, 'Phòng học không được để trống'], 
    trim: true 
  },
  brand: { type: String, trim: true },
  model: { type: String, trim: true },
  quantity: { 
    type: Number, 
    required: [true, 'Số lượng không được để trống'], 
    min: [0, 'Số lượng phải lớn hơn hoặc bằng 0'] 
  },
  status: { 
    type: String, 
    required: [true, 'Trạng thái không được để trống'],
    enum: {
      values: ['Đang sử dụng', 'Hư hỏng', 'Đang sửa chữa', 'Ngừng sử dụng'],
      message: 'Trạng thái không hợp lệ'
    }
  },
  purchaseDate: { type: String, required: [true, 'Ngày mua không được để trống'] },
  description: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Device', deviceSchema, 'devices');