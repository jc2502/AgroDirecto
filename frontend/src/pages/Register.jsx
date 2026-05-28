import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const roles = [
  { id: 1, nombre: 'PRODUCTOR', icon: '🌱', desc: 'Vendo mis cosechas directamente' },
  { id: 2, nombre: 'COMPRADOR', icon: '🛒', desc: 'Compro productos del campo' },
  { id: 3, nombre: 'TRANSPORTISTA', icon: '🚚', desc: 'Ofrezco servicios de flete' },
];

export default function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    rol_id: '', nombre_completo: '', correo: '', password: '', celular: '',
    tipo_productor: '', nombre_finca: '', experiencia_anios: '', tipo_documento: '', numero_documento: '',
    tipo_comprador: '', nombre_negocio: '', ciudad_compra: '',
    tipo_transporte: '', capacidad_carga: '', zona_operacion: '', licencia_conducir: '', placa_vehiculo: '',
  });
  const [errors, setErrors] = useState({});
  const { register, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validateStep1 = () => {
    const errs = {};
    if (!form.nombre_completo || form.nombre_completo.length < 3) errs.nombre_completo = 'Mínimo 3 caracteres';
    if (!form.correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) errs.correo = 'Correo inválido';
    if (!form.password || form.password.length < 8) errs.password = 'Mínimo 8 caracteres';
    else if (!/[A-Z]/.test(form.password)) errs.password = 'Debe tener una mayúscula';
    else if (!/[0-9]/.test(form.password)) errs.password = 'Debe tener un número';
    if (!form.celular || form.celular.length < 7) errs.celular = 'Celular inválido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs = {};
    const r = parseInt(form.rol_id);
    if (r === 1) {
      if (!form.tipo_productor) errs.tipo_productor = 'Seleccione un tipo';
      if (!form.nombre_finca) errs.nombre_finca = 'Nombre de finca requerido';
    } else if (r === 2) {
      if (!form.tipo_comprador) errs.tipo_comprador = 'Seleccione un tipo';
    } else if (r === 3) {
      if (!form.tipo_transporte) errs.tipo_transporte = 'Seleccione un tipo';
      if (!form.capacidad_carga || parseFloat(form.capacidad_carga) <= 0) errs.capacidad_carga = 'Capacidad requerida';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    try {
      await register({ ...form, rol_id: parseInt(form.rol_id) });
      navigate('/login');
    } catch {}
  };

  const nextStep = () => {
    if (validateStep1()) setStep(2);
  };

  const rol = roles.find((r) => r.id === parseInt(form.rol_id));

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="card">
          <div className="text-center mb-6">
            <span className="text-4xl block mb-2">🌾</span>
            <h1 className="text-2xl font-bold">Crear Cuenta</h1>
            <p className="text-gray-500 text-sm">Únete a AgroDirecto Santa Cruz</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {typeof error === 'string' ? error : 'Error en el registro. Verifica los datos.'}
              <button onClick={clearError} className="float-right font-bold">&times;</button>
            </div>
          )}

          <div className="flex justify-center mb-6 space-x-2">
            <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-primary-600' : 'bg-gray-300'}`} />
            <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-primary-600' : 'bg-gray-300'}`} />
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Usuario</label>
                  <div className="grid grid-cols-3 gap-2">
                    {roles.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setForm({ ...form, rol_id: r.id })}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          parseInt(form.rol_id) === r.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-2xl block mb-1">{r.icon}</span>
                        <span className="text-xs font-medium">{r.nombre}</span>
                      </button>
                    ))}
                  </div>
                  {parseInt(form.rol_id) > 0 && (
                    <p className="text-xs text-gray-500 mt-1">{rol?.desc}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                  <input name="nombre_completo" value={form.nombre_completo} onChange={handleChange} className="input-field" placeholder="Juan Pérez" />
                  {errors.nombre_completo && <p className="text-xs text-red-500 mt-1">{errors.nombre_completo}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
                    <input name="correo" type="email" value={form.correo} onChange={handleChange} className="input-field" placeholder="correo@ejemplo.com" />
                    {errors.correo && <p className="text-xs text-red-500 mt-1">{errors.correo}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Celular</label>
                    <input name="celular" value={form.celular} onChange={handleChange} className="input-field" placeholder="78912345" />
                    {errors.celular && <p className="text-xs text-red-500 mt-1">{errors.celular}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                  <input name="password" type="password" value={form.password} onChange={handleChange} className="input-field" placeholder="Mín. 8 caracteres, 1 mayúscula, 1 número" />
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                </div>

                <button type="button" onClick={nextStep} disabled={!form.rol_id} className="btn-primary w-full py-3 mt-2">
                  Siguiente
                </button>
              </div>
            )}

            {step === 2 && rol && (
              <div className="space-y-4">
                <div className="bg-primary-50 p-3 rounded-lg text-center mb-4">
                  <span className="text-xl">{rol.icon}</span>
                  <span className="font-medium text-primary-700 ml-2">{rol.nombre}</span>
                </div>

                {parseInt(form.rol_id) === 1 && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Productor</label>
                      <select name="tipo_productor" value={form.tipo_productor} onChange={handleChange} className="input-field">
                        <option value="">Seleccione...</option>
                        <option value="AGRICULTOR">Agricultor</option>
                        <option value="GANADERO">Ganadero</option>
                        <option value="LECHERO">Lechero</option>
                        <option value="AVICULTOR">Avicultor</option>
                        <option value="APICULTOR">Apicultor</option>
                        <option value="OTRO">Otro</option>
                      </select>
                      {errors.tipo_productor && <p className="text-xs text-red-500 mt-1">{errors.tipo_productor}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Finca</label>
                      <input name="nombre_finca" value={form.nombre_finca} onChange={handleChange} className="input-field" placeholder="Ej: Finca El Paraíso" />
                      {errors.nombre_finca && <p className="text-xs text-red-500 mt-1">{errors.nombre_finca}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Años de Experiencia</label>
                        <input name="experiencia_anios" type="number" value={form.experiencia_anios} onChange={handleChange} className="input-field" placeholder="5" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Documento</label>
                        <select name="tipo_documento" value={form.tipo_documento} onChange={handleChange} className="input-field">
                          <option value="">Seleccione...</option>
                          <option value="CI">Cédula de Identidad</option>
                          <option value="NIT">NIT</option>
                          <option value="PASAPORTE">Pasaporte</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {parseInt(form.rol_id) === 2 && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Comprador</label>
                      <select name="tipo_comprador" value={form.tipo_comprador} onChange={handleChange} className="input-field">
                        <option value="">Seleccione...</option>
                        <option value="INDIVIDUAL">Individual</option>
                        <option value="EMPRESA">Empresa</option>
                        <option value="RESTAURANTE">Restaurante</option>
                        <option value="MERCADO">Mercado</option>
                        <option value="OTRO">Otro</option>
                      </select>
                      {errors.tipo_comprador && <p className="text-xs text-red-500 mt-1">{errors.tipo_comprador}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Negocio (opcional)</label>
                      <input name="nombre_negocio" value={form.nombre_negocio} onChange={handleChange} className="input-field" placeholder="Ej: Restaurante Doña María" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad de Compra</label>
                      <input name="ciudad_compra" value={form.ciudad_compra} onChange={handleChange} className="input-field" placeholder="Santa Cruz" />
                    </div>
                  </>
                )}

                {parseInt(form.rol_id) === 3 && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Transporte</label>
                      <select name="tipo_transporte" value={form.tipo_transporte} onChange={handleChange} className="input-field">
                        <option value="">Seleccione...</option>
                        <option value="CAMION">Camión</option>
                        <option value="CAMIONETA">Camioneta</option>
                        <option value="MOTO">Motocicleta</option>
                        <option value="FURGON">Furgón</option>
                        <option value="OTRO">Otro</option>
                      </select>
                      {errors.tipo_transporte && <p className="text-xs text-red-500 mt-1">{errors.tipo_transporte}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad de Carga (kg)</label>
                        <input name="capacidad_carga" type="number" step="0.1" value={form.capacidad_carga} onChange={handleChange} className="input-field" placeholder="1000" />
                        {errors.capacidad_carga && <p className="text-xs text-red-500 mt-1">{errors.capacidad_carga}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Zona de Operación</label>
                        <input name="zona_operacion" value={form.zona_operacion} onChange={handleChange} className="input-field" placeholder="Santa Cruz" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Licencia</label>
                        <input name="licencia_conducir" value={form.licencia_conducir} onChange={handleChange} className="input-field" placeholder="N° Licencia" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Placa del Vehículo</label>
                        <input name="placa_vehiculo" value={form.placa_vehiculo} onChange={handleChange} className="input-field" placeholder="ABC-123" />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">Atrás</button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1 py-3">
                    {loading ? 'Registrando...' : 'Crear Cuenta'}
                  </button>
                </div>
              </div>
            )}

            {step === 2 && !rol && (
              <p className="text-center text-red-500">Seleccione un tipo de usuario en el paso anterior.</p>
            )}
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
