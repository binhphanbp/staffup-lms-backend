"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNoContent = exports.sendCreated = exports.sendSuccess = exports.sendResponse = void 0;
const normalizeJsonValue = (value) => {
    if (value === null || value === undefined) {
        return value;
    }
    if (typeof value === 'bigint') {
        return value.toString();
    }
    if (value instanceof Date) {
        return value.toISOString();
    }
    if (Array.isArray(value)) {
        return value.map((item) => normalizeJsonValue(item));
    }
    if (typeof value === 'object') {
        return Object.fromEntries(Object.entries(value).map(([key, nestedValue]) => [key, normalizeJsonValue(nestedValue)]));
    }
    return value;
};
const sendResponse = (res, statusCode, data) => {
    const normalizedData = normalizeJsonValue(data);
    res.status(statusCode).json({
        success: statusCode < 400,
        ...normalizedData,
    });
};
exports.sendResponse = sendResponse;
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
    (0, exports.sendResponse)(res, statusCode, { data, message });
};
exports.sendSuccess = sendSuccess;
const sendCreated = (res, data, message = 'Created successfully') => {
    (0, exports.sendResponse)(res, 201, { data, message });
};
exports.sendCreated = sendCreated;
const sendNoContent = (res) => {
    res.status(204).send();
};
exports.sendNoContent = sendNoContent;
