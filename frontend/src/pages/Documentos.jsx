import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';

export default function Documentos() {
  const { user } = useAuthStore();
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [tipoDocumento, setTipoDocumento] = useState('');
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    api.get('/documentos/mis-documentos')
      .then(({ data }) => setDocumentos(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'El archivo excede el tamaño máximo de 5MB' });
      e.target.value = '';
      return;
    }

    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setMessage({ type: 'error', text: 'Solo se permiten archivos JPG, PNG y PDF' });
      e.target.value = '';
      return;
    }

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setPreview('pdf');
    }
  };

  const handleUpload = async () => {
    if (!tipoDocumento || !fileRef.current?.files[0]) {
      setMessage({ type: 'error', text: 'Seleccione un tipo de documento y un archivo' });
      return;
    }

    const formData = new FormData();
    formData.append('archivo', fileRef.current.files[0]);
    formData.append('tipo_documento', tipoDocumento);

    setUploading(true);
    try {
      await api.post('/documentos/subir', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage({ type: 'success', text: 'Documento subido correctamente' });
      setTipoDocumento('');
      setPreview(null);
      fileRef.current.value = '';
      const { data } = await api.get('/documentos/mis-documentos');
      setDocumentos(data);
    } catch {
      setMessage({ type: 'error', text: 'Error al subir el documento' });
    } finally {
      setUploading(false);
    }
  };

  const estadoBadge = (estado) => {
    switch (estado) {
      case 'APROBADO': return 'badge-success';
      case 'RECHAZADO': return 'badge-danger';
      default: return 'badge-warning';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-40 rounded-xl" />
        <div className="skeleton h-48 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">📄 Documentos</h1>
        <p className="text-gray-500">Sube tus documentos para verificación de identidad</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm flex items-center justify-between ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
          'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="font-bold">&times;</button>
        </div>
      )}

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Subir Nuevo Documento</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento</label>
            <select
              className="input-field"
              value={tipoDocumento}
              onChange={(e) => setTipoDocumento(e.target.value)}
            >
              <option value="">Seleccione...</option>
              <option value="CI">Cédula de Identidad</option>
              <option value="NIT">NIT</option>
              <option value="LICENCIA">Licencia de Conducir</option>
              <option value="CERTIFICADO">Certificado de Finca</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Archivo (JPG, PNG, PDF - máx 5MB)</label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors cursor-pointer"
              onClick={() => fileRef.current?.click()}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              {preview === 'pdf' ? (
                <div>
                  <span className="text-4xl block mb-2">📄</span>
                  <p className="text-sm text-gray-500">Archivo PDF seleccionado</p>
                </div>
              ) : preview ? (
                <img src={preview} alt="Preview" className="max-h-32 mx-auto rounded" />
              ) : (
                <div>
                  <span className="text-4xl block mb-2">📁</span>
                  <p className="text-sm text-gray-500">Haz clic para seleccionar un archivo</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG o PDF hasta 5MB</p>
                </div>
              )}
            </div>
          </div>

          <button onClick={handleUpload} disabled={uploading || !tipoDocumento} className="btn-primary">
            {uploading ? 'Subiendo...' : '📤 Subir Documento'}
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Mis Documentos ({documentos.length})</h2>
        {documentos.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <span className="text-4xl block mb-2">📄</span>
            <p>Aún no has subido documentos</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documentos.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{doc.tipo_documento}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(doc.fecha_subida).toLocaleDateString('es-BO', {
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                  {doc.comentario_admin && (
                    <p className="text-xs text-red-600 mt-1">Admin: {doc.comentario_admin}</p>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <span className={estadoBadge(doc.estado)}>{doc.estado}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
