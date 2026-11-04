import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/devices';

export default function App() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const initialForm = {
    deviceId: '',
    name: '',
    deviceType: '',
    room: '',
    brand: '',
    model: '',
    quantity: 1,
    status: 'Đang sử dụng',
    purchaseDate: new Date().toISOString().split('T')[0],
    description: ''
  };
  const [formData, setFormData] = useState(initialForm);

  // Lấy danh sách thiết bị từ Backend API
  const fetchDevices = async (keyword = '') => {
    setLoading(true);
    setError('');
    try {
      const url = keyword ? `${API_BASE}?search=${encodeURIComponent(keyword)}` : API_BASE;
      const res = await axios.get(url);
      setDevices(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách thiết bị!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDevices(search);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Thêm hoặc cập nhật thiết bị
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (isEditing) {
        await axios.put(`${API_BASE}/${formData._id || formData.deviceId}`, formData);
        setSuccess('Cập nhật thông tin thiết bị thành công!');
      } else {
        await axios.post(API_BASE, formData);
        setSuccess('Thêm mới thiết bị thành công!');
      }
      setFormData(initialForm);
      setIsEditing(false);
      fetchDevices(search);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu thiết bị!');
    }
  };

  // Xem chi tiết
  const handleViewDetail = async (id) => {
    try {
      const res = await axios.get(`${API_BASE}/${id}`);
      setSelectedDevice(res.data);
    } catch (err) {
      setError('Không thể lấy chi tiết thiết bị!');
    }
  };

  // Chuẩn bị form để sửa
  const handleEdit = (device) => {
    setFormData(device);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Xóa thiết bị
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thiết bị này?')) return;
    try {
      await axios.delete(`${API_BASE}/${id}`);
      setSuccess('Đã xóa thiết bị thành công!');
      fetchDevices(search);
      if (selectedDevice && (selectedDevice._id === id || selectedDevice.deviceId === id)) {
        setSelectedDevice(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa thiết bị!');
    }
  };

  // Màu sắc phân biệt tình trạng thiết bị (Mục 7)
  const getStatusBadge = (status) => {
    const styles = {
      'Đang sử dụng': { bg: '#e8f5e9', color: '#2e7d32' },
      'Đang sửa chữa': { bg: '#fff3e0', color: '#ef6c00' },
      'Hư hỏng': { bg: '#ffebee', color: '#c62828' },
      'Ngừng sử dụng': { bg: '#eceff1', color: '#546e7a' }
    };
    const current = styles[status] || { bg: '#eee', color: '#333' };
    return (
      <span style={{
        backgroundColor: current.bg,
        color: current.color,
        padding: '4px 8px',
        borderRadius: '4px',
        fontWeight: 'bold',
        fontSize: '13px'
      }}>
        {status}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '20px auto', fontFamily: 'Arial, sans-serif', padding: '0 15px' }}>
      <h2 style={{ textAlign: 'center', color: '#1976d2' }}>HỆ THỐNG QUẢN LÝ THIẾT BỊ PHÒNG HỌC</h2>

      {/* Thông báo kết quả và lỗi (Mục 8) */}
      {loading && <p style={{ color: '#0288d1', fontWeight: 'bold' }}>Đang tải dữ liệu...</p>}
      {error && <div style={{ background: '#ffcdd2', color: '#b71c1c', padding: '10px', borderRadius: '4px', marginBottom: '10px' }}>{error}</div>}
      {success && <div style={{ background: '#c8e6c9', color: '#1b5e20', padding: '10px', borderRadius: '4px', marginBottom: '10px' }}>{success}</div>}

      {/* Form tìm kiếm thiết bị (Mục 6) */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Tìm theo mã, tên, loại thiết bị hoặc phòng..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: '8px' }}
        />
        <button type="submit" style={{ padding: '8px 16px', background: '#1976d2', color: '#fff', border: 'none', cursor: 'pointer' }}>Tìm kiếm</button>
        <button type="button" onClick={() => { setSearch(''); fetchDevices(''); }} style={{ padding: '8px 16px' }}>Đặt lại</button>
      </form>

      {/* Form Thêm / Cập nhật thiết bị (Mục 3 & 4) */}
      <form onSubmit={handleSubmit} style={{ background: '#f5f5f5', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
        <h3>{isEditing ? 'Cập nhật thiết bị' : 'Thêm thiết bị mới'}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          <div>
            <label>Mã thiết bị (*):</label>
            <input required type="text" name="deviceId" value={formData.deviceId} onChange={handleInputChange} disabled={isEditing} style={{ width: '100%', padding: '6px' }} />
          </div>
          <div>
            <label>Tên thiết bị (*):</label>
            <input required type="text" name="name" value={formData.name} onChange={handleInputChange} style={{ width: '100%', padding: '6px' }} />
          </div>
          <div>
            <label>Loại thiết bị (*):</label>
            <input required type="text" name="deviceType" value={formData.deviceType} onChange={handleInputChange} style={{ width: '100%', padding: '6px' }} />
          </div>
          <div>
            <label>Phòng học (*):</label>
            <input required type="text" name="room" value={formData.room} onChange={handleInputChange} style={{ width: '100%', padding: '6px' }} />
          </div>
          <div>
            <label>Hãng sản xuất:</label>
            <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} style={{ width: '100%', padding: '6px' }} />
          </div>
          <div>
            <label>Model:</label>
            <input type="text" name="model" value={formData.model} onChange={handleInputChange} style={{ width: '100%', padding: '6px' }} />
          </div>
          <div>
            <label>Số lượng (*):</label>
            <input required type="number" min="0" name="quantity" value={formData.quantity} onChange={handleInputChange} style={{ width: '100%', padding: '6px' }} />
          </div>
          <div>
            <label>Tình trạng (*):</label>
            <select name="status" value={formData.status} onChange={handleInputChange} style={{ width: '100%', padding: '6px' }}>
              <option value="Đang sử dụng">Đang sử dụng</option>
              <option value="Hư hỏng">Hư hỏng</option>
              <option value="Đang sửa chữa">Đang sửa chữa</option>
              <option value="Ngừng sử dụng">Ngừng sử dụng</option>
            </select>
          </div>
          <div>
            <label>Ngày mua (*):</label>
            <input required type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleInputChange} style={{ width: '100%', padding: '6px' }} />
          </div>
        </div>
        <div style={{ marginTop: '10px' }}>
          <label>Mô tả, ghi chú:</label>
          <input type="text" name="description" value={formData.description} onChange={handleInputChange} style={{ width: '100%', padding: '6px' }} />
        </div>
        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
          <button type="submit" style={{ padding: '8px 20px', background: isEditing ? '#f57c00' : '#2e7d32', color: '#fff', border: 'none', cursor: 'pointer' }}>
            {isEditing ? 'Lưu thay đổi' : 'Thêm mới'}
          </button>
          {isEditing && (
            <button type="button" onClick={() => { setIsEditing(false); setFormData(initialForm); }} style={{ padding: '8px 15px' }}>
              Hủy chỉnh sửa
            </button>
          )}
        </div>
      </form>

      {/* Xem chi tiết thiết bị (Mục 2) */}
      {selectedDevice && (
        <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #90caf9' }}>
          <h4>Chi tiết thiết bị: {selectedDevice.name} ({selectedDevice.deviceId})</h4>
          <p><strong>Loại thiết bị:</strong> {selectedDevice.deviceType} | <strong>Phòng:</strong> {selectedDevice.room}</p>
          <p><strong>Hãng:</strong> {selectedDevice.brand || 'Chưa có'} | <strong>Model:</strong> {selectedDevice.model || 'Chưa có'}</p>
          <p><strong>Số lượng:</strong> {selectedDevice.quantity} | <strong>Tình trạng:</strong> {selectedDevice.status}</p>
          <p><strong>Ngày nhận:</strong> {selectedDevice.purchaseDate}</p>
          <p><strong>Mô tả:</strong> {selectedDevice.description || 'Không có ghi chú'}</p>
          <button onClick={() => setSelectedDevice(null)} style={{ padding: '4px 10px' }}>Đóng chi tiết</button>
        </div>
      )}

      {/* Bảng danh sách thiết bị (Mục 1 & 7) */}
      <h3>Danh sách thiết bị ({devices.length})</h3>
      <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#e0e0e0' }}>
            <th>Mã TB</th>
            <th>Tên thiết bị</th>
            <th>Loại</th>
            <th>Phòng</th>
            <th>Số lượng</th>
            <th>Tình trạng</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {devices.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center' }}>Không có dữ liệu thiết bị nào.</td>
            </tr>
          ) : (
            devices.map((d) => (
              <tr key={d._id || d.deviceId}>
                <td>{d.deviceId}</td>
                <td>{d.name}</td>
                <td>{d.deviceType}</td>
                <td>{d.room}</td>
                <td>{d.quantity}</td>
                <td>{getStatusBadge(d.status)}</td>
                <td style={{ display: 'flex', gap: '5px' }}>
                  <button onClick={() => handleViewDetail(d._id || d.deviceId)}>Xem</button>
                  <button onClick={() => handleEdit(d)}>Sửa</button>
                  <button onClick={() => handleDelete(d._id || d.deviceId)} style={{ color: 'red' }}>Xóa</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}