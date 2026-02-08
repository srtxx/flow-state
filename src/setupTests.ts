import '@testing-library/jest-dom';

// ResizeObserver mock for Recharts
globalThis.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};
