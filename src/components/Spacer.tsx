import React from 'react'

type SpacerProps = {
    space?: number;
}

const Spacer: React.FC<SpacerProps> = ({space=10}) => {
    return (
        <div style={{margin: `${space}px 0`}} />
    )
}

export default Spacer;