function validatePassword(password) {
    const errors = [];
    if (!password || password.length < 8) {
        errors.push('La contraseña debe tener al menos 8 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('La contraseña debe contener al menos una mayúscula');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('La contraseña debe contener al menos un número');
    }
    return errors;
}

function validateEmail(correo) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correo || !emailRegex.test(correo)) {
        return ['El formato del correo electrónico no es válido'];
    }
    return [];
}

function validateCelular(celular) {
    const phoneRegex = /^[0-9]{7,15}$/;
    if (!celular || !phoneRegex.test(celular.replace(/[\s+\-]/g, ''))) {
        return ['El número de celular debe contener entre 7 y 15 dígitos'];
    }
    return [];
}

function sanitizeString(str) {
    if (!str) return '';
    return str.trim().replace(/<[^>]*>/g, '');
}

function validateRegistrationInput(data) {
    const errors = {};

    const passwordErrors = validatePassword(data.password);
    if (passwordErrors.length > 0) errors.password = passwordErrors;

    const emailErrors = validateEmail(data.correo);
    if (emailErrors.length > 0) errors.correo = emailErrors;

    const celularErrors = validateCelular(data.celular);
    if (celularErrors.length > 0) errors.celular = celularErrors;

    if (!data.nombre_completo || data.nombre_completo.trim().length < 3) {
        errors.nombre_completo = ['El nombre completo debe tener al menos 3 caracteres'];
    }

    return Object.keys(errors).length > 0 ? errors : null;
}

function validatePreventaDate(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return 'La fecha de disponibilidad futura no es válida';
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 3) {
        return 'La fecha de disponibilidad futura debe ser de al menos 3 días a partir de hoy';
    }
    if (diffDays > 90) {
        return 'La fecha de disponibilidad futura no puede exceder los 90 días a partir de hoy';
    }
    return null;
}

module.exports = {
    validatePassword,
    validateEmail,
    validateCelular,
    sanitizeString,
    validateRegistrationInput,
    validatePreventaDate,
};
