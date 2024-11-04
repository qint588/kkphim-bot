import { GetStaticProps, InferGetStaticPropsType } from 'next';

import { createSwaggerSpec, SwaggerOptions } from 'next-swagger-doc';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

const ApiDoc = ({ spec }: InferGetStaticPropsType<typeof getStaticProps>) => {
    return <SwaggerUI spec={spec} />;
};

export const getStaticProps: GetStaticProps = async ctx => {
    // @ts-ignore
    const configs: SwaggerOptions = {
        apiFolder: 'src/pages/api/**',
        definition: {
            openapi: "3.0.0",
            info: {
                title: "API Docs",
                description: 'Danh sách api phim tổng hợp',
                version: "1.0",
            },
            components: {},
            security: [],
        },
    }
    const spec: Record<string, any> = createSwaggerSpec(configs);
    return { props: { spec } };
};

export default ApiDoc;