import React from 'react'
import PropTypes from 'prop-types'

interface IProps {
    name: string
    selectedValue: string | number,
    disabled: boolean,
    items: any[],
    className: string,
    onChange: (ev: any) => void
}

const Select = ({name, selectedValue, items, className, onChange, disabled = false}: IProps) => {
    return (
        <div className={`relative ${className}`}>
            <select name={name}
                    className={`block appearance-none form__input form__input--select`}
                    value={selectedValue} disabled={disabled}
                    onChange={onChange}>
                {items.map(item => <option key={item.key} value={item.key}>{item.value}</option>)}
            </select>
            <div className="pointer-events-none absolute pin-y pin-r flex items-center px-2 text-grey-darker">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
            </div>
        </div>

    )
};

export default Select
