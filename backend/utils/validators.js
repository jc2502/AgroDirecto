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

module.exports = {
    validatePassword,
    validateEmail,
    validateCelular,
    sanitizeString,
    validateRegistrationInput,
};
