import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const CATEGORIAS = [
  { id: 1, nombre: 'Hortalizas' },
  { id: 2, nombre: 'Frutas' },
  { id: 3, nombre: 'Granos' },
  { id: 4, nombre: 'Tubérculos' },
  { id: 5, nombre: 'Lácteos' },
  { id: 6, nombre: 'Otros' },
];

const UNIDADES = [
  { valor: 'QUINTAL', label: 'Quintal', kg: 46 },
  { valor: 'ARROBA', label: 'Arroba', kg: 11.5 },
  { valor: 'KILOGRAMO', label: 'Kilogramo', kg: 1 },
  { valor: 'CAJA', label: 'Caja', kg: null },
  { valor: 'BOLSA', label: 'Bolsa', kg: null },
  { valor: 'UNIDAD', label: 'Unidad', kg: null },
];

export default function PublicarCosecha() {
  const navigate = useNavigate();
  const { id } = useParams();
  const esEdicion = !!id;
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    nombre: '', categoria_id: '', variedad: '', cantidad_disponible: '',
    unidad_medida: '', precio: '', descripcion: '', fecha_disponibilidad: '',
  });
  const [previews, setPreviews] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (esEdicion) {
      api.get(`/productos/${id}`).then(({ data }) => {
        setForm({
          nombre: data.nombre || '',
          categoria_id: data.categoria_id || '',
          variedad: data.variedad || '',
          cantidad_disponible: data.cantidad_disponible || '',
          unidad_medida: data.unidad_medida || '',
          precio: data.precio || '',
          descripcion: data.descripcion || '',
          fecha_disponibilidad: data.fecha_disponibilidad || '',
        });
        if (data.imagenes) {
          setPreviews(data.imagenes.map(i => ({ url: `/${i.ruta_imagen}`, existing: true })));
        }
      }).catch(() => navigate('/dashboard/productor'));
    }
  }, [id, esEdicion, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);
    const total = previews.filter(p => !p.existing).length + selected.length;
    if (total > 5) {
      setError('Máximo 5 imágenes');
      return;
    }
    const newFiles = [...files, ...selected].slice(0, 5);
    setFiles(newFiles);
    const newPreviews = selected.map(f => ({ url: URL.createObjectURL(f), existing: false }));
    setPreviews([...previews, ...newPreviews].slice(0, 5));
  };

  const removeImage = (index) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    const newFiles = files.filter((_, i) => {
      const pi = previews.filter(p => !p.existing).length;
      return i !== (index - (previews.length - pi));
    });
    setPreviews(newPreviews);
    setFiles(newFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.categoria_id || !form.variedad || !form.cantidad_disponible || !form.unidad_medida || !form.precio) {
      setError('Complete todos los campos obligatorios: nombre, categoría, variedad, cantidad, unidad y precio');
      return;
    }
    if (previews.length === 0) {
      setError('Debe subir al menos 1 imagen del producto');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      files.forEach(f => formData.append('imagenes', f));

      if (esEdicion) {
        await api.put(`/productos/${id}`, form);
        setSuccess('Producto actualizado');
      } else {
        await api.post('/productos/crear', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccess('Cosecha publicada exitosamente');
      }

      setTimeout(() => navigate('/dashboard/mis-productos'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  const unidad = UNIDADES.find(u => u.valor === form.unidad_medida);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {esEdicion ? '✏️ Editar Cosecha' : '🌽 Publicar Cosecha'}
        </h1>
        <p className="text-gray-500">
          {esEdicion ? 'Actualiza los datos de tu producto' : 'Registra tu cosecha para que los compradores la encuentren'}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold">&times;</button>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} className="input-field" placeholder="Ej: Tomate" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
            <select name="categoria_id" value={form.categoria_id} onChange={handleChange} className="input-field">
              <option value="">Seleccione...</option>
              {CATEGORIAS.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Variedad</label>
            <input name="variedad" value={form.variedad} onChange={handleChange} className="input-field" placeholder="Ej: Perita" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unidad de Medida *</label>
            <select name="unidad_medida" value={form.unidad_medida} onChange={handleChange} className="input-field">
              <option value="">Seleccione...</option>
              {UNIDADES.map(u => (
                <option key={u.valor} value={u.valor}>
                  {u.label}{u.kg ? ` (${u.kg} kg)` : ''}
                </option>
              ))}
            </select>
            {unidad && unidad.kg && (
              <p className="text-xs text-gray-400 mt-1">Equivale a {unidad.kg} kg</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad Disponible *</label>
            <input name="cantidad_disponible" type="number" step="0.01" min="0" value={form.cantidad_disponible} onChange={handleChange} className="input-field" placeholder="100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio (Bs) *</label>
            <input name="precio" type="number" step="0.01" min="0.01" value={form.precio} onChange={handleChange} className="input-field" placeholder="50" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea name="descripcion" rows="3" value={form.descripcion} onChange={handleChange} className="input-field" placeholder="Describe tu producto, calidad, tipo de cultivo..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Disponibilidad</label>
          <input name="fecha_disponibilidad" type="date" value={form.fecha_disponibilidad} onChange={handleChange} className="input-field" />
          {form.fecha_disponibilidad && (
            <p className="text-xs text-amber-600 mt-1">Al definir una fecha futura, el producto se publicará como PREVENTA</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fotografías (1-5, JPG/PNG, máx 10MB c/u)</label>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary-400 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png" multiple onChange={handleFiles} className="hidden" />
            <span className="text-3xl block mb-1">📷</span>
            <p className="text-sm text-gray-500">Haz clic para seleccionar imágenes</p>
          </div>
          {previews.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {previews.map((p, i) => (
                <div key={i} className="relative">
                  <img src={p.url} alt="" className="w-20 h-20 object-cover rounded-lg border" />
                  <button type="button" onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs leading-none">&times;</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
          {loading ? 'Guardando...' : esEdicion ? '💾 Actualizar Producto' : '🌾 Publicar Cosecha'}
        </button>
      </form>
    </div>
  );
}
