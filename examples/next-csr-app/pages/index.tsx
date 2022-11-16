import React, {ReactElement} from 'react';
import {GetStaticProps} from 'next';
import HomeBanner, {getDefaultHomeBannerContent, HomeBannerProps} from '@/components/HomeBanner';

type HomeProps = {
    defaultHomeBannerContent: HomeBannerProps['defaultContent'],
};

export default function Home({defaultHomeBannerContent}: HomeProps): ReactElement {
    return (
        <HomeBanner defaultContent={defaultHomeBannerContent} />
    );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => ({
    // Revalidate every 1 minute
    revalidate: 60,
    props: {
        defaultHomeBannerContent: await getDefaultHomeBannerContent(),
    },
});
