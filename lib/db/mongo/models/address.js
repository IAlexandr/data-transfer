import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema({
  RegisterNo: {
    type: String,
    required: false,
    default: 'empty'
  },
  ID: { // linkID === building.properties.OBJECTID === xlsxFeature.ID связь между точками и строениями
    type: String,
    required: false,
    default: 'empty'
  },
  address: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true,
    enum: ['необработаное', 'необработанное', 'обработанное', 'недостаточно фотографий', 'в работе', 'другое'],
    default: 'необработаное'
  },
  checked: {
    type: Boolean,
    default: false
  },
  userId: {
    type: String
  },
  comment: {
    type: String,
    required: false
  },
});

export default mongoose.model('Address', AddressSchema);
