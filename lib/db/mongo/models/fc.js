import mongoose from 'mongoose';

const FcSchema = new mongoose.Schema({
  'type': {
    type: String,
    required: true,
    enum: ['Feature'],
    default: 'Feature'
  },
  'properties': {},
  'geometry': {}
});

export default FcSchema;
