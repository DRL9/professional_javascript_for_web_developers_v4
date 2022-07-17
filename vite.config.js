import basicSsl from '@vitejs/plugin-basic-ssl';

export default {
    server: {
        https: true
    },
    plugins: [basicSsl()]
};
