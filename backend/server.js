const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Device = require('./Device');

const app = express();
app.use(cors());
app.use(express.json());

// Kết nối cơ sở dữ liệu MongoDB Atlas qua biến môi trường MONGODB_URI
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Đã kết nối thành công tới MongoDB Atlas!'))
  .catch((err) => {
    console.error('Lỗi kết nối MongoDB:', err.message);
  });

// 8. Endpoint GET /health kiểm tra trạng thái hoạt động backend
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Backend đang hoạt động ổn định',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// 1 & 2. GET /api/devices và GET /api/devices?search=keyword
app.get('/api/devices', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search && search.trim() !== '') {
      const keyword = search.trim();
      const regex = new RegExp(keyword, 'i');
      query = {
        $or: [
          { deviceId: regex },
          { name: regex },
          { deviceType: regex },
          { room: regex }
        ]
      };
    }

    const devices = await Device.find(query);
    return res.status(200).json(devices);
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
  }
});

// 1. GET /api/devices/:id - Xem chi tiết thiết bị (hỗ trợ cả Mongo ID lẫn deviceId)
app.get('/api/devices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let device = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      device = await Device.findById(id);
    }
    if (!device) {
      device = await Device.findOne({ deviceId: id });
    }

    if (!device) {
      return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
    }

    return res.status(200).json(device);
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
  }
});

// 1, 3, 4. POST /api/devices - Thêm thiết bị mới
app.post('/api/devices', async (req, res) => {
  try {
    const { deviceId, name, deviceType, room, brand, model, quantity, status, purchaseDate, description } = req.body;

    // Kiểm tra dữ liệu bắt buộc
    if (!deviceId || !name || !deviceType || !room || quantity === undefined || !status || !purchaseDate) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ các trường bắt buộc' });
    }

    // Kiểm tra trùng deviceId
    const existingDevice = await Device.findOne({ deviceId: deviceId.trim() });
    if (existingDevice) {
      return res.status(409).json({ message: `Mã thiết bị '${deviceId}' đã tồn tại trong hệ thống` });
    }

    const newDevice = new Device({
      deviceId: deviceId.trim(),
      name: name.trim(),
      deviceType: deviceType.trim(),
      room: room.trim(),
      brand: brand ? brand.trim() : '',
      model: model ? model.trim() : '',
      quantity: Number(quantity),
      status,
      purchaseDate,
      description: description || ''
    });

    const saved = await newDevice.save();
    return res.status(201).json(saved);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Dữ liệu không hợp lệ', error: err.message });
    }
    return res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
  }
});

// 1, 3. PUT /api/devices/:id - Cập nhật thông tin thiết bị
app.put('/api/devices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { deviceId: id };

    // Nếu người dùng muốn đổi deviceId, kiểm tra xem ID mới có bị trùng thiết bị khác không
    if (req.body.deviceId) {
      const duplicate = await Device.findOne({ deviceId: req.body.deviceId.trim(), _id: { $ne: id } });
      if (duplicate) {
        return res.status(409).json({ message: `Mã thiết bị '${req.body.deviceId}' đã tồn tại` });
      }
    }

    const updatedDevice = await Device.findOneAndUpdate(query, req.body, { 
      new: true, 
      runValidators: true 
    });

    if (!updatedDevice) {
      return res.status(404).json({ message: 'Không tìm thấy thiết bị để cập nhật' });
    }

    return res.status(200).json(updatedDevice);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Dữ liệu cập nhật không hợp lệ', error: err.message });
    }
    return res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
  }
});

// 1. DELETE /api/devices/:id - Xóa thiết bị
app.delete('/api/devices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { deviceId: id };

    const deletedDevice = await Device.findOneAndDelete(query);
    if (!deletedDevice) {
      return res.status(404).json({ message: 'Không tìm thấy thiết bị để xóa' });
    }

    return res.status(200).json({ 
      message: 'Xóa thiết bị thành công', 
      device: deletedDevice 
    });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
  }
});

// Cổng chạy lấy từ biến môi trường PORT (hoặc 5000)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});