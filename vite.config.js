import basicSsl from '@vitejs/plugin-basic-ssl';

export default {
    server: {
        host: '0.0.0.0',
        https: true,
        headers: {
            ['Cross-Origin-Embedder-Policy']: 'require-corp',
            ['Cross-Origin-Opener-Policy']: 'same-origin'
        }
    },
    plugins: [basicSsl()]
};
