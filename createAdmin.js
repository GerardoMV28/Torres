console.log("🎯 Script createAdmin.js INICIADO!");

import { config } from 'dotenv';
config();

console.log("🔍 Variables de entorno:");
console.log("   MONGO_URI:", process.env.MONGO_URI || "❌ NO DEFINIDA");
console.log("   JWT_SECRET:", process.env.JWT_SECRET ? "✅ Definida" : "❌ No definida");

async function createAdmin() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI no está definida. Revisa tu archivo .env');
    }

    const mongoose = await import('mongoose');
    const bcrypt = await import('bcryptjs');
    
    console.log("🔗 Conectando a MongoDB...");
    await mongoose.default.connect(process.env.MONGO_URI);
    console.log("✅ Conectado a MongoDB");

    // Crear modelo directamente
    const userSchema = new mongoose.default.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      role: { type: String, enum: ['student','teacher','admin'], default: 'student' }
    }, { timestamps: true });
    
    const User = mongoose.default.models.User || mongoose.default.model('User', userSchema);
    console.log("✅ Modelo User listo");

    const adminEmail = 'admin@escuela.com';
    const adminPassword = 'admin123';

    console.log("🔍 Verificando administrador...");
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("✅ Administrador ya existe:");
      console.log("   📧", existingAdmin.email);
      console.log("   👤", existingAdmin.name);
      console.log("   🎯", existingAdmin.role);
      await mongoose.default.disconnect();
      return;
    }

    console.log("🔧 Creando nuevo administrador...");
    const hash = await bcrypt.default.hash(adminPassword, 10);
    const admin = await User.create({
      name: 'Administrador Principal',
      email: adminEmail,
      password: hash,
      role: 'admin'
    });

    console.log("🎉 ✅ ADMINISTRADOR CREADO EXITOSAMENTE!");
    console.log("========================================");
    console.log("📧 Email:", adminEmail);
    console.log("🔑 Password:", adminPassword);
    console.log("👤 ID:", admin._id);
    console.log("🎯 Rol:", admin.role);
    console.log("========================================");
    console.log("⚠️  IMPORTANTE: Usa estas credenciales para login");

    await mongoose.default.disconnect();
    console.log("🔒 Conexión cerrada");

  } catch (error) {
    console.error("❌ ERROR:", error.message);
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error("📁 Error de módulo:", error.message);
    }
    process.exit(1);
  }
}

createAdmin();