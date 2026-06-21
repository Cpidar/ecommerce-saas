import localFont from 'next/font/local'

// define a custom local font where GreatVibes-Regular.ttf is stored in the styles folder
const IRANSans = localFont({
    src: [
        {
            path: './font/IRANSansWeb_UltraLight.woff2',
            style: 'normal',
            weight: '200'
        },
        {
            path: './font/IranSansWeb-FaNum-Light.woff2',
            style: 'normal',
            weight: '300'
        },
        {
            path: './font/IRANSansWeb-FaNum.woff2',
            style: 'normal',
            weight: 'normal'
        },
        {
            path: './font/IRANSansWeb_Medium.woff2',
            style: 'normal',
            weight: '500'
        },
        {
            path: './font/IRANSansWeb-FaNum-Bold.woff2',
            style: 'normal',
            weight: 'bold'
        }

    ],
    variable: '--iransans',   // ← this is what you need
    display: 'swap',
    preload: true,
})

export { IRANSans }