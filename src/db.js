import mongoose from 'mongoose';
export async function connectDB(uri){
  if (!uri) throw new Error('MONGO_URI no definido');
  await mongoose.connect(uri);
  console.log('Mongo conectado');
}
