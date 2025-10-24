import jwt from 'jsonwebtoken';
import User from '../modules/auth/user.model.js';

export function auth(requiredRole) {
  return async (req, res, next) => {
    try {
      console.log('🔐 [AUTH DEBUG] Iniciando middleware de autenticación');
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      console.log('🔐 [AUTH DEBUG] Token recibido:', token ? 'PRESENTE' : 'AUSENTE');
      console.log('🔐 [AUTH DEBUG] Header completo:', req.headers.authorization);
      
      if (!token) {
        console.log('🔐 [AUTH DEBUG] Error: Token requerido');
        return res.status(401).json({ message: 'Token requerido' });
      }
      
      console.log('🔐 [AUTH DEBUG] Verificando token JWT...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('🔐 [AUTH DEBUG] Token decodificado:', decoded);
      
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        console.log('🔐 [AUTH DEBUG] Error: Usuario no encontrado');
        return res.status(401).json({ message: 'Token inválido' });
      }
      
      console.log('🔐 [AUTH DEBUG] Usuario autenticado:', user.email, 'Rol:', user.role);
      
      // Verificar rol si se especifica uno requerido
      if (requiredRole && user.role !== requiredRole) {
        console.log('🔐 [AUTH DEBUG] Error: Rol insuficiente. Requerido:', requiredRole, 'Actual:', user.role);
        return res.status(403).json({ 
          message: `Acceso denegado. Se requiere rol: ${requiredRole}` 
        });
      }
      
      req.user = user;
      console.log('🔐 [AUTH DEBUG] Autenticación exitosa, pasando al siguiente middleware');
      next();
    } catch (error) {
      console.error('🔐 [AUTH DEBUG] Error en autenticación:', error.message);
      res.status(401).json({ message: 'Token inválido' });
    }
  };
}

export function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Se requieren permisos de administrador' });
  }
  next();
}