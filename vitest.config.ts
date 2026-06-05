import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [angular(), tsconfigPaths()],
    optimizeDeps: {
        include: ['rxfire', '@angular/fire', 'firebase'],
    },
    ssr: {
        noExternal: ['rxfire', '@angular/fire', 'firebase', '@firebase/app', '@firebase/component'],
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['src/test-setup.ts'],
        include: ['src/**/*.spec.ts'],
        server: {
            deps: {
                external: ['rxfire', '@angular/fire', 'firebase', '@firebase/app'],
            },
        },
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            reportsDirectory: './coverage',
            include: ['src/app/**/*.ts'],
            exclude: [
                '**/*.spec.ts',
                '**/*.module.ts',
                '**/*.main.ts',
                'src/app/app.config.ts',
                'src/app/app.routes.ts',
            ],
        },
    },
});
