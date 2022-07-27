import basicSsl from '@vitejs/plugin-basic-ssl';

export default {
    server: {
        host: '0.0.0.0',
        https: true
    },
    plugins: [basicSsl()]
};
