// src/modules/auth/inviteCodes.routes.js
import express from 'express';
import InviteCode from './InviteCode.model.js';
import { auth, requireAdmin } from '../../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Aplicar autenticación a todas las rutas (excepto verify)
router.use((req, res, next) => {
  console.log('🛂 [ROUTE DEBUG] Llegó a invite-codes routes:', req.method, req.url);
  console.log('🛂 [ROUTE DEBUG] Headers:', JSON.stringify(req.headers));
  return auth()(req, res, (err) => {
    if (err) {
      console.log('🛂 [ROUTE DEBUG] Error en auth:', err);
      return next(err);
    }
    console.log('🛂 [ROUTE DEBUG] Auth completado, usuario:', req.user?.email);
    next();
  });
});
// Generar código de invitación (solo admin)

// REEMPLAZA TEMPORALMENTE solo la función generate con ESTO:
router.post('/generate', requireAdmin, async (req, res) => {
  console.log('🔧 [1] Llegó a /generate después de middlewares');
  
  try {
    console.log('🔧 [2] Verificando req.body:', JSON.stringify(req.body));
    console.log('🔧 [3] User ID:', req.user?.id, 'Email:', req.user?.email, 'Role:', req.user?.role);
    
    const { expiresInDays = 7 } = req.body;
    console.log('🔧 [4] expiresInDays:', expiresInDays);
    
    console.log('🔧 [5] Generando código con UUID...');
    const code = uuidv4().substring(0, 8).toUpperCase();
    console.log('🔧 [6] Código generado:', code);
    
    console.log('🔧 [7] Creando objeto InviteCode...');
    const inviteCode = new InviteCode({
      code,
      role: 'teacher',
      createdBy: req.user.id,
      expiresAt: new Date(+new Date() + expiresInDays * 24 * 60 * 60 * 1000)
    });

    console.log('🔧 [8] Intentando guardar en MongoDB...');
    await inviteCode.save();
    console.log('🔧 [9] ✅ Guardado exitoso en MongoDB');

    console.log('🔧 [10] Enviando respuesta al cliente...');
    res.json({ 
      message: 'Código generado exitosamente',
      code, 
      expiresAt: inviteCode.expiresAt,
      role: 'teacher'
    });
    console.log('🔧 [11] ✅ Respuesta enviada');
    
  } catch (error) {
    console.error('❌ [ERROR] En generate:', error.message);
    console.error('❌ [STACK]', error.stack);
    res.status(500).json({ 
      message: 'Error generando código de invitación: ' + error.message 
    });
  }
});

// Verificar código de invitación (público)
router.get('/verify/:code', async (req, res) => {
  try {
    const inviteCode = await InviteCode.findOne({ 
      code: req.params.code.toUpperCase() 
    });
    
    if (!inviteCode) {
      return res.status(404).json({ 
        valid: false,
        message: 'Código inválido' 
      });
    }
    
    if (inviteCode.used) {
      return res.status(400).json({ 
        valid: false,
        message: 'Código ya utilizado' 
      });
    }
    
    if (new Date() > inviteCode.expiresAt) {
      return res.status(400).json({ 
        valid: false,
        message: 'Código expirado' 
      });
    }
    
    res.json({ 
      valid: true, 
      role: inviteCode.role,
      expiresAt: inviteCode.expiresAt,
      message: 'Código válido'
    });
  } catch (error) {
    console.error('Error verificando código:', error);
    res.status(500).json({ 
      valid: false,
      message: 'Error verificando código' 
    });
  }
});

// Listar códigos (solo admin)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const codes = await InviteCode.find()
      .populate('createdBy', 'name email')
      .populate('usedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(codes);
  } catch (error) {
    console.error('Error obteniendo códigos:', error);
    res.status(500).json({ message: 'Error obteniendo códigos' });
  }
});

// Obtener estadísticas de códigos (solo admin)
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const totalCodes = await InviteCode.countDocuments();
    const usedCodes = await InviteCode.countDocuments({ used: true });
    const activeCodes = await InviteCode.countDocuments({ 
      used: false, 
      expiresAt: { $gt: new Date() } 
    });
    const expiredCodes = await InviteCode.countDocuments({ 
      used: false, 
      expiresAt: { $lte: new Date() } 
    });
    
    res.json({
      total: totalCodes,
      used: usedCodes,
      active: activeCodes,
      expired: expiredCodes
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ message: 'Error obteniendo estadísticas' });
  }
});


export default router;