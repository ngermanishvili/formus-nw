import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
    locales: ['en', 'ka'],
    defaultLocale: 'ka',
    localePrefix: "never"
});

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);