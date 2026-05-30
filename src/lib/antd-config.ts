import type { ThemeConfig } from 'antd';

export const antdTheme: ThemeConfig = {
    token: {
        colorPrimary: '#1890ff',
        borderRadius: 6,
        fontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`,
    },
    components: {
        Button: {
            controlHeight: 36,
            borderRadius: 6,
        },
        Input: {
            controlHeight: 36,
            borderRadius: 6,
        },
        Select: {
            controlHeight: 36,
            borderRadius: 6,
        },
        Card: {
            borderRadius: 8,
        },
    },
};
