import Vue from 'vue';

export const toastBus = new Vue();

const show = (type, message, options = {}) => {
    if (!message) return;

    toastBus.$emit('toast', {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        type,
        message: String(message),
        duration: options.duration || 4000
    });
};

export const toast = {
    success: (message, options) => show('success', message, options),
    error: (message, options) => show('error', message, options),
    info: (message, options) => show('info', message, options),
    warning: (message, options) => show('warning', message, options)
};
