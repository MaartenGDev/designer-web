import React from 'react'
import PropTypes from "prop-types";

interface IProps {
    children: any,
    condition: boolean
}
const ShowIfTrue = ({children, condition}: IProps) => {
    return condition ? children : null;
}

export default ShowIfTrue;
