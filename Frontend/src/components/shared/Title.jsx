import React from 'react'
import { Helmet } from "react-helmet-async";

const Title = ({
    title = "Chat App",
    description = "Chat with your friends and family",
}) => {
    return (
        <Helmet>
            <title>{title}</title>
            <meta name="description" content={description} />
        </Helmet>
    )
};

export default Title;
